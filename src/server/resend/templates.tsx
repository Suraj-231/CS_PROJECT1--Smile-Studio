interface EmailTemplateProps {
  patientName: string;
  dentistName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
}


const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  

export function getAppointmentConfirmationHtml({
  patientName,
  dentistName,
  serviceName,
  appointmentDate,
  appointmentTime,
}: EmailTemplateProps): string {
  return `
    <div style="width: 100%; background-color: #f8fafc; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
      <div style="margin: 0 auto; max-width: 576px; overflow: hidden; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
        
        <div style="background-color: #1e3c72; padding: 32px; text-align: center;">
          <h1 style="margin: 0; text-transform: none; font-size: 24px; font-weight: 700; tracking-tight: normal; letter-spacing: 0.5px; color: #ffffff;">
            Appointment Confirmed
          </h1>
        </div>

        <div style="padding: 32px; line-height: 1.6;">
          <p style="margin: 0 0 20px 0; font-size: 16px;">
            Hi <strong style="font-weight: 600; color: #0f172a;">${patientName}</strong>,
          </p>
          <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b;">
            Your upcoming dental appointment has been successfully scheduled. We have attached a calendar invite (<code>.ics</code> file) to this email so you can quickly add it to your Apple, Google, or Outlook calendar.
          </p>

          <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <h3 style="margin: 0 0 16px 0; border-bottom: 1px solid rgba(226, 232, 240, 0.6); padding-bottom: 8px; font-size: 16px; font-weight: 600; color: #0f172a;">
              Reservation Details
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tbody>
                <tr style="border-bottom: 1px solid rgba(226, 232, 240, 0.4);">
                  <td style="padding: 8px 0; font-weight: 500; color: #64748b; width: 96px;">Treatment:</td>
                  <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${serviceName}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(226, 232, 240, 0.4);">
                  <td style="padding: 8px 0; font-weight: 500; color: #64748b;">Dentist:</td>
                  <td style="padding: 8px 0; color: #334155;">${dentistName}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(226, 232, 240, 0.4);">
                  <td style="padding: 8px 0; font-weight: 500; color: #64748b;">Date:</td>
                  <td style="padding: 8px 0; color: #334155;">${appointmentDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 500; color: #64748b;">Time:</td>
                  <td style="padding: 8px 0; color: #334155;">${appointmentTime}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style="margin: 0; font-size: 12px; color: #64748b;">
            If you need to reschedule or cancel your visit, please contact our administration desk at least 24 hours prior to your slot block.
          </p>
        </div>

        <div style="padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            © 2026 Dental Clinic Management Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `.trim();
}


interface MagicLinkEmailProps {
  email: string;
  token: string;
  url: string;
  metadata: any;
}

export function getMagicLinkEmailHtml(props: MagicLinkEmailProps): string {
  const { email, url } = props;
  return `
    <div style="width: 100%; background-color: #f8fafc; padding: 48px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
      <div style="margin: 0 auto; max-width: 448px; overflow: hidden; border-radius: 12px; background-color: #ffffff; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <div style="background-color: #1e3c72; height: 8px; width: 100%;"></div>

        <div style="padding: 32px;">
          <div style="margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 700; tracking-tight: -0.025em; color: #0f172a;">
              Sign in to your account
            </h1>
          </div>

          <p style="margin: 0 0 16px 0; font-size: 14px; color: #64748b; line-height: 1.6;">
            We received a request to log into your account from <span style="font-weight: 500; color: #1e293b;">${email}</span>.
          </p>

          <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b; line-height: 1.6;">
            Click the button below to sign in instantly. For security, this link will automatically expire in 15 minutes.
          </p>

          <div style="margin-bottom: 24px; text-align: center;">
            <a href="${url}" style="display: inline-block; border-radius: 6px; background-color: #1e3c72; padding: 12px 20px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
              Sign In
            </a>
          </div>

          <div style="border-top: 1px solid #f1f5f9; pt: 20px; padding-top: 20px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
              If the button doesn't work, copy and paste this URL into your web browser:
            </p>
            <p style="margin: 0; word-break: break-all; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #94a3b8; max-width: 100%; overflow: hidden;">
              ${url}
            </p>
          </div>
        </div>

        <div style="background-color: rgba(248, 250, 252, 0.8); padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
          <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
            If you did not request this login link, you can safely ignore this email. Your account remains completely secure.
          </p>
        </div>
      </div>
    </div>
  `.trim();
}


interface DirectCancellationEmailDetails {
  email: string;
  patientName: string;
  dateStr: string;        // "2026-07-15"
  timeStr?: string;       // "10:00:00"
  startTime?: string;     // Backward-compatible alias
  frontendUrl: string;    // e.g., "https://your-app.com"
  clinicPhone?: string;   // Optional fallback phone number
  clinicEmail?: string;   // Optional fallback support email
}

export function getDirectCancellationHtml(details: DirectCancellationEmailDetails): string {
  const {
    patientName,
    dateStr,
    timeStr,
    startTime,
    frontendUrl,
    clinicPhone = "+254 700 000000",
    clinicEmail = "support@singularity.co.ke",
  } = details;

  // 1. Resolve fallback time variables
  const resolvedTime = timeStr || startTime || "00:00:00";

  // 2. Format a friendly date layout (e.g., "Wednesday, July 15, 2026")
  const baseDate = new Date(dateStr);
  const normalizedDate = !isNaN(baseDate.getTime())
    ? baseDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : dateStr;

  // 3. Format a clean display time (e.g., "10:00 AM")
  let normalizedTime = resolvedTime;
  const timeParts = resolvedTime.split(":");
  if (timeParts.length >= 2) {
    const hourNum = Number(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    normalizedTime = `${String(displayHour).padStart(2, "0")}:${minutes} ${ampm}`;
  }

  // Ensure trailing slash structure handles the path clean
  const cleanBaseUrl = frontendUrl.endsWith("/") ? frontendUrl.slice(0, -1) : frontendUrl;
  const rebookUrl = `${cleanBaseUrl}/book`;

  return `
    <div style="width: 100%; background-color: #f8fafc; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
      <div style="margin: 0 auto; max-width: 512px; overflow: hidden; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <div style="background-color: #ef4444; height: 6px; width: 100%;"></div>

        <div style="padding: 32px; line-height: 1.6;">
          <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
            Cancellation Notice
          </h2>

          <p style="margin: 0 0 16px 0; font-size: 15px;">
            Hi <strong>${patientName}</strong>,
          </p>

          <p style="margin: 0 0 24px 0; font-size: 15px; color: #334155;">
            Just writing to let you know that your appointment scheduled for 
            <span style="font-weight: 600; color: #0f172a;">${normalizedDate}</span> at 
            <span style="font-weight: 600; color: #0f172a;">${normalizedTime}</span> has been cancelled.
          </p>

          <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b;">
            Please tap below to book another appointment on another date:
          </p>

          <div style="margin-bottom: 32px; text-align: center;">
            <a href="${rebookUrl}" style="display: inline-block; border-radius: 6px; background-color: #1e3c72; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
              Schedule Another Appointment
            </a>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #64748b;">
            <p style="margin: 0 0 6px 0; font-weight: 600; color: #334155;">Have any enquiries?</p>
            <p style="margin: 0;">
              If you have any questions or feel this modification was processed in error, you can reach our team at 
              <a href="tel:${clinicPhone.replace(/\s+/g, "")}" style="color: #1e3c72; text-decoration: none; font-weight: 500;">${clinicPhone}</a> 
              or reply directly to 
              <a href="mailto:${clinicEmail}" style="color: #1e3c72; text-decoration: none; font-weight: 500;">${clinicEmail}</a>.
            </p>
          </div>
        </div>

        <div style="padding: 20px; text-align: center; background-color: #fafafa; border-top: 1px solid #f1f5f9;">
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">
            © 2026 Dental Studio Management Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `.trim();
}