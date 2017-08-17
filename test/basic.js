const { EthHdWallet } = require('../')

const { expect } = require('code')

exports['generate addresses'] = {
  beforeEach: () => {
    /*
      We'll go with a known reliable testset, see https://github.com/MetaMask/metamask-extension/issues/640
     */
    this.wallet = EthHdWallet.fromMnemonic('radar blur cabbage chef fix engine embark joy scheme fiction master release')
  },

  'first address': () => {
    const addresses = this.wallet.generateAddresses(1)

    console.log(addresses)
  }
}
