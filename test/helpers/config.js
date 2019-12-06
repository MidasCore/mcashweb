const fullHost = "http://127.0.0.1:" + (process.env.HOST_PORT || 13399);

module.exports = {

    PRIVATE_KEY: '1c78d4d86dc31acb08a9eb132b9306bd1c86ea426083e0e0b32308606d212a98',
    CONSUME_USER_RESOURCE_PERCENT: 30,
    FEE_LIMIT: 10000000000,
    FULL_NODE_API: fullHost,
    SOLIDITY_NODE_API: fullHost,
    EVENT_API: fullHost,
    NETWORK_ID: "*",
    ADDRESS_HEX: '32bf82fd6597cd3200c468220ecd7cf47c1a4cb149',
    ADDRESS_BASE58: 'MRMnDQKREu7JAg8s5qNaVzh2Gkg1MTiYqE',
    UPDATED_TEST_TOKEN_OPTIONS: {
        description: 'Very useless utility token',
        url: 'https://none.example.com',
        freeBandwidth: 10,
        freeBandwidthLimit: 100
    },
    getTokenOptions: () => {
        const rnd = Math.random().toString(36).substr(2);
        return {
            name: `Token${rnd}`,
            abbreviation: `T${rnd.substring(2).toUpperCase()}`,
            description: 'Useless utility token',
            url: `https://example-${rnd}.com/`,
            totalSupply: 100000000,
            saleEnd: Date.now() + 60000, // 1 minute
            frozenAmount: 5,
            frozenDuration: 1,
            trxRatio: 10,
            tokenRatio: 2,
            saleStart: Date.now() + 500,
            freeBandwidth: 100,
            freeBandwidthLimit: 1000
        }
    },
    isProposalApproved: async (mcashWeb, proposal) => {
        let chainParameters = await mcashWeb.mcash.getChainParameters();
        for(let param of chainParameters) {
            if(param.key === proposal) {
                return param.value
            }
        }
        return false
    }
};
