import { useState } from "react";
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { utf8ToBytes } from 'ethereum-cryptography/utils';
import { keccak256 } from 'ethereum-cryptography/keccak';
import server from "./server";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    if (!privateKey) {
      console.error("Private key is undefined");
      return;
    }

    // signing transaction to generate signature
    const message = JSON.stringify({
      sender: address,
      amount: parseInt(sendAmount),
      recipient,
    });
    const msgHash = keccak256(utf8ToBytes(message));

    let signedMessage = secp256k1.sign(msgHash, privateKey);
    signedMessage = JSON.stringify({
      ...signedMessage,
      r: BigInt(signedMessage.r).toString(),
      s: BigInt(signedMessage.s).toString(),
      recovery: signedMessage.recovery,
    });

    // sending the signature
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signedMessage,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
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
          placeholder="Type an address"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
