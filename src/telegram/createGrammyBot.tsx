import { Readable } from "node:stream";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { Bot } from "grammy";
import mime from "mime";
import { v4 as uuidv4 } from "uuid";
import { AppContext } from "../AppContext";
import { createNoteFromPhotoMessage, createNoteFromTextMessage } from "../Note";
import { copyExtname } from "../common/copyExtname";
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
			const file = await bot.api.getFile(
				ctx.message.photo[ctx.message.photo.length - 1].file_id,
			);
			if (!file.file_path) {
				throw new Error("Could not get file path from telegram API");
			}
			const url = new URL(
				`/file/bot${bot.token}/${file.file_path}`,
				"https://api.telegram.org/",
			);
			const res = await fetch(url.toString());

			if (!res.ok || !res.body) {
				throw Error("Could not fetch file from telegram API");
			}

			const s3client = app_ctx.getStorageClient();

			const file_key = copyExtname(uuidv4(), file.file_path);

			await s3client.send(
				new PutObjectCommand({
					Bucket: app_ctx.Settings.StorageBucketName,
					Key: file_key,
					// biome-ignore lint: lint/suspicious/noExplicitAny
					Body: Readable.fromWeb(res.body as any),
					Metadata: {
						"Content-Type":
							mime.getType(file.file_path) || "application/octet-stream",
					},
				}),
			);

			const link_to_photo = `https://m-little-bot-attachments.ascrazy.me/${file_key}`;

			const note = await createNoteFromPhotoMessage(
				app_ctx,
				ctx.message,
				link_to_photo,
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
