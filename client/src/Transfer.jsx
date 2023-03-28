import { useState } from 'react'
import * as secp from 'ethereum-cryptography/secp256k1'
import { keccak256 } from 'ethereum-cryptography/keccak'
import { utf8ToBytes } from 'ethereum-cryptography/utils'
import { toHex } from 'ethereum-cryptography/utils'
import server from './server'

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState('')
  const [recipient, setRecipient] = useState('')

  const setValue = (setter) => (evt) => setter(evt.target.value)

  async function transfer(evt) {
    evt.preventDefault()

    const {
      data: { transactionIds },
    } = await server.get('/transaction-ids')

    if (transactionIds) {
      const newId = parseInt(transactionIds.slice(-1)) + 1

      const bytesMessage = utf8ToBytes(
        JSON.stringify({
          amount: parseInt(sendAmount),
          recipient,
          id: newId,
        }),
      )

      const messageHash = keccak256(bytesMessage)

      const signedMessage = await secp.sign(messageHash, privateKey, {
        recovered: true,
      })

      try {
        const {
          data: { balance },
        } = await server.post(`send`, {
          sender: address,
          amount: parseInt(sendAmount),
          recipient,
          signedMessage,
          messageHash,
          id: parseInt(newId),
        })
        setBalance(balance)
      } catch (ex) {
        alert(ex.response.data.message)
      }
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  )
}

export default Transfer
