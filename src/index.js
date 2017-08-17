import ethUtil from 'ethereumjs-util'
import HDKey from 'ethereumjs-wallet/hdkey'
import Mnemonic from 'bitcore-mnemonic'



// See https://github.com/ethereum/EIPs/issues/85
const BIP44_PATH = `m/44'/60'/0'/0`


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
    this._hdKey = HDKey.fromExtendedKey(xPrivKey)
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
   * Get all addresses.
   * @return {[String]}
   */
  getAddresses () {
    return this._children.map(k => k.address)
  }

  /**
   * Check whether given address is present in current list of generated addresses.
   * @param  {String}  addr
   * @return {Boolean}
   */
  hasAddress (addr) {
    addr = this._sanitizeAddress(addr)

    return !!this._children.find(({ address }) => addr === address)
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
        address: this._sanitizeAddress(child.getAddress().toString('hex'))
      })
    }

    return this._children.slice(-num)
  }


  /**
   * Sanitize given address.
   *
   * This will add `0x` prefix to an address if not already set.
   *
   * @param  {String} addr
   * @return {String}
   */
  _sanitizeAddress (addr) {
    return ethUtil.addHexPrefix(addr)
  }
}
