const mcashWebBuilder = require('./mcashWebBuilder');
const mcashWeb = mcashWebBuilder.createInstance();
const wait = require('./wait');
const chalk = require('chalk');

function log(x) {
    process.stdout.write(chalk.yellow(x))
}

module.exports = async function (type, ...params) {
    let startTimestamp = Date.now();
    let timeLimit = 5000;
    do {
        let data;
        let isFound = false;
        try {
            switch (type) {
                case 'tx': {
                    data = await mcashWeb.mcash.getTransaction(params[0]);
                    isFound = !!data.tx_id;
                    break;
                }
                case 'account': {
                    data = await mcashWeb.mcash.getUnconfirmedAccount(params[0]);
                    isFound = !!data.address;
                    break;
                }
                case 'token': {
                    data = await mcashWeb.mcash.getTokensIssuedByAddress(params[0]);
                    isFound = !!Object.keys(data).length;
                    break;
                }
                case 'tokenById': {
                    data = await mcashWeb.mcash.getTokenFromId(params[0]);
                    isFound = !!data.name;
                    break;
                }
                case 'sendToken': {
                    data = await mcashWeb.mcash.getUnconfirmedAccount(params[0]);
                    isFound = data && data.assets && data.assets.length && data.assets[0].value !== params[1];
                    break;
                }
                case 'balance': {
                    data = await mcashWeb.mcash.getUnconfirmedBalance(params[0]);
                    isFound = (data !== params[1]);
                    break;
                }
                case 'freezeBp': {
                    data = await mcashWeb.mcash.getUnconfirmedAccount(params[0]);
                    isFound = data.frozen_for_bandwidth && (data.frozen_for_bandwidth.frozen_balance !== params[1]);
                    break;
                }
                case 'freezeEnergy': {
                    data = await mcashWeb.mcash.getUnconfirmedAccount(params[0]);
                    isFound = data.frozen_for_energy && (data.frozen_for_energy.frozen_balance !== params[1]);
                    break;
                }
                case 'contract': {
                    data = await mcashWeb.mcash.getContract(params[0]);
                    isFound = !!data.contract_address;
                    break;
                }
                case 'exchange': {
                    data = await mcashWeb.mcash.getExchangeByID(params[0]);
                    isFound = !!data.exchange_id;
                    break;
                }
                default:
                    isFound = true;

            }
        } catch (e) {
            log(e);
            await wait(1);
            continue;
        }
        // console.log(...params, 'wait for chain data result: ', isFound, data, type);
        if (isFound)
            return;
        log(`waiting for unconfirmed data,${type}...`);
        await wait(1);

    } while (Date.now() - startTimestamp < timeLimit);

    throw new Error('No unconfirmed data found on chain');
};
