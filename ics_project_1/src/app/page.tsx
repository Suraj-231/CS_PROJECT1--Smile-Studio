import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ImageCard } from "./_components/cards";

export default async function Home() {
  return (
    <div>
      <div className="flex gap-8">
        <ImageCard
          props={{
            src: "appointment.jpg",
            href: "/book",
            alt: "Smile Studio appointment.",
            title: "Book An Appointment",
            description:
              "Secure your time slot in less than a minute. Choose your dental care provider, view live real-time availability, and get an instant calendar confirmation sent directly to your inbox.",
          }}
        />

        <ImageCard
          props={{
            src: "profile-2.jpg",
            href: "/profile",
            alt: "Smile Studio profile.",
            title: "Profile",
            description:
              "View and update your personal information, track your upcoming appointments, and access your historical treatment logs all from a single, secure student dashboard.",
          }}
        />
      </div>
    </div>
  );
}
