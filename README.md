## What is McashWeb?

__[Mcash Web - Developer Document](https://github.com/MidasCore/java-mcashchain/wiki/McashWeb)__

<!--
McashWeb aims to deliver a unified, seamless development experience influenced by Ethereum's [Web3](https://github.com/ethereum/web3.js/) implementation. We have taken the core ideas and expanded upon it to unlock the functionality of TRON's unique feature set along with offering new tools for integrating DApps in the browser, Node.js and IoT devices.
-->

## Compatibility
- Version built for Node.js v6 and above
- Version built for browsers with more than 0.25% market share

You can access either version specifically from the [dist](dist) folder.

McashWeb is also compatible with frontend frameworks such as:
- Angular 
- React
- Vue.

You can also ship McashWeb in a Chrome extension.

## Installation

### Node.js
```bash
npm install mcashweb
```
or
```bash
yarn add mcashweb
```

### Browser
The asiest way to use McashWeb in a browser is to install it as above and copy the dist file to your working folder. For example:
```
cp node_modules/mcashweb/dist/McashWeb.js ./js/mcashweb.js
```
so that you can call it in your HTML page as
```
<script src="./js/mcashweb.js"><script>
```

## Testnet

To use Mcash Testnet the following endpoint:
```
https://testnet.mcash.network
```
Anything you do should be explorable on https://testnet.mcashscan.io

## Creating an Instance

First off, in your javascript file, define McashWeb:

```js
const McashWeb = require('mcashweb');

const mcashWeb = new McashWeb({
    fullHost: 'https://mainnet.mcash.network',
    privateKey: 'your private key'
});
```

## Licence

McashWeb is distributed under a MIT licence.


-----

<!--
For more historic data, check the original repo at
[https://github.com/tronprotocol/tron-web](https://github.com/tronprotocol/tron-web)
-->
