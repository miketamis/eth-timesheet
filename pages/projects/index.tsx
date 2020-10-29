import { HTMLProps, useEffect, useState } from "react";
import { Provider, useSelector } from "react-redux";
import Header from "../../components/Header";
import createProjectContractInstance from "../../utils/createProjectContractInstance";
import genericComponentFactory from "../../utils/genericComponentFactory";
import store, { Project, State } from "../../utils/store";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { msToHhmm } from "../../utils/durationFormat";

function ProjectCard({ address }: { address: string }) {
  const project = useSelector<State, Project>(
    (state) => state.projects[address]
  );

  return (
    <div className="p-4 text-xs bg-gray-200 mb-4">
      <span className="text-xl p-2">{project.name}</span>
      {address}
      <div className="text-base p-2 space-x-8">
        <span>📤 {msToHhmm(project.timeSubmitted || "0")}</span>
        <span>✅ {msToHhmm(project.timeApproved || "0")}</span>
      </div>
    </div>
  );
}

function useInput(defaultValue: string) {
  const [value, setValue] = useState(defaultValue);
  return {
    value,
    onChange({ target }: React.ChangeEvent<HTMLInputElement>) {
      setValue(target.value);
    },
  };
}

const Card = (props: HTMLProps<any>) => (
  <div
    {...props}
    className={`m-4 p-4 rounded shadow-md space-y-4 ${props.className}`}
  ></div>
);

function CreateProject() {
  const nameInput = useInput("");
  const myAddress = useSelector<State, string>((state) => state.account);

  return (
    <Card>
      <h2>Create new Generic Project</h2>

      <Input {...nameInput} placeholder="Project Name"></Input>
      <Button
        disabled={!myAddress}
        onClick={() => {
          genericComponentFactory()
            .methods.createProject(nameInput.value)
            .send({ from: myAddress })
            .on("receipt", (res) => {
              //    res.to;
              store.dispatch({
                type: "ADD_PROJECT",
                payload: {
                  projectAddress:
                    res.events.NewProject.returnValues._projectAddress,
                  name: res.events.NewProject.returnValues._name,
                  approver: res.events.NewProject.returnValues._approver,
                },
              });
            });
        }}
      >
        Create Project
      </Button>
    </Card>
  );
}

async function getNameAndApprover(projectAddress: string, myAddress: string) {
  const contract = createProjectContractInstance(projectAddress, myAddress);
  const [name, approver] = await Promise.all([
    contract.methods.name().call(),
    contract.methods.approver().call(),
  ]);
  return {
    name,
    approver,
  };
}

function AddProject() {
  const contractAddressInput = useInput("");
  const [error, setError] = useState(false);
  const myAddress = useSelector<State, string>((state) => state.account);

  useEffect(() => {
    setError(false);
  }, [contractAddressInput.value]);

  return (
    <Card>
      <h2 className="">Import existing Project</h2>
      <Input
        error={error}
        {...contractAddressInput}
        placeholder="Contract Address"
      ></Input>
      <Button
        onClick={async () => {
          try {
            const { name, approver } = await getNameAndApprover(
              contractAddressInput.value,
              myAddress
            );
            store.dispatch({
              type: "ADD_PROJECT",
              payload: {
                projectAddress: contractAddressInput.value,
                name,
                approver,
              },
            });
          } catch (e) {
            setError(true);
          }
        }}
      >
        Add Project
      </Button>
    </Card>
  );
}
function ProjectsList() {
  const projects = useSelector((state) => Object.keys(state.projects));
  return (
    <>
      <div className="bg-blue-200">
        <div className="mx-auto w-full lg:w-9/12 max-w-xl text-black p-2">
          Projects
        </div>
      </div>
      <div className="mx-auto w-full lg:w-9/12 max-w-xl">
        <div className="py-4">
          {projects.map((project) => (
            <ProjectCard address={project}></ProjectCard>
          ))}
        </div>
        <div className="flex">
          <AddProject />

          <CreateProject />
        </div>
      </div>
    </>
  );
}

export default function AwaitingApproval() {
  return (
    <Provider store={store}>
      <Header />
      <ProjectsList />
    </Provider>
  );
}
