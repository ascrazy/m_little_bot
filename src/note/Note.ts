import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";

export type Note = {
	summary: string;
	page_content: BlockObjectRequest[];
};

