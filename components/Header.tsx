import { useRouter } from "next/router";
import Button from "./Button";
import Link from "next/link";
import { useSelector } from "react-redux";
import { addressShort } from "../utils/utils";
import { State } from "../pages/time/store";

export default function Header() {
  const router = useRouter();
  const myAddress = useSelector<State, string>((state) => state.account);
  const network = useSelector<State, { chainId?: string }>((state) => state.network);

  return (
    <div>
      <nav className="p-4 bg-blue-200 flex space-x-4">
        <h1 className="text-blue-700 text-2xl">Eth TimeSheet</h1>
        <Link href="/time">
          <Button active={router.pathname.startsWith("/time")}>Time</Button>
        </Link>
        <Link href="/awaiting-approval">
          <Button active={router.pathname.startsWith("/awaiting-approval")}>
            Awaiting Approvals
          </Button>
        </Link>
        <Link href="/projects">
          <Button active={router.pathname.startsWith("/projects")}>
            Projects
          </Button>
        </Link>
        {myAddress ? (
          <div className="bg-indigo-900 text-white rounded h-8 py-1 px-4">
            {addressShort(myAddress)}
          </div>
        ) : (
          <Button
            green
            onClick={() => {
              if (!window.ethereum) {
                alert(
                  "You must be using a web3 browser like Chrome + Metamask"
                );
                return;
              }
              window.ethereum.enable();
            }}
          >
            Connect
          </Button>
        )}
      </nav>
      {network.chainId !== "0x4" && (
        <div className="p-4 bg-red-400 text-xl">
          This dApp has been deployed to Rinkeby Ethereum Test net please switch
          to that network.
        </div>
      )}
    </div>
  );
}
