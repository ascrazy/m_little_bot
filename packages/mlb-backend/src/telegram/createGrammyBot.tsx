import { isFullPageOrDatabase } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { Bot } from "grammy";
import type { AppContext } from "../AppContext";
import { createAttachmentFromUrl } from "../Attachment";
import { markdownV2Escape } from "../common/markdownV2Escape";
import { createNoteFromPhotoMessage } from "../note/createNoteFromPhotoMessage";
import { createNoteFromTextMessage } from "../note/createNoteFromTextMessage";
import { createCollapsibleJSONBlock } from "../notion/createCollapsibleJSONBlock";
import { createHeadingBlock } from "../notion/createHeadingBlock";
import { readTop } from "../notion/readTop";
import { getFileLink } from "./getFileLink";

export const createGrammyBot = (app_ctx: AppContext, token: string) => {
	const bot = new Bot(token);

	bot.command("top", async (ctx) => {
		const top = await readTop(app_ctx);

		if (top.length === 0) {
			return ctx.reply("");
		}

		const message = top
			.map(({ name, url }) => {
				return `• [${markdownV2Escape(name)}](${url})`;
			})
			.join("\n");

		return ctx.reply(message, {
			parse_mode: "MarkdownV2",
			reply_to_message_id: ctx.message?.message_id,
		});
	});

	bot.on("message:text", async (ctx) => {
		try {
			const note = await createNoteFromTextMessage(app_ctx, ctx.message);
			const notion_response = await app_ctx.getNotionClient().pages.create({
				parent: {
					type: "database_id",
					database_id: app_ctx.Settings.NotionDatabaseId,
				},
				properties: {
					Name: {
						title: [
							{
								text: {
									content: note.summary,
								},
							},
						],
					},
				},
				children: [
					createHeadingBlock(ctx.message),
					...note.page_content,
					app_ctx.Settings.Debug &&
						createCollapsibleJSONBlock(
							"Original Telegram Message JSON",
							ctx.message,
						),
				].flatMap((f) => (f ? [f] : [])),
			});

			ctx.reply(`📃 ${note.summary}`, {
				entities: [
					{
						type: "text_link",
						offset: 3,
						length: note.summary.length,
						url: (notion_response as PageObjectResponse).url,
					},
				],
				reply_to_message_id: ctx.message.message_id,
			});
		} catch (err) {
			ctx.reply(`🆘 ${(err as Error).message}`, {
				reply_to_message_id: ctx.message.message_id,
			});
		}
	});

	bot.on("message:photo", async (ctx) => {
		try {
			const { url, content_type } = await getFileLink(
				bot,
				ctx.message.photo[ctx.message.photo.length - 1].file_id,
			);
			const attachment = await createAttachmentFromUrl(
				app_ctx,
				url,
				content_type,
			);
			const note = await createNoteFromPhotoMessage(
				app_ctx,
				ctx.message,
				attachment,
			);
			const notion_response = await app_ctx.getNotionClient().pages.create({
				parent: {
					type: "database_id",
					database_id: app_ctx.Settings.NotionDatabaseId,
				},
				properties: {
					Name: {
						title: [
							{
								text: {
									content: note.summary,
								},
							},
						],
					},
				},
				children: [
					createHeadingBlock(ctx.message),
					...note.page_content,
					app_ctx.Settings.Debug &&
						createCollapsibleJSONBlock(
							"Original Telegram Message JSON",
							ctx.message,
						),
				].flatMap((f) => (f ? [f] : [])),
			});

			ctx.reply(`📃 ${note.summary}`, {
				entities: [
					{
						type: "text_link",
						offset: 3,
						length: note.summary.length,
						url: (notion_response as PageObjectResponse).url,
					},
				],
				reply_to_message_id: ctx.message.message_id,
			});
		} catch (err) {
			ctx.reply(`🆘 ${(err as Error).message}`, {
				reply_to_message_id: ctx.message.message_id,
			});
		}
	});

	return bot;
};
