import {HttpProvider} from "./providers";

export type Callback<T> = (error: Error, result: T) => void;

interface McashWebConstructorOptions {
    fullNode?: string | HttpProvider,
    solidityNode?: string | HttpProvider,
    eventServer?: string | HttpProvider,
    fullHost?: string | HttpProvider,
    privateKey?: string,
}

export interface EventLog {
    event: string;
    address: string;
    returnValues: any;
    logIndex: number;
    transactionIndex: number;
    transactionHash: string;
    blockHash: string;
    blockNumber: number;
    raw?: { data: string; topics: string[] };
}

export interface ABIDefinition {
    constant?: boolean;
    payable?: boolean;
    stateMutability?: "pure" | "view" | "nonpayable" | "payable";
    anonymous?: boolean;
    inputs?: Array<{ name: string; type: ABIDataTypes; indexed?: boolean }>;
    name?: string;
    outputs?: Array<{ name: string; type: ABIDataTypes }>;
    type: "function" | "constructor" | "event" | "fallback";
}

type ABIDataTypes = "uint256" | "boolean" | "string" | "bytes" | string | "tokenid";

type CreateSmartContractParameter = {
    type: string;
    value: any;
}

// ***** options ***** //

export interface CreateSmartContractOption {
    feeLimit?: number;
    userFeePercentage?: number | string;
    originEnergyLimit?: number;
    callValue?: number;
    tokenValue?: number;
    tokenId?: number;
    abi?: ABIDefinition[];
    bytecode?: string;
    name?: string;
    parameters?: CreateSmartContractParameter[];
}

type CreateTokenOption = {
    name: string;
    abbreviation: string;
    description: string;
    url: string;
    totalSupply: number;
    mcashRatio: number;
    tokenRatio: number,
    saleStart: number,
    saleEnd: number,
    freeBandwidth?: number;
    freeBandwidthLimit?: number;
    frozenAmount?: number;
    frozenDuration?: number;
    voteScore?: number,
    precision?: number;
};

type UpdateTokenOption = {
    description?: string;
    url?: string,
    freeBandwidth?: number;
    freeBandwidthLimit?: number;
};

type McashOption = {
    privateKey?: string,
    address?: string,
}

type TriggerSmartContractOption = {
    tokenValue?: number;
    tokenId?: number;
    callValue?: number;
    feeLimit?: number;
}

type BlockId = string | number;

//**//

export interface BlockHeader {
    raw_data: {
        timestamp: number;
        tx_trie_root: string;
        parent_hash: string;
        number: number;
        witness_id?: number;
        witness_address: string;
        version: number;
    };
    witness_signature: string;
}

export interface Block {
    block_header: BlockHeader;
    transactions: Array<Transaction>;
}

export interface Transaction {
    ret?: Array<{
        fee?: number;
        code?: string;
        contract_result: string;
        asset_issue_id?: number;
        withdraw_amount?: number;
        unfreeze_amount?: number;
        exchange_received_amount?: number;
        exchange_inject_another_amount?: number;
        exchange_withdraw_another_amount?: number;
        exchange_id?: number;
        unstake_amount?: number;
        vote_count?: number;
    }>;
    raw_data: {
        ref_block_bytes: string;
        ref_block_num?: number;
        ref_block_hash: string;
        expiration: number;
        timestamp: number;
        fee_limit?: number;
        contract: Array<{
            type?: string;
            parameter?: any;
            provider?: string;
            contract_name?: string;
            permission_id?: number;
        }>;
    };
    signature?: string[];
    tx_id?: string;
    raw_data_hex?: string;
}

export interface InternalTransaction {
    hash: string;
    caller_address: string;
    transfer_to_address?: string;
    call_value_info?: Array<{
        call_value: number;
        token_id?: number;
    }>;
    note?: string;
    rejected?: boolean;
}

export interface TransactionInfo {
    id: string;
    fee?: number;
    block_number: number;
    block_time_stamp: number;
    contract_result: string[];
    contract_address: string;
    receipt: ResourceReceipt;
    log?: Array<{
        address?: string;
        topics?: Array<string>;
        data?: string;
    }>;
    result?: string;
    res_message?: string;

    asset_issue_id?: number;
    withdraw_amount?: number;
    unfreeze_amount?: number;
    internal_transactions?: Array<InternalTransaction>;
    exchange_received_amount?: number;
    exchange_inject_another_amount?: number;
    exchange_withdraw_another_amount?: number;
    exchange_id?: number;
    unstake_amount?: number;
    vote_count?: number;
}

export interface ResourceReceipt {
    energy_usage?: number;
    energy_fee?: number;
    origin_energy_usage?: number;
    energy_usage_total?: number;
    bandwidth_usage?: number;
    bandwidth_fee?: number;
    result?: string;
}

export interface Stake {
    stake_amount?: number;
    expiration_time?: number;
}

export interface Vote {
    vote_address: string;
    vote_count?: number;
}

type Frozen = {
    frozen_balance?: number;
    expire_time?: number;
}

type DelegatedFrozen = {
    acquired_delegated_balance?: number;
    delegated_balance?: number;
}

interface AccountResource {
    bandwidth_usage?: number;
    latest_bandwidth_consume_time?: number;
    free_bandwidth_usage?: number;
    latest_free_bandwidth_consume_time?: number;
    energy_usage?: number;
    latest_energy_consume_time?: number;
    asset_free_bandwidth_usage?: Map<number, number>;
    latest_asset_operation_time?: Map<number, number>;
}

export interface Key {
    address: string;
    weight: number;
}

export interface Permission {
    type?: string;
    id?: number;
    permission_name?: string;
    threshold?: number;
    parent_id?: number;
    operations?: string;
    keys?: Array<Key>;
}

export interface Account {
    account_name?: string;
    type?: string;
    address?: string;
    balance?: number;
    vote?: Vote;
    assets?: Array<{
        key: number;
        value: number;
    }>;
    frozen_for_bandwidth?: Frozen;
    frozen_for_energy?: Frozen;
    frozen_assets?: Array<Frozen>;
    delegated_frozen_for_bandwidth?: DelegatedFrozen;
    delegated_frozen_for_energy?: DelegatedFrozen;

    create_time?: number;
    latest_operation_time?: number;
    allowance?: number;
    latest_withdraw_time?: number;
    is_witness?: boolean;
    is_committee?: boolean;
    asset_issued_id?: number;
    account_id?: string;

    account_resource?: AccountResource;

    code_hash?: string;
    owner_permission?: Permission;
    witness_permission?: Permission;
    active_permission?: Array<Permission>;

    stake?: Stake;
    witness_stake?: Stake;
}

export interface Witness {
    address: string;
    vote_count?: number;
    pub_key?: string;
    url?: string;
    total_produced?: number;
    total_missed?: number;
    latest_block_num?: number;
    latest_slot_num?: number;
    is_jobs?: boolean;
    status?: string;
    owner_address?: string;
    epoch_produced?: number;
    epoch_missed?: number;
}

export interface SmartContract {
    origin_address: string;
    contract_address: string;
    abi?: {
        entrys?:Array<ABIDefinition>;
    };
    bytecode: string;
    call_value?: number;
    consume_user_resource_percent?: number;
    name?: string;
    origin_energy_limit?: number;
}

export interface Proposal {
    proposal_id: number;
    proposer_address: string;
    parameters?: Map<number, number>;
    expiration_time: number;
    create_time: number;
    approvals: Array<string>;
    state?: string;
}

export interface ChainParameter {
    key: string;
    value?: number;
}

export interface Exchange {
    exchange_id: number;
    creator_address: string;
    create_time: number;
    first_token_id: number;
    first_token_balance: number;
    second_token_id: number;
    second_token_balance: number;
}

type Address = {
    host: string;
    port: number;
}

type Node = {
    address: Address;
}

type Return = {
    result?: boolean;
    code?: string;
    message?: string;
}

interface TransactionExtension {
    transaction?: Transaction;
    tx_id?: string;
    constant_result?: Array<string>;
    result?: Return;
}

interface TransactionApprovedList {
    approved_list?: Array<string>;
    result?: {
        code?: string;
        message?: string;
    };
    transaction?: TransactionExtension;
}

interface TransactionSignWeight {
    permission?: Permission;
    approved_list?: Array<string>;
    current_weight?: number;
    result?: {
        code?: string;
        message?: string;
    };
    transaction?: TransactionExtension;
}

interface AccountResourceMessage {
    free_bandwidth_used?: number;
    free_bandwidth_limit?: number;
    bandwidth_used?: number;
    bandwidth_limit?: number;
    asset_bandwidth_used?: Map<number, number>;
    asset_bandwidth_limit?: Map<number, number>;
    total_bandwidth_limit?: number;
    total_bandwidth_weight?: number;

    energy_used?: number;
    energy_limit?: number;
    total_energy_limit?: number;
    total_energy_weight?: number;
}

export interface AssetIssueContract {
    id: number;
    owner_address: string;
    name: string;
    abbr: string;
    total_supply: number;
    frozen_supply?: Array<{
        frozen_amount?: number;
        frozen_days?: number;
    }>;
    mcash_num: number;
    precision: number;
    num: number;
    start_time?: number;
    end_time?: number;
    order?: number;
    vote_score?: number;
    description?: string;
    url?: string;
    free_asset_bandwidth_limit?: number;
    public_free_asset_bandwidth_limit?: number;
    public_free_asset_bandwidth_usage?: number;
    public_latest_free_bandwidth_time?: number;
}
