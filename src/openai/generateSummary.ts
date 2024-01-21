import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

export async function generateSummary(input: string): Promise<string> {
  const response = await openai.chat.completions.create(
    {
      messages: [
        {
          role: "system",
          content:
            "generate short one line summary of the max length of 100 characters for the following message. reply with summary only",
        },
        { role: "user", content: input },
      ],
      model: "gpt-3.5-turbo",
    },
    {
      maxRetries: 5,
    },
  );

  return response.choices[0].message.content ?? "";
}
