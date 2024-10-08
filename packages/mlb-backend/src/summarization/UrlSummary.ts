import { z } from "zod";

export const UrlSummarySchema = z.object({
	short: z.string(),
	long: z.string(),
});

export type UrlSummary = z.infer<typeof UrlSummarySchema>;
