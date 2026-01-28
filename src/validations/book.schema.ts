import { z } from "zod";

const baseBookSchema = {
  title: z
    .string("Title must be a string")
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),

  author: z
    .string("Author must be a string")
    .trim()
    .min(1, "Author is required")
    .max(100, "Author must be less than 100 characters"),

  category: z
    .string("Category must be a string")
    .trim()
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters"),

  isbn: z
    .string("ISBN must be a string")
    .trim()
    .transform((val) => val.replace(/[\s-]/g, '')) // Remove spaces and hyphens
    .refine((val) => {
      // ISBN-10 or ISBN-13 validation
      return /^(?:\d{9}[\dX]|\d{13})$/.test(val);
    }, "Invalid ISBN format"),

  totalCopies: z
    .string("Total copies must be a string")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Total copies must be a positive number")
    .refine((val) => val <= 1000, "Total copies cannot exceed 1000"),

  publishedYear: z
    .string("Published year must be a string")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 1000, "Published year must be a valid year")
    .refine((val) => val <= new Date().getFullYear(), "Published year cannot be in the future")
    .optional(),

  description: z
    .string("Description must be a string")
    .trim()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
};

export const createBookSchema = z.object({
  title: z.string().trim().min(1).max(200),
  author: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(50),
  isbn: z.string().trim().max(20),
  totalCopies: z.string().max(10),
  publishedYear: z.string().max(10).optional(),
  description: z.string().trim().max(1000).optional(),
});

export const updateBookSchema = z.object({
  title: z.string().max(200).optional(),
  author: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  isbn: z.string().max(20).optional(),
  totalCopies: z.string().max(10).optional(),
  publishedYear: z.string().max(10).optional(),
  description: z.string().max(1000).optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
