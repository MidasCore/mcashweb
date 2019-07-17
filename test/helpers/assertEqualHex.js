const assert = require('chai').assert;
const mcashWebBuilder = require('./mcashWebBuilder');

module.exports = async function (result, string) {

    assert.equal(
        result,
        mcashWebBuilder.getInstance().toHex(string).substring(2)
    )
};
