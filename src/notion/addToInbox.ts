import { Client } from "@notionhq/client";
import type {
  BlockObjectRequest,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

const client = new Client({ auth: process.env.NOTION_ACCESS_TOKEN });

export async function addToInbox(
  title: string,
  content: BlockObjectRequest[],
): Promise<string> {
  const response = await client.pages.create({
    parent: {
      type: "database_id",
      database_id: process.env.NOTION_DATABASE_ID ?? "",
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
    },
    children: content,
  });

  return (response as PageObjectResponse).url;
}
