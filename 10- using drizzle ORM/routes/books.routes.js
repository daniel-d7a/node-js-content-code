import express from "express";
import {
  createBook,
  deleteBookById,
  getAllBooks,
  getBookById,
  updateBook,
} from "../db/queries/books.queries.js";
import { bookInsertSchema } from "../db/validation-schemas.js";

export const booksRouter = express.Router();

booksRouter.get("/", async (req, res) => {
  const books = await getAllBooks();

  res.status(200).json({
    message: "success",
    data: books,
  });
});
booksRouter.get("/:id", async (req, res) => {
  const id = req.params.id;

  const book = await getBookById(id);

  if (book) {
    return res.status(200).json({
      message: "success",
      data: book,
    });
  } else {
    return res.status(404).json({
      message: "error",
      data: null,
    });
  }
});

booksRouter.post("/", async (req, res) => {
  const body = bookInsertSchema.parse(req.body);

  console.log(body);

  const result = await createBook(body);

  res.status(201).json({
    message: "success",
    data: result,
  });
});

booksRouter.put("/:id", async (req, res) => {
  const id = req.params.id;
  const body = bookInsertSchema.partial().parse(req.body);

  const result = await updateBook(id, body);

  return res.status(200).json({
    message: "success",
    data: result,
  });
});

booksRouter.delete("/:id", async (req, res) => {
  const id = req.params.id;

  await deleteBookById(id);

  res.status(204).end();
});
