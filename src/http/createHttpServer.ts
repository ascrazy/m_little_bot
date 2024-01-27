import Router from "@koa/router";
import Koa from "koa";
import mime from "mime";
import type { Telegram } from "telegraf";
import { Readable } from "stream";
import { parseFileHandle } from "./FileHandle";

export const createHttpServer = (telegram: Telegram) => {
	const http = new Koa();

	const router = new Router();

	router.get("/", async (ctx) => {
		try {
			const me = await telegram.getMe();
			ctx.response.status = 200;
			ctx.response.body = `Status: ok\nUsername: ${me.username}`;
		} catch (err) {
			ctx.response.status = 500;
			ctx.response.body = `Status: error, Error: ${(err as Error).message}`;
		}
	});

	router.get("/status", async (ctx) => {
		try {
			const me = await telegram.getMe();

			ctx.status = 200;
			ctx.headers["content-type"] = "application/json";
			ctx.body = {
				status: "ok",
				username: me.username,
			};
		} catch (err) {
			ctx.status = 500;
			ctx.headers["content-type"] = "application/json";
			ctx.body = {
				status: "error",
				error: (err as Error).message,
			};
		}
	});

	router.get("/file/:file_handle", async (ctx) => {
		try {
			const file_handle = parseFileHandle(ctx.params.file_handle);
			const url = await telegram.getFileLink(file_handle.file_id);
			const res = await fetch(url.toString());

			if (!res.ok || !res.body) {
				ctx.throw(500, "Internal Server Error");
			}

			ctx.status = 200;
			ctx.set(
				"Content-Type",
				mime.getType(url.pathname) ??
					mime.getType(file_handle.extname) ??
					"application/octet-stream",
			);

			// biome-ignore lint: lint/suspicious/noExplicitAny
			ctx.body = Readable.fromWeb(res.body as any);
		} catch (error) {
			ctx.throw(500, "Internal Server Error");
		}
	});

	http.use(router.routes());
	http.use(router.allowedMethods());

	return http;
};
