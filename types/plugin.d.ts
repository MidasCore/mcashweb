import McashWeb = require("./index");

export class Plugin {
    constructor(mcashWeb?: McashWeb);

    register(plugin: Plugin, options?: object): object;
}
