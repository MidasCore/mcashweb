const fullHost = "http://127.0.0.1:" + (process.env.HOST_PORT || 13399);

module.exports = {

    PRIVATE_KEY: '29e2e0f061bd50f16e777e4c31af80dd7f32727dafad6c89d29d4211911bc66f',
    CONSUME_USER_RESOURCE_PERCENT: 30,
    FEE_LIMIT: 10000000000,
    FULL_NODE_API: fullHost,
    SOLIDITY_NODE_API: fullHost,
    EVENT_API: fullHost,
    NETWORK_ID: "*",
    ADDRESS_HEX: '323174e6fedb5211df5f0968299e9538bd36527f68',
    ADDRESS_BASE58: 'MCQfPM1tN6QmbAhEDtrrYs2xiPZdqLESLu',
    ADDRESS_FOUNDATION: 'MGiC9p9CfWaTtYbZKeRm6rLPC5aK4i6GwW',
    ADDRESS_FOUNDATION_HEX: '3260a628d80aea5d7d46739d27352d00d159b6d70a',
    PRIVATE_KEY_FOUNDATION: '859e43f418fa4d4449f90807d9886b4a6ba25b3fe4c214c5039384f20303f3f7',
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
            mcashRatio: 10,
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
