import express from "express";
import { booksRouter } from "./routes/books.routes.js";

const app = express();

process.loadEnvFile()

app.use(express.json());

app.use((req, res, next) => {
  console.log(new Date().toLocaleString(), req.method, req.url);
  next();
});

app.use("/books", booksRouter);

app.use((err, req, res, next) => {
  console.log("err", err);
  res.status(500).json({ error: "something went wrong" });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});