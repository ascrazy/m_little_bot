import type { Chat, User } from "telegraf/types";

/** This object describes the origin of a message. It can be one of
- MessageOriginUser
- MessageOriginHiddenUser
- MessageOriginChat
- MessageOriginChannel
 */
export type MessageOrigin =
	| MessageOriginUser
	| MessageOriginHiddenUser
	| MessageOriginChat
	| MessageOriginChannel;

interface AbstractMessageOrigin {
	/** Type of the message origin */
	type: string;
	/** Date the message was sent originally in Unix time */
	date: number;
}

/** The message was originally sent by a known user. */
interface MessageOriginUser extends AbstractMessageOrigin {
	type: "user";
	/** User that sent the message originally */
	sender_user: User;
}

/** The message was originally sent by an unknown user. */
interface MessageOriginHiddenUser extends AbstractMessageOrigin {
	type: "hidden_user";
	/** Name of the user that sent the message originally */
	sender_user_name: string;
}

/** The message was originally sent on behalf of a chat to a group chat. */
export interface MessageOriginChat extends AbstractMessageOrigin {
	type: "chat";
	/** Chat that sent the message originally */
	sender_chat: Chat;
	/** For messages originally sent by an anonymous chat administrator, original message author signature */
	author_signature?: string;
}

/** The message was originally sent to a channel chat. */
interface MessageOriginChannel extends AbstractMessageOrigin {
	type: "channel";
	/** Channel chat to which the message was originally sent */
	chat: Chat;
	/** Unique message identifier inside the chat */
	message_id: number;
	/** Signature of the original post author */
	author_signature?: string;
}
