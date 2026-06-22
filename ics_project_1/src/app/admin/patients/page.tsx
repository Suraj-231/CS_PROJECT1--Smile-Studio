"use client";
import { Search } from "lucide-react";
import { api } from "~/trpc/react";
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

export default function CalendarPage() {
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [debouncedSearch] = useDebounce(search, 1000);

  const { data: users } = api.users.getWithSearch.useQuery({
    query: debouncedSearch,
    limit: pageSize,
  });

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1>Patients</h1>
          <p className="text-muted-foreground">View and manage all patients.</p>
        </div>

        <InputGroup className="w-80">
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
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users ? (
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
    </div>
  );
}
