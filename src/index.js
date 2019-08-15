import { addHexPrefix } from 'ethereumjs-util'
import { fromExtendedKey } from 'ethereumjs-wallet/hdkey'
import EthereumTx from 'ethereumjs-tx'
import EthSigUtil from 'eth-sig-util'
import Mnemonic from 'bitcore-mnemonic'


// See https://github.com/ethereum/EIPs/issues/85
const BIP44_PATH = `m/44'/60'/0'/0`


/**
 * Normalize an Etherum address
 * @param  {String} addr Address
 * @return {Striung}
 */
const normalizeAddress = addr => addr ? addHexPrefix(addr.toLowerCase()) : addr


/**
 * Generate a 12-word mnemonic in English.
 * @return {[String]}
 */
export const generateMnemonic = () => {
  return new Mnemonic(Mnemonic.Words.ENGLISH).toString()
}


/**
 * Represents a wallet instance.
 */
export class EthHdWallet {
  /**
   * Construct HD wallet instance from given mnemonic
   * @param  {String} mnemonic Mnemonic/seed string.
   * @return {EthHdWallet}
   */
  static fromMnemonic (mnemonic) {
    const { xprivkey } = new Mnemonic(mnemonic).toHDPrivateKey()

    return new EthHdWallet(xprivkey)
  }

  /**
   * @constructor
   * @param  {String} hdKey Extended HD private key
   */
  constructor (xPrivKey) {
    this._hdKey = fromExtendedKey(xPrivKey)
    this._root = this._hdKey.derivePath(BIP44_PATH)
    this._children = []
  }


  /**
   * Generate new addresses.
   * @param  {Number} num No. of new addresses to generate.
   * @return {[String]}
   */
  generateAddresses (num) {
    const newKeys = this._deriveNewKeys(num)

    return newKeys.map(k => k.address)
  }

  /**
   * Discard generated addresses.
   *
   * This is in effect the reverse of `generateAddresses()`.
   *
   * @param  {Number} num The number of addresses to remove from the end of the list of addresses.
   * @return {[String]} The discarded addresses
   */
  discardAddresses (num) {
    const discard = this._children.splice(-num)

    return discard.map(k => k.address)
  }



  /**
   * Get all addresses.
   * @return {[String]}
   */
  getAddresses () {
    return this._children.map(k => k.address)
  }


  /**
   * Get no. of addresses.
   * @return {Number}
   */
  getAddressCount () {
    return this._children.length
  }


  /**
   * Check whether given address is present in current list of generated addresses.
   * @param  {String}  addr
   * @return {Boolean}
   */
  hasAddress (addr) {
    addr = normalizeAddress(addr)

    return !!this._children.find(({ address }) => addr === address)
  }


  /**
   * Get private key for given address.
   * @param  {String}  addr Public key address
   * @return {Buffer} private key buffer
   */
  getPrivateKey (addr) {
    addr = normalizeAddress(addr)

    const { wallet } = this._children.find(({ address: a }) => addr === a) || {}

    if (!wallet) {
      throw new Error('Invalid address')
    }

    return wallet.getPrivateKey()
  }


  /**
   * Sign transaction data.
   *
   * @param  {String} from From address
   * @param  {String} [to] If omitted then deploying a contract
   * @param  {Number} value Amount of wei to send
   * @param  {String} data Data
   * @param  {Number} gasLimit Total Gas to use
   * @param  {Number} gasPrice Gas price (wei per gas unit)
   * @param  {String} chainId Chain id
   *
   * @return {String} Raw transaction string.
   */
  signTransaction ({ nonce, from, to, value, data, gasLimit, gasPrice, chainId }) {
    from = normalizeAddress(from)
    to = normalizeAddress(to)

    const { wallet } = this._children.find(({ address }) => from === address) || {}

    if (!wallet) {
      throw new Error('Invalid from address')
    }

    const tx = new EthereumTx({
      nonce, to, value, data, gasLimit, gasPrice, chainId
    })

    tx.sign(wallet.getPrivateKey())

    return addHexPrefix(tx.serialize().toString('hex'))
  }


  /**
   * Sign data.
   *
   * @param  {String} address Address whos private key to sign with
   * @param  {String|Buffer|BN} data Data
   *
   * @return {String} Signed data..
   */
  sign ({ address, data }) {
    address = normalizeAddress(address)

    const { wallet } = this._children.find(({ address: a }) => address === a) || {}

    if (!wallet) {
      throw new Error('Invalid address')
    }

    return addHexPrefix(EthSigUtil.personalSign(wallet.getPrivateKey(), { data }))
  }


  /**
   * Recover public key of signing account.
   *
   * @param  {String} signature The signed message..
   * @param  {String|Buffer|BN} data The original input data.
   *
   * @return {String} Public signing key.
   */
  recoverSignerPublicKey ({ signature, data }) {
    return EthSigUtil.recoverPersonalSignature({ sig: signature, data })
  }



  /**
   * Derive new key pairs.
   *
   * This will increment the internal key index counter and add the
   * generated keypairs to the internal list.
   *
   * @param  {Number} num no. of new keypairs to generate
   * @return {[String]} Generated keypairs.
   */
  _deriveNewKeys (num) {
    let count = num

    while (0 <= --count) {
      const child = this._root.deriveChild(this._children.length).getWallet()

      this._children.push({
        wallet: child,
        address: normalizeAddress(child.getAddress().toString('hex'))
      })
    }

    return this._children.slice(-num)
  }
}
