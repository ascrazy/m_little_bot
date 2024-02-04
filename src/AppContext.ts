import { Client as NotionClient } from "@notionhq/client";
import { Context } from "hono";
import { env } from "hono/adapter";
import OpenAI from "openai";

export type AppContext = {
	Settings: {
		Debug: boolean;
		NotionDatabaseId: string;
		MessageProxyBaseUrl: string;
	};
	getOpenAI: () => OpenAI;
	getNotionClient: () => NotionClient;
};

export const createAppContext = (ctx: Context): AppContext => {
	let openai: OpenAI;
	let notion: NotionClient;

	return {
		Settings: {
			Debug: env<{ DEBUG: boolean }>(ctx).DEBUG,
			NotionDatabaseId: env<{ NOTION_DATABASE_ID: string }>(ctx)
				.NOTION_DATABASE_ID,
			MessageProxyBaseUrl: env<{ HOST: string }>(ctx).HOST,
		},
		getOpenAI: () => {
			if (!openai) {
				openai = new OpenAI({
					apiKey: env<{ OPENAI_API_KEY: string }>(ctx).OPENAI_API_KEY,
				});
			}

			return openai;
		},
		getNotionClient: () => {
			if (!notion) {
				notion = new NotionClient({
					auth: env<{ NOTION_ACCESS_TOKEN: string }>(ctx).NOTION_ACCESS_TOKEN,
				});
			}
			return notion;
		},
	};
};
