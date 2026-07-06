import { Resend } from "resend";
import {
  getAppointmentConfirmationHtml,
  getDirectCancellationHtml,
  getMagicLinkEmailHtml,
} from "./templates";
import { google } from "googleapis";
import { generateGoogleCompatibleIcs } from "./ics";


const resend = new Resend(process.env.RESEND_API_KEY);

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Handle newline formatting in env variables
  ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"]
);

const calendar = google.calendar({ version: "v3", auth });

interface CreateCalendarEventOptions {
  patientEmail: string;
  patientName: string;
  dentistName: string;
  serviceName: string;
  date: Date;          // The base date of the appointment
  startTime: string;   // e.g., "09:30:00"
  estimatedTime: number; // Duration in minutes (e.g., 90)
}

export async function addAppointmentToGoogleCalendar({
  patientEmail,
  patientName,
  dentistName,
  serviceName,
  date,
  startTime,
  estimatedTime,
}: CreateCalendarEventOptions) {
  try {
    
    // 1. Calculate precise ISO Start and End times
    const [hours, minutes] = startTime.split(":").map(Number);
    if(!hours || !minutes) {
      throw new Error(`Invalid startTime format: ${startTime}`);
    }
    
    const startDateTime = new Date(date);
    startDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + estimatedTime);

    // 2. Build the structural Google Event payload
    const eventPayload = {
      summary: `Dental Appointment: ${serviceName}`,
      location: "Your Dental Clinic Address, Nairobi, Kenya",
      description: `Hello ${patientName},\n\nThis is an automated confirmation for your upcoming ${serviceName} with ${dentistName}.\n\nIf you need to reschedule or cancel, please contact administration at least 24 hours prior to your slot block.`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Africa/Nairobi", // Set this to your local timezone context
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Africa/Nairobi",
      },
      // Automatically triggers an invitation notification email directly from Google infrastructure
      attendees: [{ email: patientEmail, displayName: patientName }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 24 hours prior reminder
          { method: "popup", minutes: 60 },      // 1 hour prior pop-up
        ],
      },
    };

    // 3. Insert the resource item into the primary calendar stream
    const response = await calendar.events.insert({
      calendarId: "primary", // Uses the main calendar associated with the service account or configured delegation
      requestBody: eventPayload,
      sendUpdates: "all", // Force Google to send the native calendar invitation system prompt
    });

    return {
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    };
  } catch (error) {
    console.error("Failed to inject event to Google Calendar API:", error);
    // Return graceful status instead of failing the parent transaction
    return { success: false, error };
  }
}

export async function resendConfirmationEmail(details: {
  email: string;
  patientName: string;
  dentistName: string;
  serviceName: string;
  dateStr: string;       // "2026-07-15"
  timeStr?: string;      // "10:00:00"
  startTime?: string;    // Backward-compatible alias
  estimatedTime: number; // Duration in minutes (e.g., 90)
  appointmentId: string | number;
}) {
  
  const {
    email,
    patientName,
    dentistName,
    serviceName,
    dateStr,
    timeStr,
    startTime,
    estimatedTime,
    appointmentId,
  } = details;

  // 1. Resolve fallback time slot string gracefully
  const resolvedTime = timeStr || startTime;
  if (!resolvedTime) {
    throw new Error("[RESEND]: Appointment time parameters are missing.");
  }

  // 2. Parse and normalize values safely for template displays
  const baseDate = new Date(dateStr);
  if (isNaN(baseDate.getTime())) {
    throw new Error("[RESEND]: Invalid date format provided.");
  }

  // Format dates human-readably for the HTML template view context
  const normalizedDate = baseDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Extract a clean display hour marker for the customer (e.g., "10:00 AM")
  const [hours, minutes] = resolvedTime.split(":");
  const hourNum = Number(hours);
  const ampm = hourNum >= 12 ? "PM" : "AM";
  const displayHour = hourNum % 12 || 12;
  const normalizedTime = `${String(displayHour).padStart(2, "0")}:${minutes} ${ampm}`;

  // 3. Compile the structural Google-compatible .ics string payload
  const icsContent = generateGoogleCompatibleIcs({
    serviceName,
    dentistName,
    date: baseDate,
    startTime: resolvedTime,
    estimatedTime,
    appointmentId,
  });

  // 4. Convert the string to a transport buffer block
  const icsBuffer = Buffer.from(icsContent, "utf-8");

  console.log(`[RESEND]: Sending confirmation email to ${email} for appointment on ${normalizedDate} at ${normalizedTime}`);
  // 5. Dispatch directly through Resend
  const { error } = await resend.emails.send({
    from: "Dental Clinic <noreply@singularity.co.ke>",
    to: [email],
    subject: `Confirmed: Appointment for ${serviceName}`,
    html: getAppointmentConfirmationHtml({
      patientName,
      dentistName,
      serviceName,
      appointmentDate: normalizedDate,
      appointmentTime: normalizedTime,
    }),
    attachments: [
      {
        filename: "invite.ics",
        content: icsBuffer,
        contentType: "text/calendar; charset=utf-8; method=REQUEST",
      },
    ],
  });

  if (error) {
    console.log("[RESEND]:", error);
    throw new Error("[RESEND]: failed to send appointment confirmation email");
  }
}


export async function resendCancellationEmail(details: {
  email: string;
  patientName: string;
  dateStr: string;        // "2026-07-15"
  timeStr?: string;       // "10:00:00"
  startTime?: string;     // Backward-compatible alias
  frontendUrl: string;    // e.g., "https://your-app.com"
  clinicPhone?: string;   // Optional fallback phone number
  clinicEmail?: string;   // Optional fallback support email
}) {
  console.log("[RESEND]: Sending cancellation email to", details.email);
  const { data, error } = await resend.emails.send({
    from: "Dental Clinic <noreply@singularity.co.ke>",
    to: [details.email],
    subject: "Smile Studio Authentication",
    
    html: getDirectCancellationHtml(details),
  });
  if (error) {
    console.log("[RESEND]:", error);
    throw new Error("[RESEND]: failed to send magic link email");
  }
}


  
export async function resendMagicLinkEmail(details: {
  email: string;
  token: string;
  url: string;
  metadata: any;
}) {
  const { email, token, url, metadata } = details;
console.log("[RESEND]: Sending magic link email to", email);
  const { data, error } = await resend.emails.send({
    from: "Dental Clinic <noreply@singularity.co.ke>",
    to: [email],
    subject: "Smile Studio Authentication",
    
    html: getMagicLinkEmailHtml({ email, token, url, metadata }),
  });
  if (error) {
    console.log("[RESEND]:", error);
    throw new Error("[RESEND]: failed to send magic link email");
  }
}
