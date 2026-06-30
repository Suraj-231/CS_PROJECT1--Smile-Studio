"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";

import { ButtonGroup } from "~/components/ui/button-group";
import {
  Book,
  Loader2,
  Settings,
  ChevronRight,
  LogOut,
  Calendar,
  RefreshCcw,
  Clock,
  ChevronLeft,
  Wrench,
  BookUserIcon,
  BookUser,
  Minus,
  PenLine,
  Trash,
  Recycle,
} from "lucide-react";
import { authClient } from "~/server/better-auth/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "~/components/ui/dialog";
import { resetPassword } from "better-auth/api";
import { appointments } from "~/server/db/schema";

const GRADIENTS = [
  { name: "modern iris", css: "from-[#667EEA] via-[#764BA2] to-[#AC92EC]" },
  { name: "vibrant mint", css: "from-[#43E97B] via-[#38F9D7] to-[#209CFF]" },
  { name: "sunset glow", css: "from-[#FBAB7E] via-[#F7CE68] to-[#F06292]" },
  { name: "electric cyan", css: "rom-[#4FACFE] via-[#00F2FE] to-[#43CBFF]" },
  { name: "cotton candy", css: "from-[#E0C3FC] via-[#8EC5FC] to-[#F8BBD0]" },
  { name: "coral blue", css: "from-[#1E3C72] via-[#2A5298] to-[#4286F4]" },
  { name: "fresh peach", css: "from-[#FF9A9E] via-[#FAD0C4] to-[#F9E79F]" },
  { name: "serene sky", css: "from-[#C2E9FB] via-[#A1C4FD] to-[#CE9FFC]" },
  { name: "morning mist", css: "from-[#A1FFCE] via-[#FAFFD1] to-[#FDFBFB]" },
  { name: "violent flame", css: "from-[#BB73E0] via-[#FF71B0] to-[#7E30E1]" },
];

export default function ProfilePage() {
  const [selectedRescheduledDate, setSelectedRescheduledDate] = useState({
    appointmentId: 0,
    date: "",
  });
  const [selectedApp, setSelectedApp] = useState({
    dentistId: 0,
    date: new Date(),
    startTime: "",
    ready: false,
  });
  const utils = api.useUtils();
  const [page, setPage] = useState(1);
  const currentOffset = (page - 1) * 5;

  const reschduleApp = api.apps.reschedule.useMutation({
    onSuccess: () => {
      toast.success("Appointment rescheduled successfully");
    },
    onError: () => {
      toast.error("Failed to reschedule appointment");
    },
  });
  const [gradient, setGradient] = useState(
    GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
  );
  const router = useRouter();
  const {
    data: rescheduledDates,
    isLoading: rescheduledLoading,
    isError: rescheduledError,
  } = api.apps.getRescheduledDateAndTime.useQuery(
    {
      dentistId: selectedApp.dentistId,
      date: selectedApp.date.toISOString(),
      startTime: selectedApp.startTime,
    },
    { enabled: selectedApp.ready },
  );
  const { data: session, isPending } = authClient.useSession();
  const {
    data: apps,
    isLoading: appsLoading,
    isError: appsError,
  } = api.apps.getForUser.useQuery({
    limit: 5,
    offset: currentOffset,
  });

  const deleteAppointment = api.apps.delete.useMutation({
    onSuccess: () => {
      toast.success("Appointment deleted successfully");
      utils.apps.getForUser.invalidate();
    },
    onError: () => {
      toast.error("Failed to delete appointment");
    },
  });

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    router.push("/auth");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex sm:flex-row flex-col items-center gap-4">
        <div className="border flex flex-col rounded-md p-2 w-80 h-96">
          <div
            className={`bg-gradient-to-br ${gradient?.css}  h-72 rounded-md`}
          />
          <Avatar size="lg" className="-mt-4">
            {session.user.image && (
              <AvatarImage src={session.user.image} alt={session.user.name} />
            )}
            <AvatarFallback>
              {session.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col mb-3">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl">{session.user.name}</h1>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-muted-foreground">
                      <Settings size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Profile Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setGradient(
                          GRADIENTS[
                            Math.ceil(Math.random() * GRADIENTS.length - 1)
                          ],
                        );
                      }}
                      variant="default"
                      className="cursor-pointer"
                    >
                      <RefreshCcw size={16} />
                      Change gradient
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => authClient.signOut()}
                      variant="destructive"
                      className="cursor-pointer"
                    >
                      <LogOut size={16} />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-xs text-muted-foreground ">
                {new Date(session.user.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground ">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex h-96 w-80 flex-col gap-3 overflow-y-auto rounded-lg border p-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Book size={14} />
              My Appointments
            </div>
            <ButtonGroup>
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
              >
                <ChevronLeft size={12} />
              </Button>
              {apps?.meta.count && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="text-xs"
                >
                  {page} / {Math.ceil(apps.meta.count / 5)}
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                disabled={!apps || apps.data.length < 5}
                onClick={() => setPage((old) => old + 1)}
              >
                <ChevronRight size={12} />
              </Button>
            </ButtonGroup>
          </div>

          {/* Appointment list */}
          <div className="flex flex-col gap-2">
            {appsLoading ? (
              Array.from({ length: 3 }, (_, i) => i + 1).map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))
            ) : !apps || apps.data.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Calendar size={28} className="text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">
                  No appointments yet.
                </p>
                <Link href="/book">
                  <Button size="sm" variant="outline" className="text-xs">
                    Book one now
                  </Button>
                </Link>
              </div>
            ) : (
              apps.data.map((app) => {
                const isUpcoming = new Date(app.date) >= new Date();

                if (isUpcoming) {
                  return (
                    <div
                      key={app.id}
                      className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3"
                    >
                      {/* Badge + actions */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                          <span className="h-1.5 w-1.5 rounded-sm bg-primary" />
                          Upcoming
                        </span>
                        <div className="flex items-center gap-2">
                          {/*<Link href={`profile/appointments/${app.id}`}>
                            <Button
                              size="xs"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <PenLine size={11} />
                            </Button>
                          </Link>*/}
                          <Dialog>
                            <DialogTrigger
                              onClick={() => {
                                setSelectedApp({
                                  dentistId: app.dentist.id,
                                  date: app.date,
                                  startTime: app.startTime,
                                  ready: true,
                                });
                              }}
                              className="text-muted-foreground"
                            >
                              <Recycle size={16} />
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Reschedule Appointment
                                </DialogTitle>
                                <DialogDescription>
                                  Rescheduling appointment on{" "}
                                  <span className="text-primary underline">
                                    {new Date(selectedApp.date).toLocaleString(
                                      "en-US",
                                      {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    )}
                                  </span>{" "}
                                  at
                                  <span className="text-primary underline">
                                    {` ${selectedApp.startTime.slice(0, 5)}`}
                                  </span>
                                </DialogDescription>
                                <p className="text-xs text-muted-foreground">
                                  Click on the date you want to reschedule to.
                                </p>
                              </DialogHeader>
                              {rescheduledLoading ? (
                                <div className="flex sm:flex-row flex-col items-center gap-2 w-full">
                                  <Skeleton className="p-3 w-full h-40 rounded-lg" />
                                  <Skeleton className="p-3 w-full h-40 rounded-lg" />
                                  <Skeleton className="p-3 w-full h-40 rounded-lg" />
                                </div>
                              ) : (
                                rescheduledDates?.suggestions.map((r, id) => (
                                  <div
                                    onClick={() =>
                                      setSelectedRescheduledDate({
                                        appointmentId: id,
                                        date: r.date.toISOString(),
                                      })
                                    }
                                    className={`p-3 w-full hover:cursor-pointer text-center rounded-lg ${id === selectedRescheduledDate.appointmentId ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                                    key={id}
                                  >
                                    <h1 className="text-xl">
                                      {new Date(r.date).toLocaleString(
                                        "en-US",
                                        {
                                          weekday: "short",
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        },
                                      )}
                                    </h1>
                                    <p className="text-sm">
                                      {r.startTime.slice(0, 5)}
                                    </p>
                                  </div>
                                ))
                              )}
                              <DialogFooter>
                                <DialogClose>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                {selectedRescheduledDate && (
                                  <Button
                                    onClick={async () => {
                                      await reschduleApp.mutateAsync({
                                        id: selectedRescheduledDate.appointmentId,
                                        date: selectedRescheduledDate.date,
                                      });
                                    }}
                                  >
                                    Confirm
                                  </Button>
                                )}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild className="text-destructive">
                              <Trash size={16} />
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Appointment</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this
                                  appointment?
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="ghost"
                                  onClick={() => setPage(page - 1)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={async () =>
                                    await deleteAppointment.mutateAsync({
                                      appointmentId: app.id,
                                      dentistId: app.dentist.id,
                                    })
                                  }
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      {/* Service name */}
                      <p className="text-sm font-semibold leading-none">
                        {app.service.name}
                      </p>

                      {/* Date + time */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(app.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {app.startTime.slice(0, 5)}
                        </span>
                      </div>

                      {/* Dentist */}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookUser size={11} />
                        {app.dentist.name}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors hover:bg-muted/50"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground/80">
                        {app.service.name}
                      </span>
                      <span className="text-muted-foreground">
                        {app.dentist.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 text-muted-foreground">
                      <span>
                        {new Date(app.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {app.startTime.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
