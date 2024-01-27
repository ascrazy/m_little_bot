import { z } from "zod";

const AppConfigSchema = z.object({
	Telegram: z.object({
		BotToken: z.string(),
		AllowedSenders: z.array(z.number().positive()).min(1),
	}),
	Notion: z.object({
		AccessToken: z.string(),
		DatabaseId: z.string(),
		AppendDebug: z.boolean(),
	}),
	OpenAIApiKey: z.string(),
	AppHost: z.string().url(),
	HttpPort: z.number().min(1025).max(65535),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

function loadAppConfig(): AppConfig {
	return AppConfigSchema.parse({
		Telegram: {
			BotToken: process.env.TELEGRAM_BOT_TOKEN,
			AllowedSenders: process.env.TELEGRAM_ALLOWED_SENDERS?.split(",").map(
				(id) => parseInt(id),
			),
		},
		Notion: {
			AccessToken: process.env.NOTION_ACCESS_TOKEN,
			DatabaseId: process.env.NOTION_DATABASE_ID,
			AppendDebug: process.env.NOTION_APPEND_DEBUG === "true",
		},
		OpenAIApiKey: process.env.OPENAI_API_KEY,
		AppHost: process.env.HOST,
		HttpPort: parseInt(process.env.PORT ?? ""),
	});
}

let config: AppConfig | undefined;

export function getAppConfig(): AppConfig {
	if (!config) {
		config = loadAppConfig();
	}

	return config;
}
