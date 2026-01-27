import { z } from "zod";

export const credentialsSchema = z.object({
  email: z
    .string("Invalid email address")
    .trim()
    .email("Invalid email address"),

  password: z
    .string("Password must be a string")
    .min(8, "Password must be at least 8 characters"),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;
