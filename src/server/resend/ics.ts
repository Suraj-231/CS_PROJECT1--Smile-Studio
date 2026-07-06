interface IcsGeneratorOptions {
  serviceName: string;
  dentistName: string;
  date: Date;          // The base appointment date
  startTime: string;   // e.g., "09:30:00" or "09:30"
  estimatedTime: number; // Duration in minutes (e.g., 90)
  appointmentId: string | number;
}

export function generateGoogleCompatibleIcs({
  serviceName,
  dentistName,
  date,
  startTime,
  estimatedTime,
  appointmentId,
}: IcsGeneratorOptions): string {
  // 1. Calculate precise date-time bounds
  const [hours, minutes] = startTime.split(":").map(Number);
  if (hours === undefined || minutes === undefined) {
    throw new Error(`Invalid startTime format: ${startTime}`);
  }
  const start = new Date(date);
  start.setHours(hours, minutes, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + estimatedTime);

  // 2. Format dates to the strict iCalendar UTC format: YYYYMMDDTHHMMSSZ
  const formatToIcsUtc = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const dtStart = formatToIcsUtc(start);
  const dtEnd = formatToIcsUtc(end);
  const dtStamp = formatToIcsUtc(new Date());

  // 3. Build the iCalendar array tokens cleanly
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dental Clinic//Management Platform//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST", // Tells Google to treat this as an actionable meeting invite card
    "BEGIN:VEVENT",
    `UID:appointment_${appointmentId}@yourclinicdomain.com`, // Unique identifier prevents duplicates
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Dental Appointment: ${serviceName}`,
    `DESCRIPTION:Your session with ${dentistName} has been locked in. Duration: ${estimatedTime} minutes.`,
    "LOCATION:Your Dental Clinic Address\\, Nairobi\\, Kenya", // Commas must be escaped with backslashes
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  // 4. Force every line to terminate with a strict CRLF token (\r\n)
  return lines.join("\r\n") + "\r\n";
}