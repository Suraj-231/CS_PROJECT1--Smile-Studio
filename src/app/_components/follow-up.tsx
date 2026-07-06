"use client";
import { api } from "~/trpc/react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { CalendarCheck, Clock, UserCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { redirect } from "next/navigation";

interface FollowUpProps {
  prevApp: {
    dentist: {
      id: number;
      name: string;
    };
    date: Date;
    startTime: string;
    service: {
      id: number;
      priority: number | null;
      name: string;
      estimatedTime: number;
    };
  };
  onReady: () => void;
}

export function FollowUp({ prevApp, onReady }: FollowUpProps) {
  const { dentist, date, startTime, service } = prevApp;
  const readyCalled = useRef(false);

  const createFollowUp = api.apps.create.useMutation({
    onSuccess: () => {
      toast.success("Follow-up created successfully");
      redirect("/profile");
    },
    onError: (error) => {
      toast.error("Failed to create follow-up", { description: error.message });
    },
  });

  const { data: followUp, isLoading } = api.apps.getFollowUp.useQuery({
    dentist,
    date: new Date(date).toISOString(),
    startTime,
    service: {
      id: service.id,
      priority: service.priority ?? 0,
      name: service.name,
    },
  });

  async function handleConfirmFollowUp() {
    if (!followUp || !service || !followUpDate) return;
    await createFollowUp.mutateAsync({
      dentist,
      localeDateForEmail: date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      date: followUpDate.toISOString(),
      startTime,
      service,
    });
  }

  // Signal the parent once the query settles so it can swap the skeleton out
  useEffect(() => {
    if (!isLoading && !readyCalled.current) {
      console.log(
        "followUp",
        "isLoading",
        isLoading,
        "readyCalled",
        readyCalled.current,
      );
      readyCalled.current = true;
      onReady();
    }
  }, [isLoading, onReady]);

  const followUpDate = followUp?.followUpDate
    ? new Date(followUp.followUpDate)
    : null;

  return (
    <div className="flex flex-col gap-6 ">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-semibold text-center">
            System Recommended Follow-up
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            The system recommends a follow-up for appointment{" "}
            <span className="font-medium text-foreground">{service.name}</span>{" "}
            on{" "}
            <span className="font-medium text-foreground">
              {date.toLocaleDateString("en-US", { dateStyle: "long" })}
            </span>{" "}
            to a new date of{" "}
            <span className="font-medium text-primary underline">
              {followUpDate?.toLocaleDateString("en-US", {
                dateStyle: "long",
              })}
            </span>
            .
          </p>
        </div>

        {/* <p className="text-center text-sm text-muted-foreground">
          Recommended time: <span className="font-medium text-foreground">Dr. {dentist.name}</span> at{" "}
          <span className="font-medium text-primary underline">
            {followUpDate?.toLocaleDateString("en-US", { dateStyle: "long" })}
          </span>{" "}
          at{" "}
          <span className="font-medium text-primary underline">
            {startTime.slice(0, 5)}
          </span>
          .
        </p> */}
      </div>

      {/* Calendar — highlights the suggested date */}
      {followUpDate && (
        <Calendar
          mode="single"
          defaultMonth={followUpDate}
          selected={followUpDate}
          modifiers={{
            booked: [followUpDate],
          }}
          modifiersClassNames={{
            booked: "border-2 border-primary  rounded-md font-bold",
          }}
          disabled={[{ before: new Date() }, { dayOfWeek: [0, 6] }]}
          className="mx-auto rounded-lg border"
        />
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Link href="/profile">
          <Button variant="outline">Skip for now</Button>
        </Link>
        <Link href="/profile">
          <Button onClick={handleConfirmFollowUp} variant="default">
            <CalendarCheck className="h-4 w-4" />
            Confirm follow-up
          </Button>
        </Link>
      </div>
    </div>
  );
}
