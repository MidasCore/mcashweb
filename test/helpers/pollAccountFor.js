const _ = require('lodash');
const wait = require('./wait');
const mcashWebBuilder = require('./mcashWebBuilder')

module.exports = async function pollAccountFor(address, property, value = false, interval = 3, timeout = 10000) {
    const mcashWeb = mcashWebBuilder.createInstance()
    let now = Date.now()
    while (true) {
        if(Date.now() > now + timeout) {
            throw new Error('Timeout...');
        }
        wait(interval);
        let result = await mcashWeb.mcash.getAccount(address);
        if(typeof property === 'string') {
            let data = _.get(result, property)
            if(data) {
                if(value) {
                    if(data == value) return Promise.resolve(result);
                } else {
                    return Promise.resolve(result);
                }
            }
        } else if(typeof property === 'function') {
            if(property(result)) {
                return Promise.resolve(result);
            }

        }
    }
}
