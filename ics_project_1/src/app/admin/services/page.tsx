"use client";

import { AddServiceForm } from "~/app/_components/forms";
import { ServiceCardReadOnly } from "~/app/_components/cards";
import { api } from "~/trpc/react";
export default function ServicesPage() {
  const { data: services, isLoading: loading } = api.services.getAll.useQuery();
  return (
    <div className="flex flex-col   gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h1>Services</h1>
          <p className="text-muted-foreground">
            Manage the clinics services here.
          </p>
        </div>
        <AddServiceForm />
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          services?.map((service) => (
            <ServiceCardReadOnly key={service.id} props={service} />
          ))
        )}
      </div>
    </div>
  );
}
