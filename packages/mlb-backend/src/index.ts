import { Api as TelegramApi, webhookCallback } from "grammy";
import { type Context, Hono } from "hono";
import { env } from "hono/adapter";
import { stream } from "hono/streaming";
import mime from "mime";
import { createAppContext } from "./AppContext";
import { parseFileHandle } from "./FileHandle";
import { createGrammyBot } from "./telegram/createGrammyBot";

const createBotFromContext = (ctx: Context) => {
	return createGrammyBot(
		createAppContext(ctx),
		env<{ TELEGRAM_BOT_TOKEN: string }>(ctx).TELEGRAM_BOT_TOKEN,
	);
};

const createTelegramApiFromContext = (ctx: Context) => {
	return new TelegramApi(
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

app.get("/file/:file_handle", async (ctx) => {
	try {
		const file_handle = parseFileHandle(ctx.req.param("file_handle"));
		const api = createTelegramApiFromContext(ctx);
		const file = await api.getFile(file_handle.file_id);
		const url = new URL(
			`/file/bot${
				env<{ TELEGRAM_BOT_TOKEN: string }>(ctx).TELEGRAM_BOT_TOKEN
				// biome-ignore lint: lint/style/no-non-null-assertion
			}/${file.file_path!}`,
			"https://api.telegram.org/",
		);
		const res = await fetch(url.toString());

		if (!res.ok || !res.body) {
			return ctx.text("Internal Server Error", 500);
		}

		ctx.header(
			"Content-Type",
			mime.getType(url.pathname) ??
				mime.getType(file_handle.extname) ??
				"application/octet-stream",
		);
		return stream(ctx, (str) => {
			// biome-ignore lint: lint/style/no-non-null-assertion
			return str.pipe(res.body!);
		});
	} catch (error) {
		return ctx.text("Internal Server Error", 500);
	}
});

app.post("/telegram-bot-webhook/:secret", async (ctx) => {
	if (
		ctx.req.param("secret") !==
		env<{ TELEGRAM_WEBHOOK_SECRET: string }>(ctx).TELEGRAM_WEBHOOK_SECRET
	) {
		console.log("Unauthorized");
		return ctx.json({ status: "bad", message: "Unauthorized" }, 401);
	}
	const bot = createBotFromContext(ctx);
	return await webhookCallback(bot, "hono")(ctx);
});

export default app;
