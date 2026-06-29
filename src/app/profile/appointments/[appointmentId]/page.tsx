"use client";
import { EditAppointmentForm } from "~/app/_components/forms";
import { use } from "react";
import { Button } from "~/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function EditAppointmentPage({
  params,
}: {
  params: Promise<{ appointmentId: number }>;
}) {
  const { appointmentId } = use(params);

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost">
          <ChevronLeft />
        </Button>
        <div>
          <h1 className="text-xl">Edit Appointment</h1>
          <p className="text-muted-foregroudn">
            You are currently editing an appointment.
          </p>
        </div>
      </div>

      <EditAppointmentForm appointmentId={appointmentId} />
    </div>
  );
}
