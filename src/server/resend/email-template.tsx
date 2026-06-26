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
