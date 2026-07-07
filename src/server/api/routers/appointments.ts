import { z } from "zod";
import { eq, sql, ilike, and, gte, lte, desc, count } from "drizzle-orm";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { appointments, dentist, user, service } from "~/server/db/schema";
import { resendConfirmationEmail, addAppointmentToGoogleCalendar, resendCancellationEmail } from "~/server/resend/send-email";
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
        localeDateForEmail: z.string(),
        service: z.object({
          id: z.number(),
          name: z.string(),
          estimatedTime: z.number(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingAppointmentOnDate =
        await ctx.db.query.appointments.findFirst({
          where: (appointments, { and, eq }) =>
            and(
              eq(appointments.userId, ctx.session.user.id),
              eq(appointments.date, input.date),
              eq(appointments.dentistId, input.dentist.id),
            ),
        });
      if (existingAppointmentOnDate) {
        throw new Error(
          "You have already booked an appointment with the same dentist on this date.",
        );
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
          estimatedTime: number;
        } | null = null;
        try {
          await ctx.db.transaction(async (tx) => {
            const newApp = await ctx.db.insert(appointments).values({
              userId: ctx.session.user.id,
              dentistId: input.dentist.id,
              date: input.date,
              startTime: input.startTime,
              service: input.service.id,
            });
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
              dateStr: input.localeDateForEmail, // "2026-07-15"
              timeStr: input.startTime, // "10:00:00"
              estimatedTime: input.service.estimatedTime, // "90"
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
        if (emailData) {
          try {
            console.log("Sending email to: ",emailData);
            await resendConfirmationEmail(emailData);
            //await addAppointmentToGoogleCalendar(emailData);
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


    getUsersWithAppointments: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit } = input;

      try {
        // Left join users with appointments to count total historical sessions per user
        const patientRegistry = await ctx.db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            // SQL aggregate counting the matching rows in the appointments table
            totalVisits: sql<number>`cast(count(${appointments.id}) as integer)`,
          })
          .from(user)
          .leftJoin(appointments, eq(user.id, appointments.userId))
          .groupBy(user.id)
          .orderBy(desc(sql`count(${appointments.id})`)) 
          .limit(limit);

      
        return patientRegistry.map((patient) => ({
          id: patient.id,
          name: patient.name || "Unknown Patient",
          email: patient.email,
          totalVisits: patient.totalVisits ?? 0,
        }));

      } catch (error) {
        console.error("Database analytics aggregation failure:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to compile analytical registry datasets.",
        });
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
        .innerJoin(user, eq(appointments.userId, user.id))
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
        const appointmentDetails = await ctx.db
          .select({
            id: appointments.id,
            date: appointments.date,
            startTime: appointments.startTime,
            email: user.email,
            patientName: user.name,
            dentistName: dentist.name,
            serviceName: service.name,
          })
          .from(appointments)
          .innerJoin(user, eq(appointments.userId, user.id))
          .innerJoin(dentist, eq(appointments.dentistId, dentist.id))
          .innerJoin(service, eq(appointments.service, service.id))
          .where(eq(appointments.id, input.appointmentId))
          .limit(1);

        const appointmentDetail = appointmentDetails[0];

        if (!appointmentDetail) {
          throw new Error("Appointment not found");
        }

        const deletedAppointments = await ctx.db
          .delete(appointments)
          .where(eq(appointments.id, input.appointmentId))
          .returning({
            id: appointments.id,
            userId: appointments.userId,
            date: appointments.date,
            startTime: appointments.startTime,
            dentistId: appointments.dentistId,
            serviceId: appointments.service,
          });

        const deletedAppointment = deletedAppointments[0];

        if (!deletedAppointment) {
          throw new Error("Appointment not found");
        }

        await ctx.db
          .update(dentist)
          .set({
            appointmentCount: sql`${dentist.appointmentCount} - 1`,
          })
          .where(eq(dentist.id, input.dentistId));

        await resendCancellationEmail({
          email: appointmentDetail.email,
          patientName: appointmentDetail.patientName ?? "Patient",
          dateStr: appointmentDetail.date.toISOString(),
          timeStr: appointmentDetail.startTime,
          frontendUrl:
            process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
          clinicPhone: process.env.CLINIC_PHONE,
          clinicEmail: process.env.CLINIC_EMAIL,
        });
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

  getLatest: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      return null
    }
    const data = await ctx.db
      .select({
        dentist: {
          id: dentist.id,
          name: dentist.name,
        },
        date: appointments.date,
        startTime: appointments.startTime,
      })
      .from(appointments)
      .where(
        and(
          gte(appointments.date, new Date()),
          eq(appointments.userId, ctx.session.user.id)
        )
      )
      .innerJoin(user, eq(appointments.userId, user.id))
      .innerJoin(dentist, eq(appointments.dentistId, dentist.id))
      .limit(1);
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
        const appTimeClean = app.startTime.substring(0, 5);
        const inputTimeClean = startTime.substring(0, 5);

        if (appTimeClean === inputTimeClean) {
          // Fall back to a local string parse sequence to eliminate timezone shifting
          const d = new Date(app.date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;
          
          blockedDates.add(dateStr);
        }
      });

      // 4. Scan forward day-by-day starting from the target window to find the closest vacant slot
      let finalFollowUpDate = new Date(targetFollowUpDate);
      let slotFound = false;

      // Defensive ceiling loop over 30 days maximum to guarantee closure protection
      for (let i = 0; i < 30; i++) {
        // FIXED: Use local .getDay() instead of .getUTCDay() to evaluate Sundays (0 = Sunday) accurately
        const dayOfWeek = finalFollowUpDate.getDay();
        
        const year = finalFollowUpDate.getFullYear();
        const month = String(finalFollowUpDate.getMonth() + 1).padStart(2, "0");
        const day = String(finalFollowUpDate.getDate()).padStart(2, "0");
        const currentDateStr = `${year}-${month}-${day}`;

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



  getByUserId: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, ctx.session.user.id));
  }),

  getByDentistId: publicProcedure
    .input(
      z.object({
        dentistId: z.number().nullable().optional(),
        date: z.string().datetime().pipe(z.coerce.date()).optional().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.dentistId || input.date === undefined || input.date === null) {
        return null;
      }
      const unulledInput: number = input.dentistId;

      const data = await ctx.db
        .select({
          startTime: appointments.startTime,
          date: appointments.date,
          service: {
            id: service.id,
            name: service.name,
            estimatedTime: service.estimatedTime,
          },
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.dentistId, unulledInput),
            eq(appointments.date, input.date),
          ),
        )
        .innerJoin(service, eq(appointments.service, service.id));

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
      const totalApps = await ctx.db
        .select({
          count: count(appointments.id),
        })
        .from(appointments)
        .where(eq(appointments.userId, ctx.session.user.id));
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
          count: totalApps[0]?.count,
        },
      };
    }),

  getRescheduledDateAndTime: publicProcedure
    .input(
      z.object({
        dentistId: z.number(),
        // The date they are looking to move to (or current date)
        date: z.string().datetime().pipe(z.coerce.date()),
        // The preferred time slot they want to keep (e.g., "10:30:00")
        startTime: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { dentistId, date, startTime } = input;

      const searchStartDate = new Date(date);
      if (isNaN(searchStartDate.getTime())) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid date format.",
        });
      }

      // 1. Grab all future appointments for this dentist starting from the search date
      // This allows us to load the dentist's busy schedule into memory once, bypassing a heavy database loop
      const upcomingBusySlots = await ctx.db
        .select({
          date: appointments.date,
          startTime: appointments.startTime,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.dentistId, dentistId),
            gte(appointments.date, searchStartDate),
          ),
        );

      // 2. Build a Set tracking dates where this specific time slot is already taken
      const blockedDates = new Set<string | undefined>();
      upcomingBusySlots.forEach((slot) => {
        const appTimeClean = slot.startTime.substring(0, 5);
        const targetTimeClean = startTime.substring(0, 5);

        if (appTimeClean === targetTimeClean) {
          const dateStr = new Date(slot.date).toISOString().split("T")[0];
          blockedDates.add(dateStr);
        }
      });

      // 3. Scan forward day-by-day to collect exactly 3 available alternative slots
      const suggestions: Array<{
        date: Date;
        dateStr: string | undefined;
        startTime: string;
      }> = [];
      let dayCursor = new Date(searchStartDate);

      // Protect against endless loops by bounding our search to a maximum 60-day window
      for (let i = 0; i < 60; i++) {
        if (suggestions.length >= 3) break; // We found our 3 open slots!

        const dayOfWeek = dayCursor.getUTCDay(); // 0 = Sunday
        const dayCursorStr = dayCursor.toISOString().split("T")[0];

        // Ensure the clinic is open (not Sunday) and the time slot isn't blocked
        if (dayOfWeek !== 0 && !blockedDates.has(dayCursorStr)) {
          suggestions.push({
            date: new Date(dayCursor),
            dateStr: dayCursorStr,
            startTime: startTime,
          });
        }

        // Advance to the next calendar day
        dayCursor.setDate(dayCursor.getDate() + 1);
      }

      return {
        success: true,
        dentistId,
        preferredTime: startTime,
        suggestions,
      };
    }),

  reschedule: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        dateForEmail: z.string(),
        date: z.string().datetime().pipe(z.coerce.date()),
        startTime: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, date, startTime } = input;
      
      const updated = await ctx.db
        .update(appointments)
        .set({ date, startTime })
        .where(
          and(
            eq(appointments.id, id),
            eq(appointments.userId, ctx.session.user.id),
          ),
        )
        .returning({ id: appointments.id, date: appointments.date });

        const rescheduledApp = await ctx.db.select({
          user:{
            email: user.email,
            name: user.name,
          },
          dentist:{
            id: dentist.id,
            name: dentist.name,
          },
          service:{
            id: service.id,
            name: service.name,
            estimatedTime: service.estimatedTime,
          },
          date: appointments.date,
          startTime: appointments.startTime,
        }).from(appointments)
        .innerJoin(user, eq(appointments.userId, user.id))
        .innerJoin(dentist, eq(appointments.dentistId, dentist.id))
        .innerJoin(service, eq(appointments.service, service.id))
        .where(eq(appointments.id, id))
        .limit(1);

        if(rescheduledApp[0]){
          await resendConfirmationEmail({
            appointmentId: input.id,
            email: rescheduledApp[0].user.email,
            patientName: rescheduledApp[0].user.name,
            dentistName: rescheduledApp[0].dentist.name,
            serviceName: rescheduledApp[0].service.name,
            dateStr: input.dateForEmail,
            timeStr: rescheduledApp[0].startTime,
            estimatedTime: rescheduledApp[0].service.estimatedTime,
          });
        }

      if (updated.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Appointment not found or not owned by user.",
        });
      }

      return { success: true, appointment: updated[0] };
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
