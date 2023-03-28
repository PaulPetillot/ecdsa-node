const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require('ethereum-cryptography/utils')

const generatePrivateKey = () => {
  const privateKey = toHex(secp.utils.randomPrivateKey())
  const publicKey = secp.getPublicKey(privateKey)
  const hashedPublicKey = keccak256(publicKey.slice(1))
  const publicAddress = `0x${toHex(hashedPublicKey.slice(hashedPublicKey.length - 20))}`

  console.log(privateKey)
  console.log(publicAddress)
}

generatePrivateKey()