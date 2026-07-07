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
        estimatedTime: z.number(),
        description: z.string().min(1).max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const serviceExists = await ctx.db.query.service.findFirst({
        where: eq(service.name, input.name),
      });
      if (serviceExists) {
        throw new Error("Service already exists");
      }
      const newService = await ctx.db.insert(service).values({
        name: input.name,
        estimatedTime: input.estimatedTime,
        priority: input.priority,
        description: input.description,
      });
      return newService;
    }),

    getById:adminProcedure
    .input(
      z.object({
        serviceId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const serviceById = await ctx.db.query.service.findFirst({
        where: eq(service.id, input.serviceId),
      });
      if (!serviceById) {
        throw new Error("Service not found");
      }
      return serviceById;
    }),

  delete: adminProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(service).where(eq(service.id, input.id));
    }),

  edit: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        estimatedTime: z.number().optional(),
        priority: z.number().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(service)
        .set({
          name: input.name,
          estimatedTime: input.estimatedTime,
          priority: input.priority,
          description: input.description,
        })
        .where(eq(service.id, input.id));
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

  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.service.findMany();
  }),
});
