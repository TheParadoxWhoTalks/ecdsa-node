const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0338bc1a60b6dfe52a498b310a92be29a9af2086a65c7bffff771229292213bc09": 100,
  // priv key: de53af1d49ea818aae663eb0f0f122ae3b08df214c3153a1513f06bff67cb7f1
  "03202f8ff447462c76565f6a075add200c713bdac7e3d6608498f64493ee240753": 50,
  // priv key: d3e86f2724ad93c5398977aa58d749f37ffc2f84fb7a1c05d7bcec2accf14e0a
  "024df25008d3316037a1113f63acae55847325021b58b6a6a8ca5ef2e9f5ba014d": 75,
  // priv key: 2755cc1390e0fc98a3bb0e802d27528c8eb882e2e86d53095d951e5374b511c7
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
    //TODO: get the signature from the client-side application
    const { sender, recipient, amount, signedMessage} = req.body;
    setInitialBalance(sender);
    setInitialBalance(recipient);
  
    //hash message
    const message = JSON.stringify({
      sender,
      amount,
      recipient,
    });
    const msgHash = keccak256(utf8ToBytes(message));
  
  
    /* change signature back to it's original form which is s = bigint r = bigint recovery = number */
    let sig = JSON.parse(signedMessage);
    sig.r = BigInt(sig.r);
    sig.s = BigInt(sig.s);
    sig.recovery = sig.recovery;
    
    const signature = new secp256k1.Signature (sig.r, sig.s, sig.recovery);
  
    //TODO: recover the public address from the signature and compare with the sender
    const recoverKey = signature.recoverPublicKey(msgHash).toHex();
    
    if(recoverKey !== sender) {
      res.status(400).send({ message: "Not invalid sender!" });
    } else if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender], message: "Transfer succesful" });
    }; 
  });
  
  app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
  });

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
