import { isFullPageOrDatabase } from "@notionhq/client";
import type {
	DatabaseObjectResponse,
	PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { AppContext } from "../AppContext";

export type Top = { name: string; url: string }[];

export async function readTop(app_ctx: AppContext): Promise<Top> {
	const notion_response = await app_ctx.getNotionClient().databases.query({
		database_id: app_ctx.Settings.NotionDatabaseId,
	});

	const top: Top = [];

	for (const entry of notion_response.results) {
		if (!isFullPageOrDatabase(entry)) {
			continue;
		}

		top.push({
			name: getEntryName(entry.properties.Name),
			url: entry.url,
		});
	}

	return top;
}

type Properties =
	| PageObjectResponse["properties"]
	| DatabaseObjectResponse["properties"];

function getEntryName(property: Properties[0]): string {
	if (property?.type !== "title") {
		return "Untitled page";
	}

	if (Array.isArray(property.title)) {
		return property.title.map((t) => t.plain_text).join("");
	}

	return "Untitled page";
}
