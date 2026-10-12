import { ilike, or, eq } from "drizzle-orm";
import express from "express";
import { db } from "../db/index.js";
import { products } from "../db/schema.js";
import { checkAuth } from "../middleware/checkAuth.js";
import { checkRole } from "../middleware/checkRole.js";
import { validateBody } from "../middleware/validateBody.js";
import {
  insertProductSchema,
  updateProductSchema,
} from "../validation-schemas/products.js";

export const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
  const search = req.query.search;

  const query = db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      image: products.image,
      price: products.price,
    })
    .from(products);

  if (search) {
    const pattern = `%${search}%`;
    query.where(
      or(ilike(products.name, pattern), ilike(products.description, pattern)),
    );
  }

  const data = await query;

  return res.status(200).json({
    data: data,
  });
});

productsRouter.get("/:id", async (req, res) => {
  const [data] = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      image: products.image,
      price: products.price,
    })
    .from(products)
    .where(eq(products.id, req.params.id))
    .limit(1);

  if (!data) {
    return res.status(404).json({
      error: "product not found",
    });
  }

  return res.status(200).json({
    data: data,
  });
});

productsRouter.post(
  "/",
  checkAuth,
  checkRole("merchant"),
  validateBody(insertProductSchema),
  async (req, res) => {
    const [data] = await db.insert(products).values(req.body).returning();

    return res.status(201).json({
      message: "product created successfully",
      data: data,
    });
  },
);

productsRouter.patch(
  "/:id",
  checkAuth,
  checkRole("merchant"),
  validateBody(updateProductSchema),
  async (req, res) => {
    const [data] = await db
      .update(products)
      .set(req.body)
      .where(eq(products.id, req.params.id))
      .returning();

    if (!data) {
      return res.status(404).json({
        error: "product not found",
      });
    }

    return res.status(200).json({
      message: "product updated successfully",
      data: data,
    });
  },
);

productsRouter.delete(
  "/:id",
  checkAuth,
  checkRole("merchant"),
  async (req, res) => {
    const data = await db
      .delete(products)
      .where(eq(products.id, req.params.id))
      .returning();

    if (data.length === 0) {
      return res.status(404).json({
        error: "product not found",
      });
    }

    return res.status(204).end();
  },
);
