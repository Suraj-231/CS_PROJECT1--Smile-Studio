"use client";
import { EventCalendar } from "~/app/_components/event-calendar";

export default function CalendarPage() {
  return (
    <div>
      <div>
        <h1>General Calendar</h1>
        <p className="text-muted-foreground">View and edit appointments.</p>
      </div>

      <div className="">
        <EventCalendar />
      </div>
    </div>
  );
}
