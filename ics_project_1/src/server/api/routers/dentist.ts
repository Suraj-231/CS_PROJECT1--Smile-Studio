import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { dentist } from "~/server/db/schema";

export const dentistRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1).max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(dentist).values({
        name: input.name,
      });
    }),

  remove: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(dentist).where(eq(dentist.id, input.id));
    }),

  decrement: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(dentist)
        .set({
          appointmentCount: sql`${dentist.appointmentCount} - 1`,
        })
        .where(eq(dentist.id, input.id));
    }),

  increment: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(dentist)
        .set({
          appointmentCount: sql`${dentist.appointmentCount} + 1`,
        })
        .where(eq(dentist.id, input.id));
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.dentist.findMany();
    return data ?? null;
  }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.query.dentist.findFirst({
        where: eq(dentist.id, input.id),
      });
      return data ?? null;
    }),
});
