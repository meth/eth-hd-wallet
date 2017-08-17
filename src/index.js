import { Buffer } from 'buffer'
import { pubToAddress } from 'ethereumjs-util'
import { HDPrivateKey } from 'bitcore-lib'
import Mnemonic from 'bitcore-mnemonic'
import Elliptic from 'elliptic'


const SECP256K1 = Elliptic.ec('secp256k1')


// See https://github.com/ethereum/EIPs/issues/85
const BIP44_PATH = [
  `44'`, // bip44 (spec)
  `60'`, // ethereum (cryptocurrency)
  `0'`, // first account (wallet)
  `0`, // external chain (public network)
]

const BIP44_PATH_STR_PREFIX = `m/${BIP44_PATH.join('/')}`


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

    return new EthHdWallet(new HDPrivateKey(xprivkey))
  }

  /**
   * @constructor
   * @param  {HDPrivateKey} hdKey HD key for deterministic key generation.
   */
  constructor (hdKey) {
    this.hdKey = hdKey
    this._nextKeyIndex = 0
    this._derivedKeys = []
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
  getAllAddresses () {
    return this._derivedKeys.map(k => k.address)
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
    while (0 < num) {
      const newKey = this.hdKey.derive(`${BIP44_PATH_STR_PREFIX}/${this._nextKeyIndex}`)
      this._nextKeyIndex++

      // if generated private key is right length then add it and dec. counter
      // (see https://github.com/ConsenSys/eth-lightwallet/blob/master/lib/keystore.js#L300)
      if (32 === newKey.privateKey.toBuffer().length) {
        this._derivedKeys.push({
          raw: newKey,
          address: this._keyToAddress(newKey)
        })

        num--
      }
    }

    return this._derivedKeys.slice(-num)
  }

  /**
   * Get public Ethereum address corresponding to given derived key.
   *
   * @param  {Object} key derived key
   * @return {String}
   */
  _keyToAddress (key) {
    const ecKey =
      SECP256K1.keyFromPublic(key.publicKey.toBuffer()).getPublic().toJSON()

    const addrBuf = pubToAddress(Buffer.concat([
      this._newBuffer32(ecKey[0].toArray()),
      this._newBuffer32(ecKey[1].toArray())
    ]))

    return this._sanitizeAddress(addrBuf.toString('hex'))
  }

  /**
   * Construct a buffer of length 32 using given input array.
   *
   * This will zero-fill "prefix" the array contents if the array length < 32.
   * @param  {Array} array
   * @return {Buffer}
   */
  _newBuffer32 (array) {
    if (32 < array.length) {
      throw new Error('EthHdWallet._newBuffer32: Array length > 32, unexpected.')
    } else {
      let buf = Buffer.from(array)

      if (32 > array.length) {
        buf = Buffer.concat(Buffer.alloc(32 - array.length, 0), buf)
      }

      return buf
    }
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
    if (2 <= addr.length && addr.substr(0, 2) !== '0x') {
      addr = `0x${addr}`
    }

    return addr
  }
}
