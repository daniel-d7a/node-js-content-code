import z from "zod";

export const registerSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
    username: z.string().min(2),
    role: z.enum(["merchant", "customer"]),
  })
  .refine((data) => data.password === data.password_confirmation, {
    error: "password and password confirmation don't match ",
    path: ["password_confirmation"],
  });
