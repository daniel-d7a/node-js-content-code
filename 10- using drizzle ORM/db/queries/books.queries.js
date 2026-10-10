import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { authors, books } from "../schema.js";

export async function getAllBooks() {
  const data = await db
    .select({
      id: books.id,
      title: books.title,
      price: books.price,
      author_name: authors.name,
    })
    .from(books)
    .innerJoin(authors, eq(books.author_id, authors.id))
    .orderBy(books.price);

  return data;
}
export async function getBookById(id) {
  const data = await db
    .select({
      id: books.id,
      title: books.title,
      price: books.price,
      author_name: authors.name,
    })
    .from(books)
    .innerJoin(authors, eq(books.author_id, authors.id))
    .where(eq(books.id, id))
    .limit(1);

  if (data.length) {
    return data[0];
  } else {
    return false;
  }
}

export async function createBook({ title, price, author_id }) {
  const result = await db.insert(books).values({
    title: title,
    price: price,
    author_id: author_id,
  });

  return result;
}
export async function updateBook(id, body) {
  const result = await db.update(books).set(body).where(eq(books.id, id));

  return result;
}

export async function deleteBookById(id) {
  await db.delete(books).where(eq(books.id, id));
}
