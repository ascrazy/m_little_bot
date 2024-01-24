export const AppConfig = {
  TelegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
  Notion: {
    AccessToken: process.env.NOTION_ACCESS_TOKEN ?? '',
    DatabaseId: process.env.NOTION_DATABASE_ID ?? '',
  },
  OpenAIApiKey: process.env.OPENAI_API_KEY ?? '',
  AppHost: process.env.HOST ?? 'http://localhost:8080',
  HttpPort: process.env.PORT ?? 8080,
};
