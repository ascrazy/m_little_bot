import { Telegraf } from 'telegraf'
import { toNotionBlocks } from "./src/notion/toNotionBlocks";
import { message } from 'telegraf/filters';
import { generateSummary } from './src/openai/generateSummary';
import { toParagraphs } from './src/telegram/toParagraphs';
import { addToInbox } from './src/notion/addToInbox';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN ?? '')
bot.on(message('text'), async (ctx) => {
    try {
        const summary = await generateSummary(ctx.message.text)
        const page_url = await addToInbox(
            summary ?? 'Could not generate summary', 
            toNotionBlocks(toParagraphs(ctx.message.text, ctx.message.entities ?? []))
        )
        ctx.reply(page_url)
    } catch (err) {
        ctx.reply((err as Error).message)
    } 
})
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
