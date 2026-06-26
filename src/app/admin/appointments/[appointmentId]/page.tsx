"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
export default function AppointmentPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const [newappointment, setNewAppointment] = useState({
    dentistId: 0,
    service: 0,
    date: "",
    startTime: "",
  });
  const { appointmentId } = use(params);
  const router = useRouter();

  const edit = api.apps.editAppointment.useMutation({
    onSuccess: () => {
      console.log("Appointment edited successfully.");
    },
  });

  return <div>{appointmentId}</div>;
}
