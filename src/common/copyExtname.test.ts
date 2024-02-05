import { describe, expect, it, test } from "bun:test";
import { copyExtname } from "./copyExtname";

describe("copyExtname", () => {
	it("copies extname", () => {
		expect(copyExtname("to", "from.md")).toBe("to.md");
	});

	it("appends second extname", () => {
		expect(copyExtname("to.txt", "from.md")).toBe("to.txt.md");
	});

	test("no extname", () => {
		expect(copyExtname("to", "from")).toBe("to");
	});

	it("throws if to is empty", () => {
		expect(() => copyExtname("", "from.md")).toThrow("to is empty");
	});
});
