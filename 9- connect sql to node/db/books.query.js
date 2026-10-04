import { pool } from "../db.js";


export async function getAllBooks() {
  const res = await pool.query("select * from books")
  return res.rows
}

export async function getBookById(id) {
  const res = await pool.query("select * from books where id = $1 limit 1", [id])
  return res.rows[0]
}

export async function createBook(title, price, author_id) {
  const res = await pool.query(
    "insert into books (title, price, author_id) values ($1, $2, $3)",
    [title, price, author_id],
  );
  console.log(res);
  return res;
}

export async function updateBook(id, title, author_id, price) {
  
}

export async function deleteBookById(id) {
  
}