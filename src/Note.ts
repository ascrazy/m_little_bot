import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';
import type { Message, MessageEntity } from 'telegraf/types';
import { generateSummary } from './openai/generateSummary';
import { toParagraphs } from './telegram/toParagraphs';
import { toNotionBlocks } from './notion/toNotionBlocks';
import { generateUrlSummary } from './openai/generateUrlSummary';
import { z } from 'zod';

export type Note = {
  summary: string;
  page_content: BlockObjectRequest[];
};

export async function createNoteFromTextMessage(
  message: Message.TextMessage,
): Promise<Note> {
  if (z.string().url().safeParse(message.text).success) {
    return createNoteFromUrlMessage(message);
  }

  const summary =
    (await generateSummary(message.text)) ?? 'Could not generate summary';

  const page_content = toNotionBlocks(
    toParagraphs(message.text, message.entities ?? []),
  );

  return {
    summary,
    page_content,
  };
}

export async function createNoteFromUrlMessage(
  message: Message.TextMessage,
): Promise<Note> {
  const summary = await generateUrlSummary(message.text);

  const page_content: BlockObjectRequest[] = [
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: message.text,
              link: {
                url: message.text,
              },
            },
          },
        ],
      },
    },
    ...toNotionBlocks(toParagraphs(summary.long, [])),
  ];

  return {
    summary: summary.short,
    page_content,
  };
}
