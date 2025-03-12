import { z } from "zod";

export const materialValidationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  quality: z.object({
    score: z.number().min(0).max(100),
    defectRate: z.number().min(0).max(100),
    consistencyScore: z.number().min(0).max(100),
  }),
});
