const chalk = require('chalk');
const McashWeb = require('../setup/McashWeb');
const jlog = require('./jlog');

const {FULL_NODE_API, SOLIDITY_NODE_API, EVENT_API, PRIVATE_KEY} = require('./config')

const createInstance = () => {
    return new McashWeb({
        fullHost: FULL_NODE_API,
        privateKey: PRIVATE_KEY
    })
};

let instance;

const getInstance = () => {
    if (!instance) {
        instance = createInstance()
    }
    return instance
};

const newTestAccounts = async (amount) => {
    const mcashWeb = createInstance();

    console.log(chalk.blue(`Generating ${amount} new accounts...`));
    await mcashWeb.fullNode.request('/admin/temporary-accounts-generation?accounts=' + amount);
    const lastCreated = await getTestAccounts(-1);
    jlog(lastCreated.b58)
};

const getTestAccounts = async (block) => {
    const accounts = {
        b58: [],
        hex: [],
        pks: []
    };
    const mcashWeb = createInstance();
    const accountsJson = await mcashWeb.fullNode.request('/admin/accounts-json');
    const index = typeof block === 'number'
        ? (block > -1 && block < accountsJson.more.length ? block : accountsJson.more.length - 1)
        : undefined;
    accounts.pks = typeof block === 'number'
        ? accountsJson.more[index].privateKeys
        : accountsJson.privateKeys;
    for (let i = 0; i < accounts.pks.length; i++) {
        let addr = mcashWeb.address.fromPrivateKey(accounts.pks[i]);
        accounts.b58.push(addr);
        accounts.hex.push(mcashWeb.address.toHex(addr));
    }
    return Promise.resolve(accounts);
};

module.exports = {
    createInstance,
    getInstance,
    newTestAccounts,
    getTestAccounts,
    McashWeb
};

