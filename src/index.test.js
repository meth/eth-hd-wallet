const { EthHdWallet } = require('./')

describe('wallet', () => {
  let wallet

  beforeEach(() => {
    /*
      We'll go with a known reliable testset, see https://github.com/MetaMask/metamask-extension/issues/640
     */
    wallet = EthHdWallet.fromMnemonic('radar blur cabbage chef fix engine embark joy scheme fiction master release')
  })

  it('has a first address', () => {
    const addresses = wallet.generateAddresses(1)

    expect(addresses).toEqual([
      '0xac39b311dceb2a4b2f5d8461c1cdaf756f4f7ae9'
    ])
    expect(wallet.getAddresses()).toEqual([
      '0xac39b311dceb2a4b2f5d8461c1cdaf756f4f7ae9'
    ])
  })

  it('can generate another 5', () => {
    wallet.generateAddresses(1)

    const addresses = wallet.generateAddresses(5)

    expect(addresses).toEqual([
      '0xd7c0cd9e7d2701c710d64fc492c7086679bdf7b4',
      '0x1acfb961c5a8268eac8e09d6241a26cbeff42241',
      '0xabc2bca51709b8615147352c62420f547a63a00c',
      '0x26042cb13cc4140a281c0fcc7464074c5e9fd0b4',
      '0x5d0d1a012a3ab2b3424c2023246d8c834bf599d9'
    ])
    expect(wallet.getAddresses()).toEqual([
      '0xac39b311dceb2a4b2f5d8461c1cdaf756f4f7ae9',
      '0xd7c0cd9e7d2701c710d64fc492c7086679bdf7b4',
      '0x1acfb961c5a8268eac8e09d6241a26cbeff42241',
      '0xabc2bca51709b8615147352c62420f547a63a00c',
      '0x26042cb13cc4140a281c0fcc7464074c5e9fd0b4',
      '0x5d0d1a012a3ab2b3424c2023246d8c834bf599d9'
    ])
  })

  it('can check if it has an address', () => {
    wallet.generateAddresses(5)

    expect(wallet.hasAddress('0xd7c0cd9e7d2701c710d64fc492c7086679bdf7b4')).toEqual(true)
    expect(wallet.hasAddress('0x26042cb13cc4140a281c0fcc7464074c5e9fd0b4')).toEqual(true)
    expect(wallet.hasAddress('0x5d0d1a012a3ab2b3424c2023246d8c834bf599d9')).toEqual(false)
  })

  it('can get an address count', () => {
    wallet.generateAddresses(5)
    wallet.generateAddresses(3)

    expect(wallet.getAddressCount()).toEqual(8)
  })

  describe('can sign', () => {
    let addresses

    beforeEach(() => {
      addresses = wallet.generateAddresses(2)
    })

    it('a value transfer', () => {
      const rawTx = wallet.sign({
        from: addresses[0],
        to: addresses[1],
        value: 10000000000000000,
        nonce: '0x0',
        data: '0x0',
        gasPrice: 100000000000,
        gasLimit: 21000,
        chainId: 1337
      })

      expect(rawTx).toEqual('f86d8085174876e80082520894d7c0cd9e7d2701c710d64fc492c7086679bdf7b4872386f26fc1000000820a95a02f905da1924dfb817ec35c2079024d6ceb77e4fe832d698e1f63777c43feca48a005ca84826088a8533e1fd3330bd0e6be8d6857196aa2d9341c63544f71ab0d85')
    })
  })
})
