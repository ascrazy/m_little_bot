import type { Bot } from "grammy";
import mime from "mime";

export async function getFileLink(
	bot: Bot,
	file_id: string,
): Promise<{
	url: string;
	content_type: string | undefined;
}> {
	const file = await bot.api.getFile(file_id);

	if (!file.file_path) {
		throw new Error("Could not get file path from telegram API");
	}

	return {
		url: new URL(
			`/file/bot${bot.token}/${file.file_path}`,
			"https://api.telegram.org/",
		).toString(),
		content_type: mime.getType(file.file_path) ?? undefined,
	};
}
