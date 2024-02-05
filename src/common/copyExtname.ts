import { extname, format } from "node:path";

export function copyExtname(to: string, from: string): string {
	if (!to) {
		throw new Error("to is empty");
	}

	const ext = extname(from);
	return format({
		name: to,
		ext,
	});
}
