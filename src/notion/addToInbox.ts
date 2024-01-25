import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { getAppConfig } from '../AppConfig';
import type { Note } from '../Note';

export async function addToInbox(note: Note): Promise<string> {
  const notion = new Client({ auth: getAppConfig().Notion.AccessToken });

  const response = await notion.pages.create({
    parent: {
      type: 'database_id',
      database_id: getAppConfig().Notion.DatabaseId,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: note.summary,
            },
          },
        ],
      },
    },
    children: note.page_content,
  });

  return (response as PageObjectResponse).url;
}
