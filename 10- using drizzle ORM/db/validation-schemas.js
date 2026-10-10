import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";
import { books } from "./schema.js";

export const bookSelectSchema = createSelectSchema(books);
export const bookInsertSchema = createInsertSchema(books);
