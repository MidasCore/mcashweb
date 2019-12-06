export class HttpProvider {
    constructor(host: string,
                timeout?: number,
                user?: string,
                password?: string,
                headers?: object,
                statusPage?: string);

    request(url: string, payload?: object, method?: string): any;

    setStatusPage(statusPage: string): void;

    isConnected(statusPage?: string): Promise<boolean>;
}

export interface Providers {
    HttpProvider: new (
        host: string,
        options?: object
    ) => HttpProvider;
}
