interface EmailTemplateProps {
  patientName: string;
  dentistName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
}

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