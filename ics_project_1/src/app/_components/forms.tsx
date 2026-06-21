import { useState, useEffect } from "react";
import { useBook } from "../hooks/use-book";
import { ServiceCard, DentistCard } from "./cards";
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
  return <div>Calendar Form</div>;
}

export function ConfirmationForm() {
  return <div>Confirmation Form</div>;
}
