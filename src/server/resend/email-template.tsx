import * as React from "react";

interface EmailTemplateProps {
  patientName: string;
  dentistName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
}

export function AppointmentConfirmationEmail({
  patientName,
  dentistName,
  serviceName,
  appointmentDate,
  appointmentTime,
}: EmailTemplateProps) {
  return (
    <div className="w-full bg-slate-50 py-10 px-4 font-sans text-slate-700">
      <div className="mx-auto max-w-xl overflow-hidden rounded-xl bg-white shadow-md">
        {/* Brand Header — Using your Primary Theme Variable */}
        <div className="bg-primary p-8 text-center">
          <h1 className="m-0 text-2xl font-bold tracking-wide text-primary-foreground">
            Appointment Confirmed
          </h1>
        </div>

        {/* Body Content */}
        <div className="p-8 leading-relaxed">
          <p className="m-0 mb-5 text-base">
            Hi{" "}
            <strong className="font-semibold text-slate-900">
              {patientName}
            </strong>
            ,
          </p>
          <p className="m-0 mb-6 text-sm text-muted-foreground">
            Your upcoming dental appointment has been successfully scheduled. We
            have attached a calendar invite (`.ics` file) to this email so you
            can quickly add it to your Apple, Google, or Outlook calendar.
          </p>

          {/* Appointment Card — Using your Muted Background Theme Variable */}
          <div className="bg-muted rounded-lg p-6 mb-8">
            <h3 className="m-0 mb-4 pb-2 border-b border-slate-200/60 text-base font-semibold text-slate-900">
              Reservation Details
            </h3>
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr className="border-b border-slate-200/40 last:border-0">
                  <td className="py-2 font-medium text-muted-foreground w-24">
                    Treatment:
                  </td>
                  <td className="py-2 font-semibold">{serviceName}</td>
                </tr>
                <tr className="border-b border-slate-200/40 last:border-0">
                  <td className="py-2 font-medium text-muted-foreground">
                    Dentist:
                  </td>
                  <td className="py-2 ">{dentistName}</td>
                </tr>
                <tr className="border-b border-slate-200/40 last:border-0">
                  <td className="py-2 font-medium text-muted-foreground">
                    Date:
                  </td>
                  <td className="py-2 ">{appointmentDate}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-muted-foreground">
                    Time:
                  </td>
                  <td className="py-2 ">{appointmentTime}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="m-0 text-xs text-muted-foreground">
            If you need to reschedule or cancel your visit, please contact our
            administration desk at least 24 hours prior to your slot block.
          </p>
        </div>

        {/* Footer */}
        <div className=" p-6 text-center ">
          <p className="m-0 text-xs text-muted-foreground">
            © 2026 Dental Clinic Management Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

interface magicLinkEmailProps {
  email: string;
  token: string;
  url: string;
  metadata: any;
}
export function MagicLinkEmailTemplate(props: magicLinkEmailProps) {
  const { email, token, url, metadata } = props;
  return (
    <div className="w-full bg-slate-50 py-12 px-4 font-sans text-slate-700">
      <div className="mx-auto max-w-md overflow-hidden rounded-xl bg-white shadow-md border border-slate-100">
        {/* Decorative Top Accent — Using your Primary Theme Variable */}
        <div className="bg-primary h-2 w-full" />

        {/* Body Content */}
        <div className="p-8">
          <div className="mb-6">
            <h1 className="m-0 text-xl font-bold tracking-tight text-slate-900">
              Sign in to your account
            </h1>
          </div>

          {/* Paragraphs — Using your Muted Foreground Theme Variable */}
          <p className="m-0 mb-4 text-sm text-muted-foreground leading-relaxed">
            We received a request to log into your account from{" "}
            <span className="font-medium text-slate-800">{email}</span>.
          </p>

          <p className="m-0 mb-6 text-sm text-muted-foreground leading-relaxed">
            Click the button below to sign in instantly. For security, this link
            will automatically expire in 15 minutes.
          </p>

          {/* Action Button — Using your Primary Theme Variable */}
          <div className="mb-6 text-center">
            <a
              href={url}
              className="inline-block rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground no-underline shadow-sm hover:opacity-95"
            >
              Sign In
            </a>
          </div>

          {/* Alternative Link Layout */}
          <div className="border-t border-slate-100 pt-5">
            <p className="m-0 mb-2 text-xs text-muted-foreground">
              If the button doesn't work, copy and paste this URL into your web
              browser:
            </p>
            <p className="m-0 break-all text-xs font-mono text-slate-400 select-all max-w-full overflow-hidden">
              {url}
            </p>
          </div>
        </div>

        {/* Security / Help Footer */}
        <div className="bg-slate-50/80 p-6 text-center border-t border-slate-100">
          <p className="m-0 text-xs text-muted-foreground">
            If you did not request this login link, you can safely ignore this
            email. Your account remains completely secure.
          </p>
        </div>
      </div>
    </div>
  );
}
