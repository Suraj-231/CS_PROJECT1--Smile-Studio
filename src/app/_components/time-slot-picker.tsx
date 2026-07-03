import { useMemo } from "react";
import {Button} from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useBook } from "../hooks/use-book";


// Helper function to turn "HH:MM:SS" or "HH:MM" into raw numeric minutes
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (hours === undefined || minutes === undefined) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  return hours * 60 + minutes;
}

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


interface BookingsDataType{
    startTime: string;
    date: Date;
    service: {
        id: number;
        name: string;
        estimatedTime: number;
    };
}


export function TimeSlotPicker(bookingsData : BookingsDataType[] | null | undefined) {
    const book = useBook()
  
  // Compute available slots smoothly whenever the data array shifts
  const availableTimes = useMemo(() => {
    const rawBookings = bookingsData || [];

    // 1. Transform existing bookings into raw mathematical blocks [startMinutes, endMinutes]
    const activeTimeBlocks = rawBookings.map((b: any) => {
      const start = timeToMinutes(b.startTime);
      // Assuming estimatedTime is stored as a clean integer of total minutes (e.g., 120 for 2 hours)
      const duration = Number(b.service?.estimatedTime || 30); 
      return { start, end: start + duration };
    });

    // 2. Filter out slots that intersect with any calculated block
    return TIMES.filter((t) => {
      const slotMinutes = timeToMinutes(t.value);

      // A slot is blocked if it lands inside an ongoing treatment window
      const isOverlapping = activeTimeBlocks.some(
        (block) => slotMinutes >= block.start && slotMinutes < block.end
      );

      return !isOverlapping;
    });
  }, [bookingsData]);

  // UI Layout Rendering
//   if (bookingsData.isLoading) {
//     return (
//       <div className="flex flex-wrap gap-2">
//         {Array.from({ length: 8 }).map((_, i) => (
//           <Skeleton key={i} className="w-24 h-10 rounded-lg" />
//         ))}
//       </div>
//     );
//   }

  return (
    <div className="flex flex-wrap gap-2">
      {availableTimes.map((t) => (
        <Button
          key={t.value}
          variant={book.startTime === t.value ? "default" : "outline"}
          onClick={() => book.setStartTime(t.value)}
        >
          {t.label}
        </Button>
      ))}
      
      {availableTimes.length === 0 && (
        <p className="text-sm text-muted-foreground italic p-2">
          No available slots left for this day.
        </p>
      )}
    </div>
  );
}