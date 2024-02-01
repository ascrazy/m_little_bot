import { webhookCallback } from "grammy";
import { Context, Hono } from "hono";
import { env } from "hono/adapter";
import { createAppContext } from "./AppContext";
import { createGrammyBot } from "./telegram/createGrammyBot";

const createBotFromContext = (ctx: Context) => {
	return createGrammyBot(
		createAppContext(ctx),
		env<{ TELEGRAM_BOT_TOKEN: string }>(ctx).TELEGRAM_BOT_TOKEN,
	);
};

const app = new Hono();

app.get("/", async (ctx) => {
	const bot = createBotFromContext(ctx);

	try {
		const me = await bot.api.getMe();

		return ctx.text(`Status: Ok\nUsername: ${me.username}`, 200);
	} catch (err) {
		return ctx.text(`Status: Error\nMessage: ${(err as Error).message}`, 500);
	}
});

app.get("/status", async (ctx) => {
	const bot = createBotFromContext(ctx);

	try {
		const me = await bot.api.getMe();

		return ctx.json({ status: "ok", username: me.username }, 200);
	} catch (err) {
		return ctx.json({ status: "bad", message: (err as Error).message }, 500);
	}
});

app.get("/setup-webhook", async (ctx) => {
	const bot = createBotFromContext(ctx);

	const url = env<{ WEBHOOK_URL: string }>(ctx).WEBHOOK_URL;

	try {
		await bot.api.setWebhook(url);
		return ctx.json({ status: "ok", url }, 200);
	} catch (err) {
		return ctx.json({ status: "bad", message: (err as Error).message }, 500);
	}
});

app.post("/telegram-bot-webhook/:secret", (ctx, next) => {
	if (
		ctx.req.param("secret") !==
		env<{ TELEGRAM_WEBHOOK_SECRET: string }>(ctx).TELEGRAM_WEBHOOK_SECRET
	) {
		console.log("Unauthorized");
		return ctx.json({ status: "bad", message: "Unauthorized" }, 401);
	}
	const bot = createBotFromContext(ctx);
	return webhookCallback(bot, "hono")(ctx, next);
});

export default app;
