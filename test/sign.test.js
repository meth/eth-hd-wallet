const { EthHdWallet } = require('../')

const { expect } = require('code')

exports['sign'] = {
  beforeEach: () => {
    /*
      We'll go with a known reliable testset, see https://github.com/MetaMask/metamask-extension/issues/640
     */
    this.wallet = EthHdWallet.fromMnemonic('radar blur cabbage chef fix engine embark joy scheme fiction master release')

    this.addresses = this.wallet.generateAddresses(2)
  },

  'sign value transfer': () => {
    const rawTx = this.wallet.sign({
      from: this.addresses[0],
      to: this.addresses[1],
      value: 10000000000000000,
      nonce: '0x0',
      data: '0x0',
      gasPrice: 100000000000,
      gasLimit: 21000,
      chainId: 1337
    })

    expect(rawTx).to.equal('f86d8085174876e80082520894d7c0cd9e7d2701c710d64fc492c7086679bdf7b4872386f26fc1000000820a95a02f905da1924dfb817ec35c2079024d6ceb77e4fe832d698e1f63777c43feca48a005ca84826088a8533e1fd3330bd0e6be8d6857196aa2d9341c63544f71ab0d85')
  }
}
