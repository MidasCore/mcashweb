const chai = require('chai');
const {FULL_NODE_API} = require('../helpers/config');
const assertThrow = require('../helpers/assertThrow');
const mcashWebBuilder = require('../helpers/mcashWebBuilder');
const McashWeb = mcashWebBuilder.McashWeb;
const GetNowBlock = require('../helpers/getnowblock');
const jlog = require('../helpers/jlog')

const assert = chai.assert;

// TODO
describe.skip('McashWeb.lib.plugin', async function () {

    let mcashWeb;

    before(async function () {
        mcashWeb = mcashWebBuilder.createInstance();
    });

    describe('#constructor()', function () {

        it('should have been set a full instance in mcashWeb', function () {

            assert.instanceOf(mcashWeb.plugin, McashWeb.Plugin);
        });

    });

    describe("#plug GetNowBlock", async function () {

        it('should register the plugin GetNowBlock', async function () {

            const someParameter = 'someValue';

            let result = mcashWeb.plugin.register(GetNowBlock, {
                someParameter
            });
            assert.isTrue(result.skipped.includes('_parseToken'));
            assert.isTrue(result.plugged.includes('getCurrentBlock'));
            assert.isTrue(result.plugged.includes('getLatestBlock'));

            result = await mcashWeb.mcash.getCurrentBlock();
            assert.isTrue(result.fromPlugin);

            result = await mcashWeb.mcash.getSomeParameter();
            assert.equal(result, someParameter)

        })

    });


});
