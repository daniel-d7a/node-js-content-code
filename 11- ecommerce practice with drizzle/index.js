import express from "express";
import { pagesRouter } from "./routes/pages.routes.js";

process.loadEnvFile();

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(new Date().toLocaleString(), req.method, req.url);
  next();
});

// TODO: mount your API routers here
// app.use("/auth", authRouter);
// app.use("/api/products", productsRouter);
// app.use("/api/cart", checkAuth, checkRole("customer"), cartRouter);
// app.use("/api/orders", checkAuth, checkRole("customer"), ordersRouter);
// app.use("/api/debug", debugRouter);

app.use(pagesRouter);

app.use((err, req, res, next) => {
  console.log("err", err);
  res.status(500).json({ error: "something went wrong" });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
