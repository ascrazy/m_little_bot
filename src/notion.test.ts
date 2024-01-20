import {describe, test, expect} from 'bun:test';
import { diff } from 'deep-object-diff';

import { TelegramTextMessageToNotionPageContent } from "./notion";

describe('TelegramTextMessageToNotionPageContent', () => {
    test('plain text paragraph', () => {
        expect(diff(TelegramTextMessageToNotionPageContent('Hello World!\n\nHey Jude!', []), [
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "Hello World!",                                
                            },
                        },
                    ],            
                }
            },
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "Hey Jude!",                                
                            },
                        },
                    ],            
                }
            },            
        ])).toEqual({})        
    })

    test('paragraph with URL', () => {             
        expect(diff(TelegramTextMessageToNotionPageContent('Hello World https://example.com', [{
            offset: 12,
            length: 19,
            type: "url",
        }]), [
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "Hello World ",                                
                            },
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": "https://example.com",
                                link: { url: "https://example.com" }                                
                            },
                        },
                    ],            
                }
            },
        ])).toEqual({})               
    })

    test('paragraph with link', () => {        
        expect(diff(TelegramTextMessageToNotionPageContent('Hello World with link', [{
            offset: 12,
            length: 9,
            type: "text_link",
            url: 'https://example.com'
        }]), [
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "Hello World ",                                
                            },
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": "with link",
                                link: { url: "https://example.com" }                                
                            },
                        },
                    ],            
                }
            },            
        ])).toEqual({})               
    })

    test('paragraph with bold text', () => {        
        expect(diff(TelegramTextMessageToNotionPageContent('Hello World bold text', [{
            offset: 12,
            length: 9,
            type: "bold",
        }]), [
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "Hello World ",                                
                            },
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": "bold text",                                                               
                            },
                            annotations: {
                                bold: true
                            }
                        },
                    ],            
                }
            },            
        ])).toEqual({})               
    })

    test('paragraph with underline text', () => {        
        expect(diff(TelegramTextMessageToNotionPageContent('Hello World underline text', [{
            offset: 12,
            length: 14,
            type: "underline",
        }]), [
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "Hello World ",                                
                            },
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": "underline text",                                                               
                            },
                            annotations: {
                                underline: true
                            }
                        },
                    ],            
                }
            },            
        ])).toEqual({})               
    })

    test('paragraph with italic text', () => {        
        expect(diff(TelegramTextMessageToNotionPageContent('Hello World italic text', [{
            offset: 12,
            length: 11,
            type: "italic",
        }]), [
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "Hello World ",                                
                            },
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": "italic text",                                                               
                            },
                            annotations: {
                                italic: true
                            }
                        },
                    ],            
                }
            },            
        ])).toEqual({})               
    })

    test('paragraph with strikethrough text', () => {        
        expect(diff(TelegramTextMessageToNotionPageContent('Hello World strikethrough text', [{
            offset: 12,
            length: 18,
            type: "strikethrough",
        }]), [
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "Hello World ",                                
                            },
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": "strikethrough text",                                                               
                            },
                            annotations: {
                                strikethrough: true
                            }
                        },
                    ],            
                }
            },            
        ])).toEqual({})               
    })

    test('paragraph with inline code', () => {        
        expect(diff(TelegramTextMessageToNotionPageContent('Hello World console.log("Hi")', [{
            offset: 12,
            length: 17,
            type: "code",
        }]), [
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "Hello World ",                                
                            },
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": "console.log(\"Hi\")",                                                               
                            },
                            annotations: {
                                code: true
                            }
                        },
                    ],            
                }
            },            
        ])).toEqual({})               
    })

    test('compound example', () => {  
        console.log(JSON.stringify(TelegramTextMessageToNotionPageContent(
            "Это тестовы текст со ссылками https://bfe.dev/ \n\nИ форматированием\n\nИ с кодом\n\nИ с дополнительной ссылкой",
            [
                {
                    offset: 30,
                    length: 16,
                    type: "url",
                }, {
                    offset: 51,
                    length: 15,
                    type: "bold",
                }, {
                    offset: 72,
                    length: 5,
                    type: "code",
                }, {
                    offset: 98,
                    length: 7,
                    type: "text_link",
                    url: "https://example.com/",
                }
            ]
        ), null, 2))      
        expect(diff(TelegramTextMessageToNotionPageContent(
            "Это тестовы текст со ссылками https://bfe.dev/ \n\nИ форматированием\n\nИ с кодом\n\nИ с дополнительной ссылкой",
            [
                {
                    offset: 30,
                    length: 16,
                    type: "url",
                }, {
                    offset: 51,
                    length: 15,
                    type: "bold",
                }, {
                    offset: 72,
                    length: 5,
                    type: "code",
                }, {
                    offset: 98,
                    length: 7,
                    type: "text_link",
                    url: "https://example.com/",
                }
            ]
        ), [
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "Это тестовы текст со ссылками ",                                
                            },
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": "https://bfe.dev/",
                                link: { url: "https://bfe.dev/" }                                
                            },
                        },
                    ],            
                }
            },
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "И ",                                
                            },
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": "форматированием",                                
                            },
                            annotations: {
                                bold: true
                            }
                        },
                    ],            
                }
            },
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "И с ",                                
                            },
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": "кодом",                                                                
                            },
                            annotations: {
                                code: true
                            }
                        },
                    ],            
                }
            },
            {
                object: "block",
                paragraph: {
                    rich_text: [
                        {
                            "type": "text",
                            "text": {
                                "content": "И с дополнительной ",                                
                            },
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": "ссылкой",
                                link: { url: "https://example.com/" }                                
                            },
                        },
                    ],  
                }
            }
        ])).toEqual({})
    })
})