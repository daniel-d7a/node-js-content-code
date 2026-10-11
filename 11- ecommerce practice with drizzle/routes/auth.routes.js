import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import express from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { validateBody } from "../middleware/validateBody.js";
import { registerSchema } from "../validation-schemas/auth.js";

export const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const passwordHash = bcrypt.hash(req.body.password, 10);

  const data = await db
    .select()
    .from(users)
    .where(eq(users.email, req.body.email));

  if (data.length > 0) {
    return res.status(422).json({
      error: "invalid email, email already used",
    });
  }

  await db.insert(users).values({
    username: req.body.username,
    email: req.body.email,
    password_hash: passwordHash,
    role: req.body.role,
  });

  return res.status(201).json({
    message: "user created successfully",
  });
});
authRouter.post("/login", async (req, res) => {});
authRouter.post("/logout", async (req, res) => {});
