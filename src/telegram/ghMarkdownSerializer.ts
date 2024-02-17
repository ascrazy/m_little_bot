import { serialiseWith, serialisers } from "@telegraf/entity";

type Serialiser = typeof serialisers.HTML;

const ghMarkdownSerializer: Serialiser = (match, node) => {
	switch (node?.type) {
		case "bold":
			return `**${match}**`;
		case "italic":
			return `_${match}_`;
		case "underline":
			// todo:
			return `__${match}__`;
		case "strikethrough":
			return `~~${match}~~`;
		case "code":
			return `\`${match}\``;
		case "pre":
			if (node.language) return `\`\`\`${node.language}\n${match}\n\`\`\``;
			return `\`\`\`\n${match}\n\`\`\``;
		case "url":
			return match;
		case "text_link":
			return `[${match}](${node.url})`;
		case "text_mention":
			return `[${match}](tg://user?id=${node.user.id})`;
		case "blockquote":
			return `${match
				.split("\n")
				.map((line) => `>${line}`)
				.join("\n")}`;
		case "mention":
			return `[${match}](https://t.me/${match})`;
		case "custom_emoji":
			return `[${match}](tg://emoji?id=${node.custom_emoji_id})`;
		case "phone_number":
			return `[${escapeLeadingPlus(match)}](tel:${match})`;
		case "email":
			return `[${match}](mailto:${match})`;
		case "spoiler":
		case "hashtag":
		case "cashtag":
		case "bot_command":
			return match;
		default:
			return match;
	}
};

export const toGhMarkdown = serialiseWith(
	ghMarkdownSerializer,
	(token) => token,
);

function escapeLeadingPlus(match: string) {
	return match.replace(/^\+/g, "\\+");
}
