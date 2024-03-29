import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import { markdownToBlocks } from "@tryfabric/martian";
import { Message, MessageEntity } from "grammy/types";
import { AppContext } from "./AppContext";
import { Attachment } from "./Attachment";
import { isWebpageUrl } from "./common/isWebpageUrl";
import { generateSummary } from "./openai/generateSummary";
import { generateUrlSummary } from "./openai/generateUrlSummary";
import { toGhMarkdown } from "./telegram/ghMarkdownSerializer";
import { toTelegrafMessageEntity } from "./telegram/toTelegrafMessageEntity";

export type Note = {
	summary: string;
	page_content: BlockObjectRequest[];
};

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
		(await generateSummary(app_ctx, message.text)) ??
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

export async function createNoteFromUrlMessage(
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

export async function createNoteFromPhotoMessage(
	app_ctx: AppContext,
	message: Pick<Message.PhotoMessage, "caption" | "caption_entities">,
	attachment: Attachment,
): Promise<Note> {
	let summary: string;
	if (message.caption) {
		summary =
			(await generateSummary(app_ctx, message.caption)) ??
			"Could not generate summary";
	} else {
		// TODO: generate caption from image with openai
		summary = "Image (no caption)";
	}

	const page_content = [
		{
			object: "block",
			type: "image",
			image: {
				type: "external",
				external: {
					url: attachment.public_url,
				},
			},
		},
		...(message.caption
			? markdownToBlocks(
					toGhMarkdown({
						text: message.caption,
						entities:
							message.caption_entities
								?.map(toTelegrafMessageEntity)
								.flatMap((f) => (f ? [f] : [])) ?? [],
					}),
			  )
			: []),
	];

	return {
		summary,
		page_content: page_content as BlockObjectRequest[],
	};
}
