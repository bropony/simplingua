#!/usr/bin/env node
/**
 * regla — Grammar text to JSON converter for Simplingua
 *
 * Converts docs/lingua_regla_de_simplingua.txt to a JSON array
 * of chapter objects matching the grammar data model schema.
 *
 * Usage:
 *   node tools/regla/index.js [options]
 *   Options:
 *     -i, --input <file>    Input file (default: docs/lingua_regla_de_simplingua.txt)
 *     -o, --output <file>   Output file (default: stdout)
 *     --pretty              Pretty-print JSON
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ── CLI arg parsing ──────────────────────────────────────────────
function parseArgs(argv) {
  const args = { input: null, output: null, pretty: false };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case "-i":
      case "--input":
        args.input = argv[++i];
        break;
      case "-o":
      case "--output":
        args.output = argv[++i];
        break;
      case "--pretty":
        args.pretty = true;
        break;
    }
  }
  return args;
}

// ── Helpers ──────────────────────────────────────────────────────

// Chinese numbered list patterns: 一、二、三、四、etc.
const CN_NUMBERS = "一二三四五六七八九十";
function cnNumToNumber(cn) {
  if (cn.length === 1) return CN_NUMBERS.indexOf(cn) + 1;
  if (cn === "十") return 10;
  // Handle 十一, 十二, etc.
  if (cn.startsWith("十")) return 10 + CN_NUMBERS.indexOf(cn[1]) + 1;
  return 1;
}

function isSectionHeader(line) {
  // Section headers: 一、二、三、... followed by title
  const match = line.match(/^([一二三四五六七八九十]+)、\s*(.+)/);
  return match;
}

function isSubsectionHeader(line) {
  // Subsection headers: 1. 2. 3. etc.
  const match = line.match(/^(\d+)\.\s+(.+)/);
  return match;
}

function extractExamples(text) {
  // Examples are typically pairs like:
  //   Simplingua sentence  Chinese translation
  // or lines that contain Simplingua words followed by Chinese
  const examples = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Look for pattern: Simplingua text + Chinese text
    // Usually separated by multiple spaces or a clear boundary
    // Example: "nina 女孩  nino 男孩"
    // Example: "un scopio （一副眼镜）"

    // Try matching pairs separated by 2+ spaces
    const pairs = trimmed.split(/\s{2,}/);
    if (pairs.length >= 2) {
      // Check if first part has latin chars and second has Chinese
      for (let i = 0; i < pairs.length - 1; i += 2) {
        const simp = pairs[i]?.trim();
        const chinese = pairs[i + 1]?.trim();
        if (simp && chinese && /[\w\u00C0-\u024F]/.test(simp) && /[\u4e00-\u9fff]/.test(chinese)) {
          examples.push({
            simplingua: simp,
            chinese: chinese.replace(/[（）]/g, "").trim(),
          });
        }
      }
    }
  }

  return examples;
}

// ── Main parser ──────────────────────────────────────────────────
function parseGrammar(inputText) {
  const lines = inputText.split("\n");
  const chapters = [];
  let stats = { chapters: 0, sections: 0, errors: 0 };

  // Phase 1: Extract table of contents to determine chapter order
  let toc = [];
  let inToc = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "【目录】") {
      inToc = true;
      continue;
    }
    if (inToc && trimmed.startsWith("【")) {
      inToc = false;
      continue;
    }
    if (inToc && trimmed) {
      toc.push(trimmed);
    }
  }

  // Phase 2: Parse chapters
  let currentChapter = null;
  let currentSection = null;
  let currentSubsection = null;
  let contentBuffer = [];

  function flushContent() {
    const content = contentBuffer.join("\n").trim();
    if (!content) return;

    if (currentSubsection) {
      currentSubsection.content += (currentSubsection.content ? "\n" : "") + content;
    } else if (currentSection) {
      currentSection.content += (currentSection.content ? "\n" : "") + content;
    }
    contentBuffer = [];
  }

  function flushSubsection() {
    if (!currentSubsection) return;
    flushContent();
    if (currentSection) {
      currentSection.subsections.push(currentSubsection);
    }
    currentSubsection = null;
  }

  function flushSection() {
    if (!currentSection) return;
    flushSubsection();
    flushContent();
    if (currentChapter) {
      currentChapter.sections.push(currentSection);
      stats.sections++;
    }
    currentSection = null;
  }

  function flushChapter() {
    if (!currentChapter) return;
    flushSection();
    flushContent();
    if (currentChapter.sections.length > 0 || currentChapter.chapterTitle) {
      chapters.push(currentChapter);
      stats.chapters++;
    }
    currentChapter = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // Skip the header lines
    if (i < 5 && (trimmed.includes("Lingua Regla") || trimmed.includes("简 语 语 法"))) continue;

    // Skip TOC
    if (trimmed === "【目录】") {
      // Skip until next 【
      while (i < lines.length - 1) {
        i++;
        if (lines[i].trim().startsWith("【") && lines[i].trim() !== "【目录】") {
          i--; // Back up so the main loop processes this line
          break;
        }
      }
      continue;
    }

    // Detect chapter headers: 【chapter name】
    const chapterMatch = trimmed.match(/^【(.+)】$/);
    if (chapterMatch) {
      const chapterTitle = chapterMatch[1];

      // Check if this chapter title is in the TOC
      const tocIndex = toc.indexOf(chapterTitle);

      flushChapter();
      currentChapter = {
        chapterTitle: chapterTitle,
        chapterTitleSimp: chapterTitle,
        order: tocIndex >= 0 ? tocIndex + 1 : chapters.length + 1,
        sections: [],
      };
      continue;
    }

    // If no chapter yet, skip
    if (!currentChapter) continue;

    // Detect section headers: 一、二、三、
    const secMatch = isSectionHeader(trimmed);
    if (secMatch) {
      flushSection();
      currentSection = {
        title: secMatch[2].trim(),
        content: "",
        examples: [],
        subsections: [],
      };
      continue;
    }

    // Detect subsection headers: 1. 2. 3.
    const subMatch = isSubsectionHeader(trimmed);
    if (subMatch) {
      flushSubsection();
      currentSubsection = {
        title: subMatch[2].trim(),
        content: "",
        examples: [],
      };
      continue;
    }

    // Regular content line
    contentBuffer.push(line);
  }

  // Flush remaining
  flushChapter();

  // Phase 3: Extract examples from content
  for (const chapter of chapters) {
    for (const section of chapter.sections) {
      section.examples = extractExamples(section.content);
      for (const sub of section.subsections) {
        sub.examples = extractExamples(sub.content);
      }
    }
  }

  return { chapters, stats };
}

// ── Main ─────────────────────────────────────────────────────────
function main() {
  const args = parseArgs(process.argv);

  const inputPath = args.input || path.resolve(__dirname, "../../docs/lingua_regla_de_simplingua.txt");

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const inputText = fs.readFileSync(inputPath, "utf-8");
  const { chapters, stats } = parseGrammar(inputText);

  const json = args.pretty
    ? JSON.stringify(chapters, null, 2)
    : JSON.stringify(chapters);

  if (args.output) {
    const outDir = path.dirname(args.output);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(args.output, json, "utf-8");
    console.error(`Written ${chapters.length} chapters to ${args.output}`);
  } else {
    process.stdout.write(json);
  }

  console.error(`\nStats: ${stats.chapters} chapters, ${stats.sections} sections, ${stats.errors} errors`);
}

main();
