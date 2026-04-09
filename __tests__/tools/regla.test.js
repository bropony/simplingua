/**
 * Tests for the regla (grammar) converter
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

describe("regla converter", () => {
  const inputPath = path.resolve(__dirname, "../../docs/lingua_regla_de_simplingua.txt");

  it("input file exists", () => {
    expect(fs.existsSync(inputPath)).toBe(true);
  });

  it("produces valid JSON output", () => {
    const outputPath = path.resolve(__dirname, "../../data/test-grammar.json");
    try {
      execSync(`node tools/regla/index.js --pretty -o ${outputPath}`, {
        cwd: path.resolve(__dirname, "../.."),
        timeout: 30000,
      });

      const content = fs.readFileSync(outputPath, "utf-8");
      const data = JSON.parse(content);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(10);

      // Check chapter structure
      const chapter = data.find(c => c.chapterTitle === "名词");
      expect(chapter).toBeDefined();
      expect(chapter.sections.length).toBeGreaterThan(0);
      expect(chapter.sections[0]).toHaveProperty("title");
      expect(chapter.sections[0]).toHaveProperty("content");
    } finally {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  });

  it("chapters have correct ordering from TOC", () => {
    const outputPath = path.resolve(__dirname, "../../data/test-grammar-order.json");
    try {
      execSync(`node tools/regla/index.js --pretty -o ${outputPath}`, {
        cwd: path.resolve(__dirname, "../.."),
        timeout: 30000,
      });

      const data = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
      const nounChapter = data.find(c => c.chapterTitle === "名词");
      expect(nounChapter.order).toBe(1); // 名词 is 1st in TOC (简语七条基本语法 and 发音与拼写 are NOT in the TOC)
    } finally {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  });

  it("sections have content", () => {
    const outputPath = path.resolve(__dirname, "../../data/test-grammar-content.json");
    try {
      execSync(`node tools/regla/index.js --pretty -o ${outputPath}`, {
        cwd: path.resolve(__dirname, "../.."),
        timeout: 30000,
      });

      const data = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
      let totalSections = 0;
      let sectionsWithContent = 0;
      for (const ch of data) {
        for (const sec of ch.sections) {
          totalSections++;
          if (sec.content && sec.content.length > 10) sectionsWithContent++;
        }
      }
      expect(totalSections).toBeGreaterThan(10);
      expect(sectionsWithContent).toBeGreaterThan(totalSections * 0.8);
    } finally {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  });
});
