import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori diperlukan").max(30, "Nama terlalu panjang"),
  icon: z.string().min(1, "Pilih ikon"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna tidak valid"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
