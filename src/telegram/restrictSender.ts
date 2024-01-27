import type { Context, Middleware } from "telegraf";

export function restrictSender<C extends Context>(
	allowedSenderIds: number[],
): Middleware<C> {
	return async (ctx, next) => {
		if (!ctx.message) {
			return;
		}

		if (!allowedSenderIds.includes(ctx.message.from.id)) {
			return;
		}

		await next();
	};
}
