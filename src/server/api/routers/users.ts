import { z } from "zod";
import { eq, sql, or, ilike } from "drizzle-orm";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { appointments, user } from "~/server/db/schema";

export const usersRouter = createTRPCRouter({
  getWithSearch: publicProcedure
    .input(
      z.object({
        query: z.optional(z.string()),
        limit: z.number().default(50),
        page: z.number().min(1).default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const page = Math.max(1, input.page);
      const offset = (page - 1) * input.limit;
      const searchTerm = input.query ? `%${input.query.toLowerCase()}%` : null;
      const whereClause = searchTerm
        ? or(ilike(user.name, searchTerm), ilike(user.email, searchTerm))
        : undefined;

      if (!input.query) {
        console.log(`No search query provided, defaulting to all users`);
      } else {
        console.log(`Searching for: ${input.query}`);
      }

      const data = await ctx.db.query.user.findMany({
        where: whereClause,
        limit: input.limit,
        offset,
        orderBy: (users, { desc }) => [desc(user.id)],
      });

      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(user)
        .where(whereClause);

      const total = Number(totalResult[0]?.count ?? 0);
      const totalPages = Math.max(1, Math.ceil(total / input.limit));

      if (input.query && data.length > 0) {
        console.log(`Found user matching: ${input.query} (${total} results)`);
      }

      if (input.query && data.length === 0) {
        console.log(`No results found for: ${input.query}`);
      }

      return {
        data,
        total,
        totalPages,
        page,
      };
    }),

  getCount: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.$count(user);
  }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log(`Deleting appointment data for user ${input.userId}`);
      await ctx.db
        .delete(appointments)
        .where(eq(appointments.userId, input.userId));
      console.log(`Deleting User: ${input.userId}`);
      await ctx.db.delete(user).where(eq(user.id, input.userId));
    }),

  getUserDataByUserId: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await ctx.db
        .select({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            role: user.role,
            // banned: user.banned,
            // banReason: user.banReason,
            // banExpires: user.banExpires,
          },
          appointments: {
            id: appointments.id,
            serviceId: appointments.service,
            date: appointments.date,
            startTime: appointments.startTime,
            createdAt: appointments.createdAt,
            updatedAt: appointments.updatedAt,
          },
        })
        .from(user)
        .where(eq(user.id, input.userId))
        .innerJoin(appointments, eq(appointments.userId, user.id));
      return data;
    }),
});
