import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useBook } from "../hooks/use-book";

interface ImageCardProps {
  props: {
    src: string;
    href: string;
    alt: string;
    title: string;
    description?: string;
  };
}
export function ImageCard(props: ImageCardProps) {
  const { src, alt, title, description, href } = props.props;
  return (
    <div className="rounded-md w-[420px] border">
      <Image
        src={"/" + src}
        alt={alt}
        width={420}
        height={400}
        className="object-cover h-80 rounded-t-sm"
      />
      <div className="bg-muted p-4 h-36 rounded-b-md">
        <Link href={href} className="flex items-center text-primary">
          <h2 className="text-xl font-bold">{title}</h2>
          <ChevronRight size={20} />
        </Link>

        {description && <p className="text-sm text-left">{description}</p>}
      </div>
    </div>
  );
}

interface ServiceCardProps {
  props: {
    title: string;
    description: string;
    id: number;
    completionTime: string;
  };
}

export function ServiceCard(props: ServiceCardProps) {
  const book = useBook();
  const { title, description, id, completionTime } = props.props;
  return (
    <div
      key={id}
      onClick={() => book.setServiceType({ id, title })}
      className={`
        ${book.serviceType?.id === id && "border-primary border bg-primary text-white"}
        rounded-md cursor-pointer hover:shadow-xs
        `}
    >
      <div className="p-4  rounded-b-md">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className={"text-sm "}>{completionTime}</p>
        <p
          className={`text-sm ${book.serviceType?.id === id ? "text-white" : "text-muted-foreground"}`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

interface DentistCardProps {
  props: {
    name: string;
    description?: string;
    specialty: string;
    id: number;
    image?: string;
  };
}

export function DentistCard(props: DentistCardProps) {
  const book = useBook();
  const { name, description, specialty, id, image } = props.props;
  return (
    <div
      key={id}
      onClick={() => book.setDentist({ id, name })}
      className={`flex flex-col w-80 grid-cols-1 rounded-md ${book.dentist?.id === id && "border-primary border bg-primary text-white"} cursor-pointer`}
    >
      <Image
        src={"/dentist1.jpg"}
        className="w-80 object-cover rounded-t-md"
        width={300}
        height={300}
        alt={name}
      />
      <div
        className={`${book.dentist?.id === id ? "bg-primary text-white" : "bg-muted text-muted-foreground"} rounded-b-md p-4 h-52`}
      >
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="text-xs mb-4">{specialty}</p>
        <p className="text-sm text-muted-foreground">
          {description?.slice(0, 150) + "..."}
        </p>
      </div>
    </div>
  );
}

interface DetailCardProps {
  props: {
    icon: React.ReactNode;
    title?: string;
    value?: string;
  };
}
export function DetailCard(props: DetailCardProps) {
  const { icon, title, value } = props.props;
  if (!title && !value) {
    return (
      <div className="bg-primary flex flex-col rounded-md p-4">
        <div className="flex items-center w-full">
          <Skeleton className="w-full rounded-full p-2" />
          <Skeleton className="w-full rounded-full p-2" />
        </div>
        <Skeleton className="w-full rounded-full p-2" />
      </div>
    );
  }
  return (
    <div className="bg-primary flex flex-col rounded-md p-4 text-white">
      <div className="flex items-center w-full">
        {icon}
        <h2 className="text-xs ml-2">{title}</h2>
      </div>
      <p className="text-2xl ">{value}</p>
    </div>
  );
}
