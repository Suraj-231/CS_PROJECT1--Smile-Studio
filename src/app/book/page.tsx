"use client";

import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useState } from "react";
import {
  ServiceForm,
  DentistForm,
  CalendarForm,
  ConfirmationForm,
} from "../_components/forms";
import { ButtonGroup } from "~/components/ui/button-group";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useBook } from "../hooks/use-book";
import { useRouter } from "next/navigation";
export default function BookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const book = useBook();
  const [form, setForm] = useState(0);
  const createAppointment = api.apps.create.useMutation({
    onSuccess: () => {
      toast.success("Booking confirmed successfully!");
      setLoading(false);
      router.push("/profile");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to confirm booking. Please try again.");
      setLoading(false);
    },
  });

  async function confirmAppointment() {
    if (!book.dentist || !book.date || !book.startTime || !book.serviceType) {
      toast.error("Please fill out all fields before confirming.");
      return;
    }
    setLoading(true);

    await createAppointment.mutateAsync({
      dentist: book.dentist,
      date: book.date.toISOString(),
      startTime: book.startTime,
      service: book.serviceType,
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
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center gap-8 p-4 ">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-primary text-xl">Book your appointment</h1>
      </div>

      <div className="grid gap-4">
        <div className="">{renderForm()}</div>

        <div className=" pb-4 flex justify-between gap-4  w-full items-center">
          <div className="flex items-center gap-2">
            {Array.from({ length: form + 1 }).map((_, i) => (
              <div key={i} className="w-4 h-2 bg-primary rounded-full"></div>
            ))}
          </div>
          {form === 3 && (
            <Button
              className="bg-green-300 hover:bg-green-200 "
              onClick={confirmAppointment}
              disabled={loading}
            >
              {loading ? "Confirming..." : "Confirm"}
            </Button>
          )}
          <ButtonGroup>
            <Button onClick={() => setForm(form - 1)} disabled={form === 0}>
              <ChevronLeft />
            </Button>
            <Button onClick={() => setForm(form + 1)} disabled={form === 3}>
              <ChevronRight />
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
}
