import { getAppConfig } from "./AppConfig";
import { createBot } from "./telegram/bot";
import { createHttpServer } from "./http/createHttpServer";

// NOTE: load config to validate it before starting the bot
getAppConfig();

const bot = createBot();

bot.launch();

const http = createHttpServer(bot.telegram);

http.listen(getAppConfig().HttpPort);

// Enable graceful stop
process.once("SIGINT", () => {
	bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
	bot.stop("SIGTERM");
});
