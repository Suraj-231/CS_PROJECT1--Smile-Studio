import { useState, useEffect } from "react";
import { useBook } from "../hooks/use-book";
import { Calendar } from "~/components/ui/calendar";
import { ServiceCard, DentistCard, DetailCard } from "./cards";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { Ban, Clock, UserCircle2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
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

export function ServiceForm() {
  const [query, setQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState(SERVICES);
  const book = useBook();
  useEffect(() => {
    if (query) {
      const filteredServices = SERVICES.filter((service) =>
        service.title.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredServices(filteredServices);
    } else {
      setFilteredServices(SERVICES);
    }
  }, [query]);

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

      <div className="grid sm:grid-cols-3 px-4 gap-4">
        {filteredServices.map((service) => (
          <ServiceCard key={service.id} props={service} />
        ))}
      </div>
    </div>
  );
}

export function DentistForm() {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-muted-foreground text-center">
        Select your preferred dentist.
      </p>
      <div className="flex gap-20">
        {DENTISTS.map((dentist) => (
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

      <div className="grid grid-cols-2 gap-1">
        {book.serviceType ? (
          <DetailCard
            props={{
              icon: <UserCircle2 size={15} />,
              title: "Service",
              value: book.serviceType.title,
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
