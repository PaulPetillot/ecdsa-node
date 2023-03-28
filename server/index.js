const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require('ethereum-cryptography/utils')
const { keccak256 } = require("ethereum-cryptography/keccak");
const hashMessage = require("./hashMessage");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x9c7645e65ad02a476e94a50d7177c7b1deee2da2": 100,
  "0xbd9776a1148250dd7c4972a27f55ad9bb8e5e2c7": 50,
  "0xb74339b4df6e75a409694c0b727878c4cb7b2e88": 75,
};

const transactionIds = [0]

app.get("/transaction-ids", (_, res) => {
  res.send({ transactionIds })
})

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const newTransactionId = parseInt(transactionIds.slice(-1)) + 1
  const { sender, recipient, amount, signedMessage } = req.body;

  const hashedMessage = hashMessage(JSON.stringify({
    amount,
    recipient,
    id: newTransactionId
  }))


  const [signature, recoveryBit] = signedMessage
  const convertedSignature = new Uint8Array(Object.values(signature))


  const publicKey = await secp.recoverPublicKey(hashedMessage, convertedSignature, recoveryBit)
  const isSigned = await secp.verify(convertedSignature, hashedMessage, publicKey);

  if (isSigned) {
    setInitialBalance(sender);
    setInitialBalance(recipient);
    transactionIds.push(transactionIds.slice(-1) + 1)

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.status(401).send({ message: 'Wrong signature!' })
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
