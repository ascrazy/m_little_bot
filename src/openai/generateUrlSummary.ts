import { z } from "zod";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { AppContext } from "../AppContext";

const UrlSummarySchema = z.object({
	short: z.string(),
	long: z.string(),
});

type UrlSummary = z.infer<typeof UrlSummarySchema>;

function parseUrlSummary(input: string): UrlSummary {
	try {
		const parsed = JSON.parse(input);
		return UrlSummarySchema.parse(parsed);
	} catch (error) {
		throw new Error(
			`Failed to parse UrlSummary (${(error as Error).message}): ${input}`,
		);
	}
}

export async function generateUrlSummary(
	app_ctx: AppContext,
	url: string,
): Promise<UrlSummary> {
	try {
		return await generateUrlSummary__readability(url);
	} catch (error) {
		console.error(
			`Failed to generateUrlSummary__readability: ${(error as Error).message}`,
		);

		return await generateUrlSummary__openai(app_ctx, url);
	}
}

export async function generateUrlSummary__openai(
	app_ctx: AppContext,
	url: string,
): Promise<UrlSummary> {
	const response = await app_ctx.getOpenAI().chat.completions.create(
		{
			messages: [
				{
					role: "system",
					content:
						"provide a short and long summaries of the content of webpage at the URL attached below. " +
						"provide both summaries in the same language as the source article. " +
						"keep short summary under 100 characters maximum and use plain text only. " +
						"keep long summary under 500 characters maximum and use basic markdown for formatting. " +
						"reply with JSON of the following format {short: string; long: string}. " +
						"reply with JSON only",
				},
				{ role: "user", content: url },
			],
			model: "gpt-4-1106-preview",
		},
		{
			maxRetries: 2,
		},
	);

	return parseUrlSummary(response.choices[0].message.content ?? "");
}

async function generateUrlSummary__readability(
	url: string,
): Promise<UrlSummary> {
	const response = await fetch(url);
	const html = await response.text();

	const dom = new JSDOM(html, { url: url });
	const reader = new Readability(dom.window.document);
	const article = reader.parse();

	if (article?.title && article?.excerpt) {
		return {
			short: article.title,
			long: article.excerpt,
		};
	}

	throw new Error(`Failed to parse UrlSummary from ${url}`);
}
