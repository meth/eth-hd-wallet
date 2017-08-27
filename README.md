# eth-hd-wallet

[![Build Status](https://secure.travis-ci.org/meth-project/eth-hd-wallet.svg?branch=master)](http://travis-ci.org/meth-project/eth-hd-wallet)
[![NPM module](https://badge.fury.io/js/eth-hd-wallet.svg)](https://badge.fury.io/js/eth-hd-wallet)

*NOTE: This is still a work-in-progress*

Features:
* Lightweight, works in Node.js and browsers
* Supports custom-generated mnemonics
* Batch-generate addresses in iterations

## Installation

```shell
npm install eth-hd-wallet
```
Or if using Yarn:

```shell
yarn add eth-hd-wallet
```

## API

### (static) fromMnemonic(): Generate wallet from mnemonic

```js
const { generateMnemonic, EthHdWallet } = require('eth-hd-wallet')

const wallet = EthHdWallet.fromMnemonic(generateMnemonic())

console.log( wallet instanceof EthHdWallet ); /* true */
*/
```


### generateAddresses(): Generating addresses

```js
// generate 2 addresses
console.log( wallet.generateAddresses(2) )

/*
[
  '0xd7c0cd9e7d2701c710d64fc492c7086679bdf7b4',
  '0x1acfb961c5a8268eac8e09d6241a26cbeff42241',
]
*/
```

### getAddresses(): Get all generated addresses

```js
wallet.generateAddresses(2)
wallet.generateAddresses(3)

// get all addresses
console.log( wallet.getAddresses() )

/*
[
  '0xd7c0cd9e7d2701c710d64fc492c7086679bdf7b4',
  '0x1acfb961c5a8268eac8e09d6241a26cbeff42241',
  '0xabc2bca51709b8615147352c62420f547a63a00c',
  '0x26042cb13cc4140a281c0fcc7464074c5e9fd0b4',
  '0x5d0d1a012a3ab2b3424c2023246d8c834bf599d9'
]
*/
```

### hasAddress(): Check if given address exists in current list of generated addresses

```js
wallet.generateAddresses(2)
wallet.generateAddresses(3)

/*
[
  '0xd7c0cd9e7d2701c710d64fc492c7086679bdf7b4',
  '0x1acfb961c5a8268eac8e09d6241a26cbeff42241',
  '0xabc2bca51709b8615147352c62420f547a63a00c',
  '0x26042cb13cc4140a281c0fcc7464074c5e9fd0b4',
  '0x5d0d1a012a3ab2b3424c2023246d8c834bf599d9'
]
*/

wallet.hasAddress('0x1efd1a012a3ab2b3424c2023246d8c834bf58723') /* false */
wallet.hasAddress('0x26042cb13cc4140a281c0fcc7464074c5e9fd0b4') /* true */
```

### getAddressCount(): Get no. of addresses

```js
wallet.generateAddresses(2)
wallet.generateAddresses(3)

console.log( wallet.getAddressCount() ) /* 5 */
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
