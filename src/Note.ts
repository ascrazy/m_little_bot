import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import { toMarkdownV2 } from "@telegraf/entity";
import { MessageEntity as TelegrafMessageEntity } from "@telegraf/types";
import { markdownToBlocks } from "@tryfabric/martian";
import { Message, MessageEntity } from "grammy/types";
import { AppContext } from "./AppContext";
import { createFileHandle, serializeFileHandle } from "./FileHandle";
import { generateSummary } from "./openai/generateSummary";

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
	// if (z.string().url().safeParse(message.text).success) {
	// 	return createNoteFromUrlMessage(message);
	// }

	const summary =
		(await generateSummary(app_ctx, message.text)) ??
		"Could not generate summary";

	const page_content = markdownToBlocks(
		toMarkdownV2({
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

// export async function createNoteFromUrlMessage(
// 	message: Message.TextMessage,
// ): Promise<Note> {
// 	const summary = await generateUrlSummary(message.text);

// 	const page_content: BlockObjectRequest[] = [
// 		{
// 			object: "block",
// 			type: "paragraph",
// 			paragraph: {
// 				rich_text: [
// 					{
// 						type: "text",
// 						text: {
// 							content: message.text,
// 							link: {
// 								url: message.text,
// 							},
// 						},
// 					},
// 				],
// 			},
// 		},
// 		...(markdownToBlocks(summary.long) as BlockObjectRequest[]),
// 	];

// 	return {
// 		summary: summary.short,
// 		page_content,
// 	};
// }

export async function createNoteFromPhotoMessage(
	app_ctx: AppContext,
	message: Pick<Message.PhotoMessage, "photo" | "caption" | "caption_entities">,
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
					url: generatePhotoUrl(app_ctx, message),
				},
			},
		},
		...(message.caption
			? markdownToBlocks(
					toMarkdownV2({
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

function generatePhotoUrl(
	app_ctx: AppContext,
	message: Pick<Message.PhotoMessage, "photo">,
): string {
	return new URL(
		`/file/${serializeFileHandle(
			createFileHandle(message.photo[message.photo.length - 1].file_id, ".jpg"),
		)}`,
		app_ctx.Settings.MessageProxyBaseUrl,
	).toString();
}

function toTelegrafMessageEntity(
	entity: MessageEntity,
): TelegrafMessageEntity | undefined {
	switch (entity.type) {
		case "mention":
		case "hashtag":
		case "cashtag":
		case "bot_command":
		case "url":
		case "email":
		case "phone_number":
		case "bold":
		case "italic":
		case "underline":
		case "strikethrough":
		case "spoiler":
		case "code":
			return {
				type: entity.type,
				offset: entity.offset,
				length: entity.length,
			};
		case "pre":
			return {
				type: "pre",
				offset: entity.offset,
				length: entity.length,
				language: entity.language,
			};
		case "text_link":
			return {
				type: "text_link",
				offset: entity.offset,
				length: entity.length,
				url: entity.url,
			};
		case "text_mention":
			return {
				type: "text_mention",
				offset: entity.offset,
				length: entity.length,
				user: {
					id: entity.user.id,
					is_bot: entity.user.is_bot,
					first_name: entity.user.first_name,
					last_name: entity.user.last_name,
					username: entity.user.username,
					language_code: entity.user.language_code,
				},
			};
		case "custom_emoji":
			return {
				type: "custom_emoji",
				offset: entity.offset,
				length: entity.length,
				custom_emoji_id: entity.custom_emoji_id,
			};
		default:
			return undefined;
	}
}
