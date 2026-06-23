import { z } from "zod";
import { eq, sql, ilike } from "drizzle-orm";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { appointments, dentist, user, service } from "~/server/db/schema";

export const appsRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        dentistId: z.number().min(1),
        date: z.string().optional(),
        startTime: z.string().min(1),
        serviceType: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session?.user.id) {
        if (!input.date || !input.startTime) {
          throw new Error("Date and start time are required");
        }
        //console.log("User ID:", ctx.session.user.id)
        // First check if appointment already exists
        const existingAppointment = await ctx.db.query.appointments.findFirst({
          where: (appointments, { and, eq }) =>
            and(
              eq(appointments.date, input.date as string),
              eq(appointments.startTime, input.startTime as string),
            ),
        });

        if (existingAppointment) {
          throw new Error("Appointment already exists");
        }

        await ctx.db.insert(appointments).values({
          userId: ctx.session.user.id as string,
          dentistId: input.dentistId,
          date: input.date as string,
          startTime: input.startTime,
          service: input.serviceType,
        });

        await ctx.db
          .update(dentist)
          .set({
            appointmentCount: sql`${dentist.appointmentCount} + 1`,
          })
          .where(eq(dentist.id, input.dentistId));
      } else {
        throw new Error("Not authenticated");
      }
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.delete(appointments).where(eq(appointments.id, input.id));
      } catch (error) {
        console.error("Error deleting appointment:", error);
        throw new Error("Failed to delete appointment");
      }
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.appointments.findMany({
      orderBy: (appointments, { asc }) => [asc(appointments.date)],
    });

    return data ?? null;
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

  getByDentistId: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.query.appointments.findMany({
        where: (appointments, { eq }) => eq(appointments.dentistId, input.id),
      });
      return data ?? null;
    }),

  getAllByMonthAndYear: adminProcedure
    .input(
      z.object({
        month: z.number(),
        year: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { month, year } = input;
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
        .innerJoin(user, eq(appointments.userId, user.id))
        .innerJoin(dentist, eq(appointments.dentistId, dentist.id))
        .innerJoin(service, eq(appointments.service, service.id));
      return data ?? null;
    }),

  getForUser: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.userId) return [];
      const data = await ctx.db.query.appointments.findMany({
        where: (appointments, { eq }) => eq(appointments.userId, input.userId),
      });
      return data ?? null;
    }),

  editAppointment: adminProcedure
    .input(
      z.object({
        id: z.number(),
        service: z.number().optional(),
        date: z.string().optional(),
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
        date: z.string(),
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
