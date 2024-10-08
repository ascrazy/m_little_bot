import path from "node:path";
import { z } from "zod";

const FileHandleSchema = z.object({
	file_id: z.string(),
	extname: z.string(),
});

type FileHandle = z.infer<typeof FileHandleSchema>;

export function parseFileHandle(file_handle_input: string): FileHandle {
	const extname = path.extname(file_handle_input);
	const file_id = path.basename(file_handle_input, extname);

	return FileHandleSchema.parse({
		file_id,
		extname,
	});
}

export function createFileHandle(file_id: string, extname: string): FileHandle {
	return { file_id, extname };
}

export function serializeFileHandle(file_handle: FileHandle): string {
	return `${file_handle.file_id}${ensureLeadingDot(file_handle.extname)}`;
}

function ensureLeadingDot(extname: string): string {
	if (extname.startsWith(".")) {
		return extname;
	}

	return `.${extname}`;
}
