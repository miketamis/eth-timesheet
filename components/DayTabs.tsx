import { format, setDay } from "date-fns";
import { addDays, eachDayOfInterval } from "date-fns/esm";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTabState } from "reakit/ts";
import { dateFormat } from "../utils/utils";
import Button from "./Button";

export default function DayTabs({ currentDate }: { currentDate: Date }) {
  const router = useRouter();

  const tab = useTabState({ selectedId: dateFormat(currentDate) });
  const sunday = addDays(setDay(currentDate, 1, { weekStartsOn: 1 }), -1);

  useEffect(() => {
    if (tab.currentId !== dateFormat(currentDate)) {
      router.push("/time/" + tab.currentId);
    }
  }, [tab.currentId]);

  const days = eachDayOfInterval({ start: sunday, end: addDays(sunday, 8) });

  return (
    <div className="flex bg-blue-200">
      <div className="mx-auto w-full lg:w-9/12 max-w-xl flex">
        {days.map((date, index) => (
          <Button
            rounded={false}
            className={
              "flex-auto " +
              (dateFormat(date) === dateFormat(currentDate)
                ? "bg-blue-700"
                : "")
            }
            onClick={() => {
              router.push("/time/" + dateFormat(date));
            }}
          >
            {index === 0
              ? "<"
              : index === days.length - 1
              ? ">"
              : format(date, "eee")}
          </Button>
        ))}
      </div>
    </div>
  );
}
