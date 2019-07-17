const chai = require('chai');
const {ADDRESS_HEX, ADDRESS_BASE58} = require('../helpers/config');
const mcashWebBuilder = require('../helpers/mcashWebBuilder');

const assert = chai.assert;

describe('mcashWeb.utils.abi', function () {

    describe('#decodeParams()', function () {
        it('should decode abi coded params passing types and output', function () {

            const mcashWeb = mcashWebBuilder.createInstance();
            const types = ['string', 'string', 'uint8', 'bytes32', 'uint256'];
            const output = '0x00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000012dc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011506920446179204e30306220546f6b656e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035049450000000000000000000000000000000000000000000000000000000000';

            const expected = [
                'Pi Day N00b Token',
                'PIE',
                18,
                '0xdc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece7',
                0
            ];


            const result = mcashWeb.utils.abi.decodeParams(types, output);

            for(let i = 0; i < expected.length; i++) {
                assert.equal(result[i], expected[i]);
            }
        });

        it('should decode abi coded params passing names, types and output', function () {

            const mcashWeb = mcashWebBuilder.createInstance();
            const names = ['Token', 'Graph', 'Qty', 'Bytes', 'Total'];
            const types = ['string', 'string', 'uint8', 'bytes32', 'uint256'];
            const output = '0x00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000012dc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011506920446179204e30306220546f6b656e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035049450000000000000000000000000000000000000000000000000000000000';

            const expected = {
                Token: 'Pi Day N00b Token',
                Graph: 'PIE',
                Qty: 18,
                Bytes: '0xdc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece7',
                Total: 0
            };

            const result = mcashWeb.utils.abi.decodeParams(names, types, output);
            for(let i in expected) {
                assert.equal(result[i], expected[i]);
            }
        });

        it('should throw if the string does not start with 0x', function () {

            const mcashWeb = mcashWebBuilder.createInstance();
            const types = ['string', 'string', 'uint8', 'bytes32', 'uint256'];
            const output =
                '00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000012dc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011506920446179204e30306220546f6b656e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035049450000000000000000000000000000000000000000000000000000000000';

            assert.throws(() => {
                mcashWeb.utils.abi.decodeParams(types, output)
            }, 'hex string must have 0x prefix');
        });

        it('should throw if the output format is wrong', function () {

            const mcashWeb = mcashWebBuilder.createInstance();
            const types = ['string', 'string', 'uint8', 'bytes32', 'uint256'];
            const output = '0x00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000012dc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011506920446179204e30306220546f6b656e0000000000000000000000000000005049450000000000000000000000000000000000000000000000000000000000';

            assert.throws(() => {
                mcashWeb.utils.abi.decodeParams(types, output)
            }, 'dynamic bytes count too large');
        });

        it('should throw if the output is invalid', function () {

            const mcashWeb = mcashWebBuilder.createInstance();
            const types = ['string'];
            const output = '0x6630f88f000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000046173646600000000000000000000000000000000000000000000000000000000';

            assert.throws(() => {
                mcashWeb.utils.abi.decodeParams(types, output)
            }, 'The encoded string is not valid. Its length must be a multiple of 64.');
        });

        it('should decode if the output is prefixed with the method hash', function () {

            const mcashWeb = mcashWebBuilder.createInstance();
            const types = ['string'];
            const output = '0x6630f88f000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000046173646600000000000000000000000000000000000000000000000000000000';

            const result = mcashWeb.utils.abi.decodeParams(types, output, true)
            assert.equal(result, 'asdf')
        });
    });


    describe('#encodeParams()', function () {
        it('should encode abi coded params passing types and values', function () {

            const mcashWeb = mcashWebBuilder.createInstance();
            const types = ['string', 'string', 'uint8', 'bytes32', 'uint256'];
            const values = [
                'Pi Day N00b Token',
                'PIE',
                18,
                '0xdc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece7',
                0
            ];

            const expected = '0x00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000012dc03b7993bad736ad595eb9e3ba51877ac17ecc31d2355f8f270125b9427ece700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011506920446179204e30306220546f6b656e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035049450000000000000000000000000000000000000000000000000000000000';


            const result = mcashWeb.utils.abi.encodeParams(types, values);

            for(let i = 0; i < expected.length; i++) {
                assert.equal(result[i], expected[i]);
            }
        });

        it('should encode abi coded params passing addresses in hex and base58 mode', function () {

            const mcashWeb = mcashWebBuilder.createInstance();
            const types = ['string', 'address', 'address'];
            const values = [
                'Onwer',
                ADDRESS_HEX,
                ADDRESS_BASE58
            ];

            const expected = '0x0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000bf82fd6597cd3200c468220ecd7cf47c1a4cb149000000000000000000000000bf82fd6597cd3200c468220ecd7cf47c1a4cb14900000000000000000000000000000000000000000000000000000000000000054f6e776572000000000000000000000000000000000000000000000000000000';
            const result = mcashWeb.utils.abi.encodeParams(types, values);

            for(let i = 0; i < expected.length; i++) {
                assert.equal(result[i], expected[i]);
            }
        });
    });
});
