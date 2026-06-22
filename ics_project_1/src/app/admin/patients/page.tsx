"use client";
import { Search } from "lucide-react";
import {
  InputGroupAddon,
  InputGroupInput,
  InputGroup,
} from "~/components/ui/input-group";
import { useState } from "react";
import { authClient } from "~/server/better-auth/client";

export default function CalendarPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<[] | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  async function searchUsers() {
    const { data: users, error } = await authClient.admin.listUsers({
      query: {
        searchValue: search,
        searchField: "name",
        searchOperator: "contains",
        limit: 10,
        offset: 10,
        sortBy: "name",
        sortDirection: "desc",
        // filterField: "email",
        // filterValue: "hello@example.com",
        filterOperator: "eq",
      },
    });
    if (users) {
      console.log(users);
      setTotalUsers(users.total);
    }
    if (error) console.error(error);
  }
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
            onKeyDown={(e) => e.key === "Enter" && searchUsers()}
            onBlur={searchUsers}
          />
          <InputGroupAddon>
            <span>{totalUsers > 0 && `${totalUsers} patients`}</span>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div></div>
    </div>
  );
}
