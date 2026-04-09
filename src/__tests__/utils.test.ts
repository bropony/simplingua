/**
 * @jest-environment node
 */

import { escapeRegex } from "@/lib/utils";

describe("escapeRegex", () => {
  it("should escape all regex special characters", () => {
    const input = ".*+?^${}()|[]\\";
    const result = escapeRegex(input);
    // Each special char should be preceded by a backslash
    expect(result).toBe("\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\");
  });

  it("should leave normal alphanumeric characters unchanged", () => {
    expect(escapeRegex("hello123")).toBe("hello123");
  });

  it("should escape a realistic search string with special chars", () => {
    const input = "word (verb) [n.] $10";
    const result = escapeRegex(input);
    expect(result).toBe("word \\(verb\\) \\[n\\.\\] \\$10");
    // The escaped string should be safe to use in a RegExp constructor
    expect(() => new RegExp(result)).not.toThrow();
  });

  it("should handle empty string", () => {
    expect(escapeRegex("")).toBe("");
  });

  it("should handle a string with only special characters", () => {
    expect(escapeRegex("$$$")).toBe("\\$\\$\\$");
  });
});
