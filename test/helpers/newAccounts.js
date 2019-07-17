const mcashWebBuilder = require('./mcashWebBuilder');
const mcashWeb = mcashWebBuilder.createInstance();

const amount = process.argv[2] || 10;

(async function () {
    await mcashWebBuilder.newTestAccounts(amount)
})();

