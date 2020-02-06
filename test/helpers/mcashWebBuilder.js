const chalk = require('chalk');
const McashWeb = require('../setup/McashWeb');
const jlog = require('./jlog');

const {FULL_NODE_API, SOLIDITY_NODE_API, EVENT_API, PRIVATE_KEY} = require('./config');

const createInstance = () => {
    return new McashWeb({
        fullHost: FULL_NODE_API,
        privateKey: PRIVATE_KEY
    });
};

let instance;

const getInstance = () => {
    if (!instance) {
        instance = createInstance();
    }
    return instance;
};

const newTestAccounts = async (amount) => {
    const mcashWeb = createInstance();

    console.log(chalk.blue(`Generating ${amount} new accounts...`));
    await mcashWeb.fullNode.request('/admin/generate-testing?accounts=' + amount);
    const lastCreated = await getTestAccounts();
    jlog(lastCreated.b58);
};

const getTestAccounts = async () => {
    const accounts = {
        b58: [],
        hex: [],
        pks: []
    };
    const mcashWeb = createInstance();
    const accountsResponse = await mcashWeb.fullNode.request('/admin/account-testing');
    if (accountsResponse.data.accounts) {
        for (let acc of accountsResponse.data.accounts) {
            accounts.pks.push(acc.pk);
            accounts.b58.push(acc.base58);
            accounts.hex.push(acc.hex);
        }
    }
    return accounts;
};

module.exports = {
    createInstance,
    getInstance,
    newTestAccounts,
    getTestAccounts,
    McashWeb
};

