import type { Message } from "telegraf/types";
import type { MessageOrigin } from "./MessageOrigin";

export type MessageWithForwardOrigin = Message.CommonMessage & {
	forward_origin: MessageOrigin;
};

export function isMessageWithForwardOrigin(
	message: Message.CommonMessage,
): message is MessageWithForwardOrigin {
	return "forward_origin" in message;
}
