import { and, eq, sql } from "drizzle-orm";
import express from "express";
import z from "zod";
import { db } from "../db/index.js";
import { cartProduct, carts, products } from "../db/schema.js";
import { validateBody } from "../middleware/validateBody.js";
import { productWithQuantity } from "../validation-schemas/products.js";

export const cartRouter = express.Router();

async function getUserCart(userId) {
  const rows = await db
    .select({
      cartId: carts.id,
      productId: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      image: products.image,
      quantity: cartProduct.quantity,
    })
    .from(carts)
    .innerJoin(cartProduct, eq(carts.id, cartProduct.cartId))
    .innerJoin(products, eq(cartProduct.productId, products.id))
    .where(eq(carts.user_id, userId));

  if (rows.length === 0) {
    return { id: null, userId: userId, products: [] };
  }

  return {
    id: rows[0].cartId,
    userId: userId,
    products: rows.map((row) => ({
      id: row.productId,
      name: row.name,
      description: row.description,
      price: row.price,
      image: row.image,
      quantity: row.quantity,
    })),
  };
}

cartRouter.get("/", async (req, res) => {
  const cart = await getUserCart(req.user.id);

  return res.status(200).json({
    data: cart,
  });
});

cartRouter.post("/", validateBody(productWithQuantity), async (req, res) => {
  let [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.user_id, req.user.id))
    .limit(1);

  if (!cart) {
    [cart] = await db
      .insert(carts)
      .values({ user_id: req.user.id })
      .returning();
  }

  const [existing] = await db
    .select()
    .from(cartProduct)
    .where(
      and(
        eq(cartProduct.cartId, cart.id),
        eq(cartProduct.productId, req.body.id),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(cartProduct)
      .set({ quantity: sql`${cartProduct.quantity} + ${req.body.quantity}` })
      .where(
        and(
          eq(cartProduct.cartId, cart.id),
          eq(cartProduct.productId, req.body.id),
        ),
      );
  } else {
    await db.insert(cartProduct).values({
      cartId: cart.id,
      productId: req.body.id,
      quantity: req.body.quantity,
    });
  }

  return res.status(201).json({
    message: "product added to cart",
    data: await getUserCart(req.user.id),
  });
});

cartRouter.patch(
  "/:productId",
  validateBody(z.object({ quantity: z.int().min(1) })),
  async (req, res) => {
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.user_id, req.user.id))
      .limit(1);

    if (!cart) {
      return res.status(404).json({
        error: "cart not found",
      });
    }

    const data = await db
      .update(cartProduct)
      .set({ quantity: req.body.quantity })
      .where(
        and(
          eq(cartProduct.cartId, cart.id),
          eq(cartProduct.productId, req.params.productId),
        ),
      )
      .returning();

    if (data.length === 0) {
      return res.status(404).json({
        error: "product not found in cart",
      });
    }

    return res.status(200).json({
      message: "cart updated",
      data: await getUserCart(req.user.id),
    });
  },
);

cartRouter.delete("/:productId", async (req, res) => {
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.user_id, req.user.id))
    .limit(1);

  if (!cart) {
    return res.status(404).json({
      error: "cart not found",
    });
  }

  const data = await db
    .delete(cartProduct)
    .where(
      and(
        eq(cartProduct.cartId, cart.id),
        eq(cartProduct.productId, req.params.productId),
      ),
    )
    .returning();

  if (data.length === 0) {
    return res.status(404).json({
      error: "product not found in cart",
    });
  }

  return res.status(200).json({
    message: "product removed from cart",
  });
});
