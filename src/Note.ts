import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';
import type { Message } from 'telegraf/types';
import { generateSummary } from './openai/generateSummary';
import { generateUrlSummary } from './openai/generateUrlSummary';
import { z } from 'zod';
import { toMarkdownV2 } from '@telegraf/entity';
import { markdownToBlocks } from '@tryfabric/martian';
import { createFileHandle, serializeFileHandle } from './http/FileHandle';
import { getAppConfig } from './AppConfig';

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

  const page_content = markdownToBlocks(
    toMarkdownV2({
      text: message.text,
      entities: message.entities,
    }),
  );

  return {
    summary,
    page_content: page_content as BlockObjectRequest[],
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
    ...(markdownToBlocks(summary.long) as BlockObjectRequest[]),
  ];

  return {
    summary: summary.short,
    page_content,
  };
}

export async function createNoteFromPhotoMessage(
  message: Message.PhotoMessage,
): Promise<Note> {
  let summary: string;
  if (message.caption) {
    summary =
      (await generateSummary(message.caption)) ?? 'Could not generate summary';
  } else {
    // TODO: generate caption from image with openai
    summary = 'Image (no caption)';
  }

  const page_content = [
    {
      object: 'block',
      type: 'image',
      image: {
        type: 'external',
        external: {
          url: generatePhotoUrl(message),
        },
      },
    },
    ...(message.caption
      ? markdownToBlocks(
          toMarkdownV2({
            text: message.caption,
            entities: message.caption_entities,
          }),
        )
      : []),
  ];

  return {
    summary,
    page_content: page_content as BlockObjectRequest[],
  };
}

function generatePhotoUrl(message: Message.PhotoMessage): string {
  return new URL(
    `/file/${serializeFileHandle(createFileHandle(message.photo[message.photo.length - 1].file_id, '.jpg'))}`,
    getAppConfig().AppHost,
  ).toString();
}
