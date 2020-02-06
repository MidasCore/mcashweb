import BigNumber from "bignumber.js";
import {HttpProvider, Providers} from "./providers";
import {Mcash} from "./mcash";
import {Event} from "./event";
import {Plugin} from "./plugin";
import {TransactionBuilder} from "./transactionBuilder";
import {Contract} from "./contracts";
import {utils} from "./utils";
import {McashWebConstructorOptions} from "./types";

export = McashWeb;

interface Provider {
    fullNode?: HttpProvider,
    solidityNode?: HttpProvider,
    eventServer?: HttpProvider,
}

declare class McashWeb {
    public mcash: Mcash;
    public event: Event;
    public plugin: Plugin;
    public transactionBuilder: TransactionBuilder;
    public fullNode: HttpProvider;
    public solidityNode: HttpProvider;

    static readonly providers: Providers;
    static readonly BigNumber: BigNumber;
    static readonly TransactionBuilder: TransactionBuilder;
    static readonly Mcash: Mcash;
    static readonly Contract: Contract;
    static readonly Plugin: Plugin;
    static readonly Event: Event;
    static readonly version: string;
    static readonly utils: utils;

    constructor(options?: string | McashWebConstructorOptions,
                fullNode?: string | HttpProvider,
                solidityNode?: string | HttpProvider,
                eventServer?: string | HttpProvider,
                privateKey?: string);

    setDefaultBlock(blockId?: number | string | boolean): void;

    setPrivateKey(privateKey: string): void;

    setAddress(address: string): void;

    setFullNode(fullNode: string | HttpProvider): void;

    setSolidityNode(solidityNode: string | HttpProvider): void;

    currentProviders(): Provider;

    currentProvider(): Provider;

    contract(abi?: object[], address?: string): Contract;

    static sha3(string: string, prefix?: boolean): string;

    static toHex(val: any): string;

    static toUtf8(hex: string): string;

    static fromUtf8(string: string): string;

    static toAscii(hex: string): string;

    static fromAscii(string: string, padding: number): string;

    static toDecimal(value: string | BigNumber): number;

    static fromDecimal(value: string | BigNumber): string;

    static fromMatoshi(matoshi: number | string | BigNumber): string | BigNumber;

    static toMatoshi(mcash: number | string | BigNumber): string | BigNumber;

    static toBigNumber(amount: number | string | BigNumber): BigNumber;

    static isAddress(address: string): boolean;

    static createAccount(): Promise<object>;

    isConnected(callback: () => any): Promise<object>;

    static get address(): {
        fromHex(address: string): string;

        fromPrivateKey(privateKey: string): string;

        toHex(address: string): string;
    }
}
