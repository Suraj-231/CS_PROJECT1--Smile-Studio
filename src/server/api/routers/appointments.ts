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

  getById: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.query.appointments.findMany({
        where: (appointments, { eq }) => eq(appointments.userId, input.id),
      });
      return data ?? null;
    }),

  // getFollowUp: publicProcedure
  //   .input(
  //     z.object({
  //       serviceId: z.number(),
  //       priority: z.number(),
  //       dentistId: z.number(),
  //       prevDate: z.string(),
  //       prevTime: z.string(),
  //     }),
  //   )
  //   .query(async ({ input, ctx }) => {
  //     const { dentistId, prevDate, prevTime, priority } = input;

  //     // 1. Calculate a base date to start searching from
  //     const baseDate = new Date(prevDate);
  //     if (isNaN(baseDate.getTime())) {
  //       throw new Error("Invalid prevDate format.");
  //     }

  //     // Determine starting gap based on urgency priority
  //     // High priority (>3): Look as early as 3 days from the previous visit
  //     // Normal priority (<=3): Standard 14 days (2 weeks) routine follow-up window
  //     const daysToWait = priority > 3 ? 3 : 14;
  //     baseDate.setDate(baseDate.getDate() + daysToWait);

  //     // 2. Fetch all upcoming appointments for this dentist to detect slot conflicts
  //     // Grabbing anything from the base start date onwards
  //     const formattedStartDateString = baseDate.toISOString().split("T")[0];

  //     const busyAppointments = await ctx.db
  //       .select({
  //         date: appointments.date,
  //         startTime: appointments.startTime,
  //       })
  //       .from(appointments)
  //       .where(
  //         and(
  //           eq(appointments.dentistId, dentistId),
  //           gte(appointments.date, baseDate),
  //         ),
  //       );

  //     // Create a Set of "YYYY-MM-DD" strings representing days where the requested time slot is blocked
  //     const blockedDates = new Set<string>();
  //     busyAppointments.forEach((app) => {
  //       // Normalizing times to compare cleanly (e.g., matching "09:00:00" or "09:00")
  //       const appTimeClean = app.startTime.substring(0, 5);
  //       const inputTimeClean = prevTime.substring(0, 5);

  //       if (appTimeClean === inputTimeClean) {
  //         blockedDates.add(app.date.toISOString());
  //       }
  //     });

  //     // 3. Scan forward Day-by-Day to discover 3 vacant slot openings
  //     const suggestedDates: string[] = [];
  //     const searchCursor = new Date(baseDate);

  //     // Limit search matrix loop to 60 days max defensively to prevent infinite runaway loops
  //     for (let i = 0; i < 60 && suggestedDates.length < 3; i++) {
  //       // Skip Sundays as the clinic is closed
  //       const dayOfWeek = searchCursor.getUTCDay();
  //       const dateString = searchCursor.toISOString().split("T")[0];

  //       if (dayOfWeek !== 0 && !blockedDates.has(dateString)) {
  //         suggestedDates.push(dateString);
  //       }

  //       // Increment cursor forward by 1 calendar day
  //       searchCursor.setDate(searchCursor.getDate() + 1);
  //     }

  //     return {
  //       success: true,
  //       dentistId,
  //       requestedTime: prevTime,
  //       priorityRule:
  //         priority > 3
  //           ? "High Priority (Accelerated Window)"
  //           : "Standard Tracking",
  //       suggestions: suggestedDates,
  //     };
  //   }),

  getByDentistId: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.id) {
        const data = await ctx.db.query.appointments.findMany({
          where: (appointments, { eq }) => eq(appointments.dentistId, input.id),
        });
        return data ?? null;
      } else {
        console.log("Dentist ID not provided.");
      }
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
        limit: z.number().min(1).max(50).optional().default(10),
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
