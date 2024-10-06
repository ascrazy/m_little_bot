import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import { markdownToBlocks } from "@tryfabric/martian";
import type { Message, MessageEntity } from "grammy/types";
import type { AppContext } from "./AppContext";
import type { Attachment } from "./Attachment";
import { isWebpageUrl } from "./common/isWebpageUrl";
import { generateTextSummary } from "./summarization/generateTextSummary";
import { generateUrlSummary } from "./summarization/generateUrlSummary";
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
	const image_block: BlockObjectRequest = {
		object: "block",
		type: "image",
		image: {
			type: "external",
			external: {
				url: attachment.public_url,
			},
		},
	}

	if (!message.caption) {
		return {
			summary: "Image (no caption)",
			page_content: [image_block],
		}
	}

	const text_note = await createNoteFromTextMessage(app_ctx, {
		text: message.caption,
		entities: message.caption_entities,
	});

	return {
		...text_note,
		page_content: [image_block, ...text_note.page_content],
	}
}
