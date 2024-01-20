import { Client } from '@notionhq/client';
import type { BlockObjectRequest, CreateCommentParameters, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { MessageEntity } from 'telegraf/types';
import { toParagraphs, type Paragraph } from './telegram/toParagraphs';

const client = new Client({ auth: process.env.NOTION_ACCESS_TOKEN });

export async function addToInbox(title: string, content: BlockObjectRequest[]): Promise<string> {
    const response = await client.pages.create({
        "parent": {
            "type": "database_id",
            "database_id": process.env.NOTION_DATABASE_ID ?? ''
        },
        "properties": {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": title
                        }
                    }
                ]
            },
        },
        "children": content
    })

    return (response as PageObjectResponse).url    
}

export function TelegramTextMessageToNotionPageContent(text: string, entities: MessageEntity[]): BlockObjectRequest[] {    
    return toParagraphs(text, entities).map((paragraph, index) => {
        const rich_text = toRichText(paragraph)

        return {
            "object": "block",
            "paragraph": {
                rich_text,                
            }
        }
    })
}

type RichTextItemRequestList = CreateCommentParameters['rich_text'];

function toRichText(paragraph: Paragraph): RichTextItemRequestList {    
    const output: RichTextItemRequestList = [];

    let currentIndex = 0;

    for (const entity of paragraph.entities) {
        const text = paragraph.text.slice(currentIndex, entity.offset)
        if (text.length > 0) {
            output.push({
                type: 'text',
                text: {
                    content: text,
                }
            })
        }
        const entityText = paragraph.text.slice(entity.offset, entity.offset + entity.length)

        switch(entity.type) {
            case 'bold':
                output.push({
                    type: 'text',
                    text: {
                        content: entityText,
                    },
                    annotations: {
                        bold: true,
                    }
                })
                break;
            case 'italic':
                output.push({
                    type: 'text',
                    text: {
                        content: entityText,
                    },
                    annotations: {
                        italic: true,
                    }
                })
                break;
            case 'underline':
                output.push({
                    type: 'text',
                    text: {
                        content: entityText,
                    },
                    annotations: {
                        underline: true,
                    }
                })
                break;
            case 'strikethrough':
                output.push({
                    type: 'text',
                    text: {
                        content: entityText,
                    },
                    annotations: {
                        strikethrough: true,
                    }
                })
                break;
            case 'code':
                output.push({
                    type: 'text',
                    text: {
                        content: entityText,                        
                    },
                    annotations: {
                        code: true,
                    }
                })
                break;            
            case 'text_link':
                output.push({
                    type: 'text',
                    text: {
                        content: entityText,
                        link: {
                            url: entity.url,
                        }
                    }
                })
                break;
            case 'url':
                output.push({
                    type: 'text',
                    text: {
                        content: entityText,
                        link: {
                            url: entityText,
                        }
                    }
                })
                break;
            default:
                console.error('Unknown entity type', entity.type)
        }

        currentIndex = entity.offset + entity.length;
    }

    if (currentIndex < paragraph.text.length - 1) {
        output.push({
            type: 'text',
            text: {
                content: paragraph.text.slice(currentIndex),
            }
        })
    }

    return output;
}