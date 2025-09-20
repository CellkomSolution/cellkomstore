import * as z from "zod";

export const settingsFormSchema = z.object({
  site_name: z.string().nullable().optional(),
  site_logo_url: z.string().url({ message: "URL logo tidak valid." }).nullable().optional(),
  contact_email: z.string().email({ message: "Email tidak valid." }).nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  contact_address: z.string().nullable().optional(),
  facebook_url: z.string().url({ message: "URL Facebook tidak valid." }).nullable().optional(),
  instagram_url: z.string().url({ message: "URL Instagram tidak valid." }).nullable().optional(),
  twitter_url: z.string().url({ message: "URL Twitter tidak valid." }).nullable().optional(),
  youtube_url: z.string().url({ message: "URL YouTube tidak valid." }).nullable().optional(),
  linkedin_url: z.string().url({ message: "URL LinkedIn tidak valid." }).nullable().optional(),
  scrolling_text_enabled: z.boolean().optional().default(false),
  scrolling_text_content: z.string().nullable().optional(),
  right_header_text_enabled: z.boolean().optional().default(false),
  right_header_text_content: z.string().nullable().optional(),
  right_header_text_link: z.string().url({ message: "URL tautan tidak valid." }).nullable().optional(),
  download_app_url: z.string().url({ message: "URL unduhan aplikasi tidak valid." }).nullable().optional(),
  download_app_text: z.string().nullable().optional(),
  featured_brands_title: z.string().nullable().optional(),
  store_status_enabled: z.boolean().optional().default(false),
  store_status_content: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.scrolling_text_enabled && (!data.scrolling_text_content || data.scrolling_text_content.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Konten teks berjalan tidak boleh kosong jika diaktifkan.",
      path: ['scrolling_text_content'],
    });
  }
  if (data.right_header_text_enabled && (!data.right_header_text_content || data.right_header_text_content.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Konten teks kanan header tidak boleh kosong jika diaktifkan.",
      path: ['right_header_text_content'],
    });
  }
  if (data.download_app_url && (!data.download_app_text || data.download_app_text.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Teks unduhan aplikasi tidak boleh kosong jika URL diaktifkan.",
      path: ['download_app_text'],
    });
  }
  if (data.store_status_enabled && (!data.store_status_content || data.store_status_content.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Konten status toko tidak boleh kosong jika diaktifkan.",
      path: ['store_status_content'],
    });
  }
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;