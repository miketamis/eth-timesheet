import { useEffect, useState } from "react";
import Button from "../components/Button";
import timecoinProjectContract from "../utils/timecoinProjectContract";

function addToken(tokenAddress) {
  //   // wasAdded is a boolean. Like any RPC method, an error may be thrown.
  process.browser &&
    ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20", // Initially only supports ERC20, but eventually more!
        options: {
          address: tokenAddress, // The address that the token is at.
          symbol: "TXC", // A ticker symbol or shorthand, up to 5 chars.
          decimals: "18", // The number of decimals in the token
          image: "https://i.imgur.com/7pToF5X.png", // A string url of the token logo
        },
      },
    });
}
export default function Timecoin() {
  const [tokenAddress, setTokenAddress] = useState("");
  useEffect(() => {
    timecoinProjectContract()
      .methods.token_address()
      .call()
      .then((res) => {
        setTokenAddress(res);
      });
  }, []);
  return (
    <div>
      <img src="https://i.imgur.com/7pToF5X.png"></img>
      <Button
        onClick={() => {
          addToken(tokenAddress);
        }}
      >
        Add Token
      </Button>
      {tokenAddress}
    </div>
  );
}
