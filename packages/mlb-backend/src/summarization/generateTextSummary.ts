import type { AppContext } from "../AppContext";

export async function generateTextSummary(
	app_ctx: AppContext,
	input_text: string,
): Promise<string> {
	if (input_text.length < 200) {
		return input_text.slice(0, 100);
	}

	const response = await app_ctx.getOpenAI().chat.completions.create(
		{
			messages: [
				{
					role: "system",
					content:
						"provide a summary of the message below in no more than 100 characters, reply with summary only",
				},
				{ role: "user", content: input_text },
			],
			model: "gpt-4-1106-preview",
		},
		{
			maxRetries: 5,
		},
	);

	return response.choices[0].message.content ?? "";
}
