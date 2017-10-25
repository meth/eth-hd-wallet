import promisify from 'es6-promisify'
import gethPrivate from 'geth-private'
import Web3 from 'web3'

import { EthHdWallet } from './'

const CHAIN_ID = 1337

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

describe('wallet', () => {
  let geth
  let web3
  let wallet

  beforeAll(async () => {
    geth = gethPrivate({
      autoMine: true,
      // verbose: true,
      gethOptions: {
        port: 60304,
        rpcport: 58545,
        networkid: CHAIN_ID,
        identity: 'eth-hd-wallet'
      },
      genesisBlock: {
        difficulty: '0x100'
      }
    })

    await geth.start()

    console.log('Waiting for Geth to be ready ...')
    await delay(7000)
    console.log('Geth ready!')

    web3 = new Web3()
    web3.setProvider(new web3.providers.HttpProvider(`http://localhost:58545`))

    web3.personal.unlockAccountAsync = promisify(web3.personal.unlockAccount, web3.personal)
    ;[
      'getBalance', 'sendTransaction', 'sendRawTransaction'
    ].forEach(f => {
      web3.eth[`${f}Async`] = promisify(web3.eth[f], web3.eth)
    })

    web3.eth.getEtherBalanceAsync = a => (
      web3.eth.getBalanceAsync(a)
        .then(b => web3.fromWei(b, 'ether').toString())
    )

    const balance = await web3.eth.getEtherBalanceAsync(web3.eth.coinbase)

    console.log(`Coinbase balance: ${balance}`)
  })

  afterAll(async () => {
    await geth.stop()
  })

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

    beforeEach(async () => {
      addresses = wallet.generateAddresses(2)

      // fill up first address with some eth
      await web3.personal.unlockAccountAsync(web3.eth.coinbase, '1234')
      await web3.eth.sendTransactionAsync({
        from: web3.eth.coinbase,
        to: addresses[0],
        value: web3.toWei(3, 'ether')
      })

      await delay(10000)

      const balance = await web3.eth.getEtherBalanceAsync(addresses[0])
      console.log(`Starting balance for ${addresses[0]}: ${balance}`)
    })

    it('a value transfer tx', async () => {
      const rawTx = wallet.sign({
        from: addresses[0],
        to: addresses[1],
        value: 200000000000000000 /* 0.2 eth */,
        nonce: 0x0,
        gasPrice: 50000000000 /* 50 gwei */,
        gasLimit: 21000 /* see https://github.com/ethereum/go-ethereum/blob/master/params/protocol_params.go#L27 */,
        chainId: CHAIN_ID
      })

      expect(rawTx).toBeTruthy()

      await web3.eth.sendRawTransactionAsync(rawTx)

      await delay(5000)

      const balance = await web3.eth.getEtherBalanceAsync(addresses[1])

      console.log(`Resulting balance of ${addresses[1]}: ${balance}`)

      expect(balance.toString()).toEqual('0.2')
    })

    it('a contract creation tx', async () => {
      const rawTx = wallet.sign({
        from: addresses[0],
        value: 0x0,
        data: '0x605280600c6000396000f3006000357c010000000000000000000000000000000000000000000000000000000090048063c6888fa114602e57005b60376004356041565b8060005260206000f35b6000600782029050604d565b91905056',
        nonce: 0x1,
        gasPrice: 50000000000 /* 50 gwei */,
        gasLimit: 103000 /* see https://github.com/ethereum/go-ethereum/blob/master/params/protocol_params.go#L28 */,
        chainId: CHAIN_ID
      })

      expect(rawTx).toBeTruthy()

      const receipt = await web3.eth.sendRawTransactionAsync(rawTx)

      await delay(5000)

      console.log(receipt)
    })
  })
})
