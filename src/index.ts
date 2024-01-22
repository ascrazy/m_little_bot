import { Telegraf } from 'telegraf';
import { toNotionBlocks } from './notion/toNotionBlocks';
import { message } from 'telegraf/filters';
import { generateSummary } from './openai/generateSummary';
import { toParagraphs } from './telegram/toParagraphs';
import { addToInbox } from './notion/addToInbox';
import { createCollapsibleJSONBlock } from './notion/createCollapsibleJSONBlock';
import { useNewReplies } from 'telegraf/future';
import { AppConfig } from './AppConfig';
import { createNoteFromTextMessage } from './Note';

const bot = new Telegraf(AppConfig.TelegramBotToken);
bot.use(useNewReplies());
bot.on(message('text'), async (ctx) => {
  try {
    const note = await createNoteFromTextMessage(ctx.message);
    const page_url = await addToInbox({
      ...note,
      page_content: [
        ...note.page_content,
        createCollapsibleJSONBlock(
          'Original Telegram Message JSON',
          ctx.message,
        ),
      ],
    });

    ctx.reply(`✅ ${note.summary}`, {
      entities: [
        {
          type: 'text_link',
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

const http = Bun.serve({
  port: AppConfig.HttpPort,
  fetch(req) {
    return new Response('m_little_bot');
  },
});

// Enable graceful stop
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  http.stop(true);
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  http.stop(true);
});
