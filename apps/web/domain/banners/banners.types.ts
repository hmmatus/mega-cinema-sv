import { z } from 'zod';

export const BannerSchema = z.object({
  id: z.string(),
  title: z.string(),
  imageUrl: z.string(),
  mobileImageUrl: z.string().nullable().optional(),
  targetUrl: z.string().nullable().optional(),
  position: z.number(),
  status: z.string(),
});

const PaginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const BannerListSchema = z.object({
  data: z.array(BannerSchema),
  pagination: PaginationSchema,
});

export type Banner = z.infer<typeof BannerSchema>;
