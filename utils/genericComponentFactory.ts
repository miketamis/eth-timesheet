import { web3 } from "./web3";
import CONTRACT_ADDRESS from "../contract-address";

const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_approver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "_projectAddress",
        type: "address",
      },
    ],
    name: "NewProject",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "createProject",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
export default () =>
  process.browser &&
  new web3.eth.Contract(abi, CONTRACT_ADDRESS.GenericProjectFactory);
