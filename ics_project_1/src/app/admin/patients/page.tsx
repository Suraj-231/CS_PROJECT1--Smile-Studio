"use client";
import { EllipsisVertical, Search } from "lucide-react";
import { api } from "~/trpc/react";
import { AddDentistForm, AddUserForm } from "~/app/_components/forms";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

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

import { useState, useEffect } from "react";
import { authClient } from "~/server/better-auth/client";
import { useDebounce } from "use-debounce";

interface UserType {
  id: string;
  name: string;
  email: string;
  role?: string | undefined;
}

export default function PatientPage() {
  const [selectedUser, setSelectedUser] = useState("");
  const [pageSize, setPageSize] = useState(10);
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
              users.map((user) => (
                <TableRow key={user.id}>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => setSelectedUser(user.id)}
                      >
                        <EllipsisVertical size={18} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Remove User</DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
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
