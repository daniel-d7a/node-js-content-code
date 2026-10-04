import express from "express"
import { createDB } from "../_db.js";
import { getAllBooks, getBookById, createBook } from "../db/books.query.js"

export const booksRouter = express.Router();
const db = createDB();

booksRouter.get("/", async (req, res) => {
  // get all books from db
  // const books = await db.getAll("books");

  const books = await getAllBooks()

  // send as json
  res.json({
    data: books,
  });
});

booksRouter.get("/:book_id", async (req, res) => {
  // get book by id from database
  // const book = await db.getById("books", req.params.book_id);

  const book = await getBookById(req.params.book_id);

  //send as json
  res.json({
    data: book,
  });
});

booksRouter.post("/", async (req, res) => {
  // get data from req body
  const bookData = req.body;

  // add to database
  // await db.create("books", bookData);
  await createBook(bookData.title, bookData.price, bookData.author_id);

  // return response
  res.status(201).json({
    message: "book created successfully",
  });
});

booksRouter.patch("/:book_id", async (req, res) => {
  // get id from params
  const id = req.params.book_id;

  // check database
  const book = await db.getById("books", id);

  if (!book) {
    return res.status(404).json({
      message: "book not found",
    });
  }

  // get data from body
  const updateData = req.body;

  // update in database
  await db.update("books", id, updateData);

  const newbook = await db.getById("books", id);

  // return res
  return res.status(200).json({
    message: "book updated successfully",
    data: newbook,
  });
});

booksRouter.delete("/:book_id", async (req, res) => {
  // get id from params
  const id = req.params.book_id;

  // check if in database
  const book = await db.getById("books", id);

  // if present delete -> return res
  if (book) {
    await db.delete("books", id);
    return res.status(204).json({
      message: "book deleted successfully",
    });
  } else {
    // if not present -> 404
    return res.status(404).json({
      message: "book not found",
    });
  }
});
