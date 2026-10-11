import express from "express";

import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "../db/index.js";
import { cartProduct, carts, products } from "../db/schema.js";
import { validateBody } from "../middleware/validateBody.js";
import { productWithQuantity } from "../validation-schemas/products.js";

export const cartRouter = express.Router();

cartRouter.get("/", async (req, res) => {
  const data = await db
    .select({
      cartId: carts.id,
      userId: carts.user_id,
      id: products.id,
      name: products.name,
      price: products.price,
      image: products.image,
      description: products.description,
      quantity: cartProduct.quantity,
    })
    .from(carts)
    .innerJoin(cartProduct, eq(carts.id, cartProduct.cartId))
    .innerJoin(products, eq(cartProduct.productId, products.id))
    .where(eq(carts.user_id, req.user.id));

  const finalData = {
    id: data[0].cartId,
    userId: data[0].userId,
    products: data.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      description: p.description,
      quantity: p.quantity,
    })),
  };

  return res.status(200).json({
    data: finalData,
  });
});

cartRouter.post("/", validateBody(productWithQuantity), async (req, res) => {
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(cart.user_id, req.user.id));

  await db.insert(cartProduct).values({
    productId: req.body.id,
    quantity: req.body.quantity,
    cartId: cart.id,
  });

  res.status(201).json({
    message: "success",
  });
});

cartRouter.put(
  "/:product_id",
  validateBody(z.object({ quantity: z.int().min(1) })),
  async (req, res) => {
    const product_id = req.params.product_id;
    const quantity = req.body.quantity;
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(cart.user_id, req.user.id));

    await db
      .update(cartProduct)
      .set({ quantity: quantity })
      .where(
        and(
          eq(cartProduct.cartId, cart.id),
          eq(cartProduct.productId, product_id),
        ),
      );

    res.status(200).json({
      message: "success",
    });
  },
);

cartRouter.delete("/:product_id", async (req, res) => {
  const product_id = req.params.product_id;
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(cart.user_id, req.user.id));

  await db
    .delete(cartProduct)
    .where(
      and(
        eq(cartProduct.cartId, cart.id),
        eq(cartProduct.productId, product_id),
      ),
    );

  return res.status(204).end();
});
