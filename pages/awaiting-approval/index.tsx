import { format } from "date-fns";
import { HTMLProps } from "react";
import { Provider, useSelector } from "react-redux";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { addressEqual } from "../../utils/addressEqual";
import createProjectContractInstance from "../../utils/createProjectContractInstance";
import { msToHhmm } from "../../utils/durationFormat";
import { addressShort, DAYS_TO_MS } from "../../utils/utils";
import store, { Project, State, TimeEntry } from "../time/store";

function TableData(props: HTMLProps<any>) {
  return <td {...props} className={`border px-4 py-2 ${props.className}`} />;
}

function Project({ address }: { address: string }) {
  const contract = createProjectContractInstance(address);

  const timeEntries = useSelector<State, TimeEntry[]>((state) =>
    state.submitted[address]
      ? state.submitted[address].map((id: string) => state.timeEntries[id])
      : []
  );
  const project = useSelector<State, Project>(
    (state) => state.projects[address]
  );
  const myAddress = useSelector<State, string>((state) => state.account);
  const isApprover = addressEqual(project.approver, myAddress);
  return (
    <div className="mb-4">
      <div>
        <div className="mx-auto w-full lg:w-9/12 max-w-xl text-black p-2 bg-blue-200 text-xs">
          <span className="text-lg">{project.name}</span> {address}
        </div>
      </div>
      <div className="mx-auto w-full lg:w-9/12 max-w-xl  bg-gray-400">
        {!isApprover && (
          <div className="p-1 bg-orange-300">
            Needs approval from {project.approver}
          </div>
        )}
        <table className="table-auto w-full">
          <thead>
            <th>Date</th>
            <th>Worker</th>
            <th>Time Worked</th>
            <th>Notes</th>
            {isApprover && <th>Approve</th>}
          </thead>
          {timeEntries.map((entry: TimeEntry) => {
            const timeEntryDate = new Date(
              parseInt(entry.day, 10) * DAYS_TO_MS
            );

            return (
              <tr className="bg-gray-200 p-4 w-full space-x-8">
                <TableData>{format(timeEntryDate, "MM/dd/yyyy")}</TableData>
                <TableData>
                  {entry.worker === myAddress
                    ? "me"
                    : addressShort(entry.worker)}
                </TableData>
                <TableData>{msToHhmm(entry.millisecs)}</TableData>
                <TableData>{entry.notes}</TableData>
                {isApprover && (
                  <TableData>
                    <Button
                      green
                      disabled={!isApprover}
                      onClick={() =>
                        contract.methods
                          .approveTimeEntry(entry.id)
                          .send({ from: myAddress })
                      }
                    >
                      Approve
                    </Button>
                  </TableData>
                )}
              </tr>
            );
          })}
        </table>
        {timeEntries.length === 0 && (
          <div className="mx-auto p-4">
            This project has no time entries awaiting approval
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectList() {
  const projects = useSelector<State, string[]>((state) =>
    Object.keys(state.projects)
  );

  return (
    <div className="p-4">
      {projects.map((project) => (
        <Project address={project} />
      ))}
    </div>
  );
}

export default function AwaitingApproval() {
  return (
    <Provider store={store}>
      <Header />
      <ProjectList />
    </Provider>
  );
}
