import type {
  BlockObjectRequest,
  CreateCommentParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { type Paragraph } from "../telegram/toParagraphs";

export function toNotionBlocks(paragraphs: Paragraph[]): BlockObjectRequest[] {
  return paragraphs.map((paragraph, index) => {
    const rich_text = toRichText(paragraph);

    return {
      object: "block",
      paragraph: {
        rich_text,
      },
    };
  });
}

type RichTextItemRequestList = CreateCommentParameters["rich_text"];

function toRichText(paragraph: Paragraph): RichTextItemRequestList {
  const output: RichTextItemRequestList = [];

  let currentIndex = 0;

  for (const entity of paragraph.entities) {
    const text = paragraph.text.slice(currentIndex, entity.offset);
    if (text.length > 0) {
      output.push({
        type: "text",
        text: {
          content: text,
        },
      });
    }
    const entityText = paragraph.text.slice(
      entity.offset,
      entity.offset + entity.length,
    );

    switch (entity.type) {
      case "bold":
        output.push({
          type: "text",
          text: {
            content: entityText,
          },
          annotations: {
            bold: true,
          },
        });
        break;
      case "italic":
        output.push({
          type: "text",
          text: {
            content: entityText,
          },
          annotations: {
            italic: true,
          },
        });
        break;
      case "underline":
        output.push({
          type: "text",
          text: {
            content: entityText,
          },
          annotations: {
            underline: true,
          },
        });
        break;
      case "strikethrough":
        output.push({
          type: "text",
          text: {
            content: entityText,
          },
          annotations: {
            strikethrough: true,
          },
        });
        break;
      case "code":
        output.push({
          type: "text",
          text: {
            content: entityText,
          },
          annotations: {
            code: true,
          },
        });
        break;
      case "text_link":
        output.push({
          type: "text",
          text: {
            content: entityText,
            link: {
              url: entity.url,
            },
          },
        });
        break;
      case "url":
        output.push({
          type: "text",
          text: {
            content: entityText,
            link: {
              url: entityText,
            },
          },
        });
        break;
      default:
        console.error("Unknown entity type", entity.type);
    }

    currentIndex = entity.offset + entity.length;
  }

  if (currentIndex < paragraph.text.length - 1) {
    output.push({
      type: "text",
      text: {
        content: paragraph.text.slice(currentIndex),
      },
    });
  }

  return output;
}
