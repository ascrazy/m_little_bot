import { describe, expect, test } from "bun:test";
import { isWebpageUrl } from "./isWebpageUrl";

describe("isWebpageUrl", () => {
	test("http url", () => {
		expect(isWebpageUrl("http://example.com")).toBe(true);
	});

	test("https url", () => {
		expect(isWebpageUrl("https://example.com")).toBe(true);
	});

	test("https url with pathname, query and hash", () => {
		expect(
			isWebpageUrl(
				"https://example.com/path/to/page?utm_source=google%20search#section_1",
			),
		).toBe(true);
	});

	test("ftp url", () => {
		expect(isWebpageUrl("ftp://example.com")).toBe(false);
	});

	test("non-url string", () => {
		expect(isWebpageUrl("not a url")).toBe(false);
		expect(isWebpageUrl("not: a url")).toBe(false);
	});

	test("URL-like string with spaces", () => {
		expect(isWebpageUrl("https://ex ample.com")).toBe(false);
	});
});
