import { Client } from '@notionhq/client';
import type {
  BlockObjectRequest,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { AppConfig } from '../AppConfig';

const client = new Client({ auth: AppConfig.Notion.AccessToken });

export async function addToInbox(
  title: string,
  content: BlockObjectRequest[],
): Promise<string> {
  const response = await client.pages.create({
    parent: {
      type: 'database_id',
      database_id: AppConfig.Notion.DatabaseId,
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
