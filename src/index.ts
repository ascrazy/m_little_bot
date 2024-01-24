import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { addToInbox } from './notion/addToInbox';
import { createCollapsibleJSONBlock } from './notion/createCollapsibleJSONBlock';
import { useNewReplies } from 'telegraf/future';
import { AppConfig } from './AppConfig';
import { createNoteFromPhotoMessage, createNoteFromTextMessage } from './Note';
import { createHttpServer } from './http/createHttpServer';

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

    ctx.reply(`📃 ${note.summary}`, {
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

bot.on(message('photo'), async (ctx) => {
  try {
    const note = await createNoteFromPhotoMessage(bot.telegram, ctx.message);
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

    ctx.reply(`📃 ${note.summary}`, {
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

createHttpServer(bot).listen(AppConfig.HttpPort);

// Enable graceful stop
process.once('SIGINT', () => {
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
});
