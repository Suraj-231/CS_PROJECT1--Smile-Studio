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
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.query) {
        console.log(`No search query provided, defaulting to all users`);
        const data = await ctx.db.query.user.findMany({
          limit: input.limit,
          orderBy: (users, { desc }) => [desc(user.id)],
        });
        return data ?? [];
      }
      const searchTerm = `%${input.query.toLowerCase()}%`;
      console.log(`Searching for: ${input.query}`);
      const data = await ctx.db.query.user.findMany({
        where: or(
          ilike(user.name, searchTerm),
          ilike(user.email, searchTerm),
          // Add more columns as needed based on your user schema
          // ilike(user.username, searchTerm),
          // ilike(user.firstName, searchTerm),
          // ilike(user.lastName, searchTerm),
        ),
        limit: input.limit,
        orderBy: (users, { desc }) => [desc(user.id)],
      });

      if (data.length > 0) {
        console.log(
          `Found user matching: ${input.query} (${data.length} results)`,
        );
        return data;
      }
      console.log(`No results found for: ${input.query}`);
      return [];
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
