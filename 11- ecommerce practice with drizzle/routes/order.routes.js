import { sql } from "drizzle-orm";
import express from "express";
import { db } from "../db/index.js";
import {
  cartProduct,
  carts,
  orderProduct,
  orders,
  products,
} from "../db/schema";

export const orderRouter = express.Router();


orderRouter.get("/", async (req, res) => {
  const data = await db
    .select({
      order_id: orders.id,
      user_id: orders.user_id,
      id: products.id,
      name: products.name,
      image: products.image,
      description: products.description,
      price: orderProduct.price,
      quantity: orderProduct.quantity,
      total: sql`price * quantity`.mapWith(Number),
      created_at: orders.created_at,
    })
    .from(orders)
    .innerJoin(orderProduct, eq(orderProduct.orderId, orders.id))
    .innerJoin(products, eq(orderProduct.productId, products.id))
    .where(eq(orders.user_id, req.user.id));

  const finalData = data.map((o) => ({
    id: o.order_id,
    userId: o.user_id,
    total: o.total,
    products: data
      .filter((d) => d.order_id == o.order_id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        description: p.description,
        quantity: p.quantity,
      })),
    createdAt: o.created_at,
  }));

  res.status(200).json({
    message: "success",
    data: finalData,
  });
});

orderRouter.post("/checkout", async (req, res) => {
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

  const insertedData = data.map((d) => ({
    price: d.price,
    quantity: d.quantity,
    product_id: d.id,
  }));

  await db.insert(orderProduct).values(insertedData);

  await db.delete(cartProduct).where(eq(cartProduct.cartId, data[0].cartId));

  res.status(200).json({
    message: "success",
  });
});
