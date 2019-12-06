type GeneratedAccount = {
    privateKey: string;
    publicKey: string;
    address: {
        base58: string;
        hex: string;
    }
}

interface accounts {
    generateAccount(): GeneratedAccount;
}

interface base58 {
    encode58(data: number[]): string;

    decode58(data: string): number[];
}

interface bytes {
    byte2hexStr(byte: number): string;

    bytesToString(arr: number[]): string;

    hextoString(hex: string): string;

    byteArray2hexStr(byteArray: number[]): string;

    base64DecodeFromString(string64: string): number[];

    base64EncodeToString(bytes: number[]): string;
}

interface code {

}

interface crypto {
    getBase58CheckAddress(addressBytes: number[]): string;

    decodeBase58Address(base58String: string): number[];
}

interface help {
    hexStringToBase58(sHexString: string): string;

    base58ToHexString(sBase58: string): string;

    hexStringToUtf8(hex: string): string;

    stringUtf8tHex(str: string): string;

    address2HexString(sHexAddress: string): string;

    hexString2Address(sAddress: string): string;

    hexString2Utf8(sHexString: string): string;

    stringUtf8toHex(sUtf8: string): string;
}


export interface utils {
    isValidURL(url: any): boolean;

    isObject(obj: any): boolean;

    isArray(array: any): boolean;

    isJson(string: string): boolean;

    isBoolean(bool: any): boolean;

    isBigNumber(number: any): boolean;

    isString(string: any): boolean;

    isFunction(obj: any): boolean;

    isHex(string: any): boolean;

    isInteger(number: any): boolean;

    hasProperty(obj: any, property: PropertyKey): boolean;

    hasProperties(obj: any, ...properties: PropertyKey[]): boolean;

    injectPromise(func: any, ...args: any[]): Promise<any>;

    promiseInjector(scope: any): Promise<any>;

    accounts: accounts;
    base58: base58;
    bytes: bytes;
    crypto: crypto;
    code: code;
    help: help;
}
