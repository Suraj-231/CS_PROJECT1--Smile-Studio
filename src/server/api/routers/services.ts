import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { service } from "~/server/db/schema";

export const servicesRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        priority: z.number(),
        estimatedTime: z.string().optional(),
        description: z.string().min(1).max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(service).values({
        name: input.name,
        estimatedTime: input.estimatedTime,
        priority: input.priority,
        description: input.description,
      });
    }),

  getCount: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.$count(service);
  }),

  remove: adminProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(service).where(eq(service.id, input.id));
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        estimatedTime: z.string().optional(),
        description: z.string().min(1).max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(service)
        .set({
          name: input.name,
          estimatedTime: input.estimatedTime,
          description: input.description,
        })
        .where(eq(service.id, input.id));
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.service.findMany();
  }),
});
