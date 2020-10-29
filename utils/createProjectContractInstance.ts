import { web3 } from "./web3";

const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_approver",
        type: "address",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
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
        indexed: true,
        internalType: "address",
        name: "_worker",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "_timesheetId",
        type: "bytes32",
      },
    ],
    name: "TimeSheetEntryApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_worker",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "_timesheetId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "_day",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_millisecs",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "_notes",
        type: "string",
      },
    ],
    name: "TimesheetEntryEvent",
    type: "event",
  },
  {
    inputs: [],
    name: "approver",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "timesheetId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "day",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "millisecs",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "notes",
        type: "string",
      },
    ],
    name: "submitTimeEntry",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "timesheetId",
        type: "bytes32",
      },
    ],
    name: "approveTimeEntry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "timeEntryId",
        type: "bytes32",
      },
    ],
    name: "getTimeEntry",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "enum GenericProject.EntryState",
        name: "",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "timeEntryId",
        type: "bytes32",
      },
    ],
    name: "getTimeEntryState",
    outputs: [
      {
        internalType: "enum GenericProject.EntryState",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export default (contractAddress: string, fromAddress?: string) =>
  process.browser &&
  new web3.eth.Contract(abi, contractAddress, { from: fromAddress });
