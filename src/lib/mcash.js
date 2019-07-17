import McashWeb from 'index';
import utils from 'utils';
import {keccak256, toUtf8Bytes, recoverAddress, SigningKey} from 'utils/ethersUtils';
import {ADDRESS_PREFIX} from 'utils/address';

const MCASH_MESSAGE_HEADER = '\x19MCASH Signed Message:\n32';
const ETH_MESSAGE_HEADER = '\x19Ethereum Signed Message:\n32';

export default class Mcash {
    constructor(mcashWeb = false) {
        if (!mcashWeb || !mcashWeb instanceof McashWeb)
            throw new Error('Expected instance of McashWeb');

        this.mcashWeb = mcashWeb;
        this.injectPromise = utils.promiseInjector(this);
        this.cache = {
            contracts: {}
        }
    }

    _parseToken(token) {
        return {
            ...token,
            name: this.mcashWeb.toUtf8(token.name),
            abbr: token.abbr && this.mcashWeb.toUtf8(token.abbr),
            description: token.description && this.mcashWeb.toUtf8(token.description),
            url: token.url && this.mcashWeb.toUtf8(token.url)
        };
    }

    getCurrentBlock(callback = false) {
        if (!callback)
            return this.injectPromise(this.getCurrentBlock);

        this.mcashWeb.fullNode.request('wallet/getnowblock').then(block => {
            callback(null, block);
        }).catch(err => callback(err));
    }

    getConfirmedCurrentBlock(callback = false) {
        if (!callback)
            return this.injectPromise(this.getConfirmedCurrentBlock);

        this.mcashWeb.solidityNode.request('walletsolidity/getnowblock').then(block => {
            callback(null, block);
        }).catch(err => callback(err));
    }

    getBlock(block = this.mcashWeb.defaultBlock, callback = false) {
        if (utils.isFunction(block)) {
            callback = block;
            block = this.mcashWeb.defaultBlock;
        }

        if (!callback)
            return this.injectPromise(this.getBlock, block);

        if (block === false)
            return callback('No block identifier provided');

        if (block == 'earliest')
            block = 0;

        if (block == 'latest')
            return this.getCurrentBlock(callback);

        if (isNaN(block) && utils.isHex(block))
            return this.getBlockByHash(block, callback);

        this.getBlockByNumber(block, callback);
    }

    getBlockByHash(blockHash, callback = false) {
        if (!callback)
            return this.injectPromise(this.getBlockByHash, blockHash);

        this.mcashWeb.fullNode.request('wallet/getblockbyid', {
            value: blockHash
        }, 'post').then(block => {
            if (!Object.keys(block).length)
                return callback('Block not found');

            callback(null, block);
        }).catch(err => callback(err));
    }

    getBlockByNumber(blockID, callback = false) {
        if (!callback)
            return this.injectPromise(this.getBlockByNumber, blockID);

        if (!utils.isInteger(blockID) || blockID < 0)
            return callback('Invalid block number provided');

        this.mcashWeb.fullNode.request('wallet/getblockbynum', {
            num: blockID
        }, 'post').then(block => {
            if (!Object.keys(block).length)
                return callback('Block not found');

            callback(null, block);
        }).catch(err => callback(err));
    }

    getBlockTransactionCount(block = this.mcashWeb.defaultBlock, callback = false) {
        if (utils.isFunction(block)) {
            callback = block;
            block = this.mcashWeb.defaultBlock;
        }

        if (!callback)
            return this.injectPromise(this.getBlockTransactionCount, block);

        this.getBlock(block).then(({transactions = []}) => {
            callback(null, transactions.length);
        }).catch(err => callback(err));
    }

    getTransactionFromBlock(block = this.mcashWeb.defaultBlock, index = 0, callback = false) {
        if (utils.isFunction(index)) {
            callback = index;
            index = 0;
        }

        if (utils.isFunction(block)) {
            callback = block;
            block = this.mcashWeb.defaultBlock;
        }

        if (!callback)
            return this.injectPromise(this.getTransactionFromBlock, block, index);

        if (!utils.isInteger(index) || index < 0)
            return callback('Invalid transaction index provided');

        this.getBlock(block).then(({transactions = false}) => {
            if (!transactions || transactions.length < index)
                return callback('Transaction not found in block');

            callback(null, transactions[index]);
        }).catch(err => callback(err));
    }

    getTransaction(transactionID, callback = false) {
        if (!callback)
            return this.injectPromise(this.getTransaction, transactionID);

        this.mcashWeb.fullNode.request('wallet/gettransactionbyid', {
            value: transactionID
        }, 'post').then(transaction => {
            if (!Object.keys(transaction).length)
                return callback('Transaction not found');

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    getConfirmedTransaction(transactionID, callback = false) {
        if (!callback)
            return this.injectPromise(this.getConfirmedTransaction, transactionID);

        this.mcashWeb.solidityNode.request('walletsolidity/gettransactionbyid', {
            value: transactionID
        }, 'post').then(transaction => {
            if (!Object.keys(transaction).length)
                return callback('Transaction not found');

            callback(null, transaction);
        }).catch(err => callback(err));
    }

    getTransactionInfo(transactionID, callback = false) {
        if (!callback)
            return this.injectPromise(this.getTransactionInfo, transactionID);

        this.mcashWeb.solidityNode.request('walletsolidity/gettransactioninfobyid', {
            value: transactionID
        }, 'post').then(transaction => {
            callback(null, transaction);
        }).catch(err => callback(err));
    }

    getTransactionsToAddress(address = this.mcashWeb.defaultAddress.hex, limit = 30, offset = 0, callback = false) {
        if (utils.isFunction(offset)) {
            callback = offset;
            offset = 0;
        }

        if (utils.isFunction(limit)) {
            callback = limit;
            limit = 30;
        }

        if (!callback)
            return this.injectPromise(this.getTransactionsToAddress, address, limit, offset);

        address = this.mcashWeb.address.toHex(address);

        return this.getTransactionsRelated(address, 'to', limit, offset, callback);
    }

    getTransactionsFromAddress(address = this.mcashWeb.defaultAddress.hex, limit = 30, offset = 0, callback = false) {
        if (utils.isFunction(offset)) {
            callback = offset;
            offset = 0;
        }

        if (utils.isFunction(limit)) {
            callback = limit;
            limit = 30;
        }

        if (!callback)
            return this.injectPromise(this.getTransactionsFromAddress, address, limit, offset);

        address = this.mcashWeb.address.toHex(address);

        return this.getTransactionsRelated(address, 'from', limit, offset, callback);
    }

    async getTransactionsRelated(address = this.mcashWeb.defaultAddress.hex, direction = 'all', limit = 30, offset = 0, callback = false) {
        if (utils.isFunction(offset)) {
            callback = offset;
            offset = 0;
        }

        if (utils.isFunction(limit)) {
            callback = limit;
            limit = 30;
        }

        if (utils.isFunction(direction)) {
            callback = direction;
            direction = 'all';
        }

        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.getTransactionsRelated, address, direction, limit, offset);

        if (!['to', 'from', 'all'].includes(direction))
            return callback('Invalid direction provided: Expected "to", "from" or "all"');

        if (direction == 'all') {
            try {
                const [from, to] = await Promise.all([
                    this.getTransactionsRelated(address, 'from', limit, offset),
                    this.getTransactionsRelated(address, 'to', limit, offset)
                ]);

                return callback(null, [
                    ...from.map(tx => (tx.direction = 'from', tx)),
                    ...to.map(tx => (tx.direction = 'to', tx))
                ].sort((a, b) => {
                    return b.raw_data.timestamp - a.raw_data.timestamp
                }));
            } catch (ex) {
                return callback(ex);
            }
        }

        if (!this.mcashWeb.isAddress(address))
            return callback('Invalid address provided');

        if (!utils.isInteger(limit) || limit < 0 || (offset && limit < 1))
            return callback('Invalid limit provided');

        if (!utils.isInteger(offset) || offset < 0)
            return callback('Invalid offset provided');

        address = this.mcashWeb.address.toHex(address);

        this.mcashWeb.solidityNode.request(`walletextension/gettransactions${direction}this`, {
            account: {
                address
            },
            offset,
            limit
        }, 'post').then(({transaction}) => {
            callback(null, transaction);
        }).catch(err => callback(err));
    }

    getAccount(address = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.getAccount, address);

        if (!this.mcashWeb.isAddress(address))
            return callback('Invalid address provided');

        address = this.mcashWeb.address.toHex(address);

        // this.tronWeb.solidityNode.request('walletsolidity/getaccount', {
        //     address
        // }, 'post').then(account => {
        //     callback(null, account);
        // }).catch(err => callback(err));

        this.mcashWeb.fullNode.request('wallet/getaccount', {
            address
        }, 'post').then(account => {
            callback(null, account);
        }).catch(err => callback(err));
    }

    getBalance(address = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.getBalance, address);

        this.getAccount(address).then(({balance = 0}) => {
            callback(null, balance);
        }).catch(err => callback(err));
    }

    getUnconfirmedAccount(address = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.getUnconfirmedAccount, address);

        if (!this.mcashWeb.isAddress(address))
            return callback('Invalid address provided');

        address = this.mcashWeb.address.toHex(address);

        this.mcashWeb.fullNode.request('wallet/getaccount', {
            address
        }, 'post').then(account => {
            callback(null, account);
        }).catch(err => callback(err));
    }

    getUnconfirmedBalance(address = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.getUnconfirmedBalance, address);

        this.getUnconfirmedAccount(address).then(({balance = 0}) => {
            callback(null, balance);
        }).catch(err => callback(err));
    }

    getBandwidth(address = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.getBandwidth, address);

        if (!this.mcashWeb.isAddress(address))
            return callback('Invalid address provided');

        address = this.mcashWeb.address.toHex(address);

        this.mcashWeb.fullNode.request('wallet/getaccountnet', {
            address
        }, 'post').then(({free_bandwidth_used = 0, free_bandwidth_limit = 0, bandwidth_used = 0, bandwidth_limit = 0}) => {
            callback(null, (free_bandwidth_limit - free_bandwidth_used) + (bandwidth_limit - bandwidth_used));
        }).catch(err => callback(err));
    }

    getTokensIssuedByAddress(address = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.hex;
        }

        if (!callback)
            return this.injectPromise(this.getTokensIssuedByAddress, address);

        if (!this.mcashWeb.isAddress(address))
            return callback('Invalid address provided');

        address = this.mcashWeb.address.toHex(address);

        this.mcashWeb.fullNode.request('wallet/getassetissuebyaccount', {
            address
        }, 'post').then(({asset_issue = false}) => {
            if (!asset_issue)
                return callback(null, {});

            const tokens = asset_issue.map(token => {
                return this._parseToken(token);
            }).reduce((tokens, token) => {
                return tokens[token.name] = token, tokens;
            }, {});

            callback(null, tokens);
        }).catch(err => callback(err));
    }

    getTokenFromId(tokenId = false, callback = false) {
        if (!callback)
            return this.injectPromise(this.getTokenFromId, tokenId);

        if (utils.isString(tokenId))
            tokenId = parseInt(tokenId);

        if (!utils.isInteger(tokenId))
            return callback('Invalid token ID provided');

        this.mcashWeb.fullNode.request('wallet/getassetissuebyid', {
            value: tokenId
        }, 'post').then(token => {
            if (!token.name)
                return callback('Token does not exist');

            callback(null, this._parseToken(token));
        }).catch(err => callback(err));
    }

    listNodes(callback = false) {
        if (!callback)
            return this.injectPromise(this.listNodes);

        this.mcashWeb.fullNode.request('wallet/listnodes').then(({nodes = []}) => {
            callback(null, nodes.map(({address: {host, port}}) => (
                `${this.mcashWeb.toUtf8(host)}:${port}`
            )));
        }).catch(err => callback(err));
    }

    getBlockRange(start = 0, end = 30, callback = false) {
        if (utils.isFunction(end)) {
            callback = end;
            end = 30;
        }

        if (utils.isFunction(start)) {
            callback = start;
            start = 0;
        }

        if (!callback)
            return this.injectPromise(this.getBlockRange, start, end);

        if (!utils.isInteger(start) || start < 0)
            return callback('Invalid start of range provided');

        if (!utils.isInteger(end) || end <= start)
            return callback('Invalid end of range provided');

        this.mcashWeb.fullNode.request('wallet/getblockbylimitnext', {
            start_num: parseInt(start),
            end_num: parseInt(end) + 1
        }, 'post').then(({block = []}) => {
            callback(null, block);
        }).catch(err => callback(err));
    }

    listSuperRepresentatives(callback = false) {
        if (!callback)
            return this.injectPromise(this.listSuperRepresentatives);

        this.mcashWeb.fullNode.request('wallet/listwitnesses').then(({witnesses = []}) => {
            callback(null, witnesses);
        }).catch(err => callback(err));
    }

    listTokens(limit = 0, offset = 0, callback = false) {
        if (utils.isFunction(offset)) {
            callback = offset;
            offset = 0;
        }

        if (utils.isFunction(limit)) {
            callback = limit;
            limit = 0;
        }

        if (!callback)
            return this.injectPromise(this.listTokens, limit, offset);

        if (!utils.isInteger(limit) || limit < 0 || (offset && limit < 1))
            return callback('Invalid limit provided');

        if (!utils.isInteger(offset) || offset < 0)
            return callback('Invalid offset provided');

        if (!limit) {
            return this.mcashWeb.fullNode.request('wallet/getassetissuelist').then(({assetIssue = []}) => {
                callback(null, assetIssue.map(token => this._parseToken(token)));
            }).catch(err => callback(err));
        }

        this.mcashWeb.fullNode.request('wallet/getpaginatedassetissuelist', {
            offset: parseInt(offset),
            limit: parseInt(limit)
        }, 'post').then(({assetIssue = []}) => {
            callback(null, assetIssue.map(token => this._parseToken(token)));
        }).catch(err => callback(err));
    }

    timeUntilNextVoteCycle(callback = false) {
        if (!callback)
            return this.injectPromise(this.timeUntilNextVoteCycle);

        this.mcashWeb.fullNode.request('wallet/getnextmaintenancetime').then(({num = -1}) => {
            if (num == -1)
                return callback('Failed to get time until next vote cycle');

            callback(null, Math.floor(num / 1000));
        }).catch(err => callback(err));
    }

    getContract(contractAddress, callback = false) {
        if (!callback)
            return this.injectPromise(this.getContract, contractAddress);

        if (!this.mcashWeb.isAddress(contractAddress))
            return callback('Invalid contract address provided');

        if (this.cache.contracts[contractAddress]) {
            callback(null, this.cache.contracts[contractAddress]);
            return;
        }

        contractAddress = this.mcashWeb.address.toHex(contractAddress);

        this.mcashWeb.fullNode.request('wallet/getcontract', {
            value: contractAddress
        }).then(contract => {
            if (contract.Error)
                return callback('Contract does not exist');
            this.cache.contracts[contractAddress] = contract;
            callback(null, contract);
        }).catch(err => callback(err));
    }

    async verifyMessage(message = false, signature = false, address = this.mcashWeb.defaultAddress.base58, useTronHeader = true, callback = false) {
        if (utils.isFunction(address)) {
            callback = address;
            address = this.mcashWeb.defaultAddress.base58;
            useTronHeader = true;
        }

        if (utils.isFunction(useTronHeader)) {
            callback = useTronHeader;
            useTronHeader = true;
        }

        if (!callback)
            return this.injectPromise(this.verifyMessage, message, signature, address, useTronHeader);

        if (!utils.isHex(message))
            return callback('Expected hex message input');

        if (Mcash.verifySignature(message, address, signature, useTronHeader))
            return callback(null, true);

        callback('Signature does not match');
    }

    static verifySignature(message, address, signature, useTronHeader = true) {
        message = message.replace(/^0x/,'');
        signature = signature.replace(/^0x/,'');
        const messageBytes = [
            ...toUtf8Bytes(useTronHeader ? MCASH_MESSAGE_HEADER : ETH_MESSAGE_HEADER),
            ...utils.code.hexStr2byteArray(message)
        ];

        const messageDigest = keccak256(messageBytes);
        const recovered = recoverAddress(messageDigest, {
            recoveryParam: signature.substring(128, 130) == '1c' ? 1 : 0,
            r: '0x' + signature.substring(0, 64),
            s: '0x' + signature.substring(64, 128)
        });

        const tronAddress = ADDRESS_PREFIX + recovered.substr(2);
        const base58Address = McashWeb.address.fromHex(tronAddress);

        return base58Address == McashWeb.address.fromHex(address);
    }

    async sign(transaction = false, privateKey = this.mcashWeb.defaultPrivateKey, useTronHeader = true, multisig = false, callback = false) {

        if (utils.isFunction(multisig)) {
            callback = multisig;
            multisig = false;
        }

        if (utils.isFunction(useTronHeader)) {
            callback = useTronHeader;
            useTronHeader = true;
            multisig = false;
        }

        if (utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = this.mcashWeb.defaultPrivateKey;
            useTronHeader = true;
            multisig = false;
        }


        if (!callback)
            return this.injectPromise(this.sign, transaction, privateKey, useTronHeader, multisig);

        // Message signing
        if (utils.isString(transaction)) {

            if (!utils.isHex(transaction))
                return callback('Expected hex message input');

            try {
                const signatureHex = Mcash.signString(transaction, privateKey, useTronHeader)
                return callback(null, signatureHex);
            } catch (ex) {
                callback(ex);
            }
        }

        if (!utils.isObject(transaction))
            return callback('Invalid transaction provided');

        if (!multisig && transaction.signature)
            return callback('Transaction is already signed');

        try {
            if (!multisig) {
                const address = this.mcashWeb.address.toHex(
                    this.mcashWeb.address.fromPrivateKey(privateKey)
                ).toLowerCase();

                if (address !== transaction.raw_data.contract[0].parameter.value.owner_address.toLowerCase())
                    return callback('Private key does not match address in transaction');
            }
            return callback(null,
                utils.crypto.signTransaction(privateKey, transaction)
            );
        } catch (ex) {
            callback(ex);
        }
    }

    static signString(message, privateKey, useTronHeader = true) {
        message = message.replace(/^0x/,'');
        const signingKey = new SigningKey(privateKey);
        const messageBytes = [
            ...toUtf8Bytes(useTronHeader ? MCASH_MESSAGE_HEADER : ETH_MESSAGE_HEADER),
            ...utils.code.hexStr2byteArray(message)
        ];

        const messageDigest = keccak256(messageBytes);
        const signature = signingKey.signDigest(messageDigest);

        const signatureHex = [
            '0x',
            signature.r.substring(2),
            signature.s.substring(2),
            Number(signature.v).toString(16)
        ].join('');

        return signatureHex
    }

    async multiSign(transaction = false, privateKey = this.mcashWeb.defaultPrivateKey, permissionId = false, callback = false) {

        if (utils.isFunction(permissionId)) {
            callback = permissionId;
            permissionId = 0;
        }

        if (utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = this.mcashWeb.defaultPrivateKey;
            permissionId = 0;
        }


        if (!callback)
            return this.injectPromise(this.multiSign, transaction, privateKey, permissionId);

        if (!utils.isObject(transaction) || !transaction.raw_data || !transaction.raw_data.contract)
            return callback('Invalid transaction provided');

        // set permission id
        transaction.raw_data.contract[0].Permission_id = permissionId;

        // check if private key insides permission list
        const address = this.mcashWeb.address.toHex(this.mcashWeb.address.fromPrivateKey(privateKey)).toLowerCase();
        const signWeight = await this.getSignWeight(transaction, permissionId);

        if (signWeight.result.code === 'PERMISSION_ERROR') {
            return callback(signWeight.result.message);
        }

        let foundKey = false;
        signWeight.permission.keys.map(key => {
            if (key.address === address)
                foundKey = true;
        });

        if (!foundKey)
            return callback(privateKey + ' has no permission to sign');

        if (signWeight.approved_list && signWeight.approved_list.indexOf(address) != -1) {
            return callback(privateKey + ' already sign transaction');
        }

        // reset transaction
        if (signWeight.transaction && signWeight.transaction.transaction) {
            transaction = signWeight.transaction.transaction;
            transaction.raw_data.contract[0].Permission_id = permissionId;
        } else {
            return callback('Invalid transaction provided');
        }

        // sign
        try {
            return callback(null, utils.crypto.signTransaction(privateKey, transaction));
        } catch (ex) {
            callback(ex);
        }
    }

    async getApprovedList(transaction, callback = false) {
        if (!callback)
            return this.injectPromise(this.getApprovedList, transaction);

        if (!utils.isObject(transaction))
            return callback('Invalid transaction provided');


        this.mcashWeb.fullNode.request(
            'wallet/getapprovedlist',
            transaction,
            'post'
        ).then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }

    async getSignWeight(transaction, permissionId, callback = false) {
        if (utils.isFunction(permissionId)) {
            callback = permissionId;
            permissionId = undefined;
        }

        if (!callback)
            return this.injectPromise(this.getSignWeight, transaction, permissionId);

        if (!utils.isObject(transaction) || !transaction.raw_data || !transaction.raw_data.contract)
            return callback('Invalid transaction provided');

        if (utils.isInteger(permissionId)) {
            transaction.raw_data.contract[0].Permission_id = parseInt(permissionId);
        } else if (typeof transaction.raw_data.contract[0].Permission_id !== 'number') {
            transaction.raw_data.contract[0].Permission_id = 0;
        }

        if (!utils.isObject(transaction))
            return callback('Invalid transaction provided');


        this.mcashWeb.fullNode.request(
            'wallet/getsignweight',
            transaction,
            'post'
        ).then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }

    sendRawTransaction(signedTransaction = false, options = {}, callback = false) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (!callback)
            return this.injectPromise(this.sendRawTransaction, signedTransaction, options);

        if (!utils.isObject(signedTransaction))
            return callback('Invalid transaction provided');

        if (!utils.isObject(options))
            return callback('Invalid options provided');

        if (!signedTransaction.signature || !utils.isArray(signedTransaction.signature))
            return callback('Transaction is not signed');

        this.mcashWeb.fullNode.request(
            'wallet/broadcasttransaction',
            signedTransaction,
            'post'
        ).then(result => {
            if (result.result)
                result.transaction = signedTransaction;
            callback(null, result);
        }).catch(err => callback(err));
    }

    async sendTransaction(to = false, amount = false, options = {}, callback = false) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (typeof options === 'string')
            options = {privateKey: options};

        if (!callback)
            return this.injectPromise(this.sendTransaction, to, amount, options);

        if (!this.mcashWeb.isAddress(to))
            return callback('Invalid recipient provided');

        if (!utils.isInteger(amount) || amount <= 0)
            return callback('Invalid amount provided');

        options = {
            privateKey: this.mcashWeb.defaultPrivateKey,
            address: this.mcashWeb.defaultAddress.hex,
            ...options
        };

        if (!options.privateKey && !options.address)
            return callback('Function requires either a private key or address to be set');

        try {
            const address = options.privateKey ? this.mcashWeb.address.fromPrivateKey(options.privateKey) : options.address;
            const transaction = await this.mcashWeb.transactionBuilder.sendMcash(to, amount, address);
            const signedTransaction = await this.sign(transaction, options.privateKey || undefined);
            const result = await this.sendRawTransaction(signedTransaction);

            return callback(null, result);
        } catch (ex) {
            return callback(ex);
        }
    }

    async sendToken(to = false, amount = false, tokenId = false, options = {}, callback = false) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (typeof options === 'string')
            options = {privateKey: options};

        if (!callback)
            return this.injectPromise(this.sendToken, to, amount, tokenId, options);

        if (!this.mcashWeb.isAddress(to))
            return callback('Invalid recipient provided');

        if (!utils.isInteger(amount) || amount <= 0)
            return callback('Invalid amount provided');

        if (utils.isString(tokenId))
            tokenId = parseInt(tokenId);

        if (!utils.isInteger(tokenId))
            return callback('Invalid token ID provided');

        options = {
            privateKey: this.mcashWeb.defaultPrivateKey,
            address: this.mcashWeb.defaultAddress.hex,
            ...options
        };

        if (!options.privateKey && !options.address)
            return callback('Function requires either a private key or address to be set');

        try {
            const address = options.privateKey ? this.mcashWeb.address.fromPrivateKey(options.privateKey) : options.address;
            const transaction = await this.mcashWeb.transactionBuilder.sendToken(to, amount, tokenId, address);
            const signedTransaction = await this.sign(transaction, options.privateKey || undefined);
            const result = await this.sendRawTransaction(signedTransaction);

            return callback(null, result);
        } catch (ex) {
            return callback(ex);
        }
    }

    /**
     * Freezes an amount of MCASH.
     *
     * @param amount - is the number of frozen MCASH
     * @param duration - is the duration in days to be frozen
     * @param resource - is the type, must be either "ENERGY" or "BANDWIDTH"
     * @param options
     * @param callback
     */
    async freezeBalance(amount = 0, duration = 3, resource = "BANDWIDTH", options = {}, receiverAddress = undefined, callback = false) {
        if (utils.isFunction(receiverAddress)) {
            callback = receiverAddress;
            receiverAddress = undefined;
        }
        if (utils.isFunction(duration)) {
            callback = duration;
            duration = 3;
        }

        if (utils.isFunction(resource)) {
            callback = resource;
            resource = "BANDWIDTH";
        }

        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (typeof options === 'string')
            options = {privateKey: options};

        if (!callback)
            return this.injectPromise(this.freezeBalance, amount, duration, resource, options, receiverAddress);

        if (!['BANDWIDTH', 'ENERGY'].includes(resource))
            return callback('Invalid resource provided: Expected "BANDWIDTH" or "ENERGY"');

        if (!utils.isInteger(amount) || amount <= 0)
            return callback('Invalid amount provided');

        if (!utils.isInteger(duration) || duration < 3)
            return callback('Invalid duration provided, minimum of 3 days');

        options = {
            privateKey: this.mcashWeb.defaultPrivateKey,
            address: this.mcashWeb.defaultAddress.hex,
            ...options
        };

        if (!options.privateKey && !options.address)
            return callback('Function requires either a private key or address to be set');

        try {
            const address = options.privateKey ? this.mcashWeb.address.fromPrivateKey(options.privateKey) : options.address;
            const freezeBalance = await this.mcashWeb.transactionBuilder.freezeBalance(amount, duration, resource, address, receiverAddress);
            const signedTransaction = await this.sign(freezeBalance, options.privateKey || undefined);
            const result = await this.sendRawTransaction(signedTransaction);

            return callback(null, result);
        } catch (ex) {
            return callback(ex);
        }
    }

    /**
     * Unfreeze MCASH that has passed the minimum freeze duration.
     * Unfreezing will remove bandwidth.
     *
     * @param resource - is the type, must be either "ENERGY" or "BANDWIDTH"
     * @param options
     * @param callback
     */
    async unfreezeBalance(resource = "BANDWIDTH", options = {}, receiverAddress = undefined, callback = false) {
        if (utils.isFunction(receiverAddress)) {
            callback = receiverAddress;
            receiverAddress = undefined;
        }

        if (utils.isFunction(resource)) {
            callback = resource;
            resource = 'BANDWIDTH';
        }

        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (typeof options === 'string')
            options = {privateKey: options};

        if (!callback)
            return this.injectPromise(this.unfreezeBalance, resource, options, receiverAddress);

        if (!['BANDWIDTH', 'ENERGY'].includes(resource))
            return callback('Invalid resource provided: Expected "BANDWIDTH" or "ENERGY"');

        options = {
            privateKey: this.mcashWeb.defaultPrivateKey,
            address: this.mcashWeb.defaultAddress.hex,
            ...options
        };

        if (!options.privateKey && !options.address)
            return callback('Function requires either a private key or address to be set');

        try {
            const address = options.privateKey ? this.mcashWeb.address.fromPrivateKey(options.privateKey) : options.address;
            const unfreezeBalance = await this.mcashWeb.transactionBuilder.unfreezeBalance(resource, address, receiverAddress);
            const signedTransaction = await this.sign(unfreezeBalance, options.privateKey || undefined);
            const result = await this.sendRawTransaction(signedTransaction);

            return callback(null, result);
        } catch (ex) {
            return callback(ex);
        }
    }

        /**
     * Stake.
     * Will give voting power
     *
     * @param amount - is the number mcash
     * @param stakeDuration - is the duration in days to be staked
     * @param options
     * @param callback
     */
    async stake(amount = 0, stakeDuration = 3, options = {}, callback = false) {
        if (utils.isFunction(stakeDuration)) {
            callback = stakeDuration;
            stakeDuration = 3;
        }

        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (typeof options === 'string')
            options = {privateKey: options};

        if (!callback)
            return this.injectPromise(this.stake, amount, stakeDuration, options);

        if (!utils.isInteger(amount) || amount <= 0)
            return callback('Invalid amount provided');

        if (!utils.isInteger(stakeDuration) || stakeDuration < 3)
            return callback('Invalid duration provided, minimum of 3 days');

        options = {
            privateKey: this.mcashWeb.defaultPrivateKey,
            address: this.mcashWeb.defaultAddress.hex,
            ...options
        };

        if (!options.privateKey && !options.address)
            return callback('Function requires either a private key or address to be set');

        try {
            const address = options.privateKey ? this.mcashWeb.address.fromPrivateKey(options.privateKey) : options.address;
            const stakeTransaction = await this.mcashWeb.transactionBuilder.stake(amount, stakeDuration, address);
            const signedTransaction = await this.sign(stakeTransaction, options.privateKey || undefined);
            const result = await this.sendRawTransaction(signedTransaction);

            return callback(null, result);
        } catch (ex) {
            return callback(ex);
        }
    }

    /**
     * Unstake
     *
     * @param options
     * @param callback
     */
    async unstake(options = {}, callback = false) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (typeof options === 'string')
            options = {privateKey: options};

        if (!callback)
            return this.injectPromise(this.unstake, options);

        options = {
            privateKey: this.mcashWeb.defaultPrivateKey,
            address: this.mcashWeb.defaultAddress.hex,
            ...options
        };

        if (!options.privateKey && !options.address)
            return callback('Function requires either a private key or address to be set');

        try {
            const address = options.privateKey ? this.mcashWeb.address.fromPrivateKey(options.privateKey) : options.address;
            const unstakeTransaction = await this.mcashWeb.transactionBuilder.unfreezeBalance(address);
            const signedTransaction = await this.sign(unstakeTransaction, options.privateKey || undefined);
            const result = await this.sendRawTransaction(signedTransaction);

            return callback(null, result);
        } catch (ex) {
            return callback(ex);
        }
    }

    /**
     * Modify account name
     * Note: Username is allowed to edit only once.
     *
     * @param privateKey - Account private Key
     * @param accountName - name of the account
     * @param callback
     *
     * @return modified Transaction Object
     */
    async updateAccount(accountName = false, options = {}, callback = false) {
        if (utils.isFunction(options)) {
            callback = options;
            options = {};
        }

        if (typeof options === 'string')
            options = {privateKey: options};

        if (!callback) {
            return this.injectPromise(this.updateAccount, accountName, options);
        }

        if (!utils.isString(accountName) || !accountName.length) {
            return callback('Name must be a string');
        }

        options = {
            privateKey: this.mcashWeb.defaultPrivateKey,
            address: this.mcashWeb.defaultAddress.hex,
            ...options
        };

        if (!options.privateKey && !options.address)
            return callback('Function requires either a private key or address to be set');

        try {
            const address = options.privateKey ? this.mcashWeb.address.fromPrivateKey(options.privateKey) : options.address;
            const updateAccount = await this.mcashWeb.transactionBuilder.updateAccount(accountName, address);
            const signedTransaction = await this.sign(updateAccount, options.privateKey || undefined);
            const result = await this.sendRawTransaction(signedTransaction);

            return callback(null, result);
        } catch (ex) {
            return callback(ex);
        }
    }

    signMessage(...args) {
        return this.sign(...args);
    }

    sendAsset(...args) {
        return this.sendToken(...args);
    }

    send(...args) {
        return this.sendTransaction(...args);
    }

    sendMcash(...args) {
        return this.sendTransaction(...args);
    }

    broadcast(...args) {
        return this.sendRawTransaction(...args);
    }

    signTransaction(...args) {
        return this.sign(...args);
    }

    /**
     * Gets a network modification proposal by ID.
     */
    getProposal(proposalId = false, callback = false) {
        if (!callback)
            return this.injectPromise(this.getProposal, proposalId);

        if (!utils.isInteger(proposalId) || proposalId < 0)
            return callback('Invalid proposalID provided');

        this.mcashWeb.fullNode.request('wallet/getproposalbyid', {
            id: proposalId,
        }, 'post').then(proposal => {
            callback(null, proposal);
        }).catch(err => callback(err));
    }

    /**
     * Lists all network modification proposals.
     */
    listProposals(callback = false) {
        if (!callback)
            return this.injectPromise(this.listProposals);

        this.mcashWeb.fullNode.request('wallet/listproposals', {}, 'post').then(({proposals = []}) => {
            callback(null, proposals);
        }).catch(err => callback(err));
    }

    /**
     * Lists all parameters available for network modification proposals.
     */
    getChainParameters(callback = false) {
        if (!callback)
            return this.injectPromise(this.getChainParameters);

        this.mcashWeb.fullNode.request('wallet/getchainparameters', {}, 'post').then(({chain_parameter = []}) => {
            callback(null, chain_parameter);
        }).catch(err => callback(err));
    }

    /**
     * Get the account resources
     */
    getAccountResources(address = this.mcashWeb.defaultAddress.hex, callback = false) {
        if (!callback)
            return this.injectPromise(this.getAccountResources, address);

        if (!this.mcashWeb.isAddress(address))
            return callback('Invalid address provided');

        this.mcashWeb.fullNode.request('wallet/getaccountresource', {
            address: this.mcashWeb.address.toHex(address),
        }, 'post').then(resources => {
            callback(null, resources);
        }).catch(err => callback(err));
    }

    /**
     * Get the exchange ID.
     */
    getExchangeByID(exchangeId = false, callback = false) {
        if (!callback)
            return this.injectPromise(this.getExchangeByID, exchangeId);

        if (!utils.isInteger(exchangeId) || exchangeId < 0)
            return callback('Invalid exchangeID provided');

        this.mcashWeb.fullNode.request('wallet/getexchangebyid', {
            id: exchangeId,
        }, 'post').then(exchange => {
            callback(null, exchange);
        }).catch(err => callback(err));
    }

    /**
     * Lists the exchanges
     */
    listExchanges(callback = false) {
        if (!callback)
            return this.injectPromise(this.listExchanges);

        this.mcashWeb.fullNode.request('wallet/listexchanges', {}, 'post').then(({exchanges = []}) => {
            callback(null, exchanges);
        }, 'post').catch(err => callback(err));
    }

    /**
     * Lists all network modification proposals.
     */
    listExchangesPaginated(limit = 10, offset = 0, callback = false) {
        if (utils.isFunction(offset)) {
            callback = offset;
            offset = 0;
        }
        if (utils.isFunction(limit)) {
            callback = limit;
            limit = 30;
        }
        if (!callback)
            return this.injectPromise(this.listExchanges);

        this.mcashWeb.fullNode.request('wallet/listexchangespaginated', {
            limit,
            offset
        }, 'post').then(({exchanges = []}) => {
            callback(null, exchanges);
        }).catch(err => callback(err));
    }

    /**
     * Get info about node
     */
    getNodeInfo(callback = false) {
        if (!callback)
            return this.injectPromise(this.getNodeInfo);

        this.mcashWeb.fullNode.request('wallet/getnodeinfo', {}, 'post').then(info => {
            callback(null, info);
        }, 'post').catch(err => callback(err));
    }

    getTokenById(tokenId = false, callback = false) {
        if (!callback)
            return this.injectPromise(this.getTokenById, tokenId);

        if (utils.isString(tokenId))
            tokenId = parseInt(tokenId);

        if (!utils.isInteger(tokenId))
            return callback('Invalid token ID provided');

        this.mcashWeb.fullNode.request('wallet/getassetissuebyid', {
            value: tokenId
        }, 'post').then(token => {
            if (!token.name)
                return callback('Token does not exist');

            callback(null, this._parseToken(token));
        }).catch(err => callback(err));
    }

};
