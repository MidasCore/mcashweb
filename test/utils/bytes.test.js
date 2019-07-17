const chai = require('chai');
const mcashWebBuilder = require('../helpers/mcashWebBuilder');

const assert = chai.assert;

describe('McashWeb.utils.bytes', function () {

    describe('#byte2hexStr()', function () {

        it("should convert a byte to a hex string", async function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.equal(mcashWeb.utils.bytes.byte2hexStr(21), '15');
            assert.equal(mcashWeb.utils.bytes.byte2hexStr(33), '21');
            assert.equal(mcashWeb.utils.bytes.byte2hexStr(78), '4E');
            assert.equal(mcashWeb.utils.bytes.byte2hexStr(156), '9C');
            assert.equal(mcashWeb.utils.bytes.byte2hexStr(200), 'C8');

        });

        it("should throw if something else than a byte is passed as input", async function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.throws(() => {
                mcashWeb.utils.bytes.byte2hexStr('15')
            }, 'Input must be a number');

            assert.throws(() => {
                mcashWeb.utils.bytes.byte2hexStr(-15)
            }, 'Input must be a byte');

            assert.throws(() => {
                mcashWeb.utils.bytes.byte2hexStr(1455)
            }, 'Input must be a byte');

        });
    });

    describe('#bytesToString()', function () {

        it("should convert an array of bytes to a hex string", async function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.equal(mcashWeb.utils.bytes.bytesToString([78, 112, 87, 69, 99, 65]), 'NpWEcA');

            assert.equal(mcashWeb.utils.bytes.bytesToString([1178, 2112, 1087, 969]), 'Қࡀпω');

        });

        it("should return the input if the input is a string", async function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.equal(mcashWeb.utils.bytes.bytesToString('NpWEcA'), 'NpWEcA');

            assert.equal(mcashWeb.utils.bytes.bytesToString('Қࡀпω'), 'Қࡀпω');
        });
    });


    describe('#hextoString()', function () {

        it("should convert an hex string to a utf-8 string", async function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.equal(mcashWeb.utils.bytes.hextoString('af43ed56aa77'), '¯CíVªw');
            assert.equal(mcashWeb.utils.bytes.hextoString('0xaf43'), '¯C');
            assert.equal(mcashWeb.utils.bytes.hextoString('49206C6F7665206461726B20636F6D6564696573'), 'I love dark comedies');

        });
    });

    describe('#byteArray2hexStr()', function () {

        it("should convert an array of bytes to a hex string", async function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.equal(mcashWeb.utils.bytes.byteArray2hexStr([73, 32, 108, 111, 118, 101, 32, 100, 97, 114, 107, 32, 99, 111, 109, 101, 100, 105, 101, 115]), '49206C6F7665206461726B20636F6D6564696573');

        });

        it("should throw if the array of bytes is not valid", async function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            assert.throws(() => {
                mcashWeb.utils.bytes.byteArray2hexStr([73, -32, 108])
            }, 'Input must be a byte');
        });
    });


    describe('#base64EncodeToString()', function () {
        it("should encode a bytes array to a base64 string", async function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            let result = mcashWeb.utils.bytes.base64EncodeToString([73, 32, 108, 111, 118, 101, 32, 100, 97, 114, 107, 32, 99, 111, 109, 101, 100, 105, 101, 115]
            );

            assert.equal(result, 'SSBsb3ZlIGRhcmsgY29tZWRpZXM=');
        });
    });

    describe('#base64DecodeFromString()', function () {
        it("should decode a base64 string", async function () {
            const mcashWeb = mcashWebBuilder.createInstance();

            let result = mcashWeb.utils.bytes.base64DecodeFromString('SSBsb3ZlIGRhcmsgY29tZWRpZXM=');

            let string = mcashWeb.utils.bytes.bytesToString(result);
            assert.equal(string, 'I love dark comedies');

        });

    });

});
