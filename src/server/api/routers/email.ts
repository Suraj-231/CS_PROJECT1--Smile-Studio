import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { dentist } from "~/server/db/schema";
import { sendConfirmationEmail } from "~/server/resend/send-email";

export const emailRouter = createTRPCRouter({
  sendGreeting: adminProcedure
    .input(
      z.object({
        description: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { description } = input;
      try {
        await sendConfirmationEmail({
          email: "mtume2016@gmail.com",
          patientName: "Mtume",
          dentistName: "Dentist",
          serviceName: "Service",
          dateStr: "2026-07-15",
          timeStr: "10:00:00",
        });
      } catch (error) {
        console.error(error);
      }
    }),
});
