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

export const signupSchema = z.object({
  name: z
    .string("Name must be a string")
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),

  email: z
    .string("Invalid email address")
    .trim()
    .email("Invalid email address"),

  password: z
    .string("Password must be a string")
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string("Invalid email address")
    .trim()
    .email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z
    .string("Token is required")
    .min(1, "Token is required"),

  newPassword: z
    .string("Password must be a string")
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
