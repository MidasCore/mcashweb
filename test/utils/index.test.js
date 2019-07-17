const chai = require('chai');
const mcashWebBuilder = require('../helpers/mcashWebBuilder');
const McashWeb = mcashWebBuilder.McashWeb;
const BigNumber = require('bignumber.js');

const assert = chai.assert;

describe('Mcash.utils', function () {

    describe("#isValidURL()", function () {

        it('should verify good urls', function () {

            const mcashWeb = mcashWebBuilder.createInstance();

            assert.isTrue(mcashWeb.utils.isValidURL('https://some.example.com:9090/casa?qe=3'))
            assert.isTrue(mcashWeb.utils.isValidURL('www.example.com/welcome'))

            assert.isFalse(mcashWeb.utils.isValidURL('http:/some.example.com'))

            assert.isFalse(mcashWeb.utils.isValidURL(['http://example.com']))

        })

    });

    describe("#isArray()", function () {

        it('should verify that a value is an array', function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.isTrue(mcashWeb.utils.isArray([]));
            assert.isTrue(mcashWeb.utils.isArray([[2], {a: 3}]));

            assert.isFalse(mcashWeb.utils.isArray({}));
            assert.isFalse(mcashWeb.utils.isArray("Array"));

        })

    });


    describe("#isJson()", function () {

        it('should verify that a value is a JSON string', function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.isTrue(mcashWeb.utils.isJson('[]'));
            assert.isTrue(mcashWeb.utils.isJson('{"key":"value"}'));
            assert.isTrue(mcashWeb.utils.isJson('"json"'));

            assert.isFalse(mcashWeb.utils.isJson({}));
            assert.isFalse(mcashWeb.utils.isJson("json"));

        })

    });

    describe("#isBoolean()", function () {

        it('should verify that a value is a JSON string', function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.isTrue(mcashWeb.utils.isBoolean(true));
            assert.isTrue(mcashWeb.utils.isBoolean('a' == []));

            assert.isFalse(mcashWeb.utils.isBoolean({}));
            assert.isFalse(mcashWeb.utils.isBoolean("json"));

        })

    });

    describe("#isBigNumber()", function () {

        it('should verify that a value is a JSON string', function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            const bigNumber = BigNumber('1234565432123456778765434456777')

            assert.isTrue(mcashWeb.utils.isBigNumber(bigNumber));

            assert.isFalse(mcashWeb.utils.isBigNumber('0x09e80f665949b63b39f3850127eb29b55267306b69e2104c41c882e076524a1c'));
            assert.isFalse(mcashWeb.utils.isBigNumber({}));
            assert.isFalse(mcashWeb.utils.isBigNumber("json"));

        })

    });


    describe("#isString()", function () {

        it('should verify that a valyue is a string', function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.isTrue(mcashWeb.utils.isString('str'));
            assert.isTrue(mcashWeb.utils.isString(13..toString()));

            assert.isFalse(mcashWeb.utils.isString(2));

        })

    });

    describe("#isFunction()", function () {

        it('should verify that a value is a function', function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.isTrue(mcashWeb.utils.isFunction(new Function()));
            assert.isTrue(mcashWeb.utils.isFunction(() => {
            }));
            assert.isTrue(mcashWeb.utils.isFunction(mcashWeb.utils.isFunction));

            assert.isFalse(mcashWeb.utils.isFunction({function: new Function}));

        })

    });

    describe('#isHex()', function () {
        it('should verify that a string is an hex string', function () {

            const mcashWeb = mcashWebBuilder.createInstance();

            let input = '0x1';
            let expected = true;
            assert.equal(mcashWeb.utils.isHex(input), expected);

            input = '0x0';
            expected = true;
            assert.equal(mcashWeb.utils.isHex(input), expected);

            input = '0x73616c616d6f6e';
            expected = true;
            assert.equal(mcashWeb.utils.isHex(input), expected);

            input = '73616c616d6f';
            expected = true;
            assert.equal(mcashWeb.utils.isHex(input), expected);

            input = '0x73616c616d6fsz';
            expected = false;
            assert.equal(mcashWeb.utils.isHex(input), expected);

            input = 'x898989';
            expected = false;
            assert.equal(mcashWeb.utils.isHex(input), expected);

        });

    });

    describe("#isInteger()", function () {

        it('should verify that a value is an integer', function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.isTrue(mcashWeb.utils.isInteger(2345434));
            assert.isTrue(mcashWeb.utils.isInteger(-234e4));

            assert.isFalse(mcashWeb.utils.isInteger(3.4));
            assert.isFalse(mcashWeb.utils.isInteger('integer'));

        })

    });

    describe("#hasProperty()", function () {

        it('should verify that an object has a specific property', function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.isTrue(mcashWeb.utils.hasProperty({p: 2}, 'p'));
            assert.isFalse(mcashWeb.utils.hasProperty([{p: 2}], 'p'));

            assert.isFalse(mcashWeb.utils.hasProperty({a: 2}, 'p'));

        })

    });

    describe("#hasProperties()", function () {

        it('should verify that an object has some specific properties', function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.isTrue(mcashWeb.utils.hasProperties({p: 2, s: 2}, 'p', 's'));

            assert.isFalse(mcashWeb.utils.hasProperties({p: 2, s: 2}, 'p', 'q'));

        })

    });


    describe("#mapEvent()", function () {

        it('should map an event result', function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            const event = {
                block_number: 'blockNumber',
                block_timestamp: 'blockTimestamp',
                contract_address: 'contractAddress',
                event_name: 'eventName',
                transaction_id: 'transactionId',
                result: 'result',
                resource_Node: 'resourceNode'
            }

            const expected = {
                block: 'blockNumber',
                timestamp: 'blockTimestamp',
                contract: 'contractAddress',
                name: 'eventName',
                transaction: 'transactionId',
                result: 'result',
                resourceNode: 'resourceNode'
            }

            const mapped = mcashWeb.utils.mapEvent(event)
            for(let key in mapped) {
                assert.equal(mapped[key], expected[key])
            }

        })

    });

    describe('#parseEvent', function () {
        // TODO
    });

    describe("#padLeft()", function () {

        it('should return the pad left of a string', function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.equal(mcashWeb.utils.padLeft('09e80f', '0', 12), '00000009e80f');
            // assert.equal(mcashWeb.utils.padLeft(new Function, '0', 32), '0000000function anonymous() {\n\n}');
            assert.equal(mcashWeb.utils.padLeft(3.4e3, '0', 12), '000000003400');

        })

    });

});
