import { Button } from "~/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  return (
    <div>
      <div className="flex  gap-8 min-h-screen bg-gradient-to-br from-primary/10 to-primary   items-center justify-center">
        <div className="flex sm:flex-row flex-col jutsify-between items-center">
          <div className="p-8 items-center justify-center">
            <h1 className="text-6xl text-muted-foreground">
              Welcome to Smile Studio
            </h1>
            <p className=" text-md mt-4 text-muted-foreground">
              Welcome to a modern era of dental care management. Our platform
              bridges the gap between clinical precision and effortless patient
              experiences by unifying real-time scheduling, smart practitioner
              coordination, and automated treatment workflows. Designed for
              fluid administrative control and transparent patient tracking, we
              eliminate structural bottlenecks so your team can focus on what
              matters most delivering exceptional dental health results with
              absolute confidence.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/auth">
                <Button
                  variant="ghost"
                  className="p-4 bg-white rounded-lg h-10"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/book">
                <Button className="p-4 rounded-lg h-10" variant="default">
                  Book an Appointment
                </Button>
              </Link>
            </div>
          </div>
          <Image
            className=""
            src="/profile-2.jpg"
            alt=""
            width={500}
            height={500}
          />
        </div>
      </div>
    </div>
  );
}
