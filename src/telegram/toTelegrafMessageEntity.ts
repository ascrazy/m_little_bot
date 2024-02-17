import { MessageEntity as TelegrafMessageEntity } from "@telegraf/types";
import { MessageEntity } from "grammy/types";

export function toTelegrafMessageEntity(
	entity: MessageEntity,
): TelegrafMessageEntity | undefined {
	switch (entity.type) {
		case "mention":
		case "hashtag":
		case "cashtag":
		case "bot_command":
		case "url":
		case "email":
		case "phone_number":
		case "bold":
		case "italic":
		case "underline":
		case "strikethrough":
		case "spoiler":
		case "code":
			return {
				type: entity.type,
				offset: entity.offset,
				length: entity.length,
			};
		case "pre":
			return {
				type: "pre",
				offset: entity.offset,
				length: entity.length,
				language: entity.language,
			};
		case "text_link":
			return {
				type: "text_link",
				offset: entity.offset,
				length: entity.length,
				url: entity.url,
			};
		case "text_mention":
			return {
				type: "text_mention",
				offset: entity.offset,
				length: entity.length,
				user: {
					id: entity.user.id,
					is_bot: entity.user.is_bot,
					first_name: entity.user.first_name,
					last_name: entity.user.last_name,
					username: entity.user.username,
					language_code: entity.user.language_code,
				},
			};
		case "custom_emoji":
			return {
				type: "custom_emoji",
				offset: entity.offset,
				length: entity.length,
				custom_emoji_id: entity.custom_emoji_id,
			};
		case "blockquote":
			return {
				type: "blockquote",
				offset: entity.offset,
				length: entity.length,
			};
		default:
			return undefined;
	}
}
