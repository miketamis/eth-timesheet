import { eventChannel } from "redux-saga";
import { call, cancelled, put, take, fork, select } from "redux-saga/effects";
import createProjectContractInstance from "./createProjectContractInstance";
import { web3 } from "./web3";

function* contractSaga(contractAddress: string, fromBlock: number) {
  const chan = yield call(channel, contractAddress, fromBlock);
  try {
    while (true) {
      let contractEvent = yield take(chan);
      yield put({
        type: contractEvent.event,
        payload: {
          blockNumber: contractEvent.blockNumber,
          returnValues: contractEvent.returnValues,
          projectAddress: contractAddress,
        },
      });
    }
  } finally {
    if (yield cancelled()) {
      chan.close();
    }
  }
}

function channel(contractAddress: string, fromBlock: number) {
  return eventChannel((emitter) => {
    const contract = createProjectContractInstance(contractAddress);
    const sub = contract.events.allEvents({ fromBlock });
    const func = (err: Error, val) => {
      if (!val || err) {
        console.log("error", err);
        return;
      }
      emitter(err || val);
    };
    sub.subscribe(func);

    return () => {
      sub.unsubscribe(func);
    };
  });
}

function* contractListenerSaga() {
  const contractListeners: { [key: string]: boolean } = {};
  const projects = yield select((state) => Object.values(state.projects));

  for (let project of projects) {
    if (contractListeners[project.address]) {
      continue;
    }
    contractListeners[project.address] = yield fork(
      contractSaga,
      project.address,
      project.blockNumber
    );
  }
  while (true) {
    const action = yield take("ADD_PROJECT");
    if (contractListeners[action.payload.projectAddress]) {
      continue;
    }
    contractListeners[action.payload.projectAddress] = yield fork(
      contractSaga,
      action.payload.projectAddress,
      0
    );
  }
}

function* accountChangeSaga() {
  const chan = eventChannel((emitter) => {
    web3.eth.getAccounts((error, result) => {
      if (error) {
        console.log(error);
      } else {
        emitter(result[0] || "");
      }
    });
    window.ethereum.on("accountsChanged", function (accounts: [string]) {
      emitter(accounts[0] || "");
    });
    return () => {};
  });
  while (true) {
    let account = yield take(chan);
    yield put({
      type: "CHANGE_ACCOUNT",
      payload: {
        account,
      },
    });
  }
}

function* networkChangeSaga() {
  const chan = eventChannel((emitter) => {
    web3.currentProvider.publicConfigStore.on("update", emitter);
    return () => {};
  });
  while (true) {
    let network = yield take(chan);
    yield put({
      type: "CHANGE_NETWORK",
      payload: {
        network,
      },
    });
  }
}

export function* rootSaga() {
  yield fork(contractListenerSaga);
  yield fork(accountChangeSaga);
  yield fork(networkChangeSaga);
}
