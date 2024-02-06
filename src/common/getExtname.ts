import mime from "mime";

export function getExtname(content_type: string | undefined) {
	if (!content_type) {
		return "";
	}

	const ext = mime.getExtension(content_type);

	return ext ? `.${ext}` : "";
}
