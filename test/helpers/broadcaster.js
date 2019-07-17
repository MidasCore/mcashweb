const mcashWebBuilder = require('./mcashWebBuilder');

module.exports = async function (func, pk, transaction) {
    const mcashWeb = mcashWebBuilder.createInstance();
    if( !transaction) {
        transaction = await func;
    }
    const signedTransaction = await mcashWeb.mcash.sign(transaction, pk);
    const result = {
        transaction,
        signedTransaction,
        receipt: await mcashWeb.mcash.sendRawTransaction(signedTransaction)
    };
    return Promise.resolve(result);
}
