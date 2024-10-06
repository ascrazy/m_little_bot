import { describe, expect, test } from "bun:test";
import { markdownV2Escape } from "./markdownV2Escape";

describe("markdownV2Escape", () => {
	test("escapes all special characters", () => {
		expect(markdownV2Escape("_")).toBe("\\_");
		expect(markdownV2Escape("`")).toBe("\\`");
		expect(markdownV2Escape("[")).toBe("\\[");
		expect(markdownV2Escape("]")).toBe("\\]");
		expect(markdownV2Escape("(")).toBe("\\(");
		expect(markdownV2Escape(")")).toBe("\\)");
		expect(markdownV2Escape("~")).toBe("\\~");
		expect(markdownV2Escape(">")).toBe("\\>");
		expect(markdownV2Escape("#")).toBe("\\#");
		expect(markdownV2Escape("+")).toBe("\\+");
		expect(markdownV2Escape("-")).toBe("\\-");
		expect(markdownV2Escape("=")).toBe("\\=");
		expect(markdownV2Escape("|")).toBe("\\|");
		expect(markdownV2Escape("{")).toBe("\\{");
		expect(markdownV2Escape("}")).toBe("\\}");
		expect(markdownV2Escape(".")).toBe("\\.");
		expect(markdownV2Escape("!")).toBe("\\!");
	});

	test("compound example", () => {
		expect(markdownV2Escape("`_~")).toBe("\\`\\_\\~");
	});
});
