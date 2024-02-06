import { Readable } from "node:stream";
import { format } from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { AppContext } from "./AppContext";
import { getExtname } from "./common/getExtname";

export type Attachment = {
	key: string;
	public_url: string;
};

export async function createAttachmentFromUrl(
	app_ctx: AppContext,
	url: string,
	content_type_hint?: string,
): Promise<Attachment> {
	const response = await fetch(url.toString());

	if (!response.ok || !response.body) {
		throw Error("Could not fetch file from telegram API");
	}

	const s3client = app_ctx.getStorageClient();

	const content_type =
		content_type_hint || response.headers.get("content-type");

	const file_key = format({
		name: uuidv4(),
		ext: getExtname(content_type ?? undefined),
	});

	await s3client.send(
		new PutObjectCommand({
			Bucket: app_ctx.Settings.StorageBucketName,
			Key: file_key,
			// biome-ignore lint: lint/suspicious/noExplicitAny
			Body: Readable.fromWeb(response.body as any),
			Metadata: content_type
				? {
						"Content-Type": content_type,
				  }
				: undefined,
		}),
	);

	const public_url = app_ctx.Settings.StoragePublicUrl.replace(
		"%file_key%",
		file_key,
	);

	return {
		key: file_key,
		public_url,
	};
}
