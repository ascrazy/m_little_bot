import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import { markdownToBlocks } from "@tryfabric/martian";
import type { Message, MessageEntity } from "grammy/types";
import type { AppContext } from "../AppContext";
import { isWebpageUrl } from "../common/isWebpageUrl";
import { generateTextSummary } from "../summarization/generateTextSummary";
import { generateUrlSummary } from "../summarization/generateUrlSummary";
import { toGhMarkdown } from "../telegram/ghMarkdownSerializer";
import { toTelegrafMessageEntity } from "../telegram/toTelegrafMessageEntity";
import type { Note } from "./Note";

export async function createNoteFromTextMessage(
	app_ctx: AppContext,
	message: Pick<Message.TextMessage, "text"> & {
		entities?: MessageEntity[];
	},
): Promise<Note> {
	if (isWebpageUrl(message.text.trim())) {
		return createNoteFromUrlMessage(app_ctx, message);
	}

	const summary =
		(await generateTextSummary(app_ctx, message.text)) ??
		"Could not generate summary";

	const page_content = markdownToBlocks(
		toGhMarkdown({
			text: message.text,
			entities:
				message.entities
					?.map(toTelegrafMessageEntity)
					.flatMap((f) => (f ? [f] : [])) ?? [],
		}),
	);

	return {
		summary,
		page_content: page_content as BlockObjectRequest[],
	};
}

async function createNoteFromUrlMessage(
	app_ctx: AppContext,
	message: Pick<Message.TextMessage, "text">,
): Promise<Note> {
	const summary = await generateUrlSummary(app_ctx, message.text.trim());

	const page_content: BlockObjectRequest[] = [
		{
			object: "block",
			type: "paragraph",
			paragraph: {
				rich_text: [
					{
						type: "text",
						text: {
							content: message.text,
							link: {
								url: message.text,
							},
						},
					},
				],
			},
		},
		...(markdownToBlocks(summary.long) as BlockObjectRequest[]),
	];

	return {
		summary: summary.short,
		page_content,
	};
}