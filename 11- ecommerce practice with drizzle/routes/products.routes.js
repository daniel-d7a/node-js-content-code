import express from "express";
import { db } from "../db/index.js";
import { products } from "../db/schema";
import { checkRole } from "../middleware/checkRole.js";
import { validateBody } from "../middleware/validateBody.js";
import {
  insertProductSchema,
  updateProductSchema,
} from "../validation-schemas/products.js";

export const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
  const data = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      image: products.image,
      price: products.price,
    })
    .from(products);

  return res.status(200).json({
    data: data,
  });
});

productsRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  const [data] = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      image: products.image,
      price: products.price,
    })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return res.status(200).json({
    data: data,
  });
});

productsRouter.post(
  "/",
  checkRole("merchant"),
  validateBody(insertProductSchema),
  async (req, res) => {
    const [data] = await db.insert(products).values(req.body).returning();

    return res.status(201).json({
      data: data,
    });
  },
);

productsRouter.put(
  "/:id",
  checkRole("merchant"),
  validateBody(updateProductSchema),
  async (req, res) => {
    const [data] = await db
      .update(products)
      .set(req.body)
      .where(eq(products.id, req.params.id))
      .returning();

    return res.status(200).json({
      data: data,
    });
  },
);

productsRouter.delete("/:id", checkRole("merchant"), async (req, res) => {
  await db.delete(products).where(eq(products.id, req.params.id));

  return res.status(204).json({
    message: "success",
  });
});
