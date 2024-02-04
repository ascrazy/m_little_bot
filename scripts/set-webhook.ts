import { Bot } from "grammy";

async function main() {
	const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN ?? "");

	const me = await bot.api.getMe();

	console.log(`Status: Ok\nUsername: ${me.username}`);

	const webhook_url = new URL(
		`/telegram-bot-webhook/${process.env.TELEGRAM_WEBHOOK_SECRET}`,
		process.env.HOST,
	).href;

	await bot.api.setWebhook(webhook_url);

	console.log(`Done. Webhook set to ${webhook_url}`);
}

main();
