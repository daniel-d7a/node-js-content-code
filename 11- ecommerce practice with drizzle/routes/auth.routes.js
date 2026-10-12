import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import express from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { validateBody } from "../middleware/validateBody.js";
import { loginSchema, registerSchema } from "../validation-schemas/auth.js";

export const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const data = await db
    .select()
    .from(users)
    .where(eq(users.email, req.body.email));

  if (data.length > 0) {
    return res.status(422).json({
      errors: {
        email: { errors: ["email already in use"] },
      },
    });
  }

  const passwordHash = await bcrypt.hash(req.body.password, 10);

  await db.insert(users).values({
    username: req.body.username,
    email: req.body.email,
    password_hash: passwordHash,
    role: req.body.role,
  });

  return res.status(201).json({
    message: "register successful, you can now login",
  });
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, req.body.email));

  if (!existingUser) {
    return res.status(422).json({
      error: "email or password are invalid",
    });
  }

  const isValid = await bcrypt.compare(
    req.body.password,
    existingUser.password_hash,
  );

  if (!isValid) {
    return res.status(422).json({
      error: "email or password are invalid",
    });
  }

  const tokenPayload = {
    id: existingUser.id,
    email: existingUser.email,
    username: existingUser.username,
    role: existingUser.role,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

  res.cookie("node_api_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "login successful",
    data: {
      user: tokenPayload,
    },
  });
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("node_api_token");

  return res.status(200).json({
    message: "logout successful",
  });
});
