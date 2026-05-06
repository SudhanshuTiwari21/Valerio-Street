import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Please share your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const forgotSchema = z.object({
  email: z.string().email(),
});

export const resetSchema = z.object({
  token: z.string().min(8),
  password: z.string().min(8),
});

export const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  line1: z.string().min(2),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().default("India"),
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(7),
  address: addressSchema,
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  story: z.string().optional(),
  materials: z.string().optional(),
  stylingNotes: z.string().optional(),
  price: z.coerce.number().int().nonnegative(),
  compareAtPrice: z.coerce.number().int().nonnegative().optional(),
  categoryId: z.string().min(1),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string().url()).default([]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
