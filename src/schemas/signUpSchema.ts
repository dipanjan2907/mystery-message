import { z } from "zod";

export const usernameValidation = z
  .string()
  .trim()
  .min(3, "Username must be atleast 3 characters")
  .max(20, "Username must be no more than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.email({ message: "Invalid email address" }).toLowerCase().trim(),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters" })
    .max(64, { message: "Password cannot be more than 64 characters" }),
});
