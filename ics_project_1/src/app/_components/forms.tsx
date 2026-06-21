import { useState, useEffect } from "react";
import { useBook } from "../hooks/use-book";
import { ServiceCard } from "./cards";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";

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
  return <div>Dentist Form</div>;
}

export function CalendarForm() {
  return <div>Calendar Form</div>;
}

export function ConfirmationForm() {
  return <div>Confirmation Form</div>;
}
