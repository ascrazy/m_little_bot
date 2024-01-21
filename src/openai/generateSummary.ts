import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

export async function generateSummary(input: string): Promise<string> {
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
