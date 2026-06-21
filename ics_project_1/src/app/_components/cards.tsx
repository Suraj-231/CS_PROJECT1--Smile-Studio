import Image from "next/image";
import { Button } from "~/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

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
