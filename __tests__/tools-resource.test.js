/**
 * Tests for tools/resource — static asset generator
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const TOOL_PATH = path.resolve(__dirname, "../tools/resource/index.js");
const OUTPUT_DIR = path.resolve(__dirname, "../public/resources-test");

// Helper to run the tool
function runTool(args = "") {
  return execSync(`node "${TOOL_PATH}" ${args}`, {
    encoding: "utf8",
    timeout: 10000,
  });
}

// Clean up test output
afterAll(() => {
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
});

describe("tools/resource", () => {
  describe("CLI argument parsing", () => {
    test("shows help and exits", () => {
      expect(() => runTool("--help")).toThrow();
    });

    test("accepts --type and --output flags", () => {
      const output = runTool(`--type alphabet -o "${OUTPUT_DIR}"`);
      expect(output).toContain("[alphabet] Generated:");
      expect(output).toContain("Done: 1 generated");
    });
  });

  describe("alphabet chart generation", () => {
    test("generates alphabet-chart.svg with valid SVG", () => {
      runTool(`--type alphabet -o "${OUTPUT_DIR}"`);

      const filePath = path.join(OUTPUT_DIR, "alphabet-chart.svg");
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, "utf8");
      expect(content).toContain("<?xml");
      expect(content).toContain("<svg");
      expect(content).toContain("简语字母发音表");
    });

    test("SVG contains all 24 letters", () => {
      runTool(`--type alphabet -o "${OUTPUT_DIR}"`);

      const content = fs.readFileSync(path.join(OUTPUT_DIR, "alphabet-chart.svg"), "utf8");
      const expectedLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Z"];
      for (const letter of expectedLetters) {
        // Each letter should appear as a bold label
        expect(content).toContain(`fill="#2563eb">${letter}</text>`);
      }
    });

    test("SVG contains digraphs section", () => {
      runTool(`--type alphabet -o "${OUTPUT_DIR}"`);

      const content = fs.readFileSync(path.join(OUTPUT_DIR, "alphabet-chart.svg"), "utf8");
      expect(content).toContain("辅音字母组合");
      expect(content).toContain(">ch<");
      expect(content).toContain(">sc<");
      expect(content).toContain(">gu<");
      expect(content).toContain(">qu<");
    });

    test("SVG contains diphthongs section", () => {
      runTool(`--type alphabet -o "${OUTPUT_DIR}"`);

      const content = fs.readFileSync(path.join(OUTPUT_DIR, "alphabet-chart.svg"), "utf8");
      expect(content).toContain("双元音");
      expect(content).toContain(">ai<");
      expect(content).toContain(">ou<");
    });
  });

  describe("OG image generation", () => {
    test("generates 4 OG images with valid SVG", () => {
      const output = runTool(`--type og -o "${OUTPUT_DIR}"`);

      expect(output).toContain("og-default.svg");
      expect(output).toContain("og-vocabulary.svg");
      expect(output).toContain("og-grammar.svg");
      expect(output).toContain("og-discussions.svg");

      const defaultSvg = fs.readFileSync(path.join(OUTPUT_DIR, "og-default.svg"), "utf8");
      expect(defaultSvg).toContain("<svg");
      expect(defaultSvg).toContain("viewBox=\"0 0 1200 630\"");
      expect(defaultSvg).toContain("简语 Simplingua");
    });

    test("OG images use gradient background", () => {
      runTool(`--type og -o "${OUTPUT_DIR}"`);

      const content = fs.readFileSync(path.join(OUTPUT_DIR, "og-default.svg"), "utf8");
      expect(content).toContain("linearGradient");
      expect(content).toContain("#1e40af");
    });
  });

  describe("'all' type generates everything", () => {
    test("generates alphabet + OG images", () => {
      const output = runTool(`--type all -o "${OUTPUT_DIR}"`);

      expect(output).toContain("[alphabet] Generated:");
      expect(output).toContain("[og] Generated:");
      expect(output).toMatch(/Done: 5 generated, 0 errors/);
    });
  });

  describe("XML escaping", () => {
    test("handles special characters in IPA data", () => {
      runTool(`--type alphabet -o "${OUTPUT_DIR}"`);

      const content = fs.readFileSync(path.join(OUTPUT_DIR, "alphabet-chart.svg"), "utf8");
      // IPA data contains < and > which should be escaped
      expect(content).not.toMatch(/[<>](?!\/?(svg|defs|linearGradient|stop|rect|text|line|g))/);
    });
  });

  describe("output directory creation", () => {
    test("creates output directory if it does not exist", () => {
      const nestedDir = path.join(OUTPUT_DIR, "nested", "deep");
      const output = runTool(`--type alphabet -o "${nestedDir}"`);

      expect(fs.existsSync(path.join(nestedDir, "alphabet-chart.svg"))).toBe(true);
      expect(output).toContain("1 generated");
    });
  });
});
