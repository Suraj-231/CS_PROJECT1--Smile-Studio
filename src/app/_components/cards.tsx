import Image from "next/image";
import { Skeleton } from "~/components/ui/skeleton";
import { CheckCircle, ChevronRight, PenLine, Trash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { useBook } from "../hooks/use-book";
import { DropdownMenu } from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  DialogClose,
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";

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
    name: string;
    description: string | null;
    priority: number | null;
    id: number;
    estimatedTime: number | null;
  };
}

export function ServiceCard(props: ServiceCardProps) {
  const book = useBook();
  const { name, description, priority, id, estimatedTime } = props.props;

  function toTimeString(time: number) {
    if (time === 0) return "";
    if (time < 60) {
      return `${time} minutes`;
    } else {
      return `${Math.ceil(time / 60)} hours`;
    }
  }
  return (
    <div
      key={id}
      onClick={() => book.setService({ id, priority, name, estimatedTime: estimatedTime || 0 })}
      className={`
        ${book.service?.id === id && "border-primary border bg-primary text-white"}
        rounded-md cursor-pointer hover:shadow-xs
        `}
    >
      <div className="p-4  rounded-b-md">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {name}
          {book.service?.id === id && <CheckCircle className="" />}
        </h2>
        <p className={"text-sm "}>
          Estimated Time: {toTimeString(estimatedTime || 0)}{" "}
        </p>
        <p
          className={`text-sm ${book.service?.id === id ? "text-white" : "text-muted-foreground"}`}
        >
          {description?.slice(0, 100)}
        </p>
      </div>
    </div>
  );
}

export function ServiceCardReadOnly(service: ServiceCardProps) {
  const { name, id, description, estimatedTime, priority } = service.props;

  const [newName, setNewName] = useState(name);
  const [newDescription, setNewDescription] = useState<string | null>(
    description,
  );
  const utils = api.useUtils();
  const [newPriority, setNewPriority] = useState<number | null>(priority);
  const [newEstimatedTime, setNewEstimatedTime] = useState(estimatedTime);

  const editService = api.services.edit.useMutation({
    onSuccess: () => {
      toast.success("Service updated successfully");
      utils.services.getAll.invalidate();
    },
    onError: () => {
      toast.error("Failed to update service");
    },
  });

  return (
    <div className="p-4 rounded-md bg-muted">
      <div className="flex justify-between items-center">
        <h2 className="text-xl text-primary">{name}</h2>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <PenLine size={10} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Service</DialogTitle>
                <DialogDescription>Editing details of {name}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-3 px-2">
                <div>
                  <label>Name</label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label>Priority</label>
                  <Select
                    value={newPriority?.toString()}
                    onValueChange={(value) => setNewPriority(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue
                        className="w-1/2"
                        placeholder="Select the priority"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label>Estimated Time</label>
                  <Select
                    value={newEstimatedTime?.toString()}
                    onValueChange={(value) =>
                      setNewEstimatedTime(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        defaultValue={newEstimatedTime?.toString()}
                        className=""
                        placeholder="Select an estimated time"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15m</SelectItem>
                      <SelectItem value="30">30m</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="170">2 hours 30min</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label>Description</label>
                  <textarea
                    rows={4}
                    className="w-full bg-muted rounded-lg p-3"
                    value={newDescription ?? ""}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    100 characters max
                  </p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                {newPriority ?? 0}
                <Button
                  onClick={async () => {
                    if (
                      !newDescription ||
                      !newName ||
                      !newEstimatedTime ||
                      !newPriority
                    ) {
                      toast.error("Please fill in all fields");
                      return;
                    }
                    await editService.mutateAsync({
                      id,
                      name: newName,
                      description: newDescription,
                      estimatedTime: newEstimatedTime,
                      priority: newPriority,
                    });
                  }}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <p className={"text-xs text-muted-foreground"}>
        Priority: {priority} days
      </p>
      <p className={"text-xs text-muted-foreground"}>{estimatedTime} minutes</p>
      <p className={"text-sm text-muted-foreground"}>{description}</p>
    </div>
  );
}

interface DentistCardProps {
  props: {
    name: string;
    description: string | null;
    id: number;
    imageUrl: string | null;
  };
}

export function DentistCard(props: DentistCardProps) {
  const book = useBook();
  const { name, description, id, imageUrl } = props.props;
  return (
    <div
      key={id}
      onClick={() => book.setDentist({ id, name })}
      className={`flex flex-col  grid-cols-1 rounded-md ${book.dentist?.id === id && "border-primary border bg-primary text-white"} cursor-pointer`}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          className=" object-cover rounded-t-md"
          width={300}
          height={300}
          alt={name}
        />
      )}

      <div
        className={`${book.dentist?.id === id ? "bg-primary text-white" : "bg-muted text-muted-foreground"} rounded-b-md p-4`}
      >
        <h1 className="text-2xl font-bold">{name}</h1>
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
      <div className=" flex flex-col rounded-md p-4">
        <div className="flex items-center w-full">
          <Skeleton className="w-full rounded-full p-2" />
          <Skeleton className="w-full rounded-full p-2" />
        </div>
        <Skeleton className="w-full rounded-full p-2" />
      </div>
    );
  }
  return (
    <div className="text-primary border items-center justify-center flex flex-col rounded-md p-2 ">
      <div className="flex items-center ">
        {icon}
        <h2 className="text-xs ml-2">{title}</h2>
      </div>
      <p className="text-2xl text-muted-foreground">{value}</p>
    </div>
  );
}
