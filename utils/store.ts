import Web3 from "web3";
import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from "redux-saga";
import persistState from "redux-localstorage";
import CONTRACT_ADDRESS from "../contract-address";

import { rootSaga } from "./sagas";

let web3 = process.browser && new Web3(Web3.givenProvider);

const initialState: State = {
  timeEntries: {},
  days: {},
  submitted: {},
  projects: {
    [CONTRACT_ADDRESS.TimesheetAccount]: {
      address: CONTRACT_ADDRESS.TimesheetAccount,
      name: "Time Coins Project",
      approver: "0xc01f7091c0235fB7b3882487D0006ED90684d50F",
    },
  },
  account: "",
  network: {},
};

type Action = {
  type: string;
  payload?: any;
};

export type TimeEntry = {
  day: string;
  worker: string;
  projectAddress: string;
  id: string;
  notes: string;
  blockNumber: number;
  millisecs: string;
  state: 0 | 1 | 2;
};

export type Project = {
  address: string;
  name: string;
  approver: string;
  timeApproved?: string;
  timeSubmitted?: string;
  blockNumber?: number;
};

export type State = {
  timeEntries: {
    [key: string]: TimeEntry;
  };
  days: {
    [key: string]: string[];
  };
  submitted: {
    [key: string]: string[];
  };
  projects: {
    [key: string]: Project;
  };
  account: string;
  network: {
    isUnlocked?: boolean;
    networkVersion?: string;
    chainId?: string;
  };
};
function reducer(state: State | undefined, action: Action): State {
  if (typeof state === "undefined") {
    return initialState;
  }

  switch (action.type) {
    case "CHANGE_NETWORK":
      return {
        ...state,
        network: action.payload.network,
      };
    case "CHANGE_ACCOUNT":
      return {
        ...state,
        account: action.payload.account,
      };
    case "ADD_PROJECT":
    case "UPDATE_PROJECT":
      const previousProject = state.projects[action.payload.projectAddress] || {
        timeApproved: "0",
        timeSubmitted: "0",
      };
      return {
        ...state,
        projects: {
          ...state.projects,
          [action.payload.projectAddress]: {
            address: action.payload.projectAddress,
            name: action.payload.name,
            approver: action.payload.approver,
            timeApproved:
              action.payload.timeApproved || previousProject.timeApproved,
            timeSubmitted:
              action.payload.timeSubmitted || previousProject.timeSubmitted,
          },
        },
      };

    case "TimeSheetEntryApproved":
      const id = action.payload.returnValues._timesheetId;
      if (
        state.timeEntries[id] &&
        action.payload.blockNumber <= state.timeEntries[id].blockNumber
      ) {
        return state;
      }

      return {
        ...state,
        timeEntries: {
          ...state.timeEntries,
          [id]: {
            ...state.timeEntries[id],
            state: 2,
            blockNumber: action.payload.blockNumber,
            projectAddress: action.payload.projectAddress,
          },
        },
        submitted: {
          ...state.submitted,
          [action.payload.projectAddress]: state.submitted[
            action.payload.projectAddress
          ].filter((a: string) => a !== id),
        },
        projects: {
          ...state.projects,
          [action.payload.projectAddress]: {
            ...state.projects[action.payload.projectAddress],
            blockNumber: action.payload.blockNumber,
            timeApproved: `${
              parseInt(
                state.projects[action.payload.projectAddress].timeApproved ||
                  "0",
                10
              ) + parseInt(state.timeEntries[id].millisecs)
            }`,
            timeSubmitted: `${
              parseInt(
                state.projects[action.payload.projectAddress].timeSubmitted ||
                  "0",
                10
              ) - parseInt(state.timeEntries[id].millisecs)
            }`,
          },
        },
      };
    case "TimesheetEntryEvent":
      const payload = action.payload;
      const values = action.payload.returnValues;
      if (
        state.timeEntries[values._timesheetId] &&
        payload.blockNumber <=
          state.timeEntries[values._timesheetId].blockNumber
      ) {
        return state;
      }
      return {
        ...state,
        timeEntries: {
          ...state.timeEntries,
          [values._timesheetId]: {
            millisecs: values._millisecs,
            notes: values._notes,
            state: 1,
            id: values._timesheetId,
            day: values._day,
            blockNumber: payload.blockNumber,
            projectAddress: action.payload.projectAddress,
            worker: values._worker,
          },
        },
        days:
          web3.currentProvider.selectedAddress.toLowerCase() ==
          values._worker.toLowerCase()
            ? {
                ...state.days,
                [values._day]: !state.days[values._day]
                  ? [values._timesheetId]
                  : state.days[values._day].find(
                      (id: string) => id === values._timesheetId
                    )
                  ? state.days[values._day]
                  : [...state.days[values._day], values._timesheetId],
              }
            : state.days,
        submitted: {
          ...state.submitted,
          [action.payload.projectAddress]: (
            state.submitted[action.payload.projectAddress] || []
          ).find((id: string) => id === values._timesheetId)
            ? state.submitted[action.payload.projectAddress]
            : [
                ...(state.submitted[action.payload.projectAddress] || []),
                values._timesheetId,
              ],
        },
        projects: {
          ...state.projects,
          [payload.projectAddress]: {
            ...state.projects[payload.projectAddress],
            blockNumber: payload.blockNumber,
            timeSubmitted: `${
              parseInt(
                state.projects[action.payload.projectAddress].timeSubmitted ||
                  "0",
                10
              ) + parseInt(values._millisecs, 10)
            }`,
          },
        },
      };
    case "CREATE_ENTRY":
      return {
        ...state,
        timeEntries: {
          ...state.timeEntries,
          [action.payload.id]: {
            millisecs: 0,
            notes: "",
            state: 0,
            projectAddress: Object.keys(state.projects)[0],
            id: action.payload.id,
            worker: state.account,
          },
        },
        days: {
          ...state.days,
          [action.payload.day]: [
            ...(state.days[action.payload.day] || []),
            action.payload.id,
          ],
        },
      };
    case "UPDATE":
      return state.timeEntries[action.payload.id].state === 0
        ? {
            ...state,
            timeEntries: {
              ...state.timeEntries,
              [action.payload.id]: {
                ...state.timeEntries[action.payload.id],
                ...action.payload,
              },
            },
          }
        : state;
  }

  // For now, don't handle any actions
  // and just return the state given to us.
  return state;
}

const sagaMiddleware = createSagaMiddleware();

const composeEnhancers =
  (process.browser && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
const store = createStore<State, Action, null, null>(
  reducer,
  composeEnhancers(applyMiddleware(sagaMiddleware), persistState())
);

sagaMiddleware.run(rootSaga);

export default store;
