import { describe, test, expect } from 'bun:test'
import { toParagraphs } from './toParagraphs'

describe('toParagraphs', () => {
    test('basic example', () => {
        expect(toParagraphs("First paragraph\nSecond paragraph\n\nThird paragraph\n\n\n\n", [])).toEqual([
            { text: 'First paragraph', entities: [] },
            { text: 'Second paragraph', entities: [] },
            { text: 'Third paragraph', entities: [] },
        ])
    })

    test('example with entities', () => {        
        expect(toParagraphs("First paragraph\nSecond paragraph\nThird paragraph", [{
            type: 'bold',
            offset: 5,
            length: 9,
        }, {
            type: 'text_link',
            offset: 16,
            length: 6,
            url: 'https://example.com'
        }])).toEqual([
            { text: 'First paragraph', entities: [{
                type: 'bold',
                offset: 5,
                length: 9,
            }] },
            { text: 'Second paragraph', entities: [{
                type: 'text_link',
                offset: 0,
                length: 6,
                url: 'https://example.com'
            }] },
            { text: 'Third paragraph', entities: [] },
        ])
    })

    test('example with multiline entities', () => {        
        expect(toParagraphs("First paragraph\nconsole.log(1)\n\nconsole.log(2)", [{
            type: 'bold',
            offset: 5,
            length: 9,
        }, {
            type: 'code',
            offset: 16,
            length: 30,
        }])).toEqual([
            { text: 'First paragraph', entities: [{
                type: 'bold',
                offset: 5,
                length: 9,
            }] },
            { text: 'console.log(1)\n\nconsole.log(2)', entities: [{
                type: 'code',
                offset: 0,
                length: 30,
            }] },
        ])
    })

    test('compound example', () => {
        expect(toParagraphs("Это тестовы текст со ссылками https://bfe.dev/ \n\nИ форматированием\n\nИ с кодом\n\nИ с дополнительной ссылкой",
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
        ])).toEqual(
        [
            {
                "text": "Это тестовы текст со ссылками https://bfe.dev/ ",
                "entities": [
                {
                    "offset": 30,
                    "length": 16,
                    "type": "url"
                }
                ]
            },
            {
                "text": "И форматированием",
                "entities": [
                {
                    "offset": 2,
                    "length": 15,
                    "type": "bold"
                }
                ]
            },
            {
                "text": "И с кодом",
                "entities": [
                {
                    "offset": 4,
                    "length": 5,
                    "type": "code"
                }
                ]
            },
            {
                "text": "И с дополнительной ссылкой",
                "entities": [
                {
                    "offset": 19,
                    "length": 7,
                    "type": "text_link",
                    "url": "https://example.com/"
                }
                ]
            }
            ]
        )
    })
})