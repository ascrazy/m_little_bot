import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';

export function createCollapsibleJSONBlock(
  title: string,
  json: object,
): BlockObjectRequest {
  return {
    object: 'block',
    type: 'toggle',
    toggle: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: title,
          },
        },
      ],
      children: [
        {
          object: 'block',
          type: 'code',
          code: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: JSON.stringify(json, null, 2).slice(0, 2000),
                },
              },
            ],
            language: 'json',
          },
        },
      ],
    },
  };
}
