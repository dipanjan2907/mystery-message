import z from "zod";
import { usernameValidation } from "./signUpSchema";

export const messageSchema = z.object({
  username: usernameValidation,
  content: z
    .string()
    .min(5, { message: "Content must be atleast 5" })
    .max(300, { message: "Content must be no longer than 300 characters" }),
});
