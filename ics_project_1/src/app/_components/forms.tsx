import { useState, useEffect } from "react";
import { useBook } from "../hooks/use-book";
import { Calendar } from "~/components/ui/calendar";
import { ServiceCard, DentistCard, DetailCard } from "./cards";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { Ban, Clock, UserCircle2, CirclePlus } from "lucide-react";
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
import { UploadButton, UploadDropzone } from "~/utils/uploadthing";

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

const DENTISTS = [
  {
    id: 1,
    name: "Mtume Owino",
    specialty: "Comprehensive Oral Health & Diagnostics",
    description:
      "Dr. Omondi is a dedicated general practitioner who focuses on building a trusted foundation for long-term oral hygiene. Her practice specializes in thorough clinical examinations, advanced digital X-ray diagnostics, cavity prevention, and painless restorative fillings. Known for her calm and thorough approach, she excels at helping anxious patients feel entirely at ease while teaching practical preventative care routines.",
    image: "",
  },
  {
    id: 2,
    name: "Dr. Faraj Patel ",
    specialty: "Root Canal Therapy & Root Canal Retreatment",
    description:
      "Dr. Patel is a micro-endodontic specialist focused entirely on saving damaged, decayed, or severely traumatized teeth. By utilizing cutting-edge rotary instruments and precise apex locator technology, he transforms complex root canal therapies into highly efficient, comfortable, and predictable procedures. His clinical precision targets severe internal infections to eliminate constant throbbing pain and preserve natural teeth.",
    image: "",
  },
  {
    id: 3,
    name: "Dr. Chloe Mwangi",
    specialty: "Advanced Surgical Extractions & Impacted Wisdom Teeth",
    description:
      "Dr. Mwangi is a highly skilled oral surgeon specializing in the management and surgical removal of deeply impacted teeth, complex bone-grafted extractions, and trauma recovery. Backed by extensive clinical experience, she handles cases where space shortages cause wisdom teeth to trap or partially erupt beneath the gumline. Her structural expertise guarantees smooth surgical execution, minimal recovery periods, and exceptional patient care.",
    image: "",
  },
];
const SERVICES = [
  {
    id: 1,
    title: "General Cleaning",
    description:
      "Routine clinical check-ups, digital X-rays, deep cleanings, and protective fillings to maintain optimal long-term oral hygiene.",
    completionTime: "1 hour",
  },
  {
    id: 2,
    title: "Root Canal",
    description:
      "Specialized micro-treatments to eliminate internal tooth infections, relieve persistent throbbing pain, and save the natural tooth from extraction.",
    completionTime: "1 hour 30 mins",
  },
  {
    id: 3,
    title: "Wisdom Tooth Removal",
    description:
      "Advanced surgical removal of damaged, decayed, or deeply trapped impacted wisdom teeth to prevent gum infections and protect neighboring teeth.",
    completionTime: "2 hours",
  },
  {
    id: 4,
    title: "Dentures",
    description:
      "Premium custom-fitted full or partial dental prosthetics designed to restore natural speech, chewing function, and a complete smile after tooth loss.",
    completionTime: "2 hours 30 mins",
  },
];
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
  description: string | null;
  estimatedTime: string;
}
export function ServiceForm() {
  const [query, setQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState<ServiceType[]>([]);
  const { data: services } = api.services.getAll.useQuery();
  useEffect(() => {
    if (query && services) {
      const filteredServices = services.filter((service) =>
        service.name.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredServices(filteredServices);
    } else if (services) {
      setFilteredServices(services);
    } else {
      setFilteredServices([]);
    }
  }, [query, services]);

  return (
    <div className="px-10 grid gap-4">
      <p className="text-muted-foreground text-center">Select a service.</p>
      <InputGroup className="px-5">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a service..."
        />
        <InputGroupAddon align="inline-end  ">
          {filteredServices.length} services
        </InputGroupAddon>
      </InputGroup>

      <div className="flex flex-col px-4 gap-4">
        {filteredServices.map((service) => (
          <ServiceCard key={service.id} props={service} />
        ))}
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
      <div className="flex gap-20">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="p-8 rounded-lg" />
            ))
          : dentists?.map((dentist) => (
              <DentistCard key={dentist.id} props={dentist} />
            ))}
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
  const bookingsByDentist = api.apps.getByDentistId.useQuery(
    { id: book.dentist?.id },
    { enabled: !!book.dentist?.id },
  );
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
          modifiersClassNames={{
            booked: "bg-gray-50 text-gray-300 rounded-md",
          }}
          disabled={{
            before: new Date(),
            dayOfWeek: [0],
          }}
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
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-center">
        Kindly confirm your appointment details.
      </p>

      <div className="grid grid-cols-2 gap-1 text-center">
        {book.serviceType ? (
          <DetailCard
            props={{
              icon: <UserCircle2 size={15} />,
              title: "Service",
              value: book.serviceType.name,
            }}
          />
        ) : (
          <div className="col-span-2">You have not selected a service.</div>
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
          <div className="col-span-2">You have not selected a start time.</div>
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
          <div className="col-span-2">You have not selected a dentist.</div>
        )}
      </div>
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
    e.preventDefault();
    setLoading(true);
    try {
      // upload the selected file first (if present) and set imageUrl
      if (selectedFile && !formData.imageUrl) {
        try {
          const uploadedUrl = await uploadFileToUploadThing(selectedFile);
          if (uploadedUrl) {
            setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
          }
        } catch (err: any) {
          console.error("Upload failed", err);
          toast.error("Image upload failed");
          setLoading(false);
          return;
        }
      }

      if (!formData.name || !formData.imageUrl || !formData.description) {
        toast.error("Please fill out all fields");
        setLoading(false);
        return;
      }

      await createDentist.mutateAsync(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function uploadFileToUploadThing(file: File): Promise<string | null> {
    // Sends the file to the UploadThing route. The exact response shape depends on your UploadThing setup.
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/uploadthing", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    const data = await res.json();
    // Try a few common response shapes to extract the uploaded file URL
    // Adjust this to match your UploadThing response (e.g. data[0].url, data.files[0].url, etc.)
    const url =
      data?.[0]?.url ||
      data?.files?.[0]?.url ||
      data?.fileUrl ||
      data?.url ||
      null;

    return url;
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" className="bg-muted text-muted-foreground">
          <CirclePlus /> Add Dentist
        </Button>
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
            <Input
              type="text"
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    estimatedTime: "",
  });
  const createService = api.services.create.useMutation({
    onSuccess: () => {
      toast.success("Service added successfully");
      setFormData({ name: "", description: "", estimatedTime: "" });
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
      await createService.mutateAsync(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" className="text-muted-foreground bg-muted">
          <CirclePlus />
          Add a Service
        </Button>
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
            <Select
              value={formData.estimatedTime}
              onValueChange={(value) =>
                setFormData({ ...formData, estimatedTime: value })
              }
            >
              <SelectTrigger>
                <SelectValue
                  className="w-full"
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
