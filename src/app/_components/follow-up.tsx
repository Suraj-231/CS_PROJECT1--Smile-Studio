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
    date: date.toISOString(),
    startTime,
    service: {
      id: service.id,
      priority: service.priority ?? 0,
      name: service.name,
    },
  });

  async function handleConfirmFollowUp() {
    if (!followUp || !service) return;
    await createFollowUp.mutateAsync({
      dentist,
      date: date.toISOString(),
      startTime,
      service,
    });
  }

  // Signal the parent once the query settles so it can swap the skeleton out
  useEffect(() => {
    if (!isLoading && !readyCalled.current) {
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
        <div className=" gap-2 flex flex-col items-center">
          <h2 className="text-lg font-semibold text-center">
            Recommended Follow-Up
          </h2>
        </div>
        <p className="text-sm text-muted-foreground ">
          Based on your appointment, we suggest scheduling a follow-up with{" "}
          <span className="font-medium text-foreground">
            Dr. {dentist.name}.
          </span>{" "}
          You can confirm or skip this for now.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Your follow-up appointment for{" "}
          <span className="font-medium text-foreground">{service.name}</span> is
          scheduled for{" "}
          <span className="text-primary underline font-medium">
            {followUpDate?.toLocaleDateString("en-US", { dateStyle: "long" })}
          </span>{" "}
          at{" "}
          <span className="text-primary underline font-medium">
            {startTime.slice(0, 5)}
          </span>
          .
        </p>
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

      {/*  Suggested slot summary card */}
      {/*<div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Suggested slot
        </p>

        <div className="flex items-center gap-3">
          <CalendarCheck className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm font-medium">
            {followUpDate
              ? followUpDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "No suggestion available"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm font-medium">
            {followUp?.startTime ?? startTime}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <UserCheck className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm font-medium">Dr. {dentist.name}</span>
        </div>
      </div>*/}

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
