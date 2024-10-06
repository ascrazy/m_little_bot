import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import type { Message } from "grammy/types";
import type { AppContext } from "../AppContext";
import type { Attachment } from "../Attachment";
import type { Note } from "./Note";
import { createNoteFromTextMessage } from "./createNoteFromTextMessage";

export async function createNoteFromPhotoMessage(
	app_ctx: AppContext,
	message: Pick<Message.PhotoMessage, "caption" | "caption_entities">,
	attachment: Attachment,
): Promise<Note> {
	const image_block: BlockObjectRequest = {
		object: "block",
		type: "image",
		image: {
			type: "external",
			external: {
				url: attachment.public_url,
			},
		},
	}

	if (!message.caption) {
		return {
			summary: "Image (no caption)",
			page_content: [image_block],
		}
	}

	const text_note = await createNoteFromTextMessage(app_ctx, {
		text: message.caption,
		entities: message.caption_entities,
	});

	return {
		...text_note,
		page_content: [image_block, ...text_note.page_content],
	}
}
