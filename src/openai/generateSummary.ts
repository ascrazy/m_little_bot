import OpenAI from 'openai';
import { AppConfig } from '../AppConfig';

const openai = new OpenAI({
  apiKey: AppConfig.OpenAIApiKey,
});

export async function generateSummary(input: string): Promise<string> {
  if (input.length < 200) {
    return input.slice(0, 100);
  }

  const response = await openai.chat.completions.create(
    {
      messages: [
        {
          role: 'system',
          content:
            'provide a summary of the message below in no more than 100 characters, reply with summary only',
        },
        { role: 'user', content: input },
      ],
      model: 'gpt-4-1106-preview',
    },
    {
      maxRetries: 5,
    },
  );

  return response.choices[0].message.content ?? '';
}
