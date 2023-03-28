import { useEffect } from 'react'
import server from './server'
import * as secp from 'ethereum-cryptography/secp256k1'
import { keccak256 } from 'ethereum-cryptography/keccak'
import { toHex } from 'ethereum-cryptography/utils'

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  setPrivateKey,
  privateKey,
}) {
  async function onChange(evt) {
    const value = evt.target.value
    setPrivateKey(value)

    const publicKey = secp.getPublicKey(value)
    const hashedPublicKey = keccak256(publicKey.slice(1))
    const publicAddress = `0x${toHex(
      hashedPublicKey.slice(hashedPublicKey.length - 20),
    )}`

    setAddress(publicAddress)
  }

  useEffect(() => {
    const getBalance = async () => {
      if (address) {
        const {
          data: { balance },
        } = await server.get(`balance/${address}`)
        setBalance(balance)
      } else {
        setBalance(0)
      }
    }

    getBalance()
  }, [address])

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input
          placeholder="Enter your private key"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>
      {address && <label>Your public address: {address}</label>}

      <div className="balance">Balance: {balance}</div>
    </div>
  )
}

export default Wallet
