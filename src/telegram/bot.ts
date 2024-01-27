import { Telegraf, type NarrowedContext, Context } from "telegraf";
import { getAppConfig } from "../AppConfig";
import { useNewReplies } from "telegraf/future";
import { restrictSender } from "./restrictSender";
import { message } from "telegraf/filters";
import {
	createNoteFromPhotoMessage,
	createNoteFromTextMessage,
	type Note,
} from "../Note";
import type { Message, Update } from "telegraf/types";
import { addToInbox } from "../notion/addToInbox";
import { createHeadingBlock } from "../notion/createHeadingBlock";
import { createCollapsibleJSONBlock } from "../notion/createCollapsibleJSONBlock";
import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";

export function createBot() {
	const bot = new Telegraf(getAppConfig().Telegram.BotToken);
	bot.use(useNewReplies());
	bot.use(restrictSender(getAppConfig().Telegram.AllowedSenders));
	bot.on(message("text"), async (ctx) => {
		return handleTelegramMessage(ctx, createNoteFromTextMessage);
	});

	bot.on(message("photo"), async (ctx) => {
		return handleTelegramMessage(ctx, createNoteFromPhotoMessage);
	});

	async function handleTelegramMessage<T extends Message.CommonMessage>(
		ctx: NarrowedContext<Context, Update.MessageUpdate & { message: T }>,
		createNote: (message: T) => Promise<Note>,
	): Promise<void> {
		try {
			const note = await createNote(ctx.message);
			const page_url = await addToInbox({
				...note,
				page_content: [
					createHeadingBlock(ctx.message),
					...note.page_content,
					getAppConfig().Notion.AppendDebug &&
						createCollapsibleJSONBlock(
							"Original Telegram Message JSON",
							message,
						),
				].filter(Boolean) as BlockObjectRequest[],
			});

			ctx.reply(`📃 ${note.summary}`, {
				entities: [
					{
						type: "text_link",
						offset: 3,
						length: note.summary.length,
						url: page_url,
					},
				],
			});
		} catch (err) {
			ctx.reply(`🆘 ${(err as Error).message}`);
		}
	}

	return bot;
}
