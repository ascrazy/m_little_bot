import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { Bot } from "grammy";
import { AppContext } from "../AppContext";
import { createNoteFromPhotoMessage, createNoteFromTextMessage } from "../Note";
import { createCollapsibleJSONBlock } from "../notion/createCollapsibleJSONBlock";
import { createHeadingBlock } from "../notion/createHeadingBlock";

export const createGrammyBot = (app_ctx: AppContext, token: string) => {
	const bot = new Bot(token);

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
			const note = await createNoteFromPhotoMessage(app_ctx, ctx.message);
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
