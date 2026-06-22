import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { appointments, dentist } from "~/server/db/schema";

export const appsRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        dentistId: z.number().min(1),
        date: z.string(),
        startTime: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session?.user.id) {
        //console.log("User ID:", ctx.session.user.id)
        await ctx.db.insert(appointments).values({
          userId: ctx.session.user.name,
          dentistId: input.dentistId,
          date: input.date,
          startTime: input.startTime,
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

  edit: publicProcedure
    .input(
      z.object({
        id: z.number(),
        newDate: z.date(),
        newStartTime: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .update(appointments)
          .set({
            date: input.newDate.toDateString(),
            startTime: input.newStartTime,
          })
          .where(eq(appointments.id, input.id));
      } catch (error) {
        console.error("Error updating appointment time:", error);
        throw new Error("Failed to update appointment time");
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

  getDates: publicProcedure.query(async ({ ctx }) => {
    const dates = await ctx.db.query.appointments.findMany({
      with: {
        date: true,
      },
    });
    return dates ?? null;
  }),
});
