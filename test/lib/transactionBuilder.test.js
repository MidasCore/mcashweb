const chai = require('chai');
const assert = chai.assert;
const txPars = require('../helpers/txPars');
const jlog = require('../helpers/jlog');
const assertThrow = require('../helpers/assertThrow');
const wait = require('../helpers/wait');
const broadcaster = require('../helpers/broadcaster');
const pollAccountFor = require('../helpers/pollAccountFor');
const _ = require('lodash');
const mcashWebBuilder = require('../helpers/mcashWebBuilder');
const assertEqualHex = require('../helpers/assertEqualHex');
const testRevertContract = require('../fixtures/contracts').testRevert;

const McashWeb = mcashWebBuilder.McashWeb;
const {
    ADDRESS_HEX,
    ADDRESS_BASE58,
    UPDATED_TEST_TOKEN_OPTIONS,
    PRIVATE_KEY,
    getTokenOptions,
    isProposalApproved
} = require('../helpers/config');

describe('McashWeb.transactionBuilder', function () {

    let accounts;
    let mcashWeb;
    let emptyAccount;
    let isAllowSameTokenNameApproved

    before(async function () {
        mcashWeb = mcashWebBuilder.createInstance();
        // ALERT this works only with Tron Quickstart:
        accounts = await mcashWebBuilder.getTestAccounts(-1);
        emptyAccount = await McashWeb.createAccount();
        isAllowSameTokenNameApproved = await isProposalApproved(mcashWeb, 'getAllowSameTokenName')
    });

    describe('#constructor()', function () {

        it('should have been set a full instance in mcashWeb', function () {

            assert.instanceOf(mcashWeb.transactionBuilder, McashWeb.TransactionBuilder);
        });

    });

    describe('#sendTrx()', function () {

        it(`should send 10 trx from default address to accounts[1]`, async function () {
            const transaction = await mcashWeb.transactionBuilder.sendMcash(accounts.b58[1], 10);

            const parameter = txPars(transaction);

            assert.equal(transaction.txID.length, 64);
            assert.equal(parameter.value.amount, 10);
            assert.equal(parameter.value.owner_address, ADDRESS_HEX);
            assert.equal(parameter.value.to_address, accounts.hex[1]);
            assert.equal(parameter.type_url, 'type.googleapis.com/protocol.TransferContract');
        });

        it(`should send 10 trx from accounts[0] to accounts[1]`, async function () {
            const transaction = await mcashWeb.transactionBuilder.sendMcash(accounts.b58[1], 10, accounts.b58[0]);

            const parameter = txPars(transaction);

            assert.equal(transaction.txID.length, 64);
            assert.equal(parameter.value.amount, 10);
            assert.equal(parameter.value.owner_address, accounts.hex[0]);
            assert.equal(parameter.value.to_address, accounts.hex[1]);
            assert.equal(parameter.type_url, 'type.googleapis.com/protocol.TransferContract');
        });

        it('should throw if an invalid address is passed', async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.sendMcash('40f0b27e3d16060a5b0e8e995120e00', 10),
                'Invalid recipient address provided'
            );

        });

        it('should throw if an invalid amount is passed', async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.sendMcash(accounts.hex[2], -10),
                'Invalid amount provided'
            );

        });

        it('should throw if an invalid origin address is passed', async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.sendMcash(accounts.hex[3], 10, '40f0b27e3d16060a5b0e8e995120e00'),
                'Invalid origin address provided'
            );

        });


        it('should throw if trying to transfer to itself', async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.sendMcash(accounts.hex[3], 10, accounts.hex[3]),
                'Cannot transfer TRX to the same account'
            );

        });

        it('should throw if trying to transfer from an account with not enough funds', async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.sendMcash(accounts.hex[3], 10, emptyAccount.address.base58),
                null,
                'ContractValidateException'
            );

        });
    });

    describe('#createToken()', function () {

        // This test passes only the first time because, in order to test updateToken, we broadcast the token creation

        it(`should allow accounts[2] to create a TestToken`, async function () {

            const options = getTokenOptions();

            const transaction = await mcashWeb.transactionBuilder.createToken(options, accounts.b58[2]);
            const parameter = txPars(transaction);
            assert.equal(transaction.txID.length, 64);
            assert.equal(parameter.value.total_supply, options.totalSupply);
            await assertEqualHex(parameter.value.abbr, options.abbreviation);
            assert.equal(parameter.value.owner_address, accounts.hex[2]);
            assert.equal(parameter.type_url, 'type.googleapis.com/protocol.AssetIssueContract');
        });

            it(`should allow accounts[8] to create a TestToken with voteScore and precision`, async function () {
                if (isAllowSameTokenNameApproved) {

                    const options = getTokenOptions();
                    options.voteScore = 5;
                    options.precision = 4;

                    const transaction = await mcashWeb.transactionBuilder.createToken(options, accounts.b58[8]);

                    const parameter = txPars(transaction);
                    assert.equal(transaction.txID.length, 64);
                    assert.equal(parameter.value.vote_score, options.voteScore);
                    assert.equal(parameter.value.precision, options.precision);
                    assert.equal(parameter.value.total_supply, options.totalSupply);
                    await assertEqualHex(parameter.value.abbr, options.abbreviation);
                    assert.equal(parameter.value.owner_address, accounts.hex[8]);
                    assert.equal(parameter.type_url, 'type.googleapis.com/protocol.AssetIssueContract');

                    await broadcaster(null, accounts.pks[8], transaction)

                    const tokenList = await mcashWeb.mcashgetTokensIssuedByAddress(accounts.b58[8])
                    const tokenID = tokenList[options.name].id
                    const token = await mcashWeb.mcashgetTokenByID(tokenID)

                    assert.equal(token.vote_score, options.voteScore);
                    assert.equal(token.precision, options.precision);

                } else {
                    this.skip()
                }
            });

        it(`should create a TestToken passing any number as a string`, async function () {
            const options = getTokenOptions();
            options.totalSupply = '100'
            options.frozenAmount = '5'
            options.frozenDuration = '2'
            options.saleEnd = options.saleEnd.toString()
            const transaction = await mcashWeb.transactionBuilder.createToken(options);
            const parameter = txPars(transaction);
            await assertEqualHex(parameter.value.abbr, options.abbreviation);
        });

        it('should throw if an invalid name is passed', async function () {

            const options = getTokenOptions();
            options.name = 123;

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid token name provided'
            );

        });

        it('should throw if an invalid abbrevation is passed', async function () {

            const options = getTokenOptions();
            options.abbreviation = 123;

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid token abbreviation provided'
            );

        });

        it('should throw if an invalid supply amount is passed', async function () {

            const options = getTokenOptions();
            options.totalSupply = [];

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Supply amount must be a positive integer'
            );

        });

        it('should throw if TRX ratio is not a positive integer', async function () {

            const options = getTokenOptions();
            options.trxRatio = {};

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'TRX ratio must be a positive integer'
            );

        });

        it('should throw if token ratio is not a positive integer', async function () {

            const options = getTokenOptions();
            options.tokenRatio = 'tokenRatio';

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Token ratio must be a positive integer'
            );

        });

        it('should throw if sale start is invalid', async function () {

            const options = getTokenOptions();
            options.saleStart = Date.now() - 1;

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid sale start timestamp provided'
            );

            options.saleStart = 'something';

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid sale start timestamp provided'
            );

        });

        it('should throw if sale end is invalid', async function () {

            const options = getTokenOptions();
            options.saleEnd = Date.now() - 1000;

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid sale end timestamp provided'
            );

            options.saleEnd = 'something';

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid sale end timestamp provided'
            );

        });

        it('should throw if an invalid description is passed', async function () {

            const options = getTokenOptions();
            options.description = 123;

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid token description provided'
            );

            options.description = '';

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid token description provided'
            );

        });

        it('should throw if an invalid url is passed', async function () {

            const options = getTokenOptions();
            options.url = 123;

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid token url provided'
            );

            options.url = '';

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid token url provided'
            );

            options.url = '//www.example.com';

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid token url provided'
            );

        });

        it('should throw if freeBandwidth is invalid', async function () {

            const options = getTokenOptions();
            options.freeBandwidth = -1;

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid Free bandwidth amount provided'
            );

            options.freeBandwidth = 'something';

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid Free bandwidth amount provided'
            );

        });

        it('should throw if freeBandwidthLimit is invalid', async function () {
            const options = getTokenOptions();

            options.freeBandwidth = 10;
            delete options.freeBandwidthLimit;

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid Free bandwidth limit provided'
            );

            options.freeBandwidthLimit = 'something';

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid Free bandwidth limit provided'
            );

        });

        it('should throw if frozen supply is invalid', async function () {

            const options = getTokenOptions();
            options.frozenAmount = -1;

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid Frozen supply provided'
            );

            options.frozenAmount = 'something';

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid Frozen supply provided'
            );
        });

        it('should throw if frozen duration is invalid', async function () {
            const options = getTokenOptions();

            options.frozenDuration = 'something';

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options),
                'Invalid Frozen duration provided'
            );

        });

        it('should throw if the issuer address is invalid', async function () {

            const options = getTokenOptions();

            await assertThrow(
                mcashWeb.transactionBuilder.createToken(options, '0xzzzww'),
                'Invalid issuer address provided'
            );

        });

        describe('#createAsset()', function () {

            // This test passes only the first time because, in order to test updateToken, we broadcast the token creation

            it(`should allow accounts[2] to create a TestToken`, async function () {
                const options = getTokenOptions();
                const transaction = await mcashWeb.transactionBuilder.createAsset(options, accounts.b58[2]);
                const parameter = txPars(transaction);
                assert.equal(transaction.txID.length, 64);
                assert.equal(parameter.value.total_supply, options.totalSupply);
                await assertEqualHex(parameter.value.abbr, options.abbreviation);
                assert.equal(parameter.value.owner_address, accounts.hex[2]);
                assert.equal(parameter.type_url, 'type.googleapis.com/protocol.AssetIssueContract');
            });
        });

    });

    describe('#updateAccount()', function () {

        it(`should update accounts[3]`, async function () {

            const newName = 'New name'
            const transaction = await mcashWeb.transactionBuilder.updateAccount(newName, accounts.b58[3]);
            const parameter = txPars(transaction);

            assert.equal(transaction.txID.length, 64);
            await assertEqualHex(parameter.value.account_name, newName);
            assert.equal(parameter.value.owner_address, accounts.hex[3]);
            assert.equal(parameter.type_url, 'type.googleapis.com/protocol.AccountUpdateContract');
        });

        it('should throw if an invalid name is passed', async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.updateAccount(123, accounts.b58[4]),
                'Invalid Name provided'
            );

        });

        it('should throw if the issuer address is invalid', async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.updateAccount('New name', '0xzzzww'),
                'Invalid origin address provided'
            );

        });

    });

    describe('#updateToken()', function () {

        let tokenOptions
        let tokenID

        before(async function () {

            this.timeout(10000)

            tokenOptions = getTokenOptions();
            await broadcaster(mcashWeb.transactionBuilder.createToken(tokenOptions, accounts.b58[2]), accounts.pks[2])

            let tokenList
            while (!tokenList) {
                tokenList = await mcashWeb.mcashgetTokensIssuedByAddress(accounts.b58[2])
            }
            if(isAllowSameTokenNameApproved) {
                tokenID = tokenList[tokenOptions.name].id
            } else {
                tokenID = tokenList[tokenOptions.name].name
            }
        });

        it(`should allow accounts[2] to update a TestToken`, async function () {
            const transaction = await mcashWeb.transactionBuilder.updateToken(UPDATED_TEST_TOKEN_OPTIONS, accounts.b58[2]);
            const parameter = txPars(transaction);
            assert.equal(transaction.txID.length, 64);
            await assertEqualHex(parameter.value.description, UPDATED_TEST_TOKEN_OPTIONS.description);
            await assertEqualHex(parameter.value.url, UPDATED_TEST_TOKEN_OPTIONS.url);
            assert.equal(parameter.value.owner_address, accounts.hex[2]);
            assert.equal(parameter.type_url, 'type.googleapis.com/protocol.UpdateAssetContract');
        });

        it('should throw if an invalid description is passed', async function () {

            const options = _.clone(UPDATED_TEST_TOKEN_OPTIONS);
            options.description = 123;

            await assertThrow(
                mcashWeb.transactionBuilder.updateToken(options, accounts.hex[2]),
                'Invalid token description provided'
            );

            options.description = '';

            await assertThrow(
                mcashWeb.transactionBuilder.updateToken(options, accounts.hex[2]),
                'Invalid token description provided'
            );

        });


        it('should throw if an invalid url is passed', async function () {

            const options = _.clone(UPDATED_TEST_TOKEN_OPTIONS);
            options.url = 123;

            await assertThrow(
                mcashWeb.transactionBuilder.updateToken(options, accounts.hex[2]),
                'Invalid token url provided'
            );

            options.url = '';

            await assertThrow(
                mcashWeb.transactionBuilder.updateToken(options, accounts.hex[2]),
                'Invalid token url provided'
            );

            options.url = '//www.example.com';

            await assertThrow(
                mcashWeb.transactionBuilder.updateToken(options, accounts.hex[2]),
                'Invalid token url provided'
            );

        });

        it('should throw if freeBandwidth is invalid', async function () {

            const options = _.clone(UPDATED_TEST_TOKEN_OPTIONS);
            options.freeBandwidth = -1;

            await assertThrow(
                mcashWeb.transactionBuilder.updateToken(options, accounts.hex[2]),
                'Free bandwidth amount must be a positive integer'
            );

            options.freeBandwidth = 'something';

            await assertThrow(
                mcashWeb.transactionBuilder.updateToken(options, accounts.hex[2]),
                'Free bandwidth amount must be a positive integer'
            );

        });

        it('should throw if freeBandwidthLimit is invalid', async function () {
            const options = _.clone(UPDATED_TEST_TOKEN_OPTIONS);

            options.freeBandwidth = 10;
            delete options.freeBandwidthLimit;

            await assertThrow(
                mcashWeb.transactionBuilder.updateToken(options, accounts.hex[2]),
                'Free bandwidth limit must be a positive integer'
            );

            options.freeBandwidthLimit = 'something';

            await assertThrow(
                mcashWeb.transactionBuilder.updateToken(options, accounts.hex[2]),
                'Free bandwidth limit must be a positive integer'
            );

        });

        it('should throw if the issuer address is invalid', async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.updateToken(UPDATED_TEST_TOKEN_OPTIONS, '0xzzzww'),
                'Invalid issuer address provided'
            );

        });

        describe('#updateAsset()', async function () {
            it(`should allow accounts[2] to update a TestToken`, async function () {
                const transaction = await mcashWeb.transactionBuilder.updateAsset(UPDATED_TEST_TOKEN_OPTIONS, accounts.b58[2]);
                const parameter = txPars(transaction);
                assert.equal(transaction.txID.length, 64);
                await assertEqualHex(parameter.value.description, UPDATED_TEST_TOKEN_OPTIONS.description);
                await assertEqualHex(parameter.value.url, UPDATED_TEST_TOKEN_OPTIONS.url);
                assert.equal(parameter.value.owner_address, accounts.hex[2]);
                assert.equal(parameter.type_url, 'type.googleapis.com/protocol.UpdateAssetContract');
            });
        });

    });

    describe('#purchaseToken()', function () {

        let tokenOptions
        let tokenID

        before(async function () {

            this.timeout(10000)

            tokenOptions = getTokenOptions();

            await broadcaster(mcashWeb.transactionBuilder.createToken(tokenOptions, accounts.b58[5]), accounts.pks[5])

            let tokenList
            while (!tokenList) {
                tokenList = await mcashWeb.mcashgetTokensIssuedByAddress(accounts.b58[5])
            }
            if(isAllowSameTokenNameApproved) {
                tokenID = tokenList[tokenOptions.name].id
            } else {
                tokenID = tokenList[tokenOptions.name].name
            }
            assert.equal(tokenList[tokenOptions.name].abbr, tokenOptions.abbreviation)
        });

        it('should verify that the asset has been created', async function () {

            let token
            if(isAllowSameTokenNameApproved) {
                token = await mcashWeb.mcashgetTokenByID(tokenID)
                assert.equal(token.id, tokenID)
            } else {
                token = await mcashWeb.mcashgetTokenFromId(tokenID)
            }
            assert.equal(token.name, tokenOptions.name)
        })

        it(`should allow accounts[2] to purchase a token created by accounts[5]`, async function () {

            this.timeout(10000)

            await wait(4)

            const transaction = await mcashWeb.transactionBuilder.purchaseToken(accounts.b58[5], tokenID, 20, accounts.b58[2]);
            const parameter = txPars(transaction);
            assert.equal(transaction.txID.length, 64);
            assert.equal(parameter.value.amount, 20);
            assert.equal(parameter.value.owner_address, accounts.hex[2]);
            assert.equal(parameter.value.to_address, accounts.hex[5]);
            assert.equal(parameter.type_url, 'type.googleapis.com/protocol.ParticipateAssetIssueContract');
        });

        it("should throw if issuerAddress is invalid", async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.purchaseToken('sasdsadasfa', tokenID, 20, accounts.b58[2]),
                'Invalid issuer address provided'
            )

        });

        it("should throw if issuerAddress is not the right one", async function () {
            await assertThrow(
                mcashWeb.transactionBuilder.purchaseToken(accounts.b58[4], tokenID, 20, accounts.b58[2]),
                null,
                'The asset is not issued by'
            )
        });

        it("should throw if the token Id is invalid", async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.purchaseToken(accounts.b58[5], 123432, 20, accounts.b58[2]),
                'Invalid token ID provided'
            )
        });

        it("should throw if token does not exist", async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.purchaseToken(accounts.b58[5], '1110000', 20, accounts.b58[2]),
                null,
                'No asset named '
            )

        });

        it("should throw if buyer address is invalid", async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.purchaseToken(accounts.b58[5], tokenID, 20, 'sasdadasdas'),
                'Invalid buyer address provided'
            )

        });

        it("should throw if amount is invalid", async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.purchaseToken(accounts.b58[5], tokenID, -3, accounts.b58[2]),
                'Invalid amount provided'
            )

            await assertThrow(
                mcashWeb.transactionBuilder.purchaseToken(accounts.b58[5], tokenID, "some-amount", accounts.b58[2]),
                'Invalid amount provided'
            )
        });
    });

    describe('#sendToken()', function () {

        let tokenOptions
        let tokenID

        before(async function () {

            this.timeout(30000)

            tokenOptions = getTokenOptions();

            await broadcaster(mcashWeb.transactionBuilder.createToken(tokenOptions, accounts.b58[6]), accounts.pks[6])

            let tokenList
            while (!tokenList) {
                tokenList = await mcashWeb.mcashgetTokensIssuedByAddress(accounts.b58[6])
            }

            if(isAllowSameTokenNameApproved) {
                tokenID = tokenList[tokenOptions.name].id
            } else {
                tokenID = tokenList[tokenOptions.name].name
            }

        });

        it('should verify that the asset has been created', async function () {

            let token
            if(isAllowSameTokenNameApproved) {
                token = await mcashWeb.mcashgetTokenByID(tokenID)
                assert.equal(token.id, tokenID)
            } else {
                token = await mcashWeb.mcashgetTokenFromId(tokenID)
            }
            assert.equal(token.name, tokenOptions.name)
        })

        it("should allow accounts [7]  to send a token to accounts[1]", async function () {

            this.timeout(10000)

            await wait(4)

            await broadcaster(mcashWeb.transactionBuilder.purchaseToken(accounts.b58[6], tokenID, 50, accounts.b58[7]), accounts.pks[7])

            await wait(1)

            const transaction = await mcashWeb.transactionBuilder.sendToken(accounts.b58[1], 5, tokenID, accounts.b58[7])

            const parameter = txPars(transaction)

            assert.equal(parameter.value.amount, 5)
            assert.equal(parameter.value.owner_address, accounts.hex[7]);
            assert.equal(parameter.value.to_address, accounts.hex[1]);

        });


        it("should allow accounts [6]  to send a token to accounts[1]", async function () {

            const transaction = await mcashWeb.transactionBuilder.sendToken(accounts.b58[1], 5, tokenID, accounts.b58[6])

            const parameter = txPars(transaction);

            assert.equal(parameter.value.amount, 5)
            assert.equal(parameter.value.owner_address, accounts.hex[6]);
            assert.equal(parameter.value.to_address, accounts.hex[1]);

        });

        it("should throw if recipient address is invalid", async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.sendToken('sadasfdfsgdfgssa', 5, tokenID, accounts.b58[7]),
                'Invalid recipient address provided'
            )

        });

        it("should throw if the token Id is invalid", async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.sendToken(accounts.b58[1], 5, 143234, accounts.b58[7]),
                'Invalid token ID provided'
            )
        });

        it("should throw if origin address is invalid", async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.sendToken(accounts.b58[1], 5, tokenID, 213253453453),
                'Invalid origin address provided'
            )

        });

        it("should throw if amount is invalid", async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.sendToken(accounts.b58[1], -5, tokenID, accounts.b58[7]),
                'Invalid amount provided'
            )

            await assertThrow(
                mcashWeb.transactionBuilder.sendToken(accounts.b58[1], 'amount', tokenID, accounts.b58[7]),
                'Invalid amount provided'
            )
        });
    });

    describe("#createProposal", async function () {

        let parameters = [{"key": 0, "value": 100000}, {"key": 1, "value": 2}]

        it('should allow the SR account to create a new proposal as a single object', async function () {

            const transaction = await mcashWeb.transactionBuilder.createProposal(parameters[0], ADDRESS_BASE58)

            const parameter = txPars(transaction);

            assert.equal(parameter.value.owner_address, ADDRESS_HEX);
            assert.equal(parameter.value.parameters[0].value, parameters[0].value);
            assert.equal(parameter.type_url, 'type.googleapis.com/protocol.ProposalCreateContract');

        })

        it('should allow the SR account to create a new proposal as an array of objects', async function () {

            const transaction = await mcashWeb.transactionBuilder.createProposal(parameters, ADDRESS_BASE58)

            const parameter = txPars(transaction);

            assert.equal(parameter.value.owner_address, ADDRESS_HEX);
            assert.equal(parameter.value.parameters[0].value, parameters[0].value);
            assert.equal(parameter.type_url, 'type.googleapis.com/protocol.ProposalCreateContract');

        })

        it("should throw if issuer address is invalid", async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.createProposal(parameters, 'sadasdsffdgdf'),
                'Invalid issuer address provided'
            )

        });


        it("should throw if the issuer address is not an SR", async function () {

            await assertThrow(
                mcashWeb.transactionBuilder.createProposal(parameters, accounts.b58[0]),
                null,
                `Witness[${accounts.hex[0]}] not exists`
            )

        });

        // TODO Complete throws

    });


    describe("#deleteProposal", async function () {


        let proposals;

        before(async function () {

            this.timeout(20000)

            let parameters = [{"key": 0, "value": 100000}, {"key": 1, "value": 2}]

            await broadcaster(mcashWeb.transactionBuilder.createProposal(parameters, ADDRESS_BASE58), PRIVATE_KEY)

            proposals = await mcashWeb.mcashlistProposals();

        })

        after(async function () {
            proposals = await mcashWeb.mcashlistProposals();
            for(let proposal of proposals) {
                if(proposal.state !== 'CANCELED')
                    await broadcaster(mcashWeb.transactionBuilder.deleteProposal(proposal.proposal_id), PRIVATE_KEY)
            }
        })

        it('should allow the SR to delete its own proposal', async function () {

            const transaction = await mcashWeb.transactionBuilder.deleteProposal(proposals[0].proposal_id)
            const parameter = txPars(transaction);

            assert.equal(parameter.value.owner_address, ADDRESS_HEX);
            assert.equal(parameter.value.proposal_id, proposals[0].proposal_id);
            assert.equal(parameter.type_url, 'type.googleapis.com/protocol.ProposalDeleteContract');

        })

        it('should throw trying to cancel an already canceled proposal', async function () {

            await broadcaster(await mcashWeb.transactionBuilder.deleteProposal(proposals[0].proposal_id));

            await assertThrow(
                mcashWeb.transactionBuilder.deleteProposal(proposals[0].proposal_id),
                null,
                `Proposal[${proposals[0].proposal_id}] canceled`);

        })

        // TODO add invalid params throws

    });

    // describe("#createWitness", async function () {
    //
    //     let url = 'https://xtron.network';
    //
    //     it('should allow accounts[0] to apply for SR', async function () {
    //
    //
    //         const transaction = await mcashWeb.transactionBuilder.createWitness(accounts.b58[0], url);
    //         const parameter = txPars(transaction);
    //
    //         assert.equal(parameter.value.owner_address, accounts.hex[0]);
    //         await assertEqualHex(parameter.value.url, url);
    //         assert.equal(parameter.type_url, 'type.googleapis.com/protocol.WitnessCreateContract');
    //     });
    //
    //     // TODO add invalid params throws
    // });


    describe("#freezeBalance", async function () {

        it('should allows accounts[1] to freeze its balance', async function () {

            const transaction = await mcashWeb.transactionBuilder.freezeBalance(100e6, 3, 'BANDWIDTH', accounts.b58[1])

            const parameter = txPars(transaction);
            // jlog(parameter)
            assert.equal(parameter.value.owner_address, accounts.hex[1]);
            assert.equal(parameter.value.frozen_balance, 100e6);
            assert.equal(parameter.value.frozen_duration, 3);
            assert.equal(parameter.type_url, 'type.googleapis.com/protocol.FreezeBalanceContract');
        })

        // TODO add invalid params throws

    });

    describe("#unfreezeBalance", async function () {

        // TODO this is not fully testable because the minimum time before unfreezing is 3 days

    });


    describe.skip("#vote", async function () {
        // this is not testable because on Tron Quickstart (like on Shasta) it is not possible to vote

        let url = 'https://xtron.network';
        // let witnesses;


        before(async function () {

            await broadcaster(mcashWeb.transactionBuilder.createWitness(accounts.b58[0], url), accounts.pks[0])
            await broadcaster(mcashWeb.transactionBuilder.freezeBalance(100e6, 3, 'BANDWIDTH', accounts.b58[1]), accounts.pks[1])
        })


        it('should allows accounts[1] to vote for accounts[0] as SR', async function () {
            let votes = {}
            votes[accounts.hex[0]] = 5

            const transaction = await mcashWeb.transactionBuilder.vote(votes, accounts.b58[1])
            const parameter = txPars(transaction);

            assert.equal(parameter.value.owner_address, accounts.hex[1]);
            assert.equal(parameter.value.votes[0].vote_address, accounts.hex[0]);
            assert.equal(parameter.value.votes[0].vote_count, 5);
            assert.equal(parameter.type_url, 'type.googleapis.com/protocol.VoteWitnessContract');
        })

    });


    describe("#createSmartContract", async function () {

        it('should create a smart contract with default parameters', async function () {

            const tx = await mcashWeb.transactionBuilder.createSmartContract({
                abi: testRevertContract.abi,
                bytecode: testRevertContract.bytecode
            })
            assert.equal(tx.raw_data.contract[0].parameter.value.new_contract.consume_user_resource_percent, 100);
            assert.equal(tx.raw_data.contract[0].parameter.value.new_contract.origin_energy_limit, 1e7);
            assert.equal(tx.raw_data.fee_limit, 1e9);
        });

        it('should create a smart contract and verify the parameters', async function () {

            const tx = await mcashWeb.transactionBuilder.createSmartContract({
                abi: testRevertContract.abi,
                bytecode: testRevertContract.bytecode,
                userFeePercentage: 30,
                originEnergyLimit: 9e6,
                feeLimit: 9e8
            })
            assert.equal(tx.raw_data.contract[0].parameter.value.new_contract.consume_user_resource_percent, 30);
            assert.equal(tx.raw_data.contract[0].parameter.value.new_contract.origin_energy_limit, 9e6);
            assert.equal(tx.raw_data.fee_limit, 9e8);
        });
    });


    describe("#withdrawBlockRewards", async function () {
    });

    describe("#triggerSmartContract", async function () {
    });

    describe("#createTRXExchange", async function () {
    });

    describe("#injectExchangeTokens", async function () {
    });

    describe("#withdrawExchangeTokens", async function () {
    });

    describe("#tradeExchangeTokens", async function () {
    });


});
