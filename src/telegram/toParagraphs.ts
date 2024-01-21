import type { MessageEntity } from "telegraf/types";

export type Paragraph = {
  text: string;
  entities: MessageEntity[];
};

export function toParagraphs(
  inputString: string,
  entities: MessageEntity[],
): Paragraph[] {
  const paragraphs = splitParagraphs(inputString, entities);

  return paragraphs.map((paragraph) => {
    const relevantEntities = selectRelevantEntities(paragraph, entities);
    return {
      text: paragraph.text,
      entities: relevantEntities,
    };
  });
}

type MessageParagraph = {
  text: string;
  startIndex: number;
};

function splitParagraphs(
  inputString: string,
  entities: MessageEntity[],
): MessageParagraph[] {
  let result: MessageParagraph[] = [];
  let lastIndex = 0;

  function isWithinEntity(index: number): boolean {
    const entity = entities.find((entity) => {
      return entity.offset <= index && entity.offset + entity.length > index;
    });

    return Boolean(entity);
  }

  // Use regex.exec in a loop to find matches and their indices
  for (const match of inputString.matchAll(/\n{1,}/g)) {
    if (!match.index) {
      continue;
    }

    if (isWithinEntity(match.index)) {
      continue;
    }

    let text = inputString.substring(lastIndex, match.index);
    if (text) {
      result.push({ text, startIndex: lastIndex });
    }
    lastIndex = match.index + match[0].length;
  }

  // Add the last paragraph if it exists
  let lastParagraph = inputString.substring(lastIndex);
  if (lastParagraph) {
    result.push({ text: lastParagraph, startIndex: lastIndex });
  }

  return result;
}

function selectRelevantEntities(
  paragraph: MessageParagraph,
  entities: MessageEntity[],
): MessageEntity[] {
  const relevantEntities = entities
    .filter(
      (entity) =>
        entity.offset >= paragraph.startIndex &&
        entity.offset <= paragraph.startIndex + paragraph.text.length,
    )
    .map((entity) => {
      return {
        ...entity,
        offset: entity.offset - paragraph.startIndex,
      };
    });

  relevantEntities.sort((a, b) => a.offset - b.offset);

  return relevantEntities;
}
