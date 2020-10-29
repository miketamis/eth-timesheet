import Web3 from "web3";
export const web3 = process.browser ? new Web3(Web3.givenProvider) : new Web3();
