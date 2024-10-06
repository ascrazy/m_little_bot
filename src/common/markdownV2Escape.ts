// In all other places characters ‘_’, ‘’, ‘[’, ‘]’, ‘(’, ‘)’, ‘~’, ‘`’, ‘>’, ‘#’, ‘+’, ‘-’, ‘=’, ‘|’, ‘{’, ‘}’, ‘.’, ‘!’ must be escaped with the preceding character ''.

export const markdownV2Escape = (text: string): string => {
	return text.replace(/[_\[\]()~`>#\+\-=|{}\.!]/g, (match) => `\\${match}`);
};
