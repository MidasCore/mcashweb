import McashWeb from 'index';
import utils from 'utils';
import semver from 'semver';

export default class Plugin {

    constructor(mcashWeb = false) {
        if (!mcashWeb || !mcashWeb instanceof McashWeb)
            throw new Error('Expected instance of McashWeb');
        this.mcashWeb = mcashWeb;
        this.pluginNoOverride = ['register'];
    }

    register(Plugin, options) {
        let pluginInterface = {
            requires: '0.0.0',
            components: {}
        };
        let result = {
            plugged: [],
            skipped: []
        };
        const plugin = new Plugin(this.mcashWeb);
        if (utils.isFunction(plugin.pluginInterface)) {
            pluginInterface = plugin.pluginInterface(options)
        }
        if (semver.satisfies(McashWeb.version, pluginInterface.requires)) {
            for (let component in pluginInterface.components) {
                if (!this.mcashWeb.hasOwnProperty(component)) {
                    // TODO implement new sub-classes
                    continue
                }
                let methods = pluginInterface.components[component];
                let pluginNoOverride = this.mcashWeb[component].pluginNoOverride || [];
                for (let method in methods) {
                    if (method === 'constructor' || (this.mcashWeb[component][method] &&
                        (pluginNoOverride.includes(method) // blacklisted methods
                            || /^_/.test(method)) // private methods
                    )) {
                        result.skipped.push(method);
                        continue
                    }
                    this.mcashWeb[component][method] = methods[method].bind(this.mcashWeb[component]);
                    result.plugged.push(method)
                }
            }
        } else {
            throw new Error('The plugin is not compatible with this version of McashWeb')
        }
        return result
    }
}

