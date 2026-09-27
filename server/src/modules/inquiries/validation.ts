import { z } from "zod";

export const createInquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a 10-digit phone number."),
  message: z.string().trim().min(10).max(1000),
  website: z.string().max(0).optional()
});

