import { describe, expect, it, mock } from "bun:test";
import { chainOfResponsibility } from "./chainOfResponsibility"; // Adjust the import based on your file structure

describe("chainOfResponsibility", () => {
	it("should resolve with the result of the first successful function", async () => {
		const failFunc = mock(() => Promise.reject("Fail"));
		const successFunc = mock(() => Promise.resolve("Success"));

		const result = await chainOfResponsibility([failFunc, successFunc]);
		expect(result).toBe("Success");
		expect(failFunc).toHaveBeenCalled();
		expect(successFunc).toHaveBeenCalled();
	});

	it("should reject if all functions fail", async () => {
		const failFunc1 = mock(() => Promise.reject("Fail1"));
		const failFunc2 = mock(() => Promise.reject("Fail2"));

		expect(() => chainOfResponsibility([failFunc1, failFunc2])).toThrow(
			"All functions failed",
		);
		expect(failFunc1).toHaveBeenCalled();
		expect(failFunc2).toHaveBeenCalled();
	});

	it("should resolve with the result of the last function if previous ones fail", async () => {
		const failFunc = mock(() => Promise.reject("Fail"));
		const successFunc = mock(() => Promise.resolve("Success"));

		const result = await chainOfResponsibility([
			failFunc,
			failFunc,
			successFunc,
		]);
		expect(result).toBe("Success");
		expect(failFunc).toHaveBeenCalledTimes(2);
		expect(successFunc).toHaveBeenCalled();
	});

	it("should not execute subsequent functions after a successful one", async () => {
		const firstFunc = mock(() => Promise.resolve("First Success"));
		const secondFunc = mock(() => Promise.resolve("Second Success"));

		const result = await chainOfResponsibility([firstFunc, secondFunc]);
		expect(result).toBe("First Success");
		expect(firstFunc).toHaveBeenCalled();
		expect(secondFunc).not.toHaveBeenCalled();
	});
});
