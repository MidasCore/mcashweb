
let someParameter

class GetNowBlock {

    // In a real case, you should have this in order to allow the library to work stand-alone. But for this test, it is more clear this way.

    // constructor(tronWeb = false) {
    //     if (!tronWeb)
    //         throw new Error('Expected instance of McashWeb');
    //
    //     this.tronWeb = tronWeb;
    // }

    async someMethod(callback = false) {

        if(!callback)
            return this.injectPromise(this.getCurrentBlock);

        this.mcashWeb.fullNode.request('wallet/getnowblock').then(block => {
            block.fromPlugin = true
            callback(null, block);
        }).catch(err => callback(err));
    }

    getSomeParameter() {
        return someParameter;
    }

    pluginInterface(options) {
        if (options.someParameter) {
            someParameter = options.someParameter
        }
        return {
            requires: '^2.2.4',
            components: {
                trx: {
                    // will be overridden
                    getCurrentBlock: this.someMethod,

                    // will be added
                    getLatestBlock: this.someMethod,
                    getSomeParameter: this.getSomeParameter,

                    // will be skipped
                    _parseToken: function () {}


                }
            }
        }
    }
}

module.exports = GetNowBlock
