import { Resend } from "resend";
import {
  getAppointmentConfirmationHtml,
  getMagicLinkEmailHtml,
} from "./templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function resendConfirmationEmail(details: {
  email: string;
  patientName: string;
  dentistName: string;
  serviceName: string;
  dateStr: string; // "2026-07-15"
  timeStr: string; // "10:00:00"
}) {
  const { email, patientName, dentistName, serviceName, dateStr, timeStr } =
    details;

  // 1. Build a basic RFC-compliant iCalendar (.ics) string structure
  // Formats time strings to match UTC / local calendar patterns (YYYYMMDDTHHMMSS)
  const cleanDate = dateStr.replace(/-/g, "");
  const cleanTime = timeStr.replace(/:/g, "").substring(0, 4); // "1000"

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PROID:-//Clinic//Appointment//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${serviceName} - ${dentistName}`,
    `DESCRIPTION:Dental appointment for ${patientName} with ${dentistName}`,
    `DTSTART:${cleanDate}T${cleanTime}00`,
    // Estimate a standard 1-hour window closure block duration dynamically
    `DTEND:${cleanDate}T${String(parseInt(cleanTime, 10) + 100).padStart(4, "0")}00`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  // 2. Convert the string to a transport buffer block
  const icsBuffer = Buffer.from(icsContent, "utf-8");

  // 3. Dispatch directly through Resend
  const {data, error} = await resend.emails.send({
    from: "Dental Clinic <noreply@singularity.co.ke>",
    to: [email],
    subject: `Confirmed: Appointment for ${serviceName}`,
    html:getAppointmentConfirmationHtml({
      patientName,
      dentistName,
      serviceName,
      appointmentDate: dateStr,
      appointmentTime: timeStr,
    })
    ,
    attachments: [
      {
        filename: "invite.ics",
        content: icsBuffer,
        contentType: "text/calendar",
      },
    ],
  });
  if(error){
    console.log("[RESEND]: resendConfirmationEmail(), ",error)
  }
}



export async function resendMagicLinkEmail(details: {
  email: string;
  token: string;
  url: string;
  metadata: any;
}) {
  const { email, token, url, metadata } = details;

 const {data, error} = await resend.emails.send({
    from: "Dental Clinic <noreply@singularity.co.ke>",
    to: [email],
    subject: "Smile Studio Authentication",
    html:getMagicLinkEmailHtml({ email, token, url, metadata })
 
  });
  if(error){
    console.log("[RESEND]:", error)
  }
}