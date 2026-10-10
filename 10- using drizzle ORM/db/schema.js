import { defineRelations } from "drizzle-orm";
import {
  decimal,
  integer,
  pgTable,
  primaryKey,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const authors = pgTable("authors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  price: decimal({ precision: 10, scale: 2, mode: "number" }).notNull(),
  author_id: integer("author_id")
    .notNull()
    .references(() => authors.id, {
      onDelete: "restrict",
    }),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  ordered_at: timestamp("ordered_at").defaultNow(),
  customer_id: integer("customer_id")
    .notNull()
    .references(() => customers.id, {
      onDelete: "cascade",
    }),
});

export const order_items = pgTable(
  "order_items",
  {
    quantity: integer("quantity").default(1),
    cost: decimal("cost", {
      precision: 10,
      scale: 2,
      mode: "number",
    }).notNull(),
    order_id: integer("order_id")
      .notNull()
      .references(() => orders.id, {
        onDelete: "set null",
      }),
    book_id: integer("book_id")
      .notNull()
      .references(() => books.id, {
        onDelete: "set null",
      }),
  },
  (table) => [primaryKey({ columns: [table.order_id, table.book_id] })],
);

export const relations = defineRelations(
  { authors, books, orders, order_items, customers },
  (r) => {
    return {
      books: {
        authors: r.one.authors({
          from: r.books.author_id,
          to: r.authors.id,
        }),
        orders: r.many.orders,
        order_items: r.many.order_items(),
      },
      authors: {
        books: r.many.books(),
      },
      orders: {
        customers: r.one.customers({
          from: r.orders.customer_id,
          to: r.customers.id,
        }),
        books: r.many.books({
          from: r.orders.id.through(r.order_items.order_id),
          to: r.books.id.through(r.order_items.book_id),
        }),
        order_items: r.many.order_items(),
      },
      customers: {
        orders: r.many.orders(),
      },
      order_items: {
        order: r.one.orders({
          from: r.order_items.order_id,
          to: r.orders.id,
        }),
        books: r.one.books({
          from: r.order_items.book_id,
          to: r.books.id,
        }),
      },
    };
  },
);
