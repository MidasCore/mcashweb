const chai = require('chai');
const {ADDRESS_HEX, ADDRESS_BASE58} = require('../helpers/config');
const mcashWebBuilder = require('../helpers/mcashWebBuilder');

const assert = chai.assert;

describe('McashWeb.utils.accounts', function () {

    describe('#generateAccount()', function () {

        it("should generate a new account", async function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            const newAccount = await mcashWeb.utils.accounts.generateAccount();
            assert.equal(newAccount.privateKey.length, 64);
            assert.equal(newAccount.publicKey.length, 130);
            let address = mcashWeb.address.fromPrivateKey(newAccount.privateKey);
            assert.equal(address, newAccount.address.base58);

            assert.equal(mcashWeb.address.toHex(address), newAccount.address.hex.toLowerCase());
        });
    });
});
