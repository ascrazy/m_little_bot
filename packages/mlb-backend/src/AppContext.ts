import { S3Client } from "@aws-sdk/client-s3";
import { Client as NotionClient } from "@notionhq/client";
import type { Context } from "hono";
import { env } from "hono/adapter";
import OpenAI from "openai";

export type AppContext = {
	Settings: {
		Debug: boolean;
		NotionDatabaseId: string;
		MessageProxyBaseUrl: string;
		StorageBucketName: string;
		StoragePublicUrl: string;
	};
	getOpenAI: () => OpenAI;
	getNotionClient: () => NotionClient;
	getStorageClient: () => S3Client;
};

export const createAppContext = (ctx: Context): AppContext => {
	let openai: OpenAI;
	let notion: NotionClient;
	let storage_client: S3Client;

	return {
		Settings: {
			Debug: env<{ DEBUG: boolean }>(ctx).DEBUG,
			NotionDatabaseId: env<{ NOTION_DATABASE_ID: string }>(ctx)
				.NOTION_DATABASE_ID,
			MessageProxyBaseUrl: env<{ HOST: string }>(ctx).HOST,
			StorageBucketName: env<{ CFR2_BUCKET_NAME: string }>(ctx)
				.CFR2_BUCKET_NAME,
			StoragePublicUrl: env<{ CFR2_PUBLIC_URL: string }>(ctx).CFR2_PUBLIC_URL,
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
		getStorageClient: () => {
			if (!storage_client) {
				const { CFR2_ACCOUNT_ID, CFR2_ACCESS_KEY_ID, CFR2_SECRET_ACCESS_KEY } =
					env<{
						CFR2_ACCOUNT_ID: string;
						CFR2_ACCESS_KEY_ID: string;
						CFR2_SECRET_ACCESS_KEY: string;
					}>(ctx);

				return new S3Client({
					region: "auto",
					endpoint: `https://${CFR2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
					credentials: {
						accessKeyId: CFR2_ACCESS_KEY_ID,
						secretAccessKey: CFR2_SECRET_ACCESS_KEY,
					},
				});
			}

			return storage_client;
		},
	};
};
