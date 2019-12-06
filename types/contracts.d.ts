import {ABIDefinition, Callback, CreateSmartContractOption, EventLog} from "./types";
import McashWeb = require("./index");

export class Contract {
    public methods: any;

    constructor(mcashWeb?: McashWeb,
                abi?: ABIDefinition[],
                address?: string);

    hasProperty(property: PropertyKey): boolean;

    loadAbi(abi?: ABIDefinition[]): void;

    new(options: CreateSmartContractOption,
        privateKey?: string,
        callback?: Callback<Contract>): Promise<Contract>;

    at(contractAddress: string,
       callback?: Callback<Contract>): Promise<Contract>;

    events(options?: object,
           callback?: Callback<EventLog[]>): object;
}
