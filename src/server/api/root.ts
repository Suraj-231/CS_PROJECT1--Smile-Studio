import { appsRouter } from "./routers/appointments";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { dentistRouter } from "./routers/dentist";
import { usersRouter } from "./routers/users";
import { servicesRouter } from "./routers/services";
import { emailRouter } from "./routers/email";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  apps: appsRouter,
  email: emailRouter,
  users: usersRouter,
  dentists: dentistRouter,
  services: servicesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
