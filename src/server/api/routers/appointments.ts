import { z } from "zod";
import { eq, sql, ilike, and, gte, lte, desc } from "drizzle-orm";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { appointments, dentist, user, service } from "~/server/db/schema";
import { sendConfirmationEmail } from "~/server/resend/send-email";

export const appsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        dentist: z.object({
          id: z.number(),
          name: z.string(),
        }),
        date: z.string().datetime().pipe(z.coerce.date()),
        startTime: z.string(),
        service: z.object({
          id: z.number(),
          name: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //check if appointment already exists
      const existingAppointmentOnDate =
        await ctx.db.query.appointments.findFirst({
          where: (appointments, { and, eq }) =>
            and(
              eq(appointments.userId, ctx.session.user.id),
              eq(appointments.date, input.date),
            ),
        });
      if (existingAppointmentOnDate) {
        throw new Error("You have already booked an appointment on this date.");
      }
      const existingAppointment = await ctx.db.query.appointments.findFirst({
        where: (appointments, { and, eq }) =>
          and(
            eq(appointments.dentistId, input.dentist.id),
            eq(appointments.date, input.date),
            eq(appointments.startTime, input.startTime),
          ),
      });
      if (existingAppointment) {
        throw new Error(
          "Appointment already exists.Try booking a different one.",
        );
      } else {
        let emailData: {
          email: string;
          patientName: string;
          dentistName: string;
          serviceName: string;
          dateStr: string;
          timeStr: string;
        } | null = null;
        try {
          // Start a new transaction to prevent any double booking or race conditions
          await ctx.db.transaction(async (tx) => {
            const newApp = await ctx.db.insert(appointments).values({
              userId: ctx.session.user.id,
              dentistId: input.dentist.id,
              date: input.date,
              startTime: input.startTime,
              service: input.service.id,
            });
            //update dentist appointment Count
            await ctx.db
              .update(dentist)
              .set({
                appointmentCount: sql`${dentist.appointmentCount} + 1`,
              })
              .where(eq(dentist.id, input.dentist.id));

            emailData = {
              email: ctx.session.user.email,
              patientName: ctx.session.user.name,
              dentistName: input.dentist.name,
              serviceName: input.service.name,
              dateStr: input.date.toLocaleDateString(), // "2026-07-15"
              timeStr: input.startTime, // "10:00:00"
            };
          });
        } catch (error: any) {
          if (
            error.code === "23505" ||
            error.message?.includes("unique constraint")
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "This appointment slot has already been reserved. Please select another time.",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Reservation processing failed. Your card has not been charged and no email was sent.",
          });
        }
        // Send email
        if (emailData) {
          try {
            await sendConfirmationEmail(emailData);
          } catch (emailError) {
            console.error(
              "Warning: Appointment saved, but confirmation email failed:",
              emailError,
            );
          }
        }
        return { success: true };
      }
    }),

  getById: publicProcedure
    .input(
      z.object({
        appointmentId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const appointment = await ctx.db
        .select()
        .from(appointments)
        .where(eq(appointments.id, input.appointmentId))
        .innerJoin(dentist, eq(appointments.dentistId, dentist.id))
        .innerJoin(service, eq(appointments.service, service.id));

      return appointment;
    }),

  update: publicProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        dentist: z.object({
          id: z.number(),
          name: z.string(),
        }),
        date: z.string().datetime().pipe(z.coerce.date()),
        startTime: z.string(),
        service: z.object({
          id: z.number(),
          name: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .update(appointments)
          .set({
            dentistId: input.dentist.id,
            date: input.date,
            startTime: input.startTime,
            service: input.service.id,
          })
          .where(eq(appointments.id, input.appointmentId));
      } catch (error) {
        console.error(error);
      }
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.appointments.findMany();
  }),

  delete: publicProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        dentistId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .delete(appointments)
          .where(eq(appointments.id, input.appointmentId));
        await ctx.db
          .update(dentist)
          .set({
            appointmentCount: sql`${dentist.appointmentCount} - 1`,
          })
          .where(eq(dentist.id, input.dentistId));
      } catch (error) {
        console.error("Error deleting appointment:", error);
        throw new Error("Failed to delete appointment");
      }
    }),

  getAllForSummary: adminProcedure
    .input(
      z.object({
        limit: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db
        .select({
          appointments: {
            id: appointments.id,
            date: appointments.date,
            startTime: appointments.startTime,
          },
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
          dentist: {
            id: dentist.id,
            name: dentist.name,
          },
          service: {
            id: service.id,
            name: service.name,
          },
        })
        .from(appointments)
        .innerJoin(user, eq(appointments.userId, user.id))
        .innerJoin(dentist, eq(appointments.dentistId, dentist.id))
        .innerJoin(service, eq(appointments.service, service.id));

      return {
        data: data ?? [],
        totalAppsCount: data.length ?? 0,
      };
    }),

  getLatest: adminProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.appointments.findFirst({
      orderBy: (appointments, { desc }) => [desc(appointments.date)],
    });

    return data ?? null;
  }),

  getAppointmentCount: adminProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.appointments.findMany();
    return data.length ?? null;
  }),

  getTimes: publicProcedure.query(async ({ ctx }) => {
    const times = await ctx.db.query.appointments.findMany({
      with: {
        startTime: true,
      },
    });
    return times ?? null;
  }),

  getFollowUp: publicProcedure
    .input(
      z.object({
        dentist: z.object({
          id: z.number(),
          name: z.string(),
        }),
        date: z.string().datetime().pipe(z.coerce.date()),
        startTime: z.string(),
        service: z
          .object({
            id: z.number(),
            priority: z.number().nullable(),
            name: z.string(),
          })
          .nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { dentist, date, startTime, service } = input;
      if (!service || service.priority === null) {
        console.log("No service provided", service);
        return null;
      }
      const baseDate = new Date(date);
      if (isNaN(baseDate.getTime())) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid date format.",
        });
      }

      // 1. Calculate the target base follow-up date based on service priority
      const targetFollowUpDate = new Date(baseDate);
      targetFollowUpDate.setDate(
        targetFollowUpDate.getDate() + service.priority,
      );

      // 2. Fetch the dentist's busy appointments starting from that target date onwards
      // Since your table column is a timestamp with timezone, we pass the Date object directly
      const busyAppointments = await ctx.db
        .select({
          date: appointments.date,
          startTime: appointments.startTime,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.dentistId, dentist.id),
            gte(appointments.date, targetFollowUpDate),
          ),
        );

      // 3. Create a Set of strings tracking which exact dates already have this time slot booked
      const blockedDates = new Set<string>();
      busyAppointments.forEach((app) => {
        // Safe string normalization for exact time slot matches ("10:30:00" vs "10:30")
        const appTimeClean = app.startTime.substring(0, 5);
        const inputTimeClean = startTime.substring(0, 5);

        if (appTimeClean === inputTimeClean) {
          // Normalize the date to YYYY-MM-DD string to store in the conflict cache Set
          const dateStr = new Date(app.date).toISOString().slice(0, 10);
          blockedDates.add(dateStr);
        }
      });

      // 4. Scan forward day-by-day starting from the target window to find the closest vacant slot
      let finalFollowUpDate = new Date(targetFollowUpDate);
      let slotFound = false;

      // Defensive ceiling loop over 30 days maximum to guarantee closure protection
      for (let i = 0; i < 30; i++) {
        // Skip Sundays completely as the clinic is closed
        const dayOfWeek = finalFollowUpDate.getUTCDay();
        const currentDateStr = finalFollowUpDate.toISOString().slice(0, 10);

        if (dayOfWeek !== 0 && !blockedDates.has(currentDateStr)) {
          slotFound = true;
          break; // Found an open day! Stop iterating.
        }

        // Advance cursor forward by 1 calendar day to search the next interval
        finalFollowUpDate.setDate(finalFollowUpDate.getDate() + 1);
      }

      if (!slotFound) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Could not find an available follow-up slot for this dentist within a 30-day window.",
        });
      }

      return {
        followUpDate: finalFollowUpDate,
        dentistId: dentist.id,
        startTime,
        serviceId: service.id,
        wasShifted:
          finalFollowUpDate.getTime() !== targetFollowUpDate.getTime(),
      };
    }),

  getByDentistId: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.id === 0) {
        console.log("Dentist ID is 0 not provided.");
        return null;
      }
      const data = await ctx.db.query.appointments.findMany({
        where: (appointments, { eq }) => eq(appointments.dentistId, input.id),
      });
      return data ?? null;
    }),

  getAllByMonthAndYear: adminProcedure
    .input(
      z.object({
        date: z.string().datetime().pipe(z.coerce.date()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const targetDate = input.date;

      const year = targetDate.getUTCFullYear();
      const month = targetDate.getUTCMonth();

      // 1. Create native Date objects matching the exact start and end moments of the month
      // Start: Midnight on the 1st day of the month (00:00:00.000 UTC)
      const firstMoment = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

      // End: 11:59:59.999 PM on the final day of the month
      // month + 1 with a day argument of 0 steps back to the exact final day of our target month
      const lastMoment = new Date(
        Date.UTC(year, month + 1, 0, 23, 59, 59, 999),
      );
      const data = await ctx.db
        .select({
          appointmentId: appointments.id,
          date: appointments.date,
          startTime: appointments.startTime,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
          dentist: {
            id: dentist.id,
            name: dentist.name,
            description: dentist.description,
          },
          service: {
            id: service.id,
            name: service.name,
            description: service.description,
          },
        })
        .from(appointments)
        .where(
          and(
            gte(appointments.date, firstMoment),
            lte(appointments.date, lastMoment),
          ),
        )
        .innerJoin(user, eq(appointments.userId, user.id))
        .innerJoin(dentist, eq(appointments.dentistId, dentist.id))
        .innerJoin(service, eq(appointments.service, service.id));
      return data ?? null;
    }),

  getForUser: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(5),
        offset: z.number().min(0).optional().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input;
      const data = await ctx.db
        .select({
          id: appointments.id,
          date: appointments.date,
          startTime: appointments.startTime,
          createdAt: appointments.createdAt,
          dentist: {
            id: dentist.id,
            name: dentist.name,
            description: dentist.description,
          },
          service: {
            id: service.id,
            name: service.name,
            description: service.description,
          },
        })
        .from(appointments)
        .innerJoin(dentist, eq(appointments.dentistId, dentist.id))
        .innerJoin(service, eq(appointments.service, service.id))
        .orderBy(desc(appointments.date))
        .where(eq(appointments.userId, ctx.session.user.id))
        .limit(limit)

        .offset(offset);
      return {
        data,
        meta: {
          limit,
          offset,
          count: data.length,
        },
      };
    }),

  editAppointment: adminProcedure
    .input(
      z.object({
        id: z.number(),
        service: z.number().optional(),
        date: z.string().datetime().pipe(z.coerce.date()),
        startTime: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, service, date, startTime } = input;
      await ctx.db
        .update(appointments)
        .set({ service, date, startTime })
        .where(eq(appointments.id, id));
    }),

  getByDate: publicProcedure
    .input(
      z.object({
        date: z.string().datetime().pipe(z.coerce.date()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.query.appointments.findMany({
        where: (appointments, { eq }) => eq(appointments.date, input.date),
      });
      return data ?? null;
    }),

  getDates: publicProcedure.query(async ({ ctx }) => {
    const dates = await ctx.db.query.appointments.findMany({
      with: {
        date: true,
      },
    });
    return dates ?? null;
  }),
});
