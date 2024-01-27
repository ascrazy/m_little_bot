import type { Message } from "telegraf/types";
import type { MessageOrigin } from "./MessageOrigin";

type SupportedMessage = Message.TextMessage | Message.PhotoMessage;

export type MessageWithForwardOrigin = SupportedMessage & {
	forward_origin: MessageOrigin;
};

export function isMessageWithForwardOrigin(
	message: Message,
): message is MessageWithForwardOrigin {
	return "forward_origin" in message;
}
