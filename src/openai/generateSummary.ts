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
            'generate short one line summary for the following message. restrict maximum length of the summary to 100 characters. reply with summary only',
        },
        { role: 'user', content: input },
      ],
      model: 'gpt-3.5-turbo',
    },
    {
      maxRetries: 5,
    },
  );

  return response.choices[0].message.content ?? '';
}
