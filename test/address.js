const { EthHdWallet } = require('../')

const { expect } = require('code')

exports['address'] = {
  beforeEach: () => {
    /*
      We'll go with a known reliable testset, see https://github.com/MetaMask/metamask-extension/issues/640
     */
    this.wallet = EthHdWallet.fromMnemonic('radar blur cabbage chef fix engine embark joy scheme fiction master release')
  },

  'first address': () => {
    const addresses = this.wallet.generateAddresses(1)

    expect(addresses).to.equal([
      '0xac39b311dceb2a4b2f5d8461c1cdaf756f4f7ae9'
    ])
    expect(this.wallet.getAddresses()).to.equal([
      '0xac39b311dceb2a4b2f5d8461c1cdaf756f4f7ae9'
    ])
  },

  'generate another 5': () => {
    this.wallet.generateAddresses(1)

    const addresses = this.wallet.generateAddresses(5)

    expect(addresses).to.equal([
      '0xd7c0cd9e7d2701c710d64fc492c7086679bdf7b4',
      '0x1acfb961c5a8268eac8e09d6241a26cbeff42241',
      '0xabc2bca51709b8615147352c62420f547a63a00c',
      '0x26042cb13cc4140a281c0fcc7464074c5e9fd0b4',
      '0x5d0d1a012a3ab2b3424c2023246d8c834bf599d9'
    ])
    expect(this.wallet.getAddresses()).to.equal([
      '0xac39b311dceb2a4b2f5d8461c1cdaf756f4f7ae9',
      '0xd7c0cd9e7d2701c710d64fc492c7086679bdf7b4',
      '0x1acfb961c5a8268eac8e09d6241a26cbeff42241',
      '0xabc2bca51709b8615147352c62420f547a63a00c',
      '0x26042cb13cc4140a281c0fcc7464074c5e9fd0b4',
      '0x5d0d1a012a3ab2b3424c2023246d8c834bf599d9'
    ])
  },

  'has address': () => {
    this.wallet.generateAddresses(5)

    expect(this.wallet.hasAddress('0xd7c0cd9e7d2701c710d64fc492c7086679bdf7b4')).to.be.true()
    expect(this.wallet.hasAddress('0x26042cb13cc4140a281c0fcc7464074c5e9fd0b4')).to.be.true()
    expect(this.wallet.hasAddress('0x5d0d1a012a3ab2b3424c2023246d8c834bf599d9')).to.be.false()
  }
}
