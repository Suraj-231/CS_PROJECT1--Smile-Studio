"use client";

import { Button } from "~/components/ui/button";

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

export default function BookPage() {
  const [loading, setLoading] = useState(false);
  const book = useBook();
  const [form, setForm] = useState(0);

  async function confirmAppointment() {
    setLoading(true);
    try {
      book.submitBooking({
        dentist: book.dentist,
        date: book.date,
        startTime: book.startTime,
        serviceType: book.serviceType,
      });
    } catch (error) {
      console.log(error);
    }
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
    <div className="flex flex-col items-center gap-8 p-4 ">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-primary text-xl">Book your appointment</h1>
      </div>

      <div className="w-full max-w-3xl relative">
        <div className="w-full pb-20">{renderForm()}</div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-between w-80 items-center">
          <div className="flex items-center gap-2">
            {Array.from({ length: form + 1 }).map((_, i) => (
              <div key={i} className="w-4 h-2 bg-primary rounded-full"></div>
            ))}
          </div>
          <ButtonGroup>
            <Button onClick={() => setForm(form - 1)} disabled={form === 0}>
              <ChevronLeft />
            </Button>
            {form === 3 ? (
              <Button onClick={confirmAppointment} disabled={loading}>
                {loading ? "Confirming appointment..." : "Confirm Appointment"}
              </Button>
            ) : (
              <Button onClick={() => setForm(form + 1)} disabled={form === 3}>
                <ChevronRight />
              </Button>
            )}
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
}
