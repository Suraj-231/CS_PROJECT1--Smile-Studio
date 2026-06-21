import { useState, useEffect } from "react";
import { useBook } from "../hooks/use-book";
import { Calendar } from "~/components/ui/calendar";
import { ServiceCard, DentistCard } from "./cards";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { Ban } from "lucide-react";
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
      "At Smile Studio the average hygiene visit lasts about one hour, this enables our doctors check your gum health, the condition of your teeth and fillings, do a thorough cleaning and polishing and offer individualised preventive advice to help you stay healthy.",
    completionTime: "1 hour",
  },
  {
    id: 2,
    title: "Root Canal",
    description:
      "Teeth that require Root Canal treatment often, but not always, have symptoms. This can be any of the following: Constant throbbing or sharp pain, lingering sensitivity to hot or cold, discolouration of the tooth, swelling of the adjacent gums or tenderness of the tooth, pain on biting or chewing and a history of trauma. Sometimes there are no signs or symptoms and a diagnosis of infection is made by chance during clinical examination and/or when taking routine x-rays. ",
    completionTime: "1 hour 30 mins",
  },
  {
    id: 3,
    title: "Dentures",
    description:
      "Root canal treatment is required when a tooth becomes infected, presenting symptoms like constant throbbing or sharp pain, lingering sensitivity to heat or cold, discoloration, gum swelling, and tenderness during chewing, often following a history of trauma. However, because infections can also develop asymptomatically, a diagnosis is sometimes made entirely by chance during routine clinical examinations or X-ray screenings.",
    completionTime: "2 hours",
  },
  {
    id: 4,
    title: "Wisdom Tooth Removal",
    description:
      "Due to a lack of jaw space, wisdom teeth often become trapped or impacted, leading to partial eruption. These partially erupted teeth are difficult to clean, trapping food debris and bacteria that can cause cavities, localized decay of neighboring teeth, bad breath, and painful gum infections like pericoronitis.",
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
          <ServiceCard props={service} />
        ))}
      </div>
    </div>
  );
}

export function DentistForm() {
  return (
    <div className="grid sm:grid-cols-3  gap-4 px-8">
      {DENTISTS.map((dentist) => (
        <DentistCard props={dentist} />
      ))}
    </div>
  );
}

export function CalendarForm() {
  const book = useBook();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const {
    data: bookings,
    isLoading: bookingsloading,
    isError: bookingsError,
  } = api.apps.getAll.useQuery();
  const bookingsByDentist = api.apps.getByDentistId.useQuery(
    { id: book.dentistId },
    { enabled: !!book.dentistId },
  );
  return (
    <div>
      <p className="text-muted-foreground text-center">
        Select a date and time.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 px-8">
        <Calendar
          mode="single"
          defaultMonth={date}
          selected={date}
          onSelect={(value) => setDate(value)}
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
          className="rounded-lg mx-auto w-3/4"
        />
        <div className="grid grid-auto-fit items-center mt-5">
          {date?.toLocaleDateString() == new Date().toLocaleDateString() &&
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
            {date?.toLocaleDateString() == new Date().toLocaleDateString()
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
  return <div>Confirmation Form</div>;
}
