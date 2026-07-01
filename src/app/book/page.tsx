"use client";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useState, useEffect, useRef, Fragment } from "react";
import { FollowUp } from "../_components/follow-up";
import {
  ServiceForm,
  DentistForm,
  CalendarForm,
  ConfirmationForm,
} from "../_components/forms";
import { ButtonGroup } from "~/components/ui/button-group";
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { useBook } from "../hooks/use-book";
import { redirect } from "next/navigation";
import { authClient } from "~/server/better-auth/client";

// Skeleton that mirrors the shape of the FollowUp form
function FollowUpSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-4 w-56" />
      </div>
      {/* Calendar */}
      <Skeleton className="h-64 w-full rounded-lg" />
      {/* Slot card */}
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-44" />
      </div>
      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
    </div>
  );
}

const STEPS = ["Service", "Dentist", "Schedule", "Confirm"] as const;

export default function BookPage() {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const book = useBook();
  const [form, setForm] = useState(0);
  const buttonGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (book.service ?? book.dentist?.id ?? book.date ?? book.startTime) {
      buttonGroupRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [book.service, book.dentist, book.date, book.startTime]);

  const createAppointment = api.apps.create.useMutation({
    onSuccess: () => {
      toast.success("Booking confirmed successfully!");
      setLoading(false);
      // Show the skeleton immediately while the follow-up query warms up
      setFollowUpLoading(true);
      setForm(4);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message);
      setLoading(false);
    },
  });

  // if (!session) {
  //   redirect("/auth");
  // }

  function checkFormStatus() {
    if (form === 0 && !book.service) {
      toast.error("Please select a service before proceeding.");
      setForm(0);
      return;
    }
    if (form === 1 && !book.dentist) {
      toast.error("Please select a dentist before proceeding.");
      setForm(1);
      return;
    }
    if (form === 2 && (!book.date || !book.startTime)) {
      toast.error("Please select a date and time before proceeding.");
      setForm(2);
      return;
    }

    setForm(form + 1);
  }
  async function confirmAppointment() {
    if (!book.dentist || !book.date || !book.startTime || !book.service) {
      toast.error("Please fill out all fields before confirming.");
      return;
    }
    setLoading(true);

    await createAppointment.mutateAsync({
      dentist: book.dentist,
      date: book.date.toISOString(),
      startTime: book.startTime,
      service: book.service,
    });
  }

  function renderForm() {
    switch (form) {
      case 0:
        return <ServiceForm />;
      case 1:
        return <DentistForm />;
      case 2:
        return <CalendarForm />;
      case 3:
        return <ConfirmationForm />;
      case 4:
        if (!book.dentist || !book.date || !book.startTime || !book.service) {
          return null;
        }
        return (
          <>
            {/* Skeleton sits on top while followUpLoading is true */}
            {followUpLoading && <FollowUpSkeleton />}

            {/*
             * FollowUp mounts immediately (hidden) so its tRPC query starts
             * running in the background. Once the query settles it calls
             * onReady, which clears followUpLoading and reveals the form.
             */}
            <div className={followUpLoading ? "hidden" : ""}>
              <FollowUp
                prevApp={{
                  dentist: book.dentist,
                  date: book.date,
                  startTime: book.startTime,
                  service: book.service,
                }}
                onReady={() => setFollowUpLoading(false)}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen p-6 pb-28">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        {/* Page header */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-primary">
            {form === 4 ? "You're all set!" : "Book your appointment"}
          </h1>
          {form === 4 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Your appointment has been booked. See the follow-up suggestion
              below.
            </p>
          )}
        </div>

        {/* Step indicator */}
        {form < 4 && (
          <div className="flex items-center justify-center">
            {STEPS.map((label, i) => (
              <Fragment key={label}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`h-1.5 w-10 rounded-sm transition-colors duration-300 ${
                      i <= form ? "bg-primary" : "bg-muted"
                    }`}
                  />
                  <span
                    className={`text-xs transition-colors duration-300 ${
                      i === form
                        ? "font-medium text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mb-4 h-px w-8 transition-colors duration-300 ${
                      i < form ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </Fragment>
            ))}
          </div>
        )}

        {/* Form content */}
        <div>{renderForm()}</div>
      </div>

      {/* ButtonGroup — fixed bottom-right */}
      {form < 4 && (
        <div ref={buttonGroupRef} className="fixed bottom-6 right-6 z-10">
          <ButtonGroup>
            <Button
              className="p-6"
              onClick={() => setForm(form - 1)}
              disabled={form === 0}
            >
              <ChevronLeft />
            </Button>
            {form === 3 ? (
              <Button
                className="p-6"
                onClick={confirmAppointment}
                disabled={loading}
              >
                {loading ? (
                  "Confirming..."
                ) : (
                  <>
                    Confirm
                    <CheckCircle />
                  </>
                )}
              </Button>
            ) : (
              <Button className="p-6" onClick={checkFormStatus}>
                <ChevronRight />
              </Button>
            )}
          </ButtonGroup>
        </div>
      )}
    </div>
  );
}
