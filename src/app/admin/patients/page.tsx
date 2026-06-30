"use client";
import {
  EllipsisVertical,
  Loader2,
  PencilLine,
  Search,
  ShieldUserIcon,
  TrashIcon,
  CalendarIcon,
  Clock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { api } from "~/trpc/react";
import { AddDentistForm, AddUserForm } from "~/app/_components/forms";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  InputGroupAddon,
  InputGroupInput,
  InputGroup,
} from "~/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "~/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";

import { useState, useEffect, Fragment } from "react";
import { authClient } from "~/server/better-auth/client";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";

interface UserType {
  id: string;
  name: string;
  email: string;
  role?: string | undefined;
}

export default function PatientPage() {
  const utils = api.useUtils();
  const [selectedUser, setSelectedUser] = useState("");
  const [activeUserId, setActiveUserId] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [debouncedSearch] = useDebounce(search, 1000);

  const { data: users, isLoading: usersLoading } =
    api.users.getWithSearch.useQuery({
      query: debouncedSearch,
      limit: pageSize,
    });

  const { data: dentists, isLoading: loadingDentists } =
    api.dentists.getAll.useQuery();

  const { data: userData, isLoading: userDataLoading } =
    api.users.getUserDataByUserId.useQuery(
      { userId: selectedUser },
      { enabled: !!selectedUser },
    );

  return (
    <div className="flex flex-col">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h1>Patients</h1>
          <p className="text-muted-foreground">View and manage all patients.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-start md:items-center">
          <InputGroup className="w-full md:w-80">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search for a user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <span>{totalUsers > 0 && `${totalUsers} patients`}</span>
            </InputGroupAddon>
          </InputGroup>

          <AddUserForm />
        </div>
      </div>

      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Settings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="p-5 rounded-lg" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="p-5 rounded-lg" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="p-5 rounded-lg" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="p-5 rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : users ? (
              users.map((user) => {
                const isExpanded = selectedUser === user.id;
                return (
                  <Fragment key={user.id}>
                    {/* Main row */}
                    <TableRow>
                      <TableCell className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage
                            src={user.image ?? undefined}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" className="text-xs">
                              <TrashIcon size={18} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove User</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to remove this user? This
                                action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose>Cancel</DialogClose>
                              <Button
                                variant="destructive"
                                onClick={async () => {
                                  await authClient.admin.removeUser({
                                    userId: user.id,
                                  });
                                  utils.invalidate();
                                }}
                              >
                                Remove
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          onClick={() =>
                            setSelectedUser((prev) =>
                              prev === user.id ? "" : user.id,
                            )
                          }
                          variant={isExpanded ? "default" : "outline"}
                        >
                          <PencilLine size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expandable detail row */}
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableCell colSpan={4} className="p-0">
                        <div
                          className={`grid transition-all duration-300 ${
                            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="flex flex-col gap-4 border-b bg-muted/30 px-4 py-4 sm:flex-row">
                              {userDataLoading ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    Loading user data…
                                  </span>
                                </div>
                              ) : (
                                <>
                                  {/* Account info */}
                                  <div className="flex min-w-48 flex-col gap-2">
                                    <p className="text-xs tracking-wide text-muted-foreground">
                                      Account
                                    </p>
                                    <div className="flex flex-col gap-1.5">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5 shrink-0 " />
                                        <span>{user.email}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 " />
                                        <span className="capitalize">
                                          {user.role ?? "user"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                                        <span>
                                          Joined{" "}
                                          {new Date(
                                            user.createdAt,
                                          ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Appointments */}
                                  <div className="flex flex-2 flex-col gap-2">
                                    <p className="text-xs tracking-wide text-muted-foreground">
                                      Appointments
                                      {userData ? ` (${userData.length})` : ""}
                                    </p>
                                    {!userData || userData.length === 0 ? (
                                      <p className="text-xs text-muted-foreground">
                                        No appointments found.
                                      </p>
                                    ) : (
                                      <div className="grid grid-cols-2 gap-1">
                                        {userData.map(
                                          ({ appointments: appt }) => (
                                            <div
                                              key={appt.id}
                                              className={`flex gap-2 w-52 items-center text-xs p-1 rounded-full ${appt.date > new Date() ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                                            >
                                              <span className="flex items-center gap-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                {new Date(
                                                  appt.date,
                                                ).toLocaleDateString("en-US", {
                                                  weekday: "short",
                                                  month: "short",
                                                  day: "numeric",
                                                  year: "numeric",
                                                })}
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {appt.startTime?.slice(0, 5)}
                                              </span>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-2 ">
                                    <p className="text-xs text-muted-foreground">
                                      Edit User Information
                                    </p>
                                    <div className="flex flex-col gap-1">
                                      <Input
                                        placeholder="Enter a new password..."
                                        className="h-6 py-2 px-4 text-xs"
                                        value={password}
                                        onChange={(e) =>
                                          setPassword(e.target.value)
                                        }
                                      />
                                      <Button
                                        className="h-6 text-xs"
                                        onClick={async () => {
                                          try {
                                            authClient.admin.setUserPassword({
                                              userId: selectedUser,
                                              newPassword: password,
                                            });
                                            toast.success(
                                              "Password updated successfully",
                                            );
                                          } catch (error) {
                                            console.error(error);
                                            toast.error(
                                              "Failed to update password",
                                            );
                                          } finally {
                                            setPassword("");
                                          }
                                        }}
                                      >
                                        Save new password
                                      </Button>
                                    </div>
                                    <DropdownMenuSeparator />
                                    {/*<Button onClick={() => {
                                        authClient.admin.
                                      }}>

                                      </Button>*/}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell className="text-center text-muted-foreground w-full">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col  md:flex-row md:justify-between items-start md:items-center mt-20 gap-4">
        <div className="mb-1">
          <h1>Dentists</h1>
          <p className="text-muted-foreground">View and manage all dentists.</p>
        </div>

        <AddDentistForm />
      </div>
      <div className="overflow-auto">
        {loadingDentists ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="p-8 rounded-lg w-full mb-1" />
          ))
        ) : dentists ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell className="">Description</TableCell>
                <TableCell className="text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dentists.map((dentist) => (
                <TableRow key={dentist.id}>
                  <TableCell>{dentist.name}</TableCell>
                  <TableCell className="text-xs  text-muted-foreground">
                    {dentist.description
                      ? dentist.description.slice(0, 110) + "..."
                      : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-muted-foreground hover:text-primary">
                        <EllipsisVertical size={18} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive">
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-xs text-muted-foreground">
            No dentists found.
          </div>
        )}
      </div>
    </div>
  );
}
