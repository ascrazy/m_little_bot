import * as z from "zod";

export function isWebpageUrl(maybeUrl: unknown): maybeUrl is string {
	return z
		.string()
		.refine((value) => /^(https?):\/\/[^\s]*$/i.test(value), {
			message: "Please enter a valid URL",
		})
		.safeParse(maybeUrl).success;
}
