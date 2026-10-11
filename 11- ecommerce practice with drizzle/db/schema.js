import { defineRelations } from "drizzle-orm";
import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

const roleEnum = pgEnum("role", ["merchant", "customer"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  role: roleEnum().default("customer"),
});

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  image: varchar("image", { length: 255 }),
  description: text(),
  price: decimal({ precision: 10, scale: 2, mode: "number" }).default(0),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const cartProduct = pgTable(
  "cart_product",
  {
    cartId: integer("cart_id")
      .notNull()
      .references(() => carts.id),
    productId: integer("prodcut_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").default(1),
  },
  (table) => [primaryKey({ columns: [table.cartId, table.productId] })],
);

export const orderProduct = pgTable(
  "order_product",
  {
    productId: integer("prodcut_id")
      .notNull()
      .references(() => products.id),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id),
    quantity: integer("quantity").default(1),
    price: decimal("price", {
      precision: 10,
      scale: 2,
      mode: "number",
    }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.productId, table.orderId] })],
);

export const relations = defineRelations(
  {
    users,
    carts,
    products,
    orders,
    cartProduct,
    orderProduct,
  },
  (r) => ({
    users: {
      cart: r.one.carts({
        from: r.users.id,
        to: r.carts.id,
      }),
      orders: r.many.orders({
        from: r.users.id,
        to: r.orders.user_id,
      }),
    },
    carts: {
      user: r.one.users(),
      products: r.many.products({
        from: r.carts.id.through(r.cartProduct.cartId),
        to: r.products.id.through(r.cartProduct.productId),
      }),
    },
    orders: {
      user: r.one.users(),
      products: r.many.products({
        from: r.orders.id.through(r.orderProduct.orderId),
        to: r.products.id.through(r.orderProduct.productId),
      }),
    },
    products: {
      carts: r.many.carts(),
      orders: r.many.orders(),
    },
  }),
);
