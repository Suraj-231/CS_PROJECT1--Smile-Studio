import { z } from "zod";
import { eq, sql, or, ilike } from "drizzle-orm";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { user } from "~/server/db/schema";

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
});
