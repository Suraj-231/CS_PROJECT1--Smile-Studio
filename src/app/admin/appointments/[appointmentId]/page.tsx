"use client";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { toast } from "sonner";
import {
  Calendar,
  CalendarClock,
  CalendarDays,
  Clock3,
  ChevronDown,
  IdCard,
  Mail,
  UserRound,
  Settings,
  Stethoscope,
  Trash2,
  WandSparkles,
  UserCircle,
  ChevronLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const formatDate = (value: Date | string) => {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatInputDate = (value: Date | string) => {
  const date = new Date(value);
  return date.toISOString().split("T")[0] ?? "";
};

const formatTime = (value: string) => {
  const [hours, minutes] = value.split(":");
  const hour = Number(hours ?? "0");
  const normalized = hour % 12 || 12;
  const period = hour >= 12 ? "pm" : "am";
  return `${normalized}:${minutes ?? "00"} ${period}`;
};

type GeneratedSuggestion = {
  id: number;
  date: Date;
  time: string;
};

const initialsFromName = (name?: string | null) => {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export default function AppointmentPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const router = useRouter();
  const { appointmentId } = use(params);
  const appointmentIdAsNumber = Number(appointmentId);
  const utils = api.useUtils();

  const [showGeneratedPanel, setShowGeneratedPanel] = useState(false);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<
    number | null
  >(null);

  // const {data:rescheduleData, isLoading: isRescheduleLoading} = api.apps.getRescheduledDateAndTime.useQuery(
  //   { date, time, dentistId, serviceId },
  //   { enabled: Number.isFinite(appointmentIdAsNumber) },
  // );
  const { data: app, isLoading } = api.apps.getById.useQuery(
    { appointmentId: appointmentIdAsNumber },
    { enabled: Number.isFinite(appointmentIdAsNumber) },
  );

  const appointmentRecord = app?.[0];

  const { data: rescheduleData, isLoading: isRescheduleLoading } =
    api.apps.getRescheduledDateAndTime.useQuery(
      {
        dentistId: appointmentRecord?.dentists.id ?? 0,
        date: appointmentRecord
          ? new Date(appointmentRecord.appointments.date).toISOString()
          : new Date().toISOString(),
        startTime: appointmentRecord?.appointments.startTime ?? "09:00:00",
      },
      {
        enabled: Boolean(appointmentRecord) && showGeneratedPanel,
      },
    );

  const generatedRescheduleDates = useMemo<GeneratedSuggestion[]>(() => {
    const suggestions = rescheduleData?.suggestions ?? [];
    return suggestions.map((suggestion, index) => ({
      id: index,
      date: new Date(suggestion.date),
      time: suggestion.startTime.slice(0, 5),
    }));
  }, [rescheduleData]);

  useEffect(() => {
    if (!showGeneratedPanel) {
      setSelectedSuggestionId(null);
    }
  }, [showGeneratedPanel]);

  const selectedSuggestion = useMemo(
    () =>
      generatedRescheduleDates.find(
        (suggestion) => suggestion.id === selectedSuggestionId,
      ) ?? null,
    [generatedRescheduleDates, selectedSuggestionId],
  );

  const updateAppointment = api.apps.update.useMutation({
    onSuccess: () => {
      void utils.apps.getById.invalidate({
        appointmentId: appointmentIdAsNumber,
      });
      toast.success("Appointment Rescheduled");
      setShowGeneratedPanel(false);
      setSelectedSuggestionId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Could not update appointment");
    },
  });

  const deleteAppointment = api.apps.delete.useMutation({
    onSuccess: () => {
      toast.success("Appointment Deleted");
      void utils.apps.getAllForSummary.invalidate();
      router.push("/admin/calendar");
    },
    onError: () => {
      toast.error("Could not delete appointment");
    },
  });

  const handleConfirmReschedule = () => {
    if (!appointmentRecord || !selectedSuggestion) return;

    updateAppointment.mutate({
      appointmentId: appointmentRecord.appointments.id,
      dentist: {
        id: appointmentRecord.dentists.id,
        name: appointmentRecord.dentists.name,
      },
      service: {
        id: appointmentRecord.services.id,
        name: appointmentRecord.services.name,
      },
      date: new Date(
        `${formatInputDate(selectedSuggestion.date)}T00:00:00.000Z`,
      ).toISOString(),
      startTime: `${selectedSuggestion.time}:00`,
    });
  };

  const handleDelete = () => {
    if (!appointmentRecord) return;
    deleteAppointment.mutate({
      appointmentId: appointmentRecord.appointments.id,
      dentistId: appointmentRecord.dentists.id,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-full p-4 bg-muted" />
        <Skeleton className="h-28 w-full rounded-full p-4 bg-muted" />
      </div>
    );
  }

  if (!appointmentRecord) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-muted p-6">
        <p className="text-sm text-muted-foreground">
          This appointment could not be found.
        </p>
      </div>
    );
  }

  const userInfo = (
    appointmentRecord as {
      user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };
    }
  ).user;

  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center gap-4">
      <div className="w-full flex items-center">
        <Button onClick={() => router.back()} variant="ghost">
          <ChevronLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl ">Editing appointment</h1>
          <p className="text-muted-foreground">
            You are currently editing {userInfo?.name ?? ""}'s{" "}
            {appointmentRecord.services.name} appointment.
          </p>
        </div>
      </div>
      {appointmentRecord.appointments.date < new Date() && (
        <div className="bg-muted text-muted-foreground border border-destructive/50 p-4 rounded-lg">
          <p className="text-sm ">
            This appointment has already passed.
          </p>
        </div>
      )}
      <div className="mx-auto flex max-w-6xl items-start justify-center gap-5">
        <section className="w-full max-w-2xl rounded-lg bg-muted p-5 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3  px-3 py-2">
                <Avatar size="lg">
                  <AvatarImage
                    src={userInfo?.image ?? undefined}
                    alt={userInfo?.name ?? "User"}
                  />
                  <AvatarFallback>
                    {initialsFromName(userInfo?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    {userInfo?.name ?? "Unknown User"}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail size={12} />
                    {userInfo?.email ?? "No email"}
                  </p>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button  type="button" variant="outline" className=" ">
                  <Settings size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border border-primary/20"
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                disabled={appointmentRecord.appointments.date < new Date()}
                onClick={() => setShowGeneratedPanel(true)}>
                  <WandSparkles size={14} />
                  Reschedule
                </DropdownMenuItem>
                {/*<DropdownMenuItem onClick={() => setShowGeneratedPanel(false)}>
                  <CalendarDays size={14} />
                  Hide Reschedule Panel
                </DropdownMenuItem>*/}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                disabled={appointmentRecord.appointments.date < new Date()}
                
                variant="destructive" onClick={handleDelete}>
                  <Trash2 size={14} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mx-auto mt-6 flex w-full max-w-md flex-col gap-3 text-sm">
            <h1 className="flex items-center mx-auto gap-2 text-2xl text-center text-primary ">
              <Stethoscope size={20} />
              {appointmentRecord.services.name}
            </h1>
            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-background/70 px-4 py-3">
              <div className="rounded-lg bg-primary/15 p-2 text-primary">
                <UserCircle size={16} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dentist</p>
                <p className="font-medium">{appointmentRecord.dentists.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-background/70 px-4 py-3">
              <div className="rounded-lg bg-primary/15 p-2 text-primary">
                <CalendarDays size={16} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Scheduled Date</p>
                <p className="font-medium">
                  {formatDate(appointmentRecord.appointments.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-background/70 px-4 py-3">
              <div className="rounded-lg bg-primary/15 p-2 text-primary">
                <Clock3 size={16} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Start Time</p>
                <p className="font-medium">
                  {formatTime(appointmentRecord.appointments.startTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-background/70 px-4 py-3">
              <div className="rounded-lg bg-primary/15 p-2 text-primary">
                <IdCard size={16} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Appointment Id</p>
                <p className="font-medium">
                  {appointmentRecord.appointments.id}
                </p>
              </div>
            </div>
          </div>
        </section>

        {showGeneratedPanel && (
          <aside className="w-full max-w-sm rounded-2xl border border-primary/20 bg-muted p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} />
              Generated Appointments
            </div>

            <div className="mt-3 flex max-h-[360px] flex-col gap-2 overflow-auto pr-1">
              {isRescheduleLoading && (
                <div className="rounded-xl border border-primary/20 bg-background/60 px-3 py-4 text-sm text-muted-foreground">
                  Generating Appointments...
                </div>
              )}

              {!isRescheduleLoading &&
                generatedRescheduleDates.length === 0 && (
                  <div className="rounded-xl border border-primary/20 bg-background/60 px-3 py-4 text-sm text-muted-foreground">
                    No Reschedule Suggestions Found.
                  </div>
                )}

              {generatedRescheduleDates.map((suggestion) => {
                const isSelected = selectedSuggestionId === suggestion.id;
                return (
                  <Button
                    key={suggestion.id}
                    type="button"
                    onClick={() => setSelectedSuggestionId(suggestion.id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-primary/20 bg-background/60"
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {formatDate(suggestion.date)}
                    </p>
                    <p
                      className={`text-xs ${
                        isSelected ? "text-white/90" : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(`${suggestion.time}:00`)}
                    </p>
                  </Button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-primary/30 bg-background"
                onClick={() => setShowGeneratedPanel(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                className="bg-primary text-white"
                disabled={!selectedSuggestion || updateAppointment.isPending}
                onClick={handleConfirmReschedule}
              >
                {updateAppointment.isPending ? "Confirming..." : "Confirm"}
              </Button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
