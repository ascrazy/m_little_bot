import { Markup, Telegraf } from 'telegraf'
import { TelegramTextMessageToNotionPageContent, addToInbox } from "./src/notion";
import { message } from 'telegraf/filters';
import { generateSummary } from './src/openai/generateSummary';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN ?? '')
bot.on(message('text'), async (ctx) => {
    try {
        const summary = await generateSummary(ctx.message.text)
        const page_url = await addToInbox(summary ?? 'Could not generate summary', TelegramTextMessageToNotionPageContent(ctx.message.text, ctx.message.entities ?? []))
        ctx.reply(page_url)
    } catch (err) {
        ctx.reply((err as Error).message)
    } 
})
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
