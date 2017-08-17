# eth-hd-wallet

[![Build Status](https://secure.travis-ci.org/meth-project/eth-hd-wallet.svg?branch=master)](http://travis-ci.org/meth-project/eth-hd-wallet)
[![NPM module](https://badge.fury.io/js/eth-hd-wallet.svg)](https://badge.fury.io/js/eth-hd-wallet)

*NOTE: This is still a work-in-progress*

Features:
* Lightweight, works in Node.js and browsers
* Supports custom-generated mnemonics
*


## Installation

```shell
npm install eth-hd-wallet
```
Or if using Yarn:

```shell
yarn add eth-hd-wallet
```

## API

### generateAddresses(): Generating addresses

```js
const { generateMnemonic, EthHdWallet } = require('eth-hd-wallet')

const wallet = EthHdWallet.fromMnemonic(generateMnemonic())

// generate 2 addresses
console.log( wallet.generateAddresses(2) )

/*
[
  '0xd7c0cd9e7d2701c710d64fc492c7086679bdf7b4',
  '0x1acfb961c5a8268eac8e09d6241a26cbeff42241',
]
*/
```

## Acknowledgements

Inspired by code from the following great projects:

* https://github.com/ConsenSys/eth-lightwallet
* https://github.com/MetaMask/eth-hd-keyring
* https://github.com/trapp/ethereum-bip44

## References

* https://github.com/ethereum/EIPs/issues/85
* https://github.com/MetaMask/metamask-extension/issues/640

## License

MIT - see [LICENSE.md](LICENSE.md)
