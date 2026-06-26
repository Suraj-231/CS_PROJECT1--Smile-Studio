"use client";
import { AddServiceForm } from "~/app/_components/forms";
import { ServiceCardReadOnly } from "~/app/_components/cards";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
export default function ServicesPage() {
  const { data: services, isLoading: loading } = api.services.getAll.useQuery();
  return (
    <div className="gap-4 flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1>Services</h1>
          <p className="text-muted-foreground">
            Manage the clinics services here.
          </p>
        </div>
        <AddServiceForm />
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="p-4 rounded-lg w-full" />
            ))
          : services?.map((service) => (
              <ServiceCardReadOnly key={service.id} props={service} />
            ))}
      </div>
    </div>
  );
}
