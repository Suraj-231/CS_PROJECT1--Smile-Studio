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
import Link from "next/link";
import { ButtonGroup } from "~/components/ui/button-group";
import { ChevronRight, ChevronLeft, CheckCircle, CircleAlert, Loader2 } from "lucide-react";
import { useBook } from "../hooks/use-book";
import {authClient} from "~/server/better-auth/client";

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

type ConfirmedAppointment = {
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

export default function BookPage() {
  const {data:session, isPending} = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] =
    useState<ConfirmedAppointment | null>(null);
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
  const utils = api.useUtils();
  const createAppointment = api.apps.create.useMutation({
    onSuccess: () => {
      if (!book.dentist || !book.date || !book.startTime || !book.service) {
        setLoading(false);
        toast.error("Missing appointment details for follow-up.");
        return;
      }

      setConfirmedAppointment({
        dentist: book.dentist,
        date: book.date,
        startTime: book.startTime,
        service: book.service,
      });
      setFollowUpLoading(true);
      toast.success("Booking confirmed successfully!");
      utils.apps.getLatest.invalidate();
      setLoading(false);
      book.clear();
      setForm((prev) => prev + 1);
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
    setForm((prev) => prev + 1);
  }
  async function confirmAppointment() {
    if (!book.dentist || !book.date || !book.startTime || !book.service) {
      toast.error("Please fill out all fields before confirming.");
      return;
    }
    setLoading(true);

    await createAppointment.mutateAsync({
      dentist: book.dentist,
      localeDateForEmail: book.date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      date: book.date.toISOString(),
      startTime: book.startTime,
      service: book.service,
    });
  }
  useEffect(() => {
    console.log(followUpLoading);
  }, [followUpLoading]);

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
        if (!confirmedAppointment) {
          return null;
        }
        return (
          <FollowUp
            prevApp={confirmedAppointment}
            onReady={() => setFollowUpLoading(false)}
          />
        );
      default:
        return null;
    }
  }


  if(isPending){
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen">
        <Loader2 className="animate-spint text-primary" />
      </div>
    )
  }

  if(!session){
    return <div className="flex flex-col px-4 gap-4 items-center justify-center min-h-screen">
      <CircleAlert className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold">You must be signed in to book an appointment</h1>
      <p className="text-muted-foreground">Please sign in to continue.</p>
      <Link href="/auth/sign-in">
        <Button >Sign In</Button>
      </Link>
    </div>
  }

  return (
    <div className="min-h-screen p-6 pb-28">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        {/* Page header */}
        <div className="text-center">
          <h1 className="text-primary text-xl font-semibold">
            {form === 4 ? "You're all set!" : "Book your appointment"}
          </h1>
          {form === 4 && (
            <p className="text-muted-foreground mt-1 text-sm">
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
        <div ref={buttonGroupRef} className="fixed right-6 bottom-6 z-10">
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
