import { Telegraf } from 'telegraf';
import { toNotionBlocks } from './notion/toNotionBlocks';
import { message } from 'telegraf/filters';
import { generateSummary } from './openai/generateSummary';
import { toParagraphs } from './telegram/toParagraphs';
import { addToInbox } from './notion/addToInbox';
import { createCollapsibleJSONBlock } from './notion/createCollapsibleJSONBlock';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN ?? '');
bot.on(message('text'), async (ctx) => {
  try {
    const summary = await generateSummary(ctx.message.text);
    const page_url = await addToInbox(summary ?? 'Could not generate summary', [
      ...toNotionBlocks(
        toParagraphs(ctx.message.text, ctx.message.entities ?? []),
      ),
      createCollapsibleJSONBlock('Original Telegram Message JSON', ctx.message),
    ]);
    ctx.reply(page_url);
  } catch (err) {
    ctx.reply((err as Error).message);
  }
});
bot.launch();

Bun.serve({
  port: process.env.PORT ?? 8080,
  fetch(req) {
    return new Response('m_little_bot');
  },
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
