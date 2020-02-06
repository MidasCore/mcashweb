import {
    Account, AccountResourceMessage, AssetIssueContract,
    Block,
    BlockId,
    Callback, ChainParameter, Exchange,
    Proposal, McashOption,
    SmartContract,
    Transaction, TransactionApprovedList,
    TransactionInfo, TransactionSignWeight,
    Witness
} from "./types";
import McashWeb = require("./index");

export class Mcash {
    constructor(mcashWeb?: McashWeb);

    getCurrentBlock(callback?: Callback<Block>): Promise<Block>;

    getConfirmedCurrentBlock(callback?: Callback<Block>): Promise<Block>;

    getBlock(block?: BlockId | Callback<Block>,
             callback?: Callback<Block>): Promise<Block>;

    getBlockByHash(blockHash: string | Callback<Block>,
                   callback?: Callback<Block>): Promise<Block>;

    getBlockTransactionCount(block?: BlockId | Callback<number>,
                             callback?: Callback<number>): Promise<number>;

    getTransactionFromBlock(block?: BlockId | number | Callback<Transaction>,
                            index?: number | Callback<Transaction>,
                            callback?: Callback<Transaction>): Promise<Transaction>;

    getTransaction(transactionId: string,
                   callback?: Callback<Transaction>): Promise<Transaction>;

    getConfirmedTransaction(transactionId: string,
                            callback?: Callback<Transaction>): Promise<Transaction>;

    getTransactionInfo(transactionId: string,
                       callback?: Callback<TransactionInfo>): Promise<TransactionInfo>;

    getConfirmedTransactionInfo(transactionId: string,
                                callback?: Callback<TransactionInfo>): Promise<TransactionInfo>;

    getAccount(address?: string | Callback<Account>,
               callback?: Callback<Account>): Promise<Account>;

    getBalance(address?: string | Callback<number>,
               callback?: Callback<number>): Promise<number>;

    getUnconfirmedAccount(address?: string | Callback<Account>,
                          callback?: Callback<Account>): Promise<Account>;

    getUnconfirmedBalance(address?: string | Callback<number>,
                          callback?: Callback<number>): Promise<Account>;

    getTokensIssuedByAddress(address?: string | Callback<AssetIssueContract[]>,
                             callback?: Callback<AssetIssueContract[]>): Promise<AssetIssueContract[]>;

    getTokenFromId(tokenId?: number | string,
                   callback?: Callback<AssetIssueContract>): Promise<AssetIssueContract>;

    listNodes(callback?: Callback<string[]>): Promise<string[]>;

    getBlockRange(start?: number | Callback<Block[]>,
                  end?: number | Callback<Block[]>,
                  callback?: Callback<Block[]>): Promise<Block[]>;

    listSuperRepresentatives(callback?: Callback<Witness[]>): Promise<Witness[]>;

    listTokens(limit?: number | Callback<AssetIssueContract[]>,
               offset?: number | Callback<AssetIssueContract[]>,
               callback?: Callback<AssetIssueContract[]>): Promise<AssetIssueContract[]>;

    timeUntilNextVoteCycle(callback?: Callback<number>): Promise<number>;

    getContract(contractAddress: string,
                callback?: Callback<SmartContract>): Promise<SmartContract>;

    verifyMessage(message?: string,
                  signature?: string,
                  address?: string | Callback<boolean>,
                  useMcashHeader?: boolean | Callback<boolean>,
                  callback?: Callback<boolean>): Promise<boolean>;

    static verifySignature(message: string, address: string, signature: string, useTronHeader?: boolean): boolean;

    sign(transaction: Transaction,
         privateKey?: string | Callback<Transaction>,
         useTronHeader?: boolean | Callback<Transaction>,
         multisig?: boolean | Callback<Transaction>,
         callback?: Callback<Transaction>): Promise<Transaction>;

    static signString(message: string, privateKey: string, useTronHeader?: boolean): string;

    multiSign(transaction: Transaction,
              privateKey?: string | Callback<Transaction>,
              permissionId?: number | Callback<Transaction>,
              callback?: Callback<Transaction>): Promise<Transaction>;

    getApprovedList(transaction: Transaction,
                    callback?: Callback<TransactionApprovedList>): Promise<TransactionApprovedList>;

    getSignWeight(transaction: Transaction,
                  permissionId?: number | Callback<TransactionSignWeight>,
                  callback?: Callback<TransactionSignWeight>): Promise<TransactionSignWeight>;

    sendRawTransaction(signedTransaction?: Transaction,
                       options?: object | Callback<Transaction>,
                       callback?: Callback<Transaction>): void | Promise<Transaction>;

    sendTransaction(to: string,
                    amount: number,
                    options?: McashOption | string | Callback<Transaction>,
                    memo?: string | Callback<Transaction>,
                    callback?: Callback<Transaction>): Promise<Transaction>;

    sendToken(to: string,
              amount: number,
              tokenId: number,
              options?: McashOption | string | Callback<Transaction>,
              memo?: string | Callback<Transaction>,
              callback?: Callback<Transaction>): Promise<Transaction>;

    freezeBalance(amount: number,
                  duration?: number | Callback<Transaction>,
                  resource?: string | Callback<Transaction>,
                  options?: McashOption | string | Callback<Transaction>,
                  receiverAddress?: string | Callback<Transaction>,
                  callback?: Callback<Transaction>): Promise<Transaction>;

    unfreezeBalance(resource?: string | Callback<Transaction>,
                    options?: McashOption | string | Callback<Transaction>,
                    receiverAddress?: string | Callback<Transaction>,
                    callback?: Callback<Transaction>): Promise<Transaction>;

    unfreezeAsset(options?: McashOption | string | Callback<Transaction>,
                  callback?: Callback<Transaction>): Promise<Transaction>;

    stake(amount: number,
          stakeDuration?: number | Callback<Transaction>,
          options?: McashOption | string | Callback<Transaction>,
          callback?: Callback<Transaction>): Promise<Transaction>;

    unstake(options?: McashOption | string | Callback<Transaction>,
            callback?: Callback<Transaction>): Promise<Transaction>;

    updateAccount(accountName: string,
                  options?: McashOption | string | Callback<Transaction>,
                  callback?: Callback<Transaction>): Promise<Transaction>;

    signMessage(transaction: Transaction,
                privateKey?: string | Callback<Transaction>,
                useTronHeader?: boolean | Callback<Transaction>,
                multisig?: boolean | Callback<Transaction>,
                callback?: Callback<Transaction>): Promise<Transaction>;

    sendAsset(to: string,
              amount: number,
              tokenId: number,
              options?: McashOption | string | Callback<Transaction>,
              memo?: string | Callback<Transaction>,
              callback?: Callback<Transaction>): Promise<Transaction>;

    send(to: string,
         amount: number,
         options?: McashOption | string | Callback<Transaction>,
         memo?: string | Callback<Transaction>,
         callback?: Callback<Transaction>): Promise<Transaction>;

    sendMcash(to: string,
              amount: number,
              options?: McashOption | string | Callback<Transaction>,
              memo?: string | Callback<Transaction>,
              callback?: Callback<Transaction>): Promise<Transaction>;

    broadcast(signedTransaction?: Transaction,
              options?: object | Callback<Transaction>,
              callback?: Callback<Transaction>): void | Promise<Transaction>;

    signTransaction(transaction: Transaction,
                    privateKey?: string | Callback<Transaction>,
                    useTronHeader?: boolean | Callback<Transaction>,
                    multisig?: boolean | Callback<Transaction>,
                    callback?: Callback<Transaction>): Promise<Transaction>;

    getProposal(proposalId: number,
                callback?: Callback<Proposal>): Promise<Proposal>;

    listProposals(callback?: Callback<Proposal>): Promise<Proposal[]>;

    getChainParameters(callback?: Callback<ChainParameter[]>): Promise<ChainParameter[]>;

    getAccountResources(address: string,
                        callback?: Callback<AccountResourceMessage>): Promise<AccountResourceMessage>;

    getExchangeByID(exchangeId: number,
                    callback?: Callback<Exchange>): Promise<Exchange>;

    listExchanges(callback?: Callback<Exchange[]>): Promise<Exchange[]>;

    listExchangesPaginated(limit?: number | Callback<Exchange[]>,
                           offset?: number | Callback<Exchange[]>,
                           callback?: Callback<Exchange[]>): Promise<Exchange[]>;

    getTokenById(tokenId: number,
                 callback?: Callback<AssetIssueContract>): Promise<AssetIssueContract>;
}
