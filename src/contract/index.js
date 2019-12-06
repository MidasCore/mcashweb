import McashWeb from 'index';
import utils from 'utils';
import Method from './method';

export default class Contract {
    constructor(mcashWeb = false, abi = [], address = false) {
        if (!mcashWeb || !mcashWeb instanceof McashWeb)
            throw new Error('Expected instance of McashWeb');

        this.mcashWeb = mcashWeb;
        this.injectPromise = utils.promiseInjector(this);

        this.address = address;
        this.abi = abi;

        this.eventListener = false;
        this.bytecode = false;
        this.deployed = false;
        this.lastBlock = false;

        this.methods = {};
        this.methodInstances = {};
        this.props = [];

        if (this.mcashWeb.isAddress(address))
            this.deployed = true;
        else this.address = false;

        this.loadAbi(abi);
    }

    async _getEvents(options = {}) {
        const events = await this.mcashWeb.event.getEventsByContractAddress(this.address, options);
        const [latestEvent] = events.sort((a, b) => b.block - a.block);
        const newEvents = events.filter((event, index) => {

            if (options.resourceNode && event.resourceNode &&
                options.resourceNode.toLowerCase() !== event.resourceNode.toLowerCase()) {
                return false
            }

            const duplicate = events.slice(0, index).some(priorEvent => (
                JSON.stringify(priorEvent) === JSON.stringify(event)
            ));

            if (duplicate)
                return false;

            if (!this.lastBlock)
                return true;

            return event.block > this.lastBlock;
        });

        if (latestEvent)
            this.lastBlock = latestEvent.block;

        return newEvents;
    }

    async _startEventListener(options = {}, callback) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (this.eventListener)
            clearInterval(this.eventListener);

        if (!this.mcashWeb.eventServer)
            throw new Error('Event server is not configured');

        if (!this.address)
            throw new Error('Contract is not configured with an address');

        this.eventCallback = callback;
        await this._getEvents(options);

        this.eventListener = setInterval(() => {
            this._getEvents(options).then(newEvents => newEvents.forEach(event => {
                this.eventCallback && this.eventCallback(event)
            })).catch(err => {
                console.error('Failed to get event list', err);
            });
        }, 3000);
    }

    _stopEventListener() {
        if (!this.eventListener)
            return;

        clearInterval(this.eventListener);
        this.eventListener = false;
        this.eventCallback = false;
    }

    hasProperty(property) {
        return this.hasOwnProperty(property) || this.__proto__.hasOwnProperty(property);
    }

    loadAbi(abi) {
        this.abi = abi;
        this.methods = {};

        this.props.forEach(prop => delete this[prop]);

        abi.forEach(func => {
            // Don't build a method for constructor function. That's handled through contract create.
            if (!func.type || /constructor/i.test(func.type))
                return;

            const method = new Method(this, func);
            const methodCall = method.onMethod.bind(method);

            const {
                name,
                functionSelector,
                signature
            } = method;

            this.methods[name] = methodCall;
            this.methods[functionSelector] = methodCall;
            this.methods[signature] = methodCall;

            this.methodInstances[name] = method;
            this.methodInstances[functionSelector] = method;
            this.methodInstances[signature] = method;

            if (!this.hasProperty(name)) {
                this[name] = methodCall;
                this.props.push(name);
            }

            if (!this.hasProperty(functionSelector)) {
                this[functionSelector] = methodCall;
                this.props.push(functionSelector);
            }

            if (!this.hasProperty(signature)) {
                this[signature] = methodCall;
                this.props.push(signature);
            }
        });
    }

    decodeInput(data) {

        const methodName = data.substring(0, 8);
        const inputData = data.substring(8);

        if (!this.methodInstances[methodName])
            throw new Error('Contract method ' + methodName + " not found");

        const methodInstance = this.methodInstances[methodName];

        return {
            name: methodInstance.name,
            params: this.methodInstances[methodName].decodeInput(inputData),
        }
    }

    async new(options, privateKey = this.mcashWeb.defaultPrivateKey, callback = false) {
        if (utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = this.mcashWeb.defaultPrivateKey;
        }

        if (!callback)
            return this.injectPromise(this.new, options, privateKey);

        try {
            const address = this.mcashWeb.address.fromPrivateKey(privateKey);
            const transaction = await this.mcashWeb.transactionBuilder.createSmartContract(options, address);
            const signedTransaction = await this.mcashWeb.mcash.sign(transaction, privateKey);
            const contract = await this.mcashWeb.mcash.sendRawTransaction(signedTransaction);

            if (contract.code)
                return callback({
                    error: contract.code,
                    message: this.mcashWeb.toUtf8(contract.message)
                });

            return this.at(signedTransaction.contract_address, callback);
        } catch (ex) {
            return callback(ex);
        }
    }

    async at(contractAddress, callback = false) {
        if (!callback)
            return this.injectPromise(this.at, contractAddress);

        try {
            const contract = await this.mcashWeb.mcash.getContract(contractAddress);

            if (!contract.contract_address)
                return callback('Unknown error: ' + JSON.stringify(contract, null, 2));

            this.address = contract.contract_address;
            this.bytecode = contract.bytecode;
            this.deployed = true;

            this.loadAbi(contract.abi.entrys);

            return callback(null, this);
        } catch (ex) {
            if (ex.toString().includes('does not exist'))
                return callback('Contract has not been deployed on the network');

            return callback(ex);
        }
    }

    events(options = {}, callback = false) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (!utils.isFunction(callback))
            throw new Error('Callback function expected');

        const self = this;

        return {
            start(startCallback = false) {
                if (!startCallback) {
                    self._startEventListener(options, callback);
                    return this;
                }

                self._startEventListener(options, callback).then(() => {
                    startCallback();
                }).catch(err => {
                    startCallback(err)
                });

                return this;
            },
            stop() {
                self._stopEventListener();
            }
        };
    }
}
