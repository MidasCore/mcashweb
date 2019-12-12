const chai = require('chai');
const assert = chai.assert;
const wait = require('../../helpers/wait');
const assertThrow = require('../../helpers/assertThrow');
const broadcaster = require('../../helpers/broadcaster');
const _ = require('lodash');
const mcashWebBuilder = require('../../helpers/mcashWebBuilder');
const McashWeb = mcashWebBuilder.McashWeb;

const testRevertContract = require('../../fixtures/contracts').testRevert;

describe('#contract.method', function () {

    let accounts;
    let mcashWeb;
    let emptyAccount;

    before(async function () {
        mcashWeb = mcashWebBuilder.createInstance();
        // ALERT this works only with Quickstart:
        accounts = await mcashWebBuilder.getTestAccounts();
        emptyAccount = await McashWeb.createAccount();
    });

    describe('#send()', function () {

        let testRevert;

        before(async function () {
            const tx = await broadcaster(mcashWeb.transactionBuilder.createSmartContract({
                abi: testRevertContract.abi,
                bytecode: testRevertContract.bytecode
            }, accounts.b58[0]), accounts.pks[0]);
            testRevert = await mcashWeb.contract().at(tx.transaction.contract_address);
        });

        it("should set accounts[2] as the owner and check it with getOwner(1)", async function () {
            await testRevert.methods.setOwner(accounts.hex[2]).send();
            assert.equal(await testRevert.methods.getOwner(1).call(), accounts.hex[2])
        });

        it("should revert if trying to set MQaCgZ4tKLttV4HFWS8JzDUBfJ1cjPvgYZ as the owner", async function () {
            this.timeout(30000);
            await assertThrow(testRevert.setOwner('MQaCgZ4tKLttV4HFWS8JzDUBfJ1cjPvgYZ').send({shouldPollResponse: true}),
                null,
                'REVERT'
            );
        });

    });

    describe('#call()', function () {

        let testRevert;

        before(async function () {
            const tx = await broadcaster(mcashWeb.transactionBuilder.createSmartContract({
                abi: testRevertContract.abi,
                bytecode: testRevertContract.bytecode
            }, accounts.b58[0]), accounts.pks[0]);
            testRevert = await mcashWeb.contract().at(tx.transaction.contract_address);
            await testRevert.setOwner(accounts.b58[2]).send();
        });

        it("should getOwner(1) and get accounts[2]", async function () {
            assert.equal(await testRevert.getOwner(1).call(), accounts.hex[2])
        });

        it("should revert if call getOwner(2)", async function () {
            await assertThrow(testRevert.getOwner(2).call(),
                null,
                ['The call has been reverted or has thrown an error.', 'Wrong check']
            )
        });

        it("should revert if call getOwner2()", async function () {
            await assertThrow(testRevert.getOwner2(2).call(),
                'The call has been reverted or has thrown an error.'
            )
        });
    });

});
