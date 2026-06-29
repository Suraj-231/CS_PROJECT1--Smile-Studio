import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  PenLineIcon,
  Trash,
  UserCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { ButtonGroup } from "~/components/ui/button-group";
import { Button } from "~/components/ui/button";
import Link from "next/link";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dialog,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";
import { AvatarFallback, Avatar, AvatarImage } from "~/components/ui/avatar";


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


export function EventCalendar() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const formattedQueryDate = useMemo(() => {
    // Create a date object set to the 1st day of that target month in UTC
    const dateObject = new Date(Date.UTC(selectedYear, selectedMonth, 1));
    return dateObject.toISOString();
  }, [selectedMonth, selectedYear]); // Recalculates only when month or year changes

  const {
    data: apps,
    isLoading: appsLoading,
    isError,
    error,
  } = api.apps.getAllByMonthAndYear.useQuery({
    date: formattedQueryDate,
  });

  useEffect(() => {
    if (isError && error) {
      toast.error("Failed to fetch appointments", {
        description: "Check your internet connection and try again.",
      });
    }
    console.log("This is not working");
  }, [isError, error]);

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

  return (
    <div className="flex flex-col items-center ">
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
      <div className="w-full rounded-md grid sm:grid-cols-7 grid-cols-3 grid-rows-5 gap-1 overflow-auto">
        {Array.from(
          { length: new Date(selectedYear, selectedMonth + 1, 0).getDate() },
          (_, i) => i + 1,
        ).map((day) => (
          <Dialog key={day}>
            <DialogTrigger
              className={`w-full h-24 ${day === today.getDate() && selectedMonth === today.getMonth() ? "bg-primary" : "bg-muted"} text-xs rounded-sm overflow-hidden flex flex-col`}
            >
              <div className="w-full text-muted-foreground bg-muted flex justify-between p-1 items-center">
                <div />
                {day}
              </div>
              <div className="grid grid-cols-3 p-1 gap-1">
                {apps
                  ?.filter((app) => app.date.getDate() === day)
                  ?.map((app, id) => (
                    <p
                      className="bg-primary p-1 text-xs text-white rounded-lg"
                      key={id}
                    >
                      {app.startTime.slice(0, 5)}
                    </p>
                  ))}
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Appointments on {selectedYear}-
                  {selectedMonth > 9
                    ? selectedMonth + 1
                    : `0${selectedMonth + 1}`}
                  -{day}
                </DialogTitle>
              </DialogHeader>
              <div className="grid">
                {apps
                  ?.filter((app) => app.date.getDate() === day)
                  .map((app, id) => (
                    <Event key={id} props={app} />
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
    appointmentId: number;
    date: Date;
    startTime: string;

    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
    dentist: {
      id: number;
      name: string;
    };
    service: {
      id: number;
      name: string;
    };
  };
}
export function Event(event: EventProps) {
  const { user, service, date, startTime, dentist, appointmentId } =
    event.props;
  const router = useRouter();
  return (
    <div className="cursor-pointer py-2 px-2 justify-between rounded-md hover:bg-muted flex items-center transition-all duration-300 p-1 text-xs">
      <div className="flex items-center gap-2">
        <Avatar>
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="">{user.name}</p>
          <p className="text-muted-foreground text-xs">{user.email}</p>
        </div>
      </div>
      <p className="text-muted-foreground">
        {service.name} - {dentist.name}
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Edit Appointment</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push(`admin/appointments/${appointmentId}`)}
            >
              <PenLineIcon className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive hover:text-destructive/80 ">
              <Trash className="mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
