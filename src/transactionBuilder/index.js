import McashWeb from '../index';
import utils from '../utils';
import {AbiCoder} from '../utils/ethersUtils';
import Validator from '../paramValidator';
import {ADDRESS_PREFIX_REGEX} from '../utils/address';

let self;

//helpers

function toHex(value) {
    return self.mcashWeb.address.toHex(value);
}

function fromUtf8(value) {
    return self.mcashWeb.fromUtf8(value);
}

function resultManager(transaction, callback) {
    if (transaction.Error)
        return callback(transaction.Error);

    if (transaction.result && transaction.result.message) {
        return callback(
            self.mcashWeb.toUtf8(transaction.result.message)
        );
    }

    return callback(null, transaction);
}


export default class TransactionBuilder {
    constructor(mcashWeb = false) {
        if (!mcashWeb || !mcashWeb instanceof McashWeb)
            throw new Error('Expected instance of McashWeb');
        self = this;
        this.mcashWeb = mcashWeb;
        this.injectPromise = utils.promiseInjector(this);
        this.validator = new Validator(mcashWeb);
    }

    sendMcash(to = false, amount = 0, from = this.mcashWeb.defaultAddress.hex, memo = '', callback = false) {
        if (utils.isFunction(memo)) {
            callback = memo;
            memo = '';
        }
        if (utils.isFunction(from)) {
            callback = from;
            from = this.mcashWeb.defaultAddress.hex;
            memo = '';
        }

        if (!callback)
            return this.injectPromise(this.sendMcash, to, amount, from, memo);

        // accept amounts passed as strings
        if (utils.isString(amount))
            amount = parseInt(amount);

        if (this.validator.notValid([
            {
                name: 'recipient',
                type: 'address',
                value: to
            },
            {
                name: 'origin',
                type: 'address',
                value: from
            },
            {
                names: ['recipient', 'origin'],
                type: 'notEqual',
                msg: 'Cannot transfer MCASH to the same account'
            },
            {
                name: 'amount',
                type: 'integer',
                gt: 0,
                value: amount
            },
            {
                name: 'memo',
                type: 'string',
                value: memo
            }
        ], callback))
            return;

        let dataObj = {
            to_address: toHex(to),
            owner_address: toHex(from),
            amount: amount
        };
        if (memo.length) {
            dataObj['memo'] = fromUtf8(memo);
        }

        this.mcashWeb.fullNode.request('wallet/createtransaction', dataObj, 'post')
            .then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    sendToken(to = false, amount = 0, tokenId = false, from = this.mcashWeb.defaultAddress.hex, memo = '', callback = false) {
        if (utils.isFunction(from)) {
            callback = from;
            from = this.mcashWeb.defaultAddress.hex;
        }

        if (utils.isFunction(memo)) {
            callback = memo;
            memo = '';
        }

        if (!callback)
            return this.injectPromise(this.sendToken, to, amount, tokenId, from, memo);

        if (utils.isString(amount))
            amount = parseInt(amount);
        if (this.validator.notValid([
            {
                name: 'recipient',
                type: 'address',
                value: to
            },
            {
                name: 'origin',
                type: 'address',
                value: from,
            },
            {
                names: ['recipient', 'origin'],
                type: 'notEqual',
                msg: 'Cannot transfer tokens to the same account'
            },
            {
                name: 'amount',
                type: 'integer',
                gt: 0,
                value: amount
            },
            {
                name: 'token Id',
                type: 'tokenId',
                value: tokenId
            },
            {
                name: 'memo',
                type: 'string',
                value: memo
            }
        ], callback))
            return;

        let dataObj = {
            to_address: toHex(to),
            owner_address: toHex(from),
            asset_id: tokenId,
            amount: amount
        };
        if (memo.length) {
            dataObj['memo'] = fromUtf8(memo);
        }

        this.mcashWeb.fullNode.request('wallet/transferasset', dataObj,
            'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    purchaseToken(issuerAddress = false, tokenId = false, amount = 0, buyer = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(buyer)) {
            callback = buyer;
            buyer = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.purchaseToken, issuerAddress, tokenId, amount, buyer);

        if (this.validator.notValid([
            {
                name: 'buyer',
                type: 'address',
                value: buyer
            },
            {
                name: 'issuer',
                type: 'address',
                value: issuerAddress
            },
            {
                names: ['buyer', 'issuer'],
                type: 'notEqual',
                msg: 'Cannot purchase tokens from same account'
            },
            {
                name: 'amount',
                type: 'integer',
                gt: 0,
                value: amount
            },
            {
                name: 'token ID',
                type: 'tokenId',
                value: tokenId
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/participateassetissue', {
            to_address: toHex(issuerAddress),
            owner_address: toHex(buyer),
            asset_id: parseInt(tokenId),
            amount: amount
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    freezeBalance(amount = 0, duration = 3, resource = "BANDWIDTH", address = this.mcashWeb.defaultAddress.hex, receiverAddress = undefined, callback = false) {
        if (utils.isFunction(receiverAddress)) {
            callback = receiverAddress;
            receiverAddress = undefined;
        }

        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (utils.isFunction(duration)) {
            callback = duration;
            duration = 3;
        }

        if (utils.isFunction(resource)) {
            callback = resource;
            resource = "BANDWIDTH";
        }

        if (!callback)
            return this.injectPromise(this.freezeBalance, amount, duration, resource, address, receiverAddress);

        if (this.validator.notValid([
            {
                name: 'origin',
                type: 'address',
                value: address
            },
            {
                name: 'receiver',
                type: 'address',
                value: receiverAddress,
                optional: true
            },
            {
                name: 'amount',
                type: 'integer',
                gt: 0,
                value: amount
            },
            {
                name: 'duration',
                type: 'integer',
                gte: 0,
                value: duration
            },
            {
                name: 'resource',
                type: 'resource',
                value: resource,
                msg: 'Invalid resource provided: Expected "BANDWIDTH" or "ENERGY'
            }
        ], callback))
            return;

        const data = {
            owner_address: toHex(address),
            frozen_balance: amount,
            frozen_duration: duration,
            resource: resource
        };

        if (utils.isNotNullOrUndefined(receiverAddress) && toHex(receiverAddress) !== toHex(address)) {
            data.receiver_address = toHex(receiverAddress)
        }

        this.mcashWeb.fullNode.request('wallet/freezebalance', data, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    unfreezeBalance(resource = "BANDWIDTH", address = this.mcashWeb.defaultAddress.hex, receiverAddress = undefined, callback = false) {
        if (utils.isFunction(receiverAddress)) {
            callback = receiverAddress;
            receiverAddress = undefined;
        }

        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (utils.isFunction(resource)) {
            callback = resource;
            resource = "BANDWIDTH";
        }

        if (!callback)
            return this.injectPromise(this.unfreezeBalance, resource, address, receiverAddress);

        if (this.validator.notValid([
            {
                name: 'origin',
                type: 'address',
                value: address
            },
            {
                name: 'receiver',
                type: 'address',
                value: receiverAddress,
                optional: true
            },
            {
                name: 'resource',
                type: 'resource',
                value: resource,
                msg: 'Invalid resource provided: Expected "BANDWIDTH" or "ENERGY'
            }
        ], callback))
            return;

        const data = {
            owner_address: toHex(address),
            resource: resource
        };

        if (utils.isNotNullOrUndefined(receiverAddress) && toHex(receiverAddress) !== toHex(address)) {
            data.receiver_address = toHex(receiverAddress)
        }

        this.mcashWeb.fullNode.request('wallet/unfreezebalance', data, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    unfreezeAsset(address = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.unfreezeAsset, address);

        if (this.validator.notValid([
            {
                name: 'owner address',
                type: 'address',
                value: address
            }
        ], callback))
            return;

        const data = {
            owner_address: toHex(address),
        };

        this.mcashWeb.fullNode.request('wallet/unfreezeasset', data, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    stake(amount = 0, stakeDuration = 3, address = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (utils.isFunction(stakeDuration)) {
            callback = stakeDuration;
            stakeDuration = 3;
        }

        if (!callback)
            return this.injectPromise(this.stake, amount, stakeDuration, address);

        if (this.validator.notValid([
            {
                name: 'origin',
                type: 'address',
                value: address
            },
            {
                name: 'amount',
                type: 'integer',
                gt: 0,
                value: amount
            },
            {
                name: 'duration',
                type: 'integer',
                gte: 0,
                value: stakeDuration
            },
        ], callback))
            return;

        const data = {
            owner_address: toHex(address),
            stake_amount: amount,
            stake_duration: stakeDuration
        };

        this.mcashWeb.fullNode.request('wallet/stake', data, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    unstake(address = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.unstake, address);

        if (this.validator.notValid([
            {
                name: 'origin',
                type: 'address',
                value: address
            },
        ], callback))
            return;

        const data = {
            owner_address: toHex(address)
        };

        this.mcashWeb.fullNode.request('wallet/unstake', data, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    withdrawBlockRewards(address = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.withdrawBlockRewards, address);

        if (this.validator.notValid([
            {
                name: 'origin',
                type: 'address',
                value: address
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/withdrawbalance', {
            owner_address: toHex(address)
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    createWitness(witnessAddress = false, ownerAddress = this.mcashWeb.defaultAddress.hex, url = false, callback = false) {
        if (utils.isValidURL(ownerAddress)) {
            callback = url || false;
            url = ownerAddress;
            ownerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.createWitness, witnessAddress, ownerAddress, url);

        if (this.validator.notValid([
            {
                name: 'owner',
                type: 'address',
                value: ownerAddress
            },
            {
                name: 'witness',
                type: 'address',
                value: witnessAddress
            },
            {
                name: 'url',
                type: 'url',
                value: url,
                msg: 'Invalid url provided'
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/createwitness', {
            owner_address: toHex(ownerAddress),
            witness_address: toHex(witnessAddress),
            url: fromUtf8(url)
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    createAccount(accountAddress = false, ownerAddress = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (!callback)
            return this.injectPromise(this.createAccount, accountAddress, ownerAddress);
        if (this.validator.notValid([
            {
                name: 'ownerAddress',
                type: 'address',
                value: ownerAddress
            },
            {
                name: 'accountAddress',
                type: 'address',
                value: accountAddress
            }
        ], callback))
            return;
        this.mcashWeb.fullNode.request('wallet/createaccount', {
            owner_address: toHex(ownerAddress),
            account_address: toHex(accountAddress)
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    vote(voteAddress = false, ownerAddress = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.vote, voteAddress, ownerAddress);

        if (this.validator.notValid([
            {
                name: 'ownerAddress',
                type: 'address',
                value: ownerAddress
            },
            {
                name: 'voteAddress',
                type: 'address',
                value: voteAddress
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/votewitnessaccount', {
            owner_address: toHex(ownerAddress),
            vote_address: toHex(voteAddress)
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    createSmartContract(options = {}, issuerAddress = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.createSmartContract, options, issuerAddress);

        const feeLimit = options.feeLimit || 1_000_000_000;
        let userFeePercentage = options.userFeePercentage;
        if (typeof userFeePercentage !== 'number' && !userFeePercentage) {
            userFeePercentage = 100;
        }
        const originEnergyLimit = options.originEnergyLimit || 10_000_000;
        const callValue = options.callValue || 0;
        const tokenValue = options.tokenValue;
        const tokenId = options.tokenId || options.token_id;

        let {
            abi = false,
            bytecode = false,
            parameters = [],
            name = ""
        } = options;

        if (abi && utils.isString(abi)) {
            try {
                abi = JSON.parse(abi);
            } catch {
                return callback('Invalid options.abi provided');
            }
        }

        if (!utils.isArray(abi))
            return callback('Invalid options.abi provided');


        const payable = abi.some(func => {
            return func.type === 'constructor' && func.payable;
        });

        if (this.validator.notValid([
            {
                name: 'bytecode',
                type: 'hex',
                value: bytecode
            },
            {
                name: 'feeLimit',
                type: 'integer',
                value: feeLimit,
                gt: 0,
                lte: 100_000_000_000
            },
            {
                name: 'callValue',
                type: 'integer',
                value: callValue,
                gte: 0
            },
            {
                name: 'userFeePercentage',
                type: 'integer',
                value: userFeePercentage,
                gte: 0,
                lte: 100
            },
            {
                name: 'originEnergyLimit',
                type: 'integer',
                value: originEnergyLimit,
                gte: 0,
                lte: 10_000_000
            },
            {
                name: 'parameters',
                type: 'array',
                value: parameters
            },
            {
                name: 'issuer',
                type: 'address',
                value: issuerAddress
            },
            {
                name: 'tokenValue',
                type: 'integer',
                value: tokenValue,
                gte: 0,
                optional: true
            },
            {
                name: 'tokenId',
                type: 'integer',
                value: tokenId,
                gte: 0,
                optional: true
            }
        ], callback))
            return;

        if (payable && callValue == 0 && tokenValue == 0)
            return callback('When contract is payable, options.callValue or options.tokenValue must be a positive integer');

        if (!payable && (callValue > 0 || tokenValue > 0))
            return callback('When contract is not payable, options.callValue and options.tokenValue must be 0');


        var constructorParams = abi.find(
            (it) => {
                return it.type === 'constructor';
            }
        );

        if (typeof constructorParams !== 'undefined' && constructorParams) {
            const abiCoder = new AbiCoder();
            const types = [];
            const values = [];
            constructorParams = constructorParams.inputs;

            if (parameters.length != constructorParams.length)
                return callback(`constructor needs ${constructorParams.length} but ${parameters.length} provided`);

            for (let i = 0; i < parameters.length; i++) {
                let type = constructorParams[i].type;
                let value = parameters[i];

                if (!type || !utils.isString(type) || !type.length)
                    return callback('Invalid parameter type provided: ' + type);

                if (type == 'address')
                    value = toHex(value).replace(ADDRESS_PREFIX_REGEX, '0x');

                types.push(type);
                values.push(value);
            }

            try {
                parameters = abiCoder.encode(types, values).replace(/^(0x)/, '');
            } catch (ex) {
                return callback(ex);
            }
        } else parameters = '';

        const args = {
            owner_address: toHex(issuerAddress),
            fee_limit: parseInt(feeLimit),
            call_value: parseInt(callValue),
            consume_user_resource_percent: userFeePercentage,
            origin_energy_limit: originEnergyLimit,
            abi: JSON.stringify(abi),
            bytecode,
            parameter: parameters,
            name
        };

        // tokenValue and tokenId can cause errors if provided when the trx10 proposal has not been approved yet. So we set them only if they are passed to the method.
        if (utils.isNotNullOrUndefined(tokenValue))
            args.call_token_value = parseInt(tokenValue)
        if (utils.isNotNullOrUndefined(tokenId))
            args.token_id = parseInt(tokenId);

        this.mcashWeb.fullNode.request('wallet/deploycontract', args, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    triggerSmartContract(...params) {
        if (typeof params[2] !== 'object') {
            params[2] = {
                feeLimit: params[2],
                callValue: params[3]
            };
            params.splice(3, 1)
        }
        return this._triggerSmartContract(...params);
    }

    _triggerSmartContract(
        contractAddress,
        functionSelector,
        options = {},
        parameters = [],
        issuerAddress = this.mcashWeb.defaultAddress.hex,
        callback = false
    ) {

        if (utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (utils.isFunction(parameters)) {
            callback = parameters;
            parameters = [];
        }

        if (!callback) {
            return this.injectPromise(
                this._triggerSmartContract,
                contractAddress,
                functionSelector,
                options,
                parameters,
                issuerAddress
            );
        }

        let {
            tokenValue,
            tokenId,
            callValue,
            feeLimit
        } = Object.assign({
            callValue: 0,
            feeLimit: 1_000_000_000
        }, options);

        if (this.validator.notValid([
            {
                name: 'feeLimit',
                type: 'integer',
                value: feeLimit,
                gt: 0,
                lte: 100_000_000_000
            },
            {
                name: 'callValue',
                type: 'integer',
                value: callValue,
                gte: 0
            },
            {
                name: 'parameters',
                type: 'array',
                value: parameters
            },
            {
                name: 'contract',
                type: 'address',
                value: contractAddress
            },
            {
                name: 'issuer',
                type: 'address',
                value: issuerAddress
            },
            {
                name: 'tokenValue',
                type: 'integer',
                value: tokenValue,
                gte: 0,
                optional: true
            },
            {
                name: 'tokenId',
                type: 'integer',
                value: tokenId,
                gte: 0,
                optional: true
            },
            {
                name: 'function selector',
                type: 'not-empty-string',
                value: functionSelector
            }
        ], callback))
            return;

        functionSelector = functionSelector.replace('/\s*/g', '');

        if (parameters.length) {
            const abiCoder = new AbiCoder();
            let types = [];
            const values = [];

            for (let i = 0; i < parameters.length; i++) {
                let {type, value} = parameters[i];

                if (!type || !utils.isString(type) || !type.length)
                    return callback('Invalid parameter type provided: ' + type);

                if (type === 'address')
                    value = toHex(value).replace(ADDRESS_PREFIX_REGEX, '0x');

                types.push(type);
                values.push(value);
            }

            try {
                // workaround for unsupported mcashToken type
                types = types.map(type => {
                    if (/mcashToken/.test(type)) {
                        type = type.replace(/mcashToken/, 'uint256')
                    }
                    return type
                });

                parameters = abiCoder.encode(types, values).replace(/^(0x)/, '');
            } catch (ex) {
                return callback(ex);
            }
        } else parameters = '';

        const args = {
            contract_address: toHex(contractAddress),
            owner_address: toHex(issuerAddress),
            function_selector: functionSelector,
            fee_limit: parseInt(feeLimit),
            call_value: parseInt(callValue),
            parameter: parameters
        };

        if (utils.isNotNullOrUndefined(tokenValue))
            args.call_token_value = parseInt(tokenValue);
        if (utils.isNotNullOrUndefined(tokenId))
            args.token_id = parseInt(tokenId);

        this.mcashWeb.fullNode.request('wallet/triggersmartcontract', args, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }


    createToken(options = {}, issuerAddress = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.createToken, options, issuerAddress);

        const {
            name = false,
            abbreviation = false,
            description = false,
            url = false,
            totalSupply = 0,
            mcashRatio = 1, // How much MCASH will `tokenRatio` cost?
            tokenRatio = 1, // How many tokens will `mcashRatio` afford?
            saleStart = Date.now(),
            saleEnd = false,
            freeBandwidth = 0, // The creator's "donated" bandwidth for use by token holders
            freeBandwidthLimit = 0, // Out of `totalFreeBandwidth`, the amount each token holder get
            frozenAmount = 0,
            frozenDuration = 0,
            // for now there is no default for the following values
            voteScore,
            precision
        } = options;

        if (this.validator.notValid([
            {
                name: 'Supply amount',
                type: 'positive-integer',
                value: totalSupply
            },
            {
                name: 'MCASH ratio',
                type: 'positive-integer',
                value: mcashRatio
            },
            {
                name: 'Token ratio',
                type: 'positive-integer',
                value: tokenRatio
            },
            {
                name: 'token abbreviation',
                type: 'not-empty-string',
                value: abbreviation
            },
            {
                name: 'token name',
                type: 'not-empty-string',
                value: name
            },
            {
                name: 'token description',
                type: 'not-empty-string',
                value: description
            },
            {
                name: 'token url',
                type: 'url',
                value: url
            },
            {
                name: 'issuer',
                type: 'address',
                value: issuerAddress
            },
            {
                name: 'sale start timestamp',
                type: 'integer',
                value: saleStart,
                gte: Date.now()
            },
            {
                name: 'sale end timestamp',
                type: 'integer',
                value: saleEnd,
                gt: saleStart
            },
            {
                name: 'Free bandwidth amount',
                type: 'integer',
                value: freeBandwidth,
                gte: 0
            },
            {
                name: 'Free bandwidth limit',
                type: 'integer',
                value: freeBandwidthLimit,
                gte: 0
            },
            {
                name: 'Frozen supply',
                type: 'integer',
                value: frozenAmount,
                gte: 0
            },
            {
                name: 'Frozen duration',
                type: 'integer',
                value: frozenDuration,
                gte: 0
            }
        ], callback))
            return;

        if (utils.isNotNullOrUndefined(voteScore) && (!utils.isInteger(voteScore) || voteScore <= 0))
            return callback('voteScore must be a positive integer greater than 0');

        if (utils.isNotNullOrUndefined(precision) && (!utils.isInteger(precision) || precision < 0 || precision > 8))
            return callback('precision must be a positive integer >= 0 and <= 8');

        const data = {
            owner_address: toHex(issuerAddress),
            name: fromUtf8(name),
            abbr: fromUtf8(abbreviation),
            description: fromUtf8(description),
            url: fromUtf8(url),
            total_supply: totalSupply,
            mcash_num: mcashRatio,
            num: tokenRatio,
            start_time: saleStart,
            end_time: saleEnd,
            free_asset_bandwidth_limit: freeBandwidth,
            public_free_asset_bandwidth_limit: freeBandwidthLimit,
            frozen_supply: {
                frozen_amount: frozenAmount,
                frozen_days: frozenDuration
            }
        };
        if (precision && !isNaN(parseInt(precision))) {
            data.precision = parseInt(precision);
        }
        if (voteScore && !isNaN(parseInt(voteScore))) {
            data.vote_score = parseInt(voteScore)
        }

        this.mcashWeb.fullNode.request('wallet/createassetissue', data, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    updateAccount(accountName = false, address = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback) {
            return this.injectPromise(this.updateAccount, accountName, address);
        }

        if (this.validator.notValid([
            {
                name: 'Name',
                type: 'not-empty-string',
                value: accountName
            },
            {
                name: 'origin',
                type: 'address',
                value: address
            }
        ], callback))
            return;


        this.mcashWeb.fullNode.request('wallet/updateaccount', {
            account_name: fromUtf8(accountName),
            owner_address: toHex(address),
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    updateToken(options = {}, issuerAddress = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.updateToken, options, issuerAddress);

        const {
            description = false,
            url = false,
            freeBandwidth = 0, // The creator's "donated" bandwidth for use by token holders
            freeBandwidthLimit = 0 // Out of `totalFreeBandwidth`, the amount each token holder get
        } = options;


        if (this.validator.notValid([
            {
                name: 'token description',
                type: 'not-empty-string',
                value: description
            },
            {
                name: 'token url',
                type: 'url',
                value: url
            },
            {
                name: 'issuer',
                type: 'address',
                value: issuerAddress
            },
            {
                name: 'Free bandwidth amount',
                type: 'positive-integer',
                value: freeBandwidth
            },
            {
                name: 'Free bandwidth limit',
                type: 'positive-integer',
                value: freeBandwidthLimit
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/updateasset', {
            owner_address: toHex(issuerAddress),
            description: fromUtf8(description),
            url: fromUtf8(url),
            new_limit: parseInt(freeBandwidth),
            new_public_limit: parseInt(freeBandwidthLimit)
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    sendAsset(...args) {
        return this.sendToken(...args);
    }

    purchaseAsset(...args) {
        return this.purchaseToken(...args);
    }

    createAsset(...args) {
        return this.createToken(...args);
    }

    updateAsset(...args) {
        return this.updateToken(...args);
    }

    /**
     * Creates a proposal to modify the network.
     * Can only be created by a current Super Representative.
     */
    createProposal(parameters = false, issuerAddress = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.createProposal, parameters, issuerAddress);

        if (this.validator.notValid([
            {
                name: 'issuer',
                type: 'address',
                value: issuerAddress
            }
        ], callback))
            return;

        const invalid = 'Invalid proposal parameters provided';

        if (!parameters)
            return callback(invalid);

        if (!utils.isArray(parameters))
            parameters = [parameters];

        for (let parameter of parameters) {
            if (!utils.isObject(parameter))
                return callback(invalid);
        }

        this.mcashWeb.fullNode.request('wallet/proposalcreate', {
            owner_address: toHex(issuerAddress),
            parameters: parameters
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    /**
     * Deletes a network modification proposal that the owner issued.
     * Only current Super Representative can vote on a proposal.
     */
    deleteProposal(proposalId = false, issuerAddress = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(issuerAddress)) {
            callback = issuerAddress;
            issuerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.deleteProposal, proposalId, issuerAddress);

        if (this.validator.notValid([
            {
                name: 'issuer',
                type: 'address',
                value: issuerAddress
            },
            {
                name: 'proposalId',
                type: 'integer',
                value: proposalId,
                gte: 0
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/proposaldelete', {
            owner_address: toHex(issuerAddress),
            proposal_id: proposalId
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    /**
     * Adds a vote to an issued network modification proposal.
     * Only current Super Representative can vote on a proposal.
     */
    voteProposal(proposalId = false, isApproval = false, voterAddress = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(voterAddress)) {
            callback = voterAddress;
            voterAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.voteProposal, proposalId, isApproval, voterAddress);

        if (this.validator.notValid([
            {
                name: 'voter',
                type: 'address',
                value: voterAddress
            },
            {
                name: 'proposalId',
                type: 'integer',
                value: proposalId,
                gte: 0
            },
            {
                name: 'has approval',
                type: 'boolean',
                value: isApproval
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/proposalapprove', {
            owner_address: toHex(voterAddress),
            proposal_id: proposalId,
            is_add_approval: isApproval
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    /**
     * Create an exchange between a token and MCASH.
     * Token Name should be a CASE SENSITIVE string.
     */
    createMcashExchange(tokenId, tokenBalance, mcashBalance, ownerAddress = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.createMcashExchange, tokenId, tokenBalance, mcashBalance, ownerAddress);

        if (this.validator.notValid([
            {
                name: 'owner',
                type: 'address',
                value: ownerAddress
            },
            {
                name: 'token id',
                type: 'integer',
                value: tokenId,
                gte: 0,
            },
            {
                name: 'token balance',
                type: 'positive-integer',
                value: tokenBalance
            },
            {
                name: 'mcash balance',
                type: 'positive-integer',
                value: mcashBalance
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/exchangecreate', {
            owner_address: toHex(ownerAddress),
            first_token_id: tokenId,
            first_token_balance: tokenBalance,
            second_token_id: 0, // Constant for MCASH.
            second_token_balance: mcashBalance
        }, 'post').then(resources => {
            callback(null, resources);
        }).catch(err => callback(err));
    }

    /**
     * Create an exchange between a token and another token.
     * DO NOT USE THIS FOR MCASH.
     * Token Names should be a CASE SENSITIVE string.
     */
    createTokenExchange(firstTokenId, firstTokenBalance, secondTokenId, secondTokenBalance, ownerAddress = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.createTokenExchange, firstTokenId, firstTokenBalance, secondTokenId, secondTokenBalance, ownerAddress);

        if (this.validator.notValid([
            {
                name: 'owner',
                type: 'address',
                value: ownerAddress
            },
            {
                name: 'first token id',
                type: 'integer',
                value: firstTokenId,
                gte: 0,
            },
            {
                name: 'second token id',
                type: 'integer',
                value: secondTokenId,
                gte: 0,
            },
            {
                name: 'first token balance',
                type: 'positive-integer',
                value: firstTokenBalance
            },
            {
                name: 'second token balance',
                type: 'positive-integer',
                value: secondTokenBalance
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/exchangecreate', {
            owner_address: toHex(ownerAddress),
            first_token_id: firstTokenId,
            first_token_balance: firstTokenBalance,
            second_token_id: secondTokenId,
            second_token_balance: secondTokenBalance
        }, 'post').then(resources => {
            callback(null, resources);
        }).catch(err => callback(err));
    }

    /**
     * Adds tokens into a bancor style exchange.
     * Will add both tokens at market rate.
     * Use 0 for the constant value for MCASH.
     */
    injectExchangeTokens(exchangeId = false, tokenId = false, tokenAmount = 0, ownerAddress = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.injectExchangeTokens, exchangeId, tokenId, tokenAmount, ownerAddress);

        if (this.validator.notValid([
            {
                name: 'owner',
                type: 'address',
                value: ownerAddress
            },
            {
                name: 'tokenId',
                type: 'integer',
                value: tokenId,
                gte: 0,
            },
            {
                name: 'tokenAmount',
                type: 'integer',
                value: tokenAmount,
                gte: 1
            },
            {
                name: 'exchangeId',
                type: 'integer',
                value: exchangeId,
                gte: 0
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/exchangeinject', {
            owner_address: toHex(ownerAddress),
            exchange_id: exchangeId,
            token_id: tokenId,
            quant: tokenAmount
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    /**
     * Withdraws tokens from a bancor style exchange.
     * Will withdraw at market rate both tokens.
     * Use "_" for the constant value for TRX.
     */
    withdrawExchangeTokens(exchangeId = false, tokenId = false, tokenAmount = 0, ownerAddress = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.withdrawExchangeTokens, exchangeId, tokenId, tokenAmount, ownerAddress);

        if (this.validator.notValid([
            {
                name: 'owner',
                type: 'address',
                value: ownerAddress
            },
            {
                name: 'tokenId',
                type: 'integer',
                value: tokenId,
                gte: 0,
            },
            {
                name: 'tokenAmount',
                type: 'integer',
                value: tokenAmount,
                gte: 1
            },
            {
                name: 'exchangeId',
                type: 'integer',
                value: exchangeId,
                gte: 0
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/exchangewithdraw', {
            owner_address: toHex(ownerAddress),
            exchange_id: exchangeId,
            token_id: tokenId,
            quant: tokenAmount
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    /**
     * Trade tokens on a bancor style exchange.
     * Expected value is a validation and used to cap the total amt of token 2 spent.
     * Use "_" for the constant value for TRX.
     */
    tradeExchangeTokens(exchangeId = false,
                        tokenId = false,
                        tokenAmountSold = 0,
                        tokenAmountExpected = 0,
                        ownerAddress = this.mcashWeb.defaultAddress.hex,
                        callback = false) {
        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.tradeExchangeTokens, exchangeId, tokenId, tokenAmountSold, tokenAmountExpected, ownerAddress);

        if (this.validator.notValid([
            {
                name: 'owner',
                type: 'address',
                value: ownerAddress
            },
            {
                name: 'token name',
                type: 'integer',
                value: tokenId,
                gte: 0
            },
            {
                name: 'tokenAmountSold',
                type: 'integer',
                value: tokenAmountSold,
                gte: 1
            },
            {
                name: 'tokenAmountExpected',
                type: 'integer',
                value: tokenAmountExpected,
                gte: 1
            },
            {
                name: 'exchangeId',
                type: 'integer',
                value: exchangeId,
                gte: 0
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/exchangetransaction', {
            owner_address: toHex(ownerAddress),
            exchange_id: exchangeId,
            token_id: tokenId,
            quant: tokenAmountSold,
            expected: tokenAmountExpected
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    /**
     * Update userFeePercentage.
     */
    updateSetting(contractAddress = false,
                  userFeePercentage = false,
                  ownerAddress = this.mcashWeb.defaultAddress.hex,
                  callback = false) {

        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.updateSetting, contractAddress, userFeePercentage, ownerAddress);

        if (this.validator.notValid([
            {
                name: 'owner',
                type: 'address',
                value: ownerAddress
            },
            {
                name: 'contract',
                type: 'address',
                value: contractAddress
            },
            {
                name: 'userFeePercentage',
                type: 'integer',
                value: userFeePercentage,
                gte: 0,
                lte: 100
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/updatesetting', {
            owner_address: toHex(ownerAddress),
            contract_address: toHex(contractAddress),
            consume_user_resource_percent: userFeePercentage
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    /**
     * Update energy limit.
     */
    updateEnergyLimit(contractAddress = false,
                      originEnergyLimit = false,
                      ownerAddress = this.mcashWeb.defaultAddress.hex,
                      callback = false) {

        if (utils.isFunction(ownerAddress)) {
            callback = ownerAddress;
            ownerAddress = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.updateEnergyLimit, contractAddress, originEnergyLimit, ownerAddress);

        if (this.validator.notValid([
            {
                name: 'owner',
                type: 'address',
                value: ownerAddress
            },
            {
                name: 'contract',
                type: 'address',
                value: contractAddress
            },
            {
                name: 'originEnergyLimit',
                type: 'integer',
                value: originEnergyLimit,
                gte: 0,
                lte: 10_000_000
            }
        ], callback))
            return;

        this.mcashWeb.fullNode.request('wallet/updateenergylimit', {
            owner_address: toHex(ownerAddress),
            contract_address: toHex(contractAddress),
            origin_energy_limit: originEnergyLimit
        }, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }

    checkPermissions(permissions, type) {
        if (permissions) {
            if (permissions.type !== type
                || !permissions.permission_name
                || !utils.isString(permissions.permission_name)
                || !utils.isInteger(permissions.threshold)
                || permissions.threshold < 1
                || !permissions.keys
            ) {
                return false
            }
            for (let key of permissions.keys) {
                if (!this.mcashWeb.isAddress(key.address)
                    || !utils.isInteger(key.weight)
                    || key.weight > permissions.threshold
                    || key.weight < 1
                    || (type === 2 && !permissions.operations)
                ) {
                    return false
                }
            }
        }
        return true
    }

    updateAccountPermissions(ownerAddress = this.mcashWeb.defaultAddress.hex,
                             ownerPermissions = false,
                             witnessPermissions = false,
                             activesPermissions = false,
                             callback = false) {

        if (utils.isFunction(activesPermissions)) {
            callback = activesPermissions;
            activesPermissions = false;
        }

        if (utils.isFunction(witnessPermissions)) {
            callback = witnessPermissions;
            witnessPermissions = activesPermissions = false;
        }

        if (utils.isFunction(ownerPermissions)) {
            callback = ownerPermissions;
            ownerPermissions = witnessPermissions = activesPermissions = false;
        }

        if (!callback)
            return this.injectPromise(this.updateAccountPermissions, ownerAddress, ownerPermissions, witnessPermissions, activesPermissions);

        if (!this.mcashWeb.isAddress(ownerAddress))
            return callback('Invalid ownerAddress provided');

        if (!this.checkPermissions(ownerPermissions, 0)) {
            return callback('Invalid ownerPermissions provided');
        }

        if (!this.checkPermissions(witnessPermissions, 1)) {
            return callback('Invalid witnessPermissions provided');
        }

        if (!Array.isArray(activesPermissions)) {
            activesPermissions = [activesPermissions]
        }

        for (let activesPermission of activesPermissions) {
            if (!this.checkPermissions(activesPermission, 2)) {
                return callback('Invalid activesPermissions provided');
            }
        }

        const data = {
            owner_address: ownerAddress
        };
        if (ownerPermissions) {
            data.owner = ownerPermissions
        }
        if (witnessPermissions) {
            data.witness = witnessPermissions
        }
        if (activesPermissions) {
            data.actives = activesPermissions.length === 1 ? activesPermissions[0] : activesPermissions
        }

        this.mcashWeb.fullNode.request('wallet/accountpermissionupdate', data, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
    }


}
