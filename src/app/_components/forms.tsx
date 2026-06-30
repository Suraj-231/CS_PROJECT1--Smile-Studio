import { useState, useEffect } from "react";
import { useBook } from "../hooks/use-book";
import { Calendar } from "~/components/ui/calendar";
import { uploadFilesFromServer } from "~/lib/uploadthing";
import { ServiceCard, DentistCard, DetailCard } from "./cards";
import { Alert, AlertTitle } from "~/components/ui/alert";
import {
  Ban,
  Clock,
  UserCircle2,
  CirclePlus,
  CalendarIcon,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";

import { authClient } from "~/server/better-auth/client";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
} from "~/components/ui/dialog";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";

const TIMES = [
  { value: "08:30:00", label: "08:30 AM" },
  { value: "09:00:00", label: "09:00 AM" },
  { value: "09:30:00", label: "09:30 AM" },
  { value: "10:00:00", label: "10:00 AM" },
  { value: "10:30:00", label: "10:30 AM" },
  { value: "11:00:00", label: "11:00 AM" },
  { value: "11:30:00", label: "11:30 AM" },
  { value: "12:00:00", label: "12:00 PM" },
  { value: "12:30:00", label: "12:30 PM" },
  { value: "13:00:00", label: "01:00 PM" },
  { value: "13:30:00", label: "01:30 PM" },
  { value: "14:00:00", label: "02:00 PM" },
  { value: "14:30:00", label: "02:30 PM" },
  { value: "15:00:00", label: "03:00 PM" },
  { value: "15:30:00", label: "03:30 PM" },
  { value: "16:00:00", label: "04:00 PM" },
  { value: "16:30:00", label: "04:30 PM" },
  { value: "17:00:00", label: "05:00 PM" },
];

interface ServiceType {
  id: number;
  name: string;
  priority: number | null;
  description: string | null;
  estimatedTime: string | null;
}
export function ServiceForm() {
  const [query, setQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState<ServiceType[]>([]);
  const { data: services, isLoading } = api.services.getAll.useQuery();
  const book = useBook();

  useEffect(() => {
    if (query && services) {
      setFilteredServices(
        services.filter((s) =>
          s.name.toLowerCase().includes(query.toLowerCase()),
        ),
      );
    } else {
      setFilteredServices(services ?? []);
    }
  }, [query, services]);

  return (
    <div className="flex flex-col gap-4 px-10">
      {/* Header */}
      <div className="text-center">
        {/*<p className="text-sm text-muted-foreground">
          Choose the service you need. You can search by name.
        </p>*/}
        {book.service && (
          <p className="mt-1 text-xs font-medium text-primary">
            ✓ {book.service.name} selected
          </p>
        )}
      </div>

      {/* Search */}
      {/*<InputGroup>
        <InputGroupAddon>
          <Search className="h-4 w-4" />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a service..."
        />
        <InputGroupAddon align="inline-end">
          <span className="text-xs text-muted-foreground">
            {filteredServices.length} found
          </span>
        </InputGroupAddon>
      </InputGroup>*/}

      {/* Grid of cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 4 }, (_, i) => i + 1).map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <ServiceCard key={service.id} props={service} />
          ))
        ) : (
          <p className="col-span-2 py-6 text-center text-sm text-muted-foreground">
            No services match your search.
          </p>
        )}
      </div>
    </div>
  );
}

export function DentistForm() {
  const { data: dentists, isLoading } = api.dentists.getAll.useQuery();
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-muted-foreground text-center">
        Select your preferred dentist.
      </p>
      <div className=" grid sm:grid-cols-3 gap-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-40 h-40 rounded-lg" />
          ))
        ) : dentists ? (
          dentists.length > 0 ? (
            dentists?.map((dentist) => (
              <DentistCard key={dentist.id} props={dentist} />
            ))
          ) : (
            <div className="text-center text-muted-foreground">
              No dentists found.
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

export function CalendarForm() {
  const book = useBook();

  const {
    data: bookings,
    isLoading: bookingsloading,
    isError: bookingsError,
  } = api.apps.getAll.useQuery();
  const bookingsByDentist = api.apps.getByDentistId.useQuery({
    id: book.dentist?.id ?? 0,
  });
  return (
    <div>
      <p className="text-muted-foreground text-center">
        Select a date and time.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 px-8">
        <Calendar
          mode="single"
          defaultMonth={book.date}
          selected={book.date}
          onSelect={(value) => book.setDate(value)}
          modifiers={{
            booked: bookings?.map((b) => new Date(b.date)),
          }}
          modifiersClassNames={
            {
              // booked: "border rounded-md",
            }
          }
          disabled={[{ before: new Date() }, { dayOfWeek: [0, 6] }]}
          className="rounded-lg mx-auto "
        />
        <div className="grid grid-auto-fit items-center mt-5">
          {book.date?.toLocaleDateString() ===
            new Date().toLocaleDateString() &&
          (new Date().getHours() < 8 || new Date().getHours() > 17) ? (
            <Alert className="text-center text-red-500">
              <Ban />
              <AlertTitle>
                You cannot book an appointment for today as our working hours
                are from 8:30 AM to 5:00 PM.
              </AlertTitle>
            </Alert>
          ) : null}
          <div className="grid grid-cols-3 gap-2">
            {book.date?.toLocaleDateString() === new Date().toLocaleDateString()
              ? TIMES.filter(
                  (t) =>
                    !bookingsByDentist?.data?.some(
                      (b) => b.startTime === t.value,
                    ),
                )
                  .filter(
                    (t) =>
                      parseInt(t.value.substring(0, 2)) > new Date().getHours(),
                  )
                  .map((t, i) => (
                    <Button
                      onClick={() => book.setStartTime(t.value)}
                      key={i}
                      variant="outline"
                      className={`${book.startTime === t.value ? "bg-primary text-white" : "bg-white"} mr-2 cursor-pointer shadow-none hover:border-primary hover:bg-primary hover:text-white mb-2`}
                    >
                      {t.label}
                    </Button>
                  ))
              : TIMES.filter(
                  (t) =>
                    !bookingsByDentist?.data?.some(
                      (b) => b.startTime === t.value,
                    ),
                ).map((t, i) => (
                  <Button
                    onClick={() => book.setStartTime(t.value)}
                    key={i}
                    variant="outline"
                    className={`${book.startTime === t.value ? "bg-primary text-white" : "bg-white"} mr-2 cursor-pointer shadow-none hover:border-primary hover:bg-primary hover:text-white mb-2`}
                  >
                    {t.label}
                  </Button>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConfirmationForm() {
  const book = useBook();
  return (
    <div className="flex flex-col gap-7 max-h-lvh mb-8">
      <p className="text-muted-foreground text-center">
        Kindly confirm your appointment details.
      </p>

      {book.service ? (
        <DetailCard
          props={{
            icon: <UserCircle2 size={15} />,
            title: "Service",
            value: book.service.name,
          }}
        />
      ) : (
        <div className="col-span-2 border-destructive bg-destructive/20 ">
          You have not selected a service.
        </div>
      )}
      {book.date ? (
        <DetailCard
          props={{
            icon: <CalendarIcon size={15} />,
            title: "Date",
            value: book.date.toLocaleDateString(),
          }}
        />
      ) : (
        <div className="col-span-2 border-destructive bg-destructive/20 ">
          You have not selected a date.
        </div>
      )}
      {book.startTime ? (
        <DetailCard
          props={{
            icon: <Clock size={15} />,
            title: "Start time",
            value: book.startTime,
          }}
        />
      ) : (
        <div className="col-span-2 border-destructive bg-destructive/20 ">
          You have not selected a start time.
        </div>
      )}
      {book.dentist ? (
        <DetailCard
          props={{
            icon: <UserCircle2 size={15} />,
            title: "Dentist",
            value: book.dentist.name,
          }}
        />
      ) : (
        <div className="col-span-2 border-destructive bg-destructive/20 ">
          You have not selected a dentist.
        </div>
      )}
    </div>
  );
}

export function AddUserForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "", // required
    password: "", // required
    name: "", // required
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const { data: newUser, error } =
      await authClient.admin.createUser(formData);
    if (error) {
      console.error(error.message);
      toast.error(error.message);
      setLoading(false);
      return;
    } else {
      console.log(`User ${newUser.user.name} has been added.`);
      toast.success(`User ${newUser.user.name} has been added.`);
    }
    setLoading(false);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="bg-muted text-muted-foreground">
          <CirclePlus />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new user.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-4 py-1">
          <div>
            <span>Email</span>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <span>Name</span>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <span>Password</span>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <Button disabled={loading} type="submit">
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DentistForm {
  name: string;
  imageUrl: string | undefined;
  description: string;
}

export function AddDentistForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DentistForm>({
    name: "",
    imageUrl: undefined,
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const utils = api.useUtils();
  const createDentist = api.dentists.create.useMutation({
    onSuccess: () => {
      toast.success("Dentist added successfully");
      setFormData({ name: "", imageUrl: undefined, description: "" });
    },
    onError: () => {
      toast.error("Failed to add dentist");
    },
    onMutate: () => {
      setLoading(true);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  async function handleAddDentist(e: React.FormEvent<HTMLFormElement>) {
    if (!selectedFile || !formData.name || !formData.description)
      toast.error("Error submitting form", {
        description: "Please fill in all fields.",
      });
    e.preventDefault();
    setLoading(true);
    try {
      const uploadedUrl = await uploadFilesFromServer(selectedFile);
      if (!uploadedUrl) {
        toast.error("No uploaded URL found!");
        return;
      }
      await createDentist.mutateAsync({
        name: formData.name,
        imageUrl: uploadedUrl,
        description: formData.description,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setFormData({
        name: "",
        imageUrl: "",
        description: "",
      });
      utils.dentists.getAll.invalidate();
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger className="bg-muted rounded-full px-4 py-1 flex items-center gap-2 text-md cursor-pointer text-muted-foreground">
        <CirclePlus size={16} /> Add Dentist
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Doctor</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new Doctor.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddDentist} className="flex flex-col gap-4">
          <div>
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                } else {
                  setSelectedFile(null);
                  setPreviewUrl(undefined);
                }
              }}
              className="block w-full"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="preview"
                className="mt-2 w-24 h-24 object-cover rounded-md"
              />
            )}
          </div>
          <div>
            <span>Name</span>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <span>Description</span>
            <textarea
              className="bg-muted w-full rounded-lg p-2"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Dentist"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddServiceForm() {
  const [loading, setLoading] = useState(false);
  const utils = api.useUtils();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "",
    estimatedTime: "",
  });
  const createService = api.services.create.useMutation({
    onSuccess: () => {
      utils.services.getAll.invalidate();
      toast.success("Service added successfully");
      setFormData({
        name: "",
        description: "",
        estimatedTime: "",
        priority: "",
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to add service");
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createService.mutateAsync({
        ...formData,
        priority: parseInt(formData.priority),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Dialog>
      <DialogTrigger className="text-muted-foreground flex gap-2 text-sm rounded-full p-2 items-center bg-muted">
        <CirclePlus size={18} />
        Add a Service
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Service</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new Service for patients.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <span>Name</span>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <span>Estimated Time</span>

            <div className="flex gap-4">
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue className="" placeholder="Select the priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">1 week</SelectItem>
                  <SelectItem value="14">2 weeks</SelectItem>
                  <SelectItem value="30">1 month</SelectItem>
                  <SelectItem value="180">6 months</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={formData.estimatedTime}
                onValueChange={(value) =>
                  setFormData({ ...formData, estimatedTime: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    className=""
                    placeholder="Select an estimated time"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">15m</SelectItem>
                  <SelectItem value="30m">30m</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="2 hours">2 hours</SelectItem>
                  <SelectItem value="2 hours 30min">2 hours 30min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <span>Description</span>
            <textarea
              rows={4}
              className="w-full bg-muted rounded-lg p-1"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Service"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  async function handleSignUp() {
    setLoading(true);
    if (!formData.email || !formData.password || !formData.name) {
      console.log("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        callbackURL: "/profile",
      });
    } catch (error) {
      toast.error("Error creating an account", {
        description: "Please try again.",
      });
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex flex-col gap-4 w-80 justify-self-center">
      <div className="text-center mb-4">
        <h1 className="text-xl ">Create an Account</h1>
        <p className="text-muted-foreground">
          To be able to book appointments, you will have to create an account
          first.
        </p>
      </div>
      <div className="flex flex-col gap-4 w-80">
        <div>
          <span>Name</span>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <span>Email</span>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div>
          <span>Password</span>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>

        <Button onClick={handleSignUp} disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  async function handleSignIn() {
    setLoading(true);
    try {
      await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: "/profile",
      });
    } catch (error) {
      toast.error("Error logging in.", { description: "Please try again." });
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 w-80 justify-self-center">
      <div className="text-center mb-4">
        <h1 className="text-xl ">Sign In</h1>
        <p className="text-muted-foreground">
          Welcome back! Please sign in to continue.
        </p>
      </div>
      <div>
        <span>Email</span>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div>
        <span>Password</span>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
      </div>

      <Button onClick={handleSignIn} disabled={loading}>
        {loading ? "Loading..." : "Submit"}
      </Button>
    </div>
  );
}

export function EditAppointmentForm({
  appointmentId,
}: {
  appointmentId: number;
}) {
  const book = useBook();
  const { data: allApps, isLoading: allAppsL } = api.apps.getAll.useQuery();
  const bookingsByDentist = api.apps.getByDentistId.useQuery(
    {
      id: book.dentist?.id ?? 0,
    },
    { enabled: !!book.dentist?.id },
  );
  const { data: dentists, isLoading: dentsistL } =
    api.dentists.getAll.useQuery();
  const { data: services, isLoading: servicesL } =
    api.services.getAll.useQuery();
  const { data: prevApp, isLoading: appL } = api.apps.getById.useQuery({
    appointmentId: appointmentId,
  });

  if (prevApp) {
    const app = prevApp[0];
    const formattedDate = app?.appointments.date
      ? new Date(app.appointments.date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

    return (
      <div className="flex flex-col gap-4">
        {/* Current appointment summary */}
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Current Appointment
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CirclePlus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">{app?.services.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <UserCircle2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{app?.dentists.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{app?.appointments.startTime?.slice(0, 5)}</span>
            </div>
          </div>
        </div>

        {/* Form header */}
        <div>
          <p className="text-sm font-medium">Update your appointment</p>
          <p className="text-xs text-muted-foreground">
            Change only the fields you need to update.
          </p>
        </div>

        {/* Dentist */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium">Dentist</label>
          <Select
            onValueChange={(value) =>
              book.setDentist({
                id: dentists?.find((d) => d.name === value)?.id ?? 0,
                name: value,
              })
            }
            value={book.dentist?.name || app?.dentists.name}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a dentist" />
            </SelectTrigger>
            <SelectContent>
              {dentists?.map((dentist) => (
                <SelectItem key={dentist.id} value={dentist.name}>
                  {dentist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Service */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium">Service</label>
          <Select
            onValueChange={(value) =>
              book.setService({
                id: services?.find((s) => s.name === value)?.id ?? 0,
                priority:
                  services?.find((s) => s.name === value)?.priority ?? 0,
                name: value,
              })
            }
            value={book.service?.name || app?.services.name}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services?.map((service) => (
                <SelectItem key={service.id} value={service.name}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium">Time</label>
          {bookingsByDentist.isLoading ? (
            <Skeleton className="h-9 w-full rounded-lg" />
          ) : (
            <Select onValueChange={(value) => book.setStartTime(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {book.date?.toLocaleDateString() ===
                new Date().toLocaleDateString()
                  ? TIMES.filter(
                      (t) =>
                        parseInt(t.value.substring(0, 2)) >
                        new Date().getHours(),
                    ).map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))
                  : TIMES.filter(
                      (t) =>
                        !bookingsByDentist?.data?.some(
                          (b) => b.startTime === t.value,
                        ),
                    ).map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium">Date</label>
          <Calendar
            mode="single"
            defaultMonth={
              app?.appointments.date
                ? new Date(app.appointments.date)
                : undefined
            }
            selected={book.date}
            onSelect={(value) => book.setDate(value)}
            modifiers={{
              booked: allApps?.map((a) => a.date),
            }}
            modifiersClassNames={{
              booked: "bg-muted",
            }}
            disabled={[{ before: new Date() }, { dayOfWeek: [0, 6] }]}
            className="mx-auto rounded-lg border"
          />
          <p className="text-xs text-muted-foreground">
            Weekends and past dates are unavailable.
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex min-h-32 items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }
}
