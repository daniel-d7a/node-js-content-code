import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import z from "zod";
import { products } from "../db/schema.js";

export const insertProductSchema = createInsertSchema(products);
export const updateProductSchema = createUpdateSchema(products).omit({
  id: true,
});

export const productWithQuantity = insertProductSchema.extend({
  quantity: z.int().min(1),
});
