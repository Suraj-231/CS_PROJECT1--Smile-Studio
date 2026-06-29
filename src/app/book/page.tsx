"use client";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useState } from "react";
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

export default function BookPage() {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const book = useBook();
  const [form, setForm] = useState(0);

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
      toast.error("Failed to confirm booking. Please try again.", {
        description: error.message,
      });
      setLoading(false);
    },
  });

  if (!session) {
    redirect("/auth");
    return null;
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
    <div className="flex min-h-screen flex-col items-center gap-8 p-4">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-primary text-xl">
          {form === 4 ? "You're all set!" : "Book your appointment"}
        </h1>
        {form === 4 && (
          <p className="text-sm text-muted-foreground">
            Your appointment has been booked. See the follow-up suggestion
            below.
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div>{renderForm()}</div>
        {/* Hide the stepper nav once we reach the follow-up step */}
        {form < 4 && (
          <div className="flex w-full items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: form + 1 }, (_, i) => i + 1).map((step) => (
                <div key={step} className="h-2 w-4 rounded-full bg-primary" />
              ))}
            </div>
            <ButtonGroup>
              <Button
                variant={"outline"}
                onClick={() => setForm(form - 1)}
                disabled={form === 0}
              >
                <ChevronLeft />
              </Button>
              {form === 3 ? (
                <Button
                  variant={"default"}
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
                <Button
                  variant={"outline"}
                  onClick={() => setForm(form + 1)}
                  disabled={form === 3}
                >
                  <ChevronRight />
                </Button>
              )}
            </ButtonGroup>
          </div>
        )}
      </div>
    </div>
  );
}
