"use client";
import { Search } from "lucide-react";
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
import { useState, useEffect } from "react";
import { authClient } from "~/server/better-auth/client";

interface UserType {
  id: string;
  name: string;
  email: string;
  role?: string | undefined;
}

export default function CalendarPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserType[] | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  const pageSize = 10;
  const currentPage = 2;

  useEffect(() => {
    async function searchUsers() {
      const { data: users, error } = await authClient.admin.listUsers({
        query: {
          searchValue: search,
          searchField: "email",
          searchOperator: "contains",
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
          sortBy: "name",
          sortDirection: "desc",
          // filterField: "email",
          // filterValue: "hello@example.com",
        },
      });
      if (users) {
        console.log(users);
        setUsers(users.users);
        setTotalUsers(users.total);
      }
      if (error) console.error(error);
    }
    if (search.length > 3) searchUsers();
  }, [search]);

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
                  <TableCell>{user.name}</TableCell>
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
