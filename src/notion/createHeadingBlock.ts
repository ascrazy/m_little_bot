import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import { formatISO, fromUnixTime } from "date-fns";
import type { Chat, Message, User } from "telegraf/types";
import {
	isMessageWithForwardOrigin,
	type MessageWithForwardOrigin,
} from "../types/MessageWithForwardOrigin";
import type { RichTextItemRequest } from "../types/RichTextItemRequest";
import type { MessageOrigin } from "../types/MessageOrigin";

export const createHeadingBlock = (
	message: Message.CommonMessage,
): BlockObjectRequest | undefined => {
	if (!message.from) return;

	if (isMessageWithForwardOrigin(message)) {
		return createHeadingBlock__forwarded(message);
	}

	return {
		object: "block",
		type: "callout",
		callout: {
			rich_text: [
				userMention(message.from),
				txt(" sent on "),
				dateMention(message.date),
			],
		},
	};
};

function createHeadingBlock__forwarded(
	message: MessageWithForwardOrigin,
): BlockObjectRequest | undefined {
	if (!message.from) return;

	return {
		object: "block",
		type: "callout",
		callout: {
			rich_text: [
				userMention(message.from),
				txt(" forwarded from "),
				...formatForwardOrigin(message.forward_origin),
				txt(" on "),
				dateMention(message.date),
			],
		},
	};
}

function chatMention(chat: Chat): RichTextItemRequest {
	switch (chat.type) {
		case "channel":
		case "supergroup":
			return chat.username
				? chatMention__username(chat.username)
				: chatMention__title(chat.title);
		case "group":
			return chatMention__title(chat.title);
		case "private":
			return chat.username
				? chatMention__username(chat.username)
				: chatMention__title(formatName(chat));
	}
}

function chatMention__username(username: string): RichTextItemRequest {
	return {
		type: "text",
		text: {
			content: `@${username}`,
			link: { url: `https://t.me/${username}` },
		},
	};
}

function chatMention__title(title: string): RichTextItemRequest {
	return {
		type: "text",
		text: {
			content: title,
		},
		annotations: {
			bold: true,
		},
	};
}

function formatName(chat: Pick<User, "first_name" | "last_name">): string {
	return [chat.first_name, chat.last_name].filter(Boolean).join(" ");
}

function userMention(user: User): RichTextItemRequest {
	if (!user.username) {
		return {
			type: "text",
			text: {
				content: formatName(user),
			},
			annotations: {
				bold: true,
			},
		};
	}

	return {
		type: "text",
		text: {
			content: `@${user.username}`,
			link: { url: `https://t.me/${user.username}` },
		},
	};
}

function formatForwardOrigin(
	forward_origin: MessageOrigin,
): RichTextItemRequest[] {
	switch (forward_origin.type) {
		case "user":
			return [userMention(forward_origin.sender_user)];
		case "hidden_user":
			return [txt(forward_origin.sender_user_name, { bold: true })];
		case "chat":
			return [
				chatMention(forward_origin.sender_chat),
				txt("(by "),
				txt(forward_origin.author_signature || "anonymous", { bold: true }),
				txt(")"),
			];
		case "channel":
			return [chatMention(forward_origin.chat)];
	}
}

function dateMention(date: number): RichTextItemRequest {
	return {
		type: "mention",
		mention: {
			date: {
				start: formatISO(fromUnixTime(date)),
				// NOTE: move to settings or get from telegram
				time_zone: "Europe/Warsaw",
			},
		},
	};
}

function txt(text: string, annotations?: { bold?: true }): RichTextItemRequest {
	return {
		type: "text",
		text: {
			content: text,
		},
		annotations,
	};
}
