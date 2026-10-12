import cookieParser from "cookie-parser";
import express from "express";
import { checkAuth } from "./middleware/checkAuth.js";
import { checkRole } from "./middleware/checkRole.js";
import { authRouter } from "./routes/auth.routes.js";
import { cartRouter } from "./routes/cart.routes.js";
import { orderRouter } from "./routes/order.routes.js";
import { pagesRouter } from "./routes/pages.routes.js";
import { productsRouter } from "./routes/products.routes.js";

process.loadEnvFile();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(new Date().toLocaleString(), req.method, req.url);
  next();
});

app.use("/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", checkAuth, checkRole("customer"), cartRouter);
app.use("/api/orders", checkAuth, checkRole("customer"), orderRouter);

app.use(pagesRouter);

app.use((err, req, res, next) => {
  console.log("err", err);
  res.status(500).json({ error: "something went wrong" });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
