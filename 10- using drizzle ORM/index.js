import express from "express";
import { booksRouter } from "./routes/books.routes.js";

const app = express();

app.use(express.json());

app.use("/books", booksRouter);

app.listen(3000, () => {
  console.log("started on port 3000");
});
