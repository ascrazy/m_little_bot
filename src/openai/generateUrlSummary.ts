import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { z } from "zod";
import { AppContext } from "../AppContext";
import { chainOfResponsibility } from "../common/chainOfResponsibility";
import { messageFromError } from "../common/messageFromError";
import { UrlSummary, UrlSummarySchema } from "./UrlSummary";

export async function generateUrlSummary(
	app_ctx: AppContext,
	url: string,
): Promise<UrlSummary> {
	try {
		return await chainOfResponsibility([
			() => generateUrlSummary__readability(url),
			() => generateUrlSummary__openai(app_ctx, url),
		]);
	} catch (err) {
		return {
			short: "(could not generate summary)",
			long: messageFromError(err),
		};
	}
}

const UrlSummaryErrorSchema = z.object({
	status: z.literal("error"),
	reason: z.string(),
});

const OpenAISummaryResponseSchema = z.union([
	UrlSummarySchema.extend({ status: z.literal("ok") }),
	UrlSummaryErrorSchema,
]);

function parseOpenAISummaryResponse(input: string): UrlSummary {
	try {
		const parsed = JSON.parse(input);
		const response = OpenAISummaryResponseSchema.parse(parsed);
		if (response.status === "ok") {
			return {
				short: response.short,
				long: response.long,
			};
		}

		throw new Error(response.reason);
	} catch (error) {
		throw new Error(
			`Failed to parse UrlSummary (${(error as Error).message}): ${input}`,
		);
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
						"reply with JSON of the following format {status: 'ok', short: string; long: string}. " +
						"in case you are unable to generate summaries, reply with JSON of the following format { status: 'error', reason: string }" +
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

	return parseOpenAISummaryResponse(response.choices[0].message.content ?? "");
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
