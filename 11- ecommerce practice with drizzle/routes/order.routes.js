import { eq, sql } from "drizzle-orm";
import express from "express";
import { db } from "../db/index.js";
import {
  cartProduct,
  carts,
  orderProduct,
  orders,
  products,
} from "../db/schema.js";

export const orderRouter = express.Router();

orderRouter.get("/", async (req, res) => {
  const rows = await db
    .select({
      orderId: orders.id,
      userId: orders.user_id,
      status: orders.status,
      createdAt: orders.created_at,
      productId: products.id,
      name: products.name,
      description: products.description,
      image: products.image,
      price: orderProduct.price,
      quantity: orderProduct.quantity,
      lineTotal: sql`order_product.price * order_product.quantity`.mapWith(
        Number,
      ),
    })
    .from(orders)
    .innerJoin(orderProduct, eq(orderProduct.orderId, orders.id))
    .innerJoin(products, eq(orderProduct.productId, products.id))
    .where(eq(orders.user_id, req.user.id));

  const data = rows.reduce((grouped, row) => {
    let order = grouped.find((o) => o.id === row.orderId);

    if (!order) {
      order = {
        id: row.orderId,
        userId: row.userId,
        products: [],
        total: 0,
        status: row.status,
        createdAt: row.createdAt,
      };
      grouped.push(order);
    }

    order.products.push({
      id: row.productId,
      name: row.name,
      description: row.description,
      price: row.price,
      image: row.image,
      quantity: row.quantity,
    });
    order.total = Number((order.total + row.lineTotal).toFixed(2));

    return grouped;
  }, []);

  return res.status(200).json({
    data: data,
  });
});

orderRouter.post("/checkout", async (req, res) => {
  const rows = await db
    .select({
      cartId: carts.id,
      productId: products.id,
      name: products.name,
      description: products.description,
      image: products.image,
      price: products.price,
      quantity: cartProduct.quantity,
    })
    .from(carts)
    .innerJoin(cartProduct, eq(carts.id, cartProduct.cartId))
    .innerJoin(products, eq(cartProduct.productId, products.id))
    .where(eq(carts.user_id, req.user.id));

  if (rows.length === 0) {
    return res.status(422).json({
      error: "cart is empty",
    });
  }

  const total = Number(
    rows.reduce((sum, row) => sum + row.price * row.quantity, 0).toFixed(2),
  );

  const [order] = await db
    .insert(orders)
    .values({ user_id: req.user.id })
    .returning();

  await db.insert(orderProduct).values(
    rows.map((row) => ({
      orderId: order.id,
      productId: row.productId,
      quantity: row.quantity,
      price: row.price,
    })),
  );

  await db.delete(cartProduct).where(eq(cartProduct.cartId, rows[0].cartId));

  return res.status(201).json({
    message: "order placed successfully",
    data: {
      id: order.id,
      userId: order.user_id,
      products: rows.map((row) => ({
        id: row.productId,
        name: row.name,
        description: row.description,
        price: row.price,
        image: row.image,
        quantity: row.quantity,
      })),
      total: total,
      status: order.status,
      createdAt: order.created_at,
    },
  });
});
