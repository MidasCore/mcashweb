import {
    Callback, ChainParameter,
    CreateSmartContractOption,
    CreateSmartContractParameter,
    CreateTokenOption,
    Transaction, TransactionExtension, TriggerSmartContractOption, UpdateTokenOption
} from "./types";
import McashWeb = require("./index");

export class TransactionBuilder {
    constructor(mcashWeb: McashWeb);

    sendMcash(to: string,
              amount: number | string,
              from?: string | Callback<Transaction>,
              memo?: string | Callback<Transaction>,
              callback?: Callback<Transaction>): Promise<Transaction>;

    sendToken(to: string,
              amount: number | string,
              tokenId: number,
              from?: string | Callback<Transaction>,
              memo?: string | Callback<Transaction>,
              callback?: Callback<Transaction>): Promise<Transaction>;

    purchaseToken(issuerAddress: string,
                  tokenId: number,
                  amount: number | string,
                  buyer?: string | Callback<Transaction>,
                  callback?: Callback<Transaction>): Promise<Transaction>;

    freezeBalance(amount: number | string,
                  duration?: number | Callback<Transaction>,
                  resource?: string | Callback<Transaction>,
                  address?: string | Callback<Transaction>,
                  receiverAddress?: string | Callback<Transaction>,
                  callback?: Callback<Transaction>): Promise<Transaction>;

    unfreezeBalance(resource?: string | Callback<Transaction>,
                    address?: string | Callback<Transaction>,
                    receiverAddress?: string | Callback<Transaction>,
                    callback?: Callback<Transaction>): Promise<Transaction>;

    unfreezeAsset(address?: string | Callback<Transaction>,
                  callback?: Callback<Transaction>): Promise<Transaction>;

    stake(amount: number | string,
          stakeDuration?: number | Callback<Transaction>,
          address?: string | Callback<Transaction>,
          callback?: Callback<Transaction>): Promise<Transaction>;

    unstake(address?: string | Callback<Transaction>,
            callback?: Callback<Transaction>): Promise<Transaction>;

    withdrawBlockRewards(address?: string | Callback<Transaction>,
                         callback?: Callback<Transaction>): Promise<Transaction>;

    createWitness(witnessAddress: string,
                  ownerAddress: string,
                  url?: string | Callback<Transaction>,
                  callback?: Callback<Transaction>): Promise<Transaction>;

    createAccount(accountAddress: string,
                  ownerAddress?: string | Callback<Transaction>,
                  callback?: Callback<Transaction>): Promise<Transaction>;

    vote(voteAddress: string,
         ownerAddress?: string | Callback<Transaction>,
         callback?: Callback<Transaction>): Promise<Transaction>;

    createSmartContract(options: CreateSmartContractOption,
                        issuerAddress?: string | Callback<Transaction>,
                        callback?: Callback<Transaction>): Promise<Transaction>;

    triggerSmartContract(contractAddress: string,
                         functionSelector: string,
                         options?: TriggerSmartContractOption,
                         parameters?: Array<CreateSmartContractParameter> | Callback<TransactionExtension>,
                         issuerAddress?: string | Callback<TransactionExtension>,
                         callback?: Callback<TransactionExtension>): Promise<TransactionExtension>;

    triggerSmartContract(contractAddress: string,
                         functionSelector: string,
                         feeLimit: number,
                         callValue: number,
                         parameters?: Array<CreateSmartContractParameter> | Callback<TransactionExtension>,
                         issuerAddress?: string | Callback<TransactionExtension>,
                         callback?: Callback<TransactionExtension>): Promise<TransactionExtension>;

    createToken(options: CreateTokenOption,
                issuerAddress?: string | Callback<Transaction>,
                callback?: Callback<Transaction>): Promise<Transaction>;

    updateAccount(accountName: string,
                  address?: string | Callback<Transaction>,
                  callback?: Callback<Transaction>): Promise<Transaction>;

    updateToken(options: UpdateTokenOption,
                issuerAddress?: string | Callback<Transaction>,
                callback?: Callback<Transaction>): Promise<Transaction>;

    sendAsset(to: string,
              amount: number | string,
              tokenId: number,
              from?: string | Callback<Transaction>,
              memo?: string | Callback<Transaction>,
              callback?: Callback<Transaction>): Promise<Transaction>;

    purchaseAsset(issuerAddress: string,
                  tokenId: number,
                  amount: number | string,
                  buyer?: string | Callback<Transaction>,
                  callback?: Callback<Transaction>): Promise<Transaction>;

    createAsset(options: CreateTokenOption,
                issuerAddress?: string | Callback<Transaction>,
                callback?: Callback<Transaction>): Promise<Transaction>;

    updateAsset(options: UpdateTokenOption,
                issuerAddress?: string | Callback<Transaction>,
                callback?: Callback<Transaction>): Promise<Transaction>;

    createProposal(parameters: Array<ChainParameter> | ChainParameter,
                   issuerAddress?: string | Callback<Transaction>,
                   callback?: Callback<Transaction>): Promise<Transaction>;

    deleteProposal(proposalId: number,
                   issuerAddress?: string | Callback<Transaction>,
                   callback?: Callback<Transaction>): Promise<Transaction>;

    voteProposal(proposalId: number,
                 isApproval: boolean,
                 voterAddress?: string | Callback<Transaction>,
                 callback?: Callback<Transaction>): Promise<Transaction>;

    createMcashExchange(tokenId: number,
                        tokenBalance: number | string,
                        mcashBalance: number | string,
                        ownerAddress?: string | Callback<Transaction>,
                        callback?: Callback<Transaction>): Promise<Transaction>;

    createTokenExchange(firstTokenId: number,
                        firstTokenBalance: number,
                        secondTokenId: number,
                        secondTokenBalance: number,
                        ownerAddress?: string | Callback<Transaction>,
                        callback?: Callback<Transaction>): Promise<Transaction>;

    injectExchangeTokens(exchangeId: number,
                         tokenId: number,
                         tokenAmount: number,
                         ownerAddress?: string | Callback<Transaction>,
                         callback?: Callback<Transaction>): Promise<Transaction>;

    withdrawExchangeTokens(exchangeId: number,
                           tokenId: number,
                           tokenAmount: number,
                           ownerAddress?: string | Callback<Transaction>,
                           callback?: Callback<Transaction>): Promise<Transaction>;

    tradeExchangeTokens(exchangeId: number,
                        tokenId: number,
                        tokenAmountSold: number,
                        tokenAmountExpected: number,
                        ownerAddress?: string | Callback<Transaction>,
                        callback?: Callback<Transaction>): Promise<Transaction>;

    updateSetting(contractAddress: string,
                  userFeePercentage: number,
                  ownerAddress?: string | Callback<Transaction>,
                  callback?: Callback<Transaction>): Promise<Transaction>;

    updateEnergyLimit(contractAddress: string,
                      originEnergyLimit: number,
                      ownerAddress?: string | Callback<Transaction>,
                      callback?: Callback<Transaction>): Promise<Transaction>;

    // TODO
    // checkPermissions(permissions, type)
    //
    // updateAccountPermissions(ownerAddress: string,
    //                          ownerPermissions: any,
    //                          witnessPermissions: any,
    //                          activesPermissions: any,
    //                          callback?: Callback<Transaction>): Promise<Transaction>;
}
