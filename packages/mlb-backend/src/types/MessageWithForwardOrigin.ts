import type { Message, MessageOrigin } from "grammy/types";

export type MessageWithForwardOrigin = Message.CommonMessage & {
	forward_origin: MessageOrigin;
};

export function isMessageWithForwardOrigin(
	message: Message.CommonMessage,
): message is MessageWithForwardOrigin {
	return "forward_origin" in message;
}
