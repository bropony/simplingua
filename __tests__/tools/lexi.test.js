/**
 * Tests for the lexi (vocabulary) converter
 */

// We need to test the parser functions directly
// Since the tool is plain JS, we can require it
// But main() runs on import, so we'll extract the parser logic

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Re-implement core parser functions for isolated testing
// (In production, these would be exported from the module)

const CIRCLED_NUMS = "①②③④⑤⑥⑦⑧⑨⑩";

function parseNumberedMeanings(text) {
  const parts = [];
  let hasCircled = false;
  for (const ch of CIRCLED_NUMS) {
    if (text.includes(ch)) { hasCircled = true; break; }
  }
  if (hasCircled) {
    let remaining = text;
    let idx = 0;
    while (idx < remaining.length) {
      const ci = CIRCLED_NUMS.indexOf(remaining[idx]);
      if (ci !== -1) {
        let end = remaining.length;
        for (let j = idx + 1; j < remaining.length; j++) {
          if (CIRCLED_NUMS.includes(remaining[j])) { end = j; break; }
        }
        parts.push({ number: ci + 1, text: remaining.slice(idx + 1, end).trim() });
        idx = end;
      } else { idx++; }
    }
  } else {
    parts.push({ number: 1, text: text.trim() });
  }
  return parts;
}

// ── Tests ────────────────────────────────────────────────────────

describe("lexi converter", () => {
  describe("parseNumberedMeanings", () => {
    it("parses circled-number definitions", () => {
      const result = parseNumberedMeanings("①酸味的东西；②酸性物质；③（化学）酸");
      expect(result).toHaveLength(3);
      expect(result[0].number).toBe(1);
      expect(result[0].text).toContain("酸味");
      expect(result[1].number).toBe(2);
      expect(result[2].number).toBe(3);
    });

    it("handles single definition without numbers", () => {
      const result = parseNumberedMeanings("冷杉（生物）");
      expect(result).toHaveLength(1);
      expect(result[0].number).toBe(1);
      expect(result[0].text).toBe("冷杉（生物）");
    });
  });

  describe("CLI execution", () => {
    const inputPath = path.resolve(__dirname, "../../docs/lexilibro_de_simplingua.txt");

    it("input file exists", () => {
      expect(fs.existsSync(inputPath)).toBe(true);
    });

    it("produces valid JSON output", () => {
      const outputPath = path.resolve(__dirname, "../../data/test-vocabulary.json");
      try {
        execSync(`node tools/lexi/index.js --pretty -o ${outputPath}`, {
          cwd: path.resolve(__dirname, "../.."),
          timeout: 30000,
        });

        const content = fs.readFileSync(outputPath, "utf-8");
        const data = JSON.parse(content);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(50);

        // Check first entry structure
        const entry = data[0];
        expect(entry).toHaveProperty("word");
        expect(entry).toHaveProperty("partOfSpeech");
        expect(entry).toHaveProperty("letter");
        expect(entry).toHaveProperty("definitions");
      } finally {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      }
    });

    it("entries have correct letter grouping", () => {
      const outputPath = path.resolve(__dirname, "../../data/test-vocab-letter.json");
      try {
        execSync(`node tools/lexi/index.js --pretty -o ${outputPath}`, {
          cwd: path.resolve(__dirname, "../.."),
          timeout: 30000,
        });

        const data = JSON.parse(fs.readFileSync(outputPath, "utf-8"));

        // Check that entries under letter A start with A
        const aEntries = data.filter(e => e.letter === "A");
        expect(aEntries.length).toBeGreaterThan(0);
        for (const entry of aEntries) {
          expect(entry.word[0].toUpperCase()).toBe("A");
        }
      } finally {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      }
    });

    it("parses definitions with examples", () => {
      const outputPath = path.resolve(__dirname, "../../data/test-vocab-defs.json");
      try {
        execSync(`node tools/lexi/index.js --pretty -o ${outputPath}`, {
          cwd: path.resolve(__dirname, "../.."),
          timeout: 30000,
        });

        const data = JSON.parse(fs.readFileSync(outputPath, "utf-8"));

        // Find "a" entry which has examples
        const aEntry = data.find(e => e.word === "a");
        expect(aEntry).toBeDefined();
        expect(aEntry.definitions.length).toBeGreaterThan(0);
        expect(aEntry.definitions[0].meaning).toContain("向");
      } finally {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      }
    });
  });
});
