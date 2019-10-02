const chai = require('chai');
const assert = chai.assert;
const txPars = require('../helpers/txPars');
const jlog = require('../helpers/jlog');
const assertThrow = require('../helpers/assertThrow');
const wait = require('../helpers/wait');
const broadcaster = require('../helpers/broadcaster');
const pollAccountFor = require('../helpers/pollAccountFor');
const _ = require('lodash');
const mcashWebBuilder = require('../helpers/mcashWebBuilder');
const assertEqualHex = require('../helpers/assertEqualHex');
const McashWeb = mcashWebBuilder.McashWeb;
const config = require('../helpers/config');
const waitChainData = require('../helpers/waitChainData');
const {
    ADDRESS_BASE58,
    PRIVATE_KEY,
    getTokenOptions,
} = require('../helpers/config');
const testRevertContract = require('../fixtures/contracts').testRevert;

describe('McashWeb.mcash', function () {

    let accounts;
    let mcashWeb;
    let emptyAccount;

    before(async function () {
        mcashWeb = mcashWebBuilder.createInstance();
        // ALERT this works only with Tron Quickstart:
        accounts = await mcashWebBuilder.getTestAccounts(-1);
        emptyAccount = await McashWeb.createAccount();
    });


    // Contrstuctor Test
    describe('#constructor()', function () {

        it('should have been set a full instance in mcashWeb', function () {
            assert.instanceOf(mcashWeb.mcash, McashWeb.Mcash);
        });

    });


    // Account Test
    describe('#Account Test', function () {

        describe("#getAccount", async function () {

            const idx = 10;

            it('should get account by hex or base58 address', async function () {
                const addressType = ['hex', 'b58'];
                let account;
                for (let type of addressType) {
                    account = await mcashWeb.mcash.getAccount(accounts[type][idx]);
                    assert.equal(account.address, accounts.hex[idx]);
                }
            });

            it('should throw address is not valid error', async function () {
                await assertThrow(
                    mcashWeb.mcash.getAccount('notAnAddress'),
                    'Invalid address provided'
                );
            });

        });


        describe("#getAccountResources", async function () {

            const idx = 10;

            it('should get account resource by hex or base58 address', async function () {
                const addressType = ['hex', 'b58'];
                let accountResource;
                for (let type of addressType) {
                    accountResource = await mcashWeb.mcash.getAccountResources(accounts[type][idx]);
                    assert.isDefined(accountResource.freeNetLimit);
                    assert.isDefined(accountResource.TotalEnergyLimit);
                }
            });

            it('should throw address is not valid error', async function () {
                await assertThrow(
                    mcashWeb.mcash.getAccountResources('notAnAddress'),
                    'Invalid address provided'
                );
            });

        });


        describe("#getBalance", async function () {

            const idx = 10;

            it('should get balance by hex or base58 address', async function () {
                const addressType = ['hex', 'b58'];
                let balance;
                for (let type of addressType) {
                    balance = await mcashWeb.mcash.getBalance(accounts[type][idx]);
                    assert.isTrue(balance >= 0);
                }
            });

        });


        describe("#getBandwidth", async function () {

            const idx = 10;

            it('should get bandwith by hex or base58 address', async function () {
                const addressType = ['hex', 'b58'];
                let bp;
                for (let type of addressType) {
                    bp = await mcashWeb.mcash.getBandwidth(accounts[type][idx]);
                    assert.isTrue(bp >= 0);
                }
            });

        });


        describe("#getUnconfirmedAccount", async function () {

            const idx = 11;
            let toHex;

            before(async function(){
                this.timeout(10000);

                const account = await mcashWeb.createAccount();
                toHex = account.address.hex;
                const transaction = await mcashWeb.transactionBuilder.sendMcash(account.address.hex, 10e5, accounts.hex[idx]);
                await broadcaster(null, accounts.pks[idx], transaction);
                await waitChainData('account', account.address.hex);
            });

            it('should get unconfirmed account by address', async function () {
                const account = await mcashWeb.mcash.getUnconfirmedAccount(toHex);
                assert.equal(account.address, toHex.toLowerCase());
            });

            it('should throw address is not valid error', async function () {
                await assertThrow(
                    mcashWeb.mcash.getUnconfirmedAccount('notAnAddress'),
                    'Invalid address provided'
                );
            });

        });


        describe("#getUnconfirmedBalance", async function () {

            const idx = 12;
            let toHex;

            before(async function(){
                this.timeout(10000);

                const account = await mcashWeb.createAccount();
                toHex = account.address.hex;
                const transaction = await mcashWeb.transactionBuilder.sendMcash(account.address.hex, 10e5, accounts.hex[idx]);
                await broadcaster(null, accounts.pks[idx], transaction);
                await waitChainData('account', account.address.hex);
            });

            it('should get unconfirmed balance by account address', async function () {
                const balance = await mcashWeb.mcash.getUnconfirmedBalance(toHex);
                assert.equal(balance, 10e5);
            });

        });


        describe("#updateAccount", async function () {

            const idx = 13;

            it('should update account name', async function () {
                const accountName = Math.random().toString(36).substr(2);
                await mcashWeb.mcash.updateAccount(accountName, { privateKey: accounts.pks[idx], address: accounts.hex[idx] });
                const account = await mcashWeb.mcash.getUnconfirmedAccount(accounts.hex[idx]);
                assert.equal(mcashWeb.toUtf8(account.account_name), accountName);
            });

            it('should throw name must be a string error', async function () {
                await assertThrow(
                    mcashWeb.mcash.updateAccount({}),
                    'Name must be a string'
                );
            });

        });

    });


    // Signature Test
    describe('#Sign Test', function () {

        describe("#sign", async function () {

            const idx = 14;
            let transaction;

            beforeEach(async function() {
                transaction = await mcashWeb.transactionBuilder.freezeBalance(10e5, 3, 'BANDWIDTH', accounts.b58[idx]);
            });

            it('should sign a transaction', async function () {
                const signedTransaction = await mcashWeb.mcash.sign(transaction, accounts.pks[idx]);
                assert.equal(signedTransaction.txID, transaction.txID);
                assert.equal(signedTransaction.signature.length, 1);
            });

            it('should throw transaction not valid error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sign(undefined, accounts.pks[idx]),
                    'Invalid transaction provided'
                );
            });

            it('should throw transaction is already signed error', async function () {
                const signedTransaction = await mcashWeb.mcash.sign(transaction, accounts.pks[idx]);
                await assertThrow(
                    mcashWeb.mcash.sign(signedTransaction, accounts.pks[idx]),
                    'Transaction is already signed'
                );
            });

            it('should throw private key does not match address error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sign(transaction, accounts.pks[idx]),
                    'Private key does not match address in transaction'
                );
            });

        });


        describe("#signMessage", async function () {

            const idx = 14;

            it('should sign a hex string message', async function () {
                const hexMsg = '0xe66f4c8f323229131006ad3e4a2ca65dfdf339f0';
                const signedMsg = await mcashWeb.mcash.sign(hexMsg, accounts.pks[idx]);
                assert.isTrue(signedMsg.startsWith('0x'));
            });

            it('should throw expected hex message input error', async function () {
                const hexMsg = 'e66f4c8f323229131006ad3e4a2ca65dfdf339f0';
                await assertThrow(
                    mcashWeb.mcash.sign(hexMsg, accounts.pks[idx]),
                    'Private key does not match address in transaction'
                );
            });

        });


        describe("#verifyMessage", async function () {

            const idx = 14;
            let hexMsg;
            let signedMsg;

            before(async function() {
                hexMsg = '0xe66f4c8f323229131006ad3e4a2ca65dfdf339f0';
                signedMsg = await mcashWeb.mcash.sign(hexMsg, accounts.pks[idx], null, false);
            });

            it('should verify signature of signed string message', async function () {
                const result = await mcashWeb.mcash.verifyMessage(hexMsg, signedMsg, accounts.hex[idx], null);
                assert.isTrue(result);
            });

            it('should throw expected hex message input error', async function () {
                await assertThrow(
                    mcashWeb.mcash.verifyMessage('e66f4c8f323229131006ad3e4a2ca65dfdf339f0', signedMsg, accounts.hex[idx], null),
                    'Expected hex message input'
                );
            });

            it('should throw signature does not match error', async function () {
                const fakeSig = '0xafd220c015fd38ffcd34455ddf4f11d20549d9565f558dd84b508c37854727887879d62e675a285c0caf' +
                    'a34ea7814b0ae5b74835bdfb612205deb8b97d7c24811c';
                await assertThrow(
                    mcashWeb.mcash.verifyMessage(hexMsg, fakeSig, accounts.hex[idx], null),
                    'Signature does not match'
                );
            });
        });


        describe("#multiSignTransaction", async function () {

            const ownerIdx = 15;
            const idxS = 15;
            const idxE = 18;
            const threshold = 3;

            before(async function() {
                this.timeout(10000);
                // update account permission
                let ownerAddress = accounts.hex[ownerIdx];
                let ownerPk = accounts.pks[ownerIdx];
                let ownerPermission = { type: 0, permission_name: 'owner' };
                ownerPermission.threshold = threshold;
                ownerPermission.keys  = [];
                let activePermission = { type: 2, permission_name: 'active0' };
                activePermission.threshold = threshold;
                activePermission.operations = '7fff1fc0037e0000000000000000000000000000000000000000000000000000';
                activePermission.keys = [];

                for (let i = idxS; i < idxE; i++) {
                    let address = accounts.hex[i];
                    let weight = 1;
                    ownerPermission.keys.push({ address: address, weight: weight });
                    activePermission.keys.push({ address: address, weight: weight });
                }

                const updateTransaction = await mcashWeb.transactionBuilder.updateAccountPermissions(
                    ownerAddress,
                    ownerPermission,
                    null,
                    [activePermission]
                );
                assert.isTrue(updateTransaction.txID && updateTransaction.txID.length === 64);

                // broadcast update transaction
                const signedUpdateTransaction = await mcashWeb.mcash.sign(updateTransaction, ownerPk, null, false);
                await mcashWeb.mcash.broadcast(signedUpdateTransaction);

                await wait(3);
            });

            it('should multi-sign a transaction by owner permission', async function () {

                const transaction = await mcashWeb.transactionBuilder.freezeBalance(10e5, 3, 'BANDWIDTH', accounts.b58[ownerIdx]);
                let signedTransaction = transaction;
                for (let i = idxS; i < idxE; i++) {
                    signedTransaction = await mcashWeb.mcash.multiSign(signedTransaction, accounts.pks[i], 0);
                }

                assert.equal(signedTransaction.signature.length, 3);

                // broadcast multi-sign transaction
                const result = await mcashWeb.mcash.broadcast(signedTransaction);
                assert.isTrue(result.result);

            });

            it('should verify weight after multi-sign by owner permission', async function () {

                // create transaction and do multi-sign
                const transaction = await mcashWeb.transactionBuilder.freezeBalance(10e5, 3, 'BANDWIDTH', accounts.b58[ownerIdx]);

                // sign and verify sign weight
                let signedTransaction = transaction;
                let signWeight;
                for (let i = idxS; i < idxE; i++) {
                    signedTransaction = await mcashWeb.mcash.multiSign(signedTransaction, accounts.pks[i], 0);
                    signWeight = await mcashWeb.mcash.getSignWeight(signedTransaction);
                    if (i < idxE - 1) {
                        assert.equal(signWeight.result.code, 'NOT_ENOUGH_PERMISSION');
                    }
                    assert.equal(signWeight.approved_list.length, i - idxS + 1);
                }

                // get approved list
                const approvedList = await mcashWeb.mcash.getApprovedList(signedTransaction);
                assert.isTrue(approvedList.approved_list.length === threshold);

                // broadcast multi-sign transaction
                const result = await mcashWeb.mcash.broadcast(signedTransaction);
                assert.isTrue(result.result);

            });

            it('should multi-sign a transaction with no permission error by owner permission', async function () {

                const transaction = await mcashWeb.transactionBuilder.freezeBalance(10e5, 3, 'BANDWIDTH', accounts.b58[ownerIdx]);
                try {
                    await mcashWeb.mcash.multiSign(transaction, (accounts.pks[ownerIdx] + '123'), 0);
                } catch (e) {
                    assert.isTrue(e.indexOf('has no permission to sign') != -1);
                }

            });

            it('should multi-sign duplicated a transaction by owner permission', async function () {

                const transaction = await mcashWeb.transactionBuilder.freezeBalance(10e5, 3, 'BANDWIDTH', accounts.b58[ownerIdx]);
                try {
                    let signedTransaction = await mcashWeb.mcash.multiSign(transaction, accounts.pks[ownerIdx], 0);
                    await mcashWeb.mcash.multiSign(signedTransaction, accounts.pks[ownerIdx], 0);
                } catch (e) {
                    assert.isTrue(e.indexOf('already sign transaction') != -1);
                }

            });

            it('should multi-sign a transaction by active permission', async function () {

                const transaction = await mcashWeb.transactionBuilder.freezeBalance(10e5, 3, 'BANDWIDTH', accounts.b58[ownerIdx]);
                let signedTransaction = transaction;
                for (let i = idxS; i < idxE; i++) {
                    signedTransaction = await mcashWeb.mcash.multiSign(signedTransaction, accounts.pks[i], 2);
                }

                assert.equal(signedTransaction.signature.length, 3);

                // broadcast multi-sign transaction
                const result = await mcashWeb.mcash.broadcast(signedTransaction);
                assert.isTrue(result.result);

            });

            it('should verify weight after multi-sign by active permission', async function () {

                // create transaction and do multi-sign
                const transaction = await mcashWeb.transactionBuilder.freezeBalance(10e5, 3, 'BANDWIDTH', accounts.b58[ownerIdx]);

                // sign and verify sign weight
                let signedTransaction = transaction;
                let signWeight;
                for (let i = idxS; i < idxE; i++) {
                    signedTransaction = await mcashWeb.mcash.multiSign(signedTransaction, accounts.pks[i], 2);
                    signWeight = await mcashWeb.mcash.getSignWeight(signedTransaction, 2);
                    if (i < idxE - 1) {
                        assert.equal(signWeight.result.code, 'NOT_ENOUGH_PERMISSION');
                    }
                    assert.equal(signWeight.approved_list.length, i - idxS + 1);
                }

                // get approved list
                const approvedList = await mcashWeb.mcash.getApprovedList(signedTransaction);
                assert.isTrue(approvedList.approved_list.length === threshold);

                // broadcast multi-sign transaction
                const result = await mcashWeb.mcash.broadcast(signedTransaction);
                assert.isTrue(result.result);

            });

            it('should multi-sign a transaction with no permission error by active permission', async function () {

                const transaction = await mcashWeb.transactionBuilder.freezeBalance(10e5, 3, 'BANDWIDTH', accounts.b58[ownerIdx]);
                try {
                    await mcashWeb.mcash.multiSign(transaction, (accounts.pks[ownerIdx] + '123'), 2);
                } catch (e) {
                    assert.isTrue(e.indexOf('has no permission to sign') != -1);
                }

            });

            it('should multi-sign duplicated a transaction by active permission', async function () {

                const transaction = await mcashWeb.transactionBuilder.freezeBalance(10e5, 3, 'BANDWIDTH', accounts.b58[ownerIdx]);
                try {
                    let signedTransaction = await mcashWeb.mcash.multiSign(transaction, accounts.pks[ownerIdx], 2);
                    await mcashWeb.mcash.multiSign(signedTransaction, accounts.pks[ownerIdx], 2);
                } catch (e) {
                    assert.isTrue(e.indexOf('already sign transaction') != -1);
                }

            });

            it('should multi-sign a transaction with permission error by both owner and active permission', async function () {

                try {
                    const transaction = await mcashWeb.transactionBuilder.freezeBalance(10e5, 3, 'BANDWIDTH', accounts.b58[ownerIdx]);
                    let signedTransaction = await mcashWeb.mcash.multiSign(transaction, accounts.pks[ownerIdx], 0);
                    await mcashWeb.mcash.multiSign(signedTransaction, accounts.pks[ownerIdx], 2);
                } catch (e) {
                    assert.isTrue(e.indexOf('not contained of permission') != -1);
                }

            });

            it('should multi-sign a transaction with wrong permission id error', async function () {

                try {
                    const transaction = await mcashWeb.transactionBuilder.freezeBalance(10e5, 3, 'BANDWIDTH', accounts.b58[ownerIdx]);
                    await mcashWeb.mcash.multiSign(transaction, accounts.pks[ownerIdx], 1);
                } catch (e) {
                    assert.isTrue(e.indexOf('permission isn\'t exit') != -1);
                }

            });

        });

    });


    // Block Test
    describe('#Block Test', function () {

        describe("#getBlock", async function () {

            it('should get earliest or latest block', async function () {
                let earliestParentHash = '957dc2d350daecc7bb6a38f3938ebde0a0c1cedafe15f0edae4256a2907449f6';
                const blockType = ['earliest', 'latest'];
                let block;
                for (let type of blockType) {
                    block = await mcashWeb.mcash.getBlock(type);
                    if (type === 'earliest') {
                        assert.equal(earliestParentHash, block.block_header.raw_data.parentHash);
                    }
                    if (type === 'latest') {
                        assert.isNumber(block.block_header.raw_data.number);
                    }
                }
            });

            it('should throw no block identifier provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.getBlock(false),
                    'No block identifier provided'
                );
            });

            it('should throw block not found error', async function () {
                await assertThrow(
                    mcashWeb.mcash.getBlock(10e10),
                    'Block not found'
                );
            });

            it('should throw invalid block number provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.getBlock(-1),
                    'Invalid block number provided'
                );
            });

        });


        describe("#getBlockByHash", async function () {

            it('should get block by block hash (id)', async function () {
                const block = await mcashWeb.mcash.getBlock('latest');
                const blockByHash = await mcashWeb.mcash.getBlockByHash(block.blockID);
                assert.equal(block.blockID, blockByHash.blockID);
            });

        });


        describe("#getBlockByNumber", async function () {

            it('should get block by block number', async function () {
                const block = await mcashWeb.mcash.getBlock('latest');
                const blockByNumber = await mcashWeb.mcash.getBlockByNumber(block.block_header.raw_data.number);
                assert.equal(block.blockID, blockByNumber.blockID);
            });

        });


        describe("#getBlockRange", async function () {

            it('should get block by range', async function () {
                const blocks = await mcashWeb.mcash.getBlockRange(0, 5);
                assert.equal(blocks.length, 6);
            });

            it('should get invalid start or end error by range', async function () {
                const ranges = [[-1, 5, 'start'], [1, -5, 'end']];
                for (let range of ranges) {
                    await assertThrow(
                        mcashWeb.mcash.getBlockRange(range[0], range[1]),
                        `Invalid ${range[2]} of range provided`
                    );
                }
            });

        });


        describe("#getBlockTransactionCount", async function () {

            it('should get transaction count by block number, \'latest\' or \'earliest\'', async function () {
                const blockType = [1, 'latest', 'earliest'];
                for (let type of blockType) {
                    const count = await mcashWeb.mcash.getBlockTransactionCount(type);
                    assert.isNumber(count);
                }
            });

        });


        describe("#getCurrentBlock", async function () {

            it('should get current block', async function () {
                const block = await mcashWeb.mcash.getCurrentBlock();
                assert.isNumber(block.block_header.raw_data.number);
            });

        });

    });


    // Transaction Test
    describe('#Transaction Test', function () {

        describe("#send", async function () {

            const fromIdx = 19;
            const toIdx = 20;

            it('should send mcash', async function () {
                this.timeout(10000);

                const balanceBefore = await mcashWeb.mcash.getUnconfirmedBalance(accounts.hex[toIdx]);
                await mcashWeb.mcash.send(accounts.hex[toIdx], 10e5, { privateKey: accounts.pks[fromIdx], address: accounts.hex[fromIdx] });
                await waitChainData('balance', accounts.hex[toIdx], balanceBefore);
                const balanceAfter = await mcashWeb.mcash.getUnconfirmedBalance(accounts.hex[toIdx]);
                assert.equal(balanceAfter - balanceBefore, 10e5);
            });

            it('should throw invalid recipient provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.send('notValidAddress', 10e5, { privateKey: accounts.pks[fromIdx] }),
                    'Invalid recipient provided'
                );
            });

            it('should throw invalid amount provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.send(accounts.hex[toIdx], -1, { privateKey: accounts.pks[fromIdx] }),
                    'Invalid amount provided'
                );
            });

        });


        describe("#sendTransaction", async function () {

            const fromIdx = 21;
            const toIdx = 22;

            it('should send mcash', async function () {
                this.timeout(10000);

                const balanceBefore = await mcashWeb.mcash.getUnconfirmedBalance(accounts.hex[toIdx]);
                await mcashWeb.mcash.sendTransaction(accounts.hex[toIdx], 10e5, { privateKey: accounts.pks[fromIdx] });
                await waitChainData('balance', accounts.hex[toIdx], balanceBefore);
                const balanceAfter = await mcashWeb.mcash.getUnconfirmedBalance(accounts.hex[toIdx]);
                assert.equal(balanceAfter - balanceBefore, 10e5);
            });

            it('should throw invalid recipient provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sendTransaction('notValidAddress', 10e5,  { privateKey: accounts.pks[fromIdx] }),
                    'Invalid recipient provided'
                );
            });

            it('should throw invalid amount provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sendTransaction(accounts.hex[toIdx], -1, { privateKey: accounts.pks[fromIdx] }),
                    'Invalid amount provided'
                );
            });

        });


        describe("#sendTrx", async function () {

            const fromIdx = 23;
            const toIdx = 24;

            it('should send mcash', async function () {
                this.timeout(10000);

                const balanceBefore = await mcashWeb.mcash.getUnconfirmedBalance(accounts.hex[toIdx]);
                await mcashWeb.mcash.sendMcash(accounts.hex[toIdx], 10e5, { privateKey: accounts.pks[fromIdx], address: accounts.hex[fromIdx] });
                await waitChainData('balance', accounts.hex[toIdx], balanceBefore);
                const balanceAfter = await mcashWeb.mcash.getUnconfirmedBalance(accounts.hex[toIdx]);
                assert.equal(balanceAfter - balanceBefore, 10e5);
            });

            it('should throw invalid recipient provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sendMcash('notValidAddress', 10e5, { privateKey: accounts.pks[fromIdx] }),
                    'Invalid recipient provided'
                );
            });

            it('should throw invalid amount provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sendMcash(accounts.hex[18], -1, { privateKey: accounts.pks[fromIdx] }),
                    'Invalid amount provided'
                );
            });

        });


        describe("#freezeBalance", async function () {

            const idx = 25;
            // const receiverIdx = 26;

            it('should freeze balance for energy or bandwidth', async function () {
                this.timeout(20000);

                let accountBefore = await mcashWeb.mcash.getAccount(accounts.hex[idx]);
                await mcashWeb.mcash.freezeBalance(10e5, 3, 'BANDWIDTH', { privateKey: accounts.pks[idx], address: accounts.hex[idx] });
                await waitChainData('freezeBp', accounts.hex[idx], 0);
                let accountAfter = await mcashWeb.mcash.getUnconfirmedAccount(accounts.hex[idx]);
                assert.equal((!accountBefore.frozen ? 0: accountBefore.frozen[0].frozen_balance) + 10e5, accountAfter.frozen[0].frozen_balance);

                accountBefore = accountAfter;
                await mcashWeb.mcash.freezeBalance(10e5, 3, 'ENERGY', { privateKey: accounts.pks[idx], address: accounts.hex[idx] });
                await waitChainData('freezeEnergy', accounts.hex[idx], 0);
                accountAfter = await mcashWeb.mcash.getUnconfirmedAccount(accounts.hex[idx]);
                assert.equal(
                    (!accountBefore.account_resource ||
                    !accountBefore.account_resource.frozen_balance_for_energy
                        ? 0
                        : accountBefore.account_resource.frozen_balance_for_energy.frozen_balance) + 10e5,
                    accountAfter.account_resource.frozen_balance_for_energy.frozen_balance
                );
            });

            it('should throw invalid resource provided: expected "BANDWIDTH" or "ENERGY" error', async function () {
                await assertThrow(
                    mcashWeb.mcash.freezeBalance(10e8, 3, 'GAS', { privateKey: accounts.pks[idx], address: accounts.hex[idx] }),
                    'Invalid resource provided: Expected "BANDWIDTH" or "ENERGY"'
                );
            });

            it('should throw invalid amount provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.freezeBalance(-10, 3, 'BANDWIDTH', { privateKey: accounts.pks[idx], address: accounts.hex[idx] }),
                    'Invalid amount provided'
                );
            });

            it('should throw invalid duration provided, minimum of 3 days error', async function () {
                await assertThrow(
                    mcashWeb.mcash.freezeBalance(10e8, 2, 'BANDWIDTH', { privateKey: accounts.pks[idx], address: accounts.hex[idx] }),
                    'Invalid duration provided, minimum of 3 days'
                );
            });
        });


        // skip since duration too long
        /**
        describe.skip("#unfreezeBalance", async function () {

            before(async function(){
                await mcashWeb.mcash.freezeBalance(10e5, 3, 'BANDWIDTH', {}, accounts.b58[15]);
                await mcashWeb.mcash.freezeBalance(10e5, 3, 'ENERGY', {}, accounts.b58[15]);
            });

            it('should unfreeze balance', async function () {
                let accountBefore = await mcashWeb.mcash.getUnconfirmedAccount(ADDRESS_HEX);
                await mcashWeb.mcash.unfreezeBalance('BANDWIDTH', {}, accounts.b58[15]);
                let accountAfter = await mcashWeb.mcash.getUnconfirmedAccount(ADDRESS_HEX);
                assert.equal(accountBefore.frozen[0].frozen_balance - 10e5, accountAfter.frozen[0].frozen_balance);

                accountBefore = accountAfter;
                await mcashWeb.mcash.unfreezeBalance('ENERGY', {}, accounts.b58[15]);
                accountAfter = await mcashWeb.mcash.getUnconfirmedAccount(ADDRESS_HEX);
                assert.equal(
                    accountBefore.account_resource.frozen_balance_for_energy.frozen_balance - 10e5,
                    accountAfter.account_resource.frozen_balance_for_energy.frozen_balance
                );
            });

            it('should throw invalid resource provided: expected "BANDWIDTH" or "ENERGY" error', async function () {
                await assertThrow(
                    mcashWeb.mcash.unfreezeBalance(10e8, 3, 'GAS', {}, accounts.b58[15]),
                    'Invalid resource provided: Expected "BANDWIDTH" or "ENERGY"'
                );
            });

        });
        */

        describe("#broadcast", async function () {

            const idx = 26;
            let transaction;
            let signedTransaction;

            before(async function () {
                transaction = await mcashWeb.transactionBuilder.freezeBalance(10e5, 3, 'BANDWIDTH', accounts.b58[idx]);
                signedTransaction = await mcashWeb.mcash.sign(transaction, accounts.pks[idx]);
            });

            it('should broadcast a transaction', async function () {
                this.timeout(20000);
                const result = await mcashWeb.mcash.broadcast(signedTransaction);
                assert.isTrue(result.result);
                assert.equal(result.transaction.signature[0], signedTransaction.signature[0]);
            });

            it('should throw invalid transaction provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.broadcast(false),
                    'Invalid transaction provided'
                );
            });

            it('should throw invalid options provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.broadcast(signedTransaction, false),
                    'Invalid options provided'
                );
            });

            it('should throw transaction is not signed error', async function () {
                await assertThrow(
                    mcashWeb.mcash.broadcast(transaction),
                    'Transaction is not signed'
                );
            });
        });


        describe("#getTransaction", async function () {

            const idx = 26;
            let transaction;

            before(async function(){
                this.timeout(10000);

                transaction = await mcashWeb.mcash.freezeBalance(10e5, 3, 'BANDWIDTH', { privateKey: accounts.pks[idx], address: accounts.hex[idx] });
                transaction = transaction.transaction;
                await waitChainData('tx', transaction.txID);
            });

            it('should get transaction by id', async function () {
                const tx = await mcashWeb.mcash.getTransaction(transaction.txID);
                assert.equal(tx.txID, transaction.txID);
            });

            it('should throw transaction not found error', async function () {
                await assertThrow(
                    mcashWeb.mcash.getTransaction('a8813981b1737d9caf7d51b200760a16c9cdbc826fa8de102386af898048cbe5'),
                    'Transaction not found'
                );
            });

        });


        describe("#getTransactionFromBlock", async function () {

            const idx = 26;
            let transaction;
            let currBlockNum;

            before(async function(){
                this.timeout(10000);
                // await wait(5); // wait for new clear block generated
                transaction = await mcashWeb.mcash.freezeBalance(10e5, 3, 'BANDWIDTH', { privateKey: accounts.pks[idx], address: accounts.hex[idx] });
                transaction = transaction.transaction;
                const currBlock = await mcashWeb.mcash.getBlock('latest');
                currBlockNum = currBlock.block_header.raw_data.number;
            });

            it('should get transaction from block', async function () {
                this.timeout(10000);
                for (let i = currBlockNum; i < currBlockNum + 3;) {
                    try {
                        const tx = await mcashWeb.mcash.getTransactionFromBlock(i, 0);
                        // assert.equal(tx.txID, transaction.txID);
                        assert.isDefined(tx.txID);
                        break;
                    } catch (e) {
                        if (e === 'Transaction not found in block') {
                            i++;
                            continue;
                        } else if (e === 'Block not found') {
                            await wait(3);
                            continue;
                        } else {
                            throw new Error(e);
                            break;
                        }
                    }
                }
            });

            it('should throw transaction not found error by transaction from block', async function () {
                await assertThrow(
                    mcashWeb.mcash.getTransactionFromBlock(currBlockNum - 1, 0),
                    'Transaction not found in block'
                );
            });

            it('should throw block not found error by transaction from block', async function () {
                await assertThrow(
                    mcashWeb.mcash.getTransactionFromBlock(currBlockNum + 50, 0),
                    'Block not found'
                );
            });

            it('should throw invalid index error by transaction from block', async function () {
                await assertThrow(
                    mcashWeb.mcash.getTransactionFromBlock(currBlockNum, -1),
                    'Invalid transaction index provided'
                );
            });

        });


        describe("#getTransactionInfo", async function () {

            const idx = 26;
            let transaction;

            before(async function(){
                transaction = await mcashWeb.mcash.freezeBalance(10e5, 3, 'BANDWIDTH', { privateKey: accounts.pks[idx], address: accounts.hex[idx] });
                transaction = transaction.transaction;
            });

            it('should get transaction info by id', async function () {
                this.timeout(20000);
                while (true) {
                    const tx = await mcashWeb.mcash.getTransactionInfo(transaction.txID);
                    if (Object.keys(tx).length === 0) {
                        await wait(3);
                        continue;
                    } else {
                        assert.equal(tx.id, transaction.txID);
                        break;
                    }
                }
            });

        });


        describe("#getConfirmedTransaction", async function () {

            const idx = 26;
            let transaction;

            before(async function(){
                transaction = await mcashWeb.mcash.freezeBalance(10e5, 3, 'BANDWIDTH', { privateKey: accounts.pks[idx], address: accounts.hex[idx] });
            });

            it('should get confirmed transaction by tx id', async function () {
                this.timeout(20000);
                while (true) {
                    try {
                        const tx = await mcashWeb.mcash.getConfirmedTransaction(transaction.transaction.txID);
                        assert.equal(tx.txID, transaction.transaction.txID);
                        break;
                    } catch (e) {
                        if (e === 'Transaction not found') {
                            await wait(3);
                            continue;
                        } else {
                            throw new Error(e);
                            break;
                        }
                    }
                }
            });

        });

    });


    // TRC 10 Token Test
    describe('#Token Test', function () {

        describe("#sendAsset", async function () {

            let token;
            const fromIdx = 27;
            const toIdx = 28;

            before(async function(){
                this.timeout(10000);

                const options = getTokenOptions();
                const transaction = await mcashWeb.transactionBuilder.createToken(options, accounts.hex[fromIdx]);
                await broadcaster(null, accounts.pks[fromIdx], transaction);
                await waitChainData('token', accounts.hex[fromIdx]);
                token = await mcashWeb.mcash.getTokensIssuedByAddress(accounts.hex[fromIdx]);
            });

            it('should send mcash by to address and verify account balance', async function () {
                this.timeout(20000);

                const assetBefore = (await mcashWeb.mcash.getUnconfirmedAccount(accounts.hex[toIdx])).assetV2;
                await waitChainData('tokenById', token[Object.keys(token)[0]]['id']);
                await mcashWeb.mcash.sendAsset(
                    accounts.hex[toIdx],
                    10e4,
                    token[Object.keys(token)[0]]['id'],
                    { privateKey: accounts.pks[fromIdx], address: accounts.hex[fromIdx] }
                );

                await waitChainData('sendToken', accounts.hex[toIdx], !assetBefore ? 0 : assetBefore[0].value);
                const assetAfter = (await mcashWeb.mcash.getUnconfirmedAccount(accounts.hex[toIdx])).assetV2;
                assert.equal(!assetBefore ? 0 : assetBefore[0].value, assetAfter[0].value - 10e4);
            });

            it('should throw invalid recipient provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sendAsset(
                        'notValidAddress',
                        10e4,
                        token[Object.keys(token)[0]]['id'],
                        { privateKey: accounts.pks[fromIdx], address: accounts.hex[fromIdx] }
                    ),
                    'Invalid recipient provided'
                );
            });

            it('should throw invalid amount provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sendAsset(
                        accounts.hex[toIdx],
                        -10,
                        token[Object.keys(token)[0]]['id'],
                        { privateKey: accounts.pks[fromIdx], address: accounts.hex[fromIdx] }
                    ),
                    'Invalid amount provided'
                );
            });

            it('should throw invalid token ID provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sendAsset(
                        accounts.hex[toIdx],
                        10e4,
                        {},
                        { privateKey: accounts.pks[fromIdx], address: accounts.hex[fromIdx] }
                    ),
                    'Invalid token ID provided'
                );
            });

            it('should throw cannot transfer tokens to the same account provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sendAsset(
                        accounts.hex[fromIdx],
                        10e4,
                        token[Object.keys(token)[0]]['id'],
                        { privateKey: accounts.pks[fromIdx], address: accounts.hex[fromIdx] }
                    ),
                    'Cannot transfer tokens to the same account'
                );
            });

        });


        describe("#sendToken", async function () {

            let token;
            const fromIdx = 29;
            const toIdx = 30;

            before(async function(){
                this.timeout(10000);

                const options = getTokenOptions();
                const transaction = await mcashWeb.transactionBuilder.createToken(options, accounts.hex[fromIdx]);
                await broadcaster(null, accounts.pks[fromIdx], transaction);
                await waitChainData('token', accounts.hex[fromIdx]);
                token = await mcashWeb.mcash.getTokensIssuedByAddress(accounts.hex[fromIdx]);
            });

            it('should send mcash by to address and verify account balance', async function () {
                this.timeout(10000);

                const assetBefore = (await mcashWeb.mcash.getUnconfirmedAccount(accounts.hex[toIdx])).assetV2;
                // transfer from account 10 to 11
                await mcashWeb.mcash.sendToken(
                    accounts.hex[toIdx],
                    10e4,
                    token[Object.keys(token)[0]]['id'],
                    '',
                    { privateKey: accounts.pks[fromIdx], address: accounts.hex[fromIdx] }
                );
                await waitChainData('sendToken', accounts.hex[toIdx], !assetBefore ? 0 : assetBefore[0].value);
                const assetAfter = (await mcashWeb.mcash.getUnconfirmedAccount(accounts.hex[toIdx])).assetV2;

                assert.equal(!assetBefore ? 0 : assetBefore[0].value, assetAfter[0].value - 10e4);
            });

            it('should throw invalid recipient provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sendToken(
                        'notValidAddress',
                        10e4,
                        token[Object.keys(token)[0]]['id'],
                        '',
                        { privateKey: accounts.pks[fromIdx], address: accounts.hex[fromIdx] }
                    ),
                    'Invalid recipient provided'
                );
            });

            it('should throw invalid amount provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sendToken(
                        accounts.hex[toIdx],
                        -10,
                        token[Object.keys(token)[0]]['id'],
                        '',
                        { privateKey: accounts.pks[fromIdx], address: accounts.hex[fromIdx] }
                    ),
                    'Invalid amount provided'
                );
            });

            it('should throw invalid token ID provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sendAsset(
                        accounts.hex[toIdx],
                        10e4,
                        {},
                        { privateKey: accounts.pks[fromIdx], address: accounts.hex[fromIdx] }
                    ),
                    'Invalid token ID provided'
                );
            });

            it('should throw cannot transfer tokens to the same account provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.sendAsset(
                        accounts.hex[fromIdx],
                        10e4,
                        token[Object.keys(token)[0]]['id'],
                        { privateKey: accounts.pks[fromIdx], address: accounts.hex[fromIdx] }
                    ),
                    'Cannot transfer tokens to the same account'
                );
            });

        });


        describe("#getTokenFromID", async function () {

            const idx = 31;

            before(async function(){
                this.timeout(10000);

                const options = getTokenOptions();
                const transaction = await mcashWeb.transactionBuilder.createToken(options, accounts.hex[idx]);
                await broadcaster(null, accounts.pks[idx], transaction);
                await waitChainData('token', accounts.hex[idx]);
            });

            it('should get token by name', async function () {
                const tokens = await mcashWeb.mcash.listTokens(5, 0);
                for (let token of tokens) {
                    const tk = await mcashWeb.mcash.getTokenFromId(token.id);
                    assert.equal(tk.id, token.id);
                }
            });

            it('should throw invalid token ID provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.getTokenFromId({}),
                    'Invalid token ID provided'
                );
            });

            it('should throw token does not exist error', async function () {
                await assertThrow(
                    mcashWeb.mcash.getTokenFromId(1234565),
                    'Token does not exist'
                );
            });

        });


        describe("#getTokensIssuedByAddress", async function () {

            const idx = 32;

            before(async function(){
                this.timeout(10000);

                const options = getTokenOptions();
                const transaction = await mcashWeb.transactionBuilder.createToken(options, accounts.hex[idx]);
                await broadcaster(null, accounts.pks[idx], transaction);
                await waitChainData('token', accounts.hex[idx]);
            });

            it('should get token by issued address', async function () {
                const tokens = await mcashWeb.mcash.listTokens(5, 0);
                for (let token of tokens) {
                    const tk = await mcashWeb.mcash.getTokensIssuedByAddress(token.owner_address);
                    assert.equal(tk[Object.keys(tk)[0]]['id'], token.id);
                }
            });

            it('should throw invalid address provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.getTokensIssuedByAddress('abcdefghijklmn'),
                    'Invalid address provided'
                );
            });

        });


        describe("#listTokens", async function () {

            it('should list all tokens by limit', async function () {
                const tokens = await mcashWeb.mcash.listTokens(10, 0);
                assert.isArray(tokens);
                for (let token of tokens) {
                    assert.isDefined(token.id);
                }
            });

            it('should throw invalid limit provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.listTokens(-1, 0),
                    'Invalid limit provided'
                );
            });

            it('should throw invalid offset provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.listTokens(5, -1),
                    'Invalid offset provided'
                );
            });

        });


        describe("#parseToken", async function () {

            it('should list all tokens by limit', async function () {
                const tokens = await mcashWeb.mcash.listTokens(10, 0);
                for (let token of tokens) {
                    const cloneToken = JSON.parse(JSON.stringify(token));
                    token.name = mcashWeb.fromUtf8(token.name);
                    token.abbr = mcashWeb.fromUtf8(token.abbr);
                    token.description = token.description && mcashWeb.fromUtf8(token.description);
                    token.url = mcashWeb.fromUtf8(token.url);

                    const tk = mcashWeb.mcash._parseToken(token);
                    assert.equal(tk.name, cloneToken.name);
                    assert.equal(tk.abbr, cloneToken.abbr);
                    assert.equal(tk.description, cloneToken.description);
                    assert.equal(tk.url, cloneToken.url);
                }
            });

        });

    });


    // Exchange Test
    describe('#Exchange Test', function () {

        describe("#listExchanges", async function () {

            const idxS = 33;
            const idxE = 35;
            const toIdx = 35;

            before(async function(){
                this.timeout(20000);

                let tokenNames = [];

                // create token
                for (let i = idxS; i < idxE; i++) {
                    const options = getTokenOptions();
                    const transaction = await mcashWeb.transactionBuilder.createToken(options, accounts.hex[i]);
                    await broadcaster(null, accounts.pks[i], transaction);
                    await waitChainData('token', accounts.hex[i]);
                    const token = await mcashWeb.mcash.getTokensIssuedByAddress(accounts.hex[i]);
                    await waitChainData('tokenById', token[Object.keys(token)[0]]['id']);
                    await broadcaster(null, accounts.pks[i], await mcashWeb.transactionBuilder.sendToken(
                        accounts.hex[toIdx],
                        10e4,
                        token[Object.keys(token)[0]]['id'],
                        token[Object.keys(token)[0]]['owner_address']
                    ));
                    await waitChainData('sendToken', accounts.hex[toIdx], 0);
                    tokenNames.push(token[Object.keys(token)[0]]['id']);
                }
                await broadcaster(
                    null,
                    accounts.pks[toIdx],
                    await mcashWeb.transactionBuilder.createTokenExchange(tokenNames[0], 10e3, tokenNames[1], 10e3, accounts.hex[toIdx])
                );

            });

            it('should get exchange by id', async function () {
                const exchanges = await mcashWeb.mcash.listExchanges();
                assert.isArray(exchanges);
                for (let exchange of exchanges) {
                    assert.isDefined(exchange.exchange_id);
                }
            });

        });


        describe("#listExchangesPaginated", async function () {

            const idxS = 36;
            const idxE = 38;
            const toIdx = 38;

            before(async function(){
                this.timeout(20000);

                let tokenNames = [];

                // create token
                for (let i = idxS; i < idxE; i++) {
                    const options = getTokenOptions();
                    const transaction = await mcashWeb.transactionBuilder.createToken(options, accounts.hex[i]);
                    await broadcaster(null, accounts.pks[i], transaction);
                    await waitChainData('token', accounts.hex[i]);
                    const token = await mcashWeb.mcash.getTokensIssuedByAddress(accounts.hex[i]);
                    await waitChainData('tokenById', token[Object.keys(token)[0]]['id']);
                    await broadcaster(null, accounts.pks[i], await mcashWeb.transactionBuilder.sendToken(
                        accounts.hex[toIdx],
                        10e4,
                        token[Object.keys(token)[0]]['id'],
                        token[Object.keys(token)[0]]['owner_address']
                    ));
                    await waitChainData('sendToken', accounts.hex[toIdx], 0);
                    tokenNames.push(token[Object.keys(token)[0]]['id']);
                }

                await broadcaster(
                    null,
                    accounts.pks[toIdx],
                    await mcashWeb.transactionBuilder.createTokenExchange(tokenNames[0], 10e3, tokenNames[1], 10e3, accounts.hex[toIdx])
                );

            });

            it('should get exchange by id', async function () {
                const exchanges = await mcashWeb.mcash.listExchangesPaginated(10, 0);
                assert.isArray(exchanges);
                assert.isTrue(exchanges.length > 0);
                for (let exchange of exchanges) {
                    assert.isDefined(exchange.exchange_id);
                }
            });

        });


        describe("#getExchangeByID", async function () {

            const idxS = 39;
            const idxE = 41;
            const toIdx = 41;
            let exchanges;

            before(async function(){
                this.timeout(20000);

                let tokenNames = [];

                // create token
                for (let i = idxS; i < idxE; i++) {
                    const options = getTokenOptions();
                    await broadcaster(null, accounts.pks[i], await mcashWeb.transactionBuilder.createToken(options, accounts.hex[i]));
                    await waitChainData('token', accounts.hex[i]);
                    const token = await mcashWeb.mcash.getTokensIssuedByAddress(accounts.hex[i]);
                    await waitChainData('tokenById', token[Object.keys(token)[0]]['id']);
                    await broadcaster(null, accounts.pks[i], await mcashWeb.transactionBuilder.sendToken(
                        accounts.hex[toIdx],
                        10e4,
                        token[Object.keys(token)[0]]['id'],
                        token[Object.keys(token)[0]]['owner_address']
                    ));
                    await waitChainData('sendToken', accounts.hex[toIdx], 0);
                    tokenNames.push(token[Object.keys(token)[0]]['id']);
                }

                await broadcaster(
                    null,
                    accounts.pks[toIdx],
                    await mcashWeb.transactionBuilder.createTokenExchange(tokenNames[0], 10e3, tokenNames[1], 10e3, accounts.hex[toIdx])
                );

                exchanges = await mcashWeb.mcash.listExchanges();
            });

            it('should get exchange by id', async function () {
                for (let exchange of exchanges) {
                    const ex = await mcashWeb.mcash.getExchangeByID(exchange.exchange_id);
                    assert.equal(ex.exchange_id, exchange.exchange_id);
                }
            });

        });

    });


    // Proposal Test
    describe("#Proposal Test", async function () {

        describe("#getChainParameters", async function () {

            it('should get proposal list', async function () {
                const params = await mcashWeb.mcash.getChainParameters();
                assert.isArray(params);
                assert.isDefined(params[0].key);
            });

        });


        describe("#getProposal", async function () {

            let proposals;

            before(async function(){
                // create proposal
                let parameters = [{"key": 0, "value": 100000}, {"key": 1, "value": 2}]
                await broadcaster(
                    null,
                    PRIVATE_KEY,
                    await mcashWeb.transactionBuilder.createProposal(parameters[0], ADDRESS_BASE58)
                );

                proposals = await mcashWeb.mcash.listProposals();
            });

            it('should get proposal by id', async function () {
                for (let proposal of proposals) {
                    const ps = await mcashWeb.mcash.getProposal(proposal.proposal_id);
                    assert.equal(ps.proposal_id, proposal.proposal_id);
                }
            });

            it('should throw invalid proposalID provided error', async function () {
                await assertThrow(
                    mcashWeb.mcash.getProposal(-1),
                    'Invalid proposalID provided'
                );
            });

        });


        describe("#listProposals", async function () {

            before(async function(){
                // create proposal
                for (let i = 0; i < 5; i++) {
                    let parameters = [{"key": i + 1, "value": 100000}, {"key": i + 2, "value": 2}]
                    await broadcaster(
                        null,
                        PRIVATE_KEY,
                        await mcashWeb.transactionBuilder.createProposal(parameters[0], ADDRESS_BASE58)
                    );
                }
            });

            it('should list seeds node', async function () {
                const proposals = await mcashWeb.mcash.listProposals();
                for (let proposal of proposals) {
                    assert.isDefined(proposal.proposal_id);
                    assert.isDefined(proposal.proposer_address);
                }
            });

        });

    });


    // Contract Test
    describe("#getContract", async function () {

        const idx = 42;
        let transaction;

        before(async function(){
            this.timeout(10000);

            transaction = await mcashWeb.transactionBuilder.createSmartContract({
                abi: testRevertContract.abi,
                bytecode: testRevertContract.bytecode
            }, accounts.hex[idx]);
            await broadcaster(null, accounts.pks[idx], transaction);
            await waitChainData('contract', transaction.contract_address)
        });

        it('should get contract by contract address', async function () {
            const contract = await mcashWeb.mcash.getContract(transaction.contract_address);
            assert.equal(contract.contract_address, transaction.contract_address);
        });

        it('should throw invalid contract address provided error', async function () {
            await assertThrow(
                mcashWeb.mcash.getContract('notAddress'),
                'Invalid contract address provided'
            );
        });

        it('should throw contract does not exist error', async function () {
            await assertThrow(
                mcashWeb.mcash.getContract('417cbcc41052b59584d1ac9fc1ce39106533aa1d40'),
                'Contract does not exist'
            );
        });

    });


    // Node Test
    describe("#listNodes", async function () {

        it('should list seeds node', async function () {
            const nodes = await mcashWeb.mcash.listNodes();
            assert.isArray(nodes);
        });

    });


    // SR Test
    describe("#listSuperRepresentatives", async function () {

        it('should list super representatives', async function () {
            const srs = await mcashWeb.mcash.listSuperRepresentatives();
            assert.isArray(srs);
            for (let sr of srs) {
                assert.isDefined(sr.address);
                assert.isDefined(sr.voteCount);
                assert.isDefined(sr.latestBlockNum);
            }
        });

    });


    describe("#timeUntilNextVoteCycle", async function () {

        it('should get time util next vote cycle', async function () {
            const num = await mcashWeb.mcash.timeUntilNextVoteCycle();
            assert.isNumber(num);
        });

    });


});
