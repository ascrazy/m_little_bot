import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { addToInbox } from "./notion/addToInbox";
import { createCollapsibleJSONBlock } from "./notion/createCollapsibleJSONBlock";
import { useNewReplies } from "telegraf/future";
import { createNoteFromPhotoMessage, createNoteFromTextMessage } from "./Note";
import { createHttpServer } from "./http/createHttpServer";
import { getAppConfig } from "./AppConfig";
import { restrictSender } from "./telegram/restrictSender";
import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import { createHeadingBlock } from "./createHeadingBlock";

getAppConfig();

const bot = new Telegraf(getAppConfig().Telegram.BotToken);
bot.use(useNewReplies());
bot.use(restrictSender(getAppConfig().Telegram.AllowedSenders));
bot.on(message("text"), async (ctx) => {
	try {
		const note = await createNoteFromTextMessage(ctx.message);
		const page_url = await addToInbox({
			...note,
			page_content: [
				createHeadingBlock(ctx.message),
				...note.page_content,
				getAppConfig().Notion.AppendDebug &&
					createCollapsibleJSONBlock(
						"Original Telegram Message JSON",
						ctx.message,
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
});

bot.on(message("photo"), async (ctx) => {
	try {
		const note = await createNoteFromPhotoMessage(ctx.message);
		const page_url = await addToInbox({
			...note,
			page_content: [
				createHeadingBlock(ctx.message),
				...note.page_content,
				getAppConfig().Notion.AppendDebug &&
					createCollapsibleJSONBlock(
						"Original Telegram Message JSON",
						ctx.message,
					),
			].filter(Boolean) as BlockObjectRequest[],
		});

		ctx.reply(`📃 ${note.summary}`, {
			entities: [
				{
					type: "text_link",
					offset: 2,
					length: note.summary.length,
					url: page_url,
				},
			],
		});
	} catch (err) {
		ctx.reply(`🆘 ${(err as Error).message}`);
	}
});
bot.launch();

createHttpServer(bot).listen(getAppConfig().HttpPort);

// Enable graceful stop
process.once("SIGINT", () => {
	bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
	bot.stop("SIGTERM");
});
