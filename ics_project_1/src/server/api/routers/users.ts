import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { user } from "~/server/db/schema";
