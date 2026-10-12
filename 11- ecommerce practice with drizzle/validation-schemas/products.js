import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import z from "zod";
import { products } from "../db/schema.js";

export const insertProductSchema = createInsertSchema(products, {
  name: (schema) => schema.min(1),
  description: (schema) => schema.min(1),
  price: (schema) => schema.positive(),
})
  .omit({ id: true })
  .required({ description: true, price: true });

export const updateProductSchema = createUpdateSchema(products, {
  name: (schema) => schema.min(1),
  description: (schema) => schema.min(1),
  price: (schema) => schema.positive(),
}).omit({ id: true });

export const productWithQuantity = createInsertSchema(products, {
  id: z.coerce.number().int().positive(),
  name: (schema) => schema.min(1),
  description: (schema) => schema.min(1),
  price: (schema) => schema.positive(),
})
  .required({ id: true, description: true, price: true })
  .extend({ quantity: z.int().min(1) });
