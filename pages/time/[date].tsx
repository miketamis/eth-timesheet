import { isValid } from "date-fns";
import { parse } from "date-fns";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Button from "../../components/Button";
import { Provider, useSelector } from "react-redux";
import store, { Project, State, TimeEntry } from "../../utils/store";

import Header from "../../components/Header";
import createProjectContractInstance from "../../utils/createProjectContractInstance";
import { web3 } from "../../utils/web3";
import { hhmmToMs, msToHhmm } from "../../utils/durationFormat";
import StateEmoji from "../../components/StateEmoji";
import { addressEqual } from "../../utils/addressEqual";
import Input from "../../components/Input";
import { dateFormat, DAYS_TO_MS } from "../../utils/utils";
import DayTabs from "../../components/DayTabs";

function useDateFromRouter() {
  const router = useRouter();
  const date = router.query.date || dateFormat(new Date());
  const dateObj = parse(
    Array.isArray(date) ? date.join("") : date,
    "yyyy-MM-dd",
    new Date()
  );
  useEffect(() => {
    if (!isValid(dateObj)) {
      router.push("/time/" + dateFormat(new Date()));
    }
  }, [dateObj]);
  return isValid(dateObj) ? dateObj : new Date();
}

var ID = () => {
  return web3.utils.randomHex(32);
};

function TimeEntryRow({ id, currentDate }: { id: string; currentDate: Date }) {
  const timeEntry = useSelector<State, TimeEntry>(
    (state) => state.timeEntries[id]
  );
  const myAddress = useSelector<State, string>((state) => state.account);

  const [noteInput, setNoteInput] = useState(timeEntry.notes);

  const [timeInput, setTimeInput] = useState(msToHhmm(timeEntry.millisecs));
  useEffect(() => {
    setNoteInput(timeEntry.notes);
    setTimeInput(msToHhmm(timeEntry.millisecs));
  }, [timeEntry.millisecs, timeEntry.notes]);
  const projects = useSelector<State, Project[]>((state) =>
    Object.values(state.projects)
  );

  if (!addressEqual(timeEntry.worker, myAddress)) {
    return null;
  }
  return (
    <div className="bg-gray-200 space-x-4 w-full p-2">
      <StateEmoji state={timeEntry.state} />
      <Input
        value={timeInput}
        className="w-20"
        disabled={timeEntry.state !== 0}
        onBlur={() => {
          const millisecs = hhmmToMs(timeInput);
          store.dispatch({
            type: "UPDATE",
            payload: {
              id,
              millisecs,
            },
          });
          setTimeInput(msToHhmm(millisecs));
        }}
        onChange={({
          target: { value },
        }: React.ChangeEvent<HTMLInputElement>) => setTimeInput(value)}
        placeholder="notes"
      />

      <select
        className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        disabled={timeEntry.state !== 0}
        value={timeEntry.projectAddress}
        onChange={({ target }) => {
          store.dispatch({
            type: "UPDATE",
            payload: {
              id,
              projectAddress: target.value,
            },
          });
        }}
      >
        {projects.map((project) => {
          return <option value={project.address}>{project.name}</option>;
        })}
      </select>

      <Input
        disabled={timeEntry.state !== 0}
        onBlur={() => {
          store.dispatch({
            type: "UPDATE",
            payload: {
              id,
              notes: noteInput,
            },
          });
        }}
        value={noteInput}
        onChange={({
          target: { value },
        }: React.ChangeEvent<HTMLInputElement>) => setNoteInput(value)}
        placeholder="notes"
      />
      {timeEntry.state === 0 && (
        <Button
          className="m-4 mx-8"
          onClick={async () => {
            const contract = createProjectContractInstance(
              timeEntry.projectAddress
            );
            await contract.methods
              .submitTimeEntry(
                id,
                new web3.utils.BN(
                  Math.floor(currentDate.getTime() / DAYS_TO_MS)
                ),
                new web3.utils.BN(timeEntry.millisecs),
                timeEntry.notes
              )
              .send({ from: myAddress });
          }}
        >
          Submit
        </Button>
      )}
    </div>
  );
}

function DayList({ currentDate }: { currentDate: Date }) {
  const timeEntryIds = useSelector<State, string[]>(
    (state) => state.days[Math.floor(currentDate.getTime() / DAYS_TO_MS)] || []
  );
  const account = useSelector<State, string>((state) => state.account);

  return (
    <div className="mx-auto w-full max-w-xl">
      <div>
        {timeEntryIds.map((timeEntryId: string) => (
          <TimeEntryRow currentDate={currentDate} id={timeEntryId} />
        ))}
      </div>
      {!account && (
        <div className="text-lg p-4">Connect to view/add time entries</div>
      )}
      <Button
        disabled={!account}
        green
        className="w-full"
        onClick={() =>
          store.dispatch({
            type: "CREATE_ENTRY",
            payload: {
              id: ID(),
              day: Math.floor(currentDate.getTime() / DAYS_TO_MS),
            },
          })
        }
      >
        Add
      </Button>
    </div>
  );
}

export default function Timesheet() {
  const dateObj = useDateFromRouter();

  return (
    <Provider store={store}>
      <Header />
      <DayTabs currentDate={dateObj} />
      <DayList currentDate={dateObj} />
    </Provider>
  );
}
