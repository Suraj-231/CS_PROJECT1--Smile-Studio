import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ButtonGroup } from "~/components/ui/button-group";
import { Button } from "~/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dialog,
} from "~/components/ui/dialog";

const SERVICES = [
  {
    id: 1,
    title: "General Cleaning",
    description:
      "Routine clinical check-ups, digital X-rays, deep cleanings, and protective fillings to maintain optimal long-term oral hygiene.",
    completionTime: "1 hour",
  },
  {
    id: 2,
    title: "Root Canal",
    description:
      "Specialized micro-treatments to eliminate internal tooth infections, relieve persistent throbbing pain, and save the natural tooth from extraction.",
    completionTime: "1 hour 30 mins",
  },
  {
    id: 3,
    title: "Wisdom Tooth Removal",
    description:
      "Advanced surgical removal of damaged, decayed, or deeply trapped impacted wisdom teeth to prevent gum infections and protect neighboring teeth.",
    completionTime: "2 hours",
  },
  {
    id: 4,
    title: "Dentures",
    description:
      "Premium custom-fitted full or partial dental prosthetics designed to restore natural speech, chewing function, and a complete smile after tooth loss.",
    completionTime: "2 hours 30 mins",
  },
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const TEST_APPS = [
  {
    id: 1,
    userId: "usr_01j0h7b2x1m6r9v4s8a1p7wqz",
    dentistId: 1,
    service: 1,
    date: "2026-06-23",
    startTime: "2026-06-23T08:00:00.000Z",
    createdAt: "2026-06-20T09:30:15.123Z",
    updatedAt: "2026-06-20T09:30:15.123Z",
  },
  {
    id: 2,
    userId: "usr_01j0h7b5k2p4m8v7w2b3x9nml",
    dentistId: 2,
    service: 2,
    date: "2026-06-23",
    startTime: "2026-06-23T09:30:00.000Z",
    createdAt: "2026-06-19T14:22:10.456Z",
    updatedAt: "2026-06-19T14:22:10.456Z",
  },
  {
    id: 3,
    userId: "usr_01j0h7b8y9t1x4m3k7r8q2wps",
    dentistId: 1,
    service: 4,
    date: "2026-06-23",
    startTime: "2026-06-23T11:00:00.000Z",
    createdAt: "2026-06-21T08:11:45.000Z",
    updatedAt: "2026-06-21T08:11:45.000Z",
  },
  {
    id: 4,
    userId: "usr_01j0h7c1v5m3w9k2p4r7b8xtq",
    dentistId: 3,
    service: 3,
    date: "2026-06-23",
    startTime: "2026-06-23T14:00:00.000Z",
    createdAt: "2026-06-18T11:05:32.789Z",
    updatedAt: "2026-06-18T11:30:00.112Z",
  },
  {
    id: 5,
    userId: "usr_01j0h7c4x2n7m5k9w3p1b8vrc",
    dentistId: 2,
    service: 2,
    date: "2026-06-24",
    startTime: "2026-06-24T08:30:00.000Z",
    createdAt: "2026-06-22T07:45:19.000Z",
    updatedAt: "2026-06-22T07:45:19.000Z",
  },
  {
    id: 6,
    userId: "usr_01j0h7b2x1m6r9v4s8a1p7wqz",
    dentistId: 1,
    service: 1,
    date: "2026-06-24",
    startTime: "2026-06-24T10:00:00.000Z",
    createdAt: "2026-06-20T10:00:22.000Z",
    updatedAt: "2026-06-20T10:00:22.000Z",
  },
  {
    id: 7,
    userId: "usr_01j0h7c7m3k9p1w5v4r2b8xtn",
    dentistId: 3,
    service: 3,
    date: "2026-06-24",
    startTime: "2026-06-24T11:30:00.000Z",
    createdAt: "2026-06-17T16:40:11.555Z",
    updatedAt: "2026-06-17T16:40:11.555Z",
  },
  {
    id: 8,
    userId: "usr_01j0h7caq8w2m4k7p9v3b5xrt",
    dentistId: 1,
    service: 1,
    date: "2026-06-24",
    startTime: "2026-06-24T15:00:00.000Z",
    createdAt: "2026-06-21T13:14:15.000Z",
    updatedAt: "2026-06-21T13:14:15.000Z",
  },
  {
    id: 9,
    userId: "usr_01j0h7cdx5k2p9w4m3v7b1nqp",
    dentistId: 2,
    service: 2,
    date: "2026-06-25",
    startTime: "2026-06-25T09:00:00.000Z",
    createdAt: "2026-06-20T11:24:03.111Z",
    updatedAt: "2026-06-20T11:24:03.111Z",
  },
  {
    id: 10,
    userId: "usr_01j0h7cgv2m8p4w9k1r5b7xtw",
    dentistId: 3,
    service: 3,
    date: "2026-06-25",
    startTime: "2026-06-25T10:30:00.000Z",
    createdAt: "2026-06-19T09:05:44.000Z",
    updatedAt: "2026-06-19T09:05:44.000Z",
  },
  {
    id: 11,
    userId: "usr_01j0h7b5k2p4m8v7w2b3x9nml",
    dentistId: 1,
    service: 2,
    date: "2026-06-25",
    startTime: "2026-06-25T13:30:00.000Z",
    createdAt: "2026-06-22T06:12:00.000Z",
    updatedAt: "2026-06-22T06:12:00.000Z",
  },
  {
    id: 12,
    userId: "usr_01j0h7cjq7n3w1k9m5v4b2xps",
    dentistId: 2,
    service: 2,
    date: "2026-06-25",
    startTime: "2026-06-25T16:00:00.000Z",
    createdAt: "2026-06-21T15:32:10.888Z",
    updatedAt: "2026-06-21T15:32:10.888Z",
  },
  {
    id: 13,
    userId: "usr_01j0h7cmw9k1p4v5m3r7b2xtq",
    dentistId: 1,
    service: 1,
    date: "2026-06-26",
    startTime: "2026-06-26T08:00:00.000Z",
    createdAt: "2026-06-20T14:55:33.000Z",
    updatedAt: "2026-06-20T14:55:33.000Z",
  },
  {
    id: 14,
    userId: "usr_01j0h7cpz2m4k8w1p9v3b5xnm",
    dentistId: 3,
    service: 3,
    date: "2026-06-26",
    startTime: "2026-06-26T09:30:00.000Z",
    createdAt: "2026-06-18T10:44:12.000Z",
    updatedAt: "2026-06-18T10:44:12.000Z",
  },
  {
    id: 15,
    userId: "usr_01j0h7csx5n9w2m7k4p1b8vrl",
    dentistId: 2,
    service: 2,
    date: "2026-06-26",
    startTime: "2026-06-26T11:00:00.000Z",
    createdAt: "2026-06-21T11:19:50.123Z",
    updatedAt: "2026-06-21T11:19:50.123Z",
  },
  {
    id: 16,
    userId: "usr_01j0h7b8y9t1x4m3k7r8q2wps",
    dentistId: 1,
    service: 1,
    date: "2026-06-26",
    startTime: "2026-06-26T14:30:00.000Z",
    createdAt: "2026-06-22T08:02:15.000Z",
    updatedAt: "2026-06-22T08:02:15.000Z",
  },
  {
    id: 17,
    userId: "usr_01j0h7cvm3w7k9p4v1r2b8xtz",
    dentistId: 3,
    service: 3,
    date: "2026-06-29",
    startTime: "2026-06-29T08:30:00.000Z",
    createdAt: "2026-06-19T13:21:04.000Z",
    updatedAt: "2026-06-19T13:21:04.000Z",
  },
  {
    id: 18,
    userId: "usr_01j0h7cyq8m2k5w7p9v4b1nps",
    dentistId: 1,
    service: 2,
    date: "2026-06-29",
    startTime: "2026-06-29T10:00:00.000Z",
    createdAt: "2026-06-21T16:50:44.222Z",
    updatedAt: "2026-06-21T16:50:44.222Z",
  },
  {
    id: 19,
    userId: "usr_01j0h7d2x5k8p1w4m3v7b9xtw",
    dentistId: 2,
    service: 2,
    date: "2025-06-29",
    startTime: "2026-06-29T13:00:00.000Z",
    createdAt: "2026-06-22T07:10:12.000Z",
    updatedAt: "2026-06-22T07:10:12.000Z",
  },
  {
    id: 20,
    userId: "usr_01j0h7d5m2n4k9w1p7v3b8xnm",
    dentistId: 3,
    service: 3,
    date: "2026-06-29",
    startTime: "2026-06-29T15:30:00.000Z",
    createdAt: "2026-06-20T12:05:19.000Z",
    updatedAt: "2026-06-20T12:30:45.000Z",
  },
];

export function EventCalendar() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  function handleDecrementMonth() {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  }

  function handleIncrementMonth() {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  }

  console.log(
    TEST_APPS.filter(
      (app) => app.date === `${selectedYear}-0${selectedMonth + 1}-29`,
    ),
  );
  return (
    <div className="flex flex-col items-center h-full">
      <div className="w-full">
        <ButtonGroup className={`items-center mb-4 justify-self-center`}>
          <Button
            onClick={handleDecrementMonth}
            variant={
              today.getMonth() === selectedMonth &&
              today.getFullYear() === selectedYear
                ? "default"
                : "outline"
            }
          >
            <ChevronLeft />
          </Button>
          <Button
            variant={
              today.getMonth() === selectedMonth &&
              today.getFullYear() === selectedYear
                ? "default"
                : "outline"
            }
          >
            {MONTHS[selectedMonth]} {selectedYear}
          </Button>
          <Button
            onClick={handleIncrementMonth}
            variant={
              today.getMonth() === selectedMonth &&
              today.getFullYear() === selectedYear
                ? "default"
                : "outline"
            }
          >
            <ChevronRight />
          </Button>
        </ButtonGroup>
      </div>
      <div className="w-full rounded-md grid grid-cols-7 grid-rows-5 gap-1">
        {Array.from(
          { length: new Date(selectedYear, selectedMonth + 1, 0).getDate() },
          (_, i) => i + 1,
        ).map((day) => (
          <Dialog key={day}>
            <DialogTrigger className="w-full h-24 bg-muted text-xs rounded-sm overflow-hidden flex flex-col">
              <div className="w-full text-muted-foreground bg-muted flex justify-between p-1 items-center">
                <div />
                {day}
              </div>
              <div className="grid grid-cols-3 p-1 gap-1">
                {TEST_APPS.filter(
                  (app) =>
                    app.date === `${selectedYear}-0${selectedMonth + 1}-${day}`,
                )

                  .map((app) => (
                    <p
                      className="bg-primary p-1 text-xs text-white rounded-lg"
                      key={app.id}
                    >
                      {new Date(app.startTime).toLocaleTimeString().slice(0, 5)}
                    </p>
                  ))}
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Appointments on {day}</DialogTitle>
              </DialogHeader>
              <div>
                {TEST_APPS.filter(
                  (app) =>
                    app.date === `${selectedYear}-0${selectedMonth + 1}-${day}`,
                ).map((app) => (
                  <Event
                    key={app.id}
                    props={{
                      title: SERVICES[app.service]?.title ?? "",
                      date: app.date,
                      startTime: app.startTime,
                    }}
                  />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}

interface EventProps {
  props: {
    title: string;
    date: string;
    startTime: string;
  };
}
export function Event(props: EventProps) {
  const { title, date, startTime } = props.props;
  return (
    <div className="text-white cursor-pointer hover:shadow-xs transition-all duration-300 p-1 rounded-md text-xs bg-primary">
      <p>{new Date(startTime).toLocaleTimeString().slice(0, 5)}</p>
    </div>
  );
}
