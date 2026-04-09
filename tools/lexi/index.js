#!/usr/bin/env node
/**
 * lexi — Vocabulary text to JSON converter for Simplingua
 *
 * Converts docs/lexilibro_de_simplingua.txt to a JSON array
 * matching the vocabulary data model schema.
 *
 * Usage:
 *   node tools/lexi/index.js [options]
 *   Options:
 *     -i, --input <file>    Input file (default: docs/lexilibro_de_simplingua.txt)
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
const CIRCLED_NUMS = "①②③④⑤⑥⑦⑧⑨⑩";

function parseNumberedMeanings(text) {
  // Split on circled numbers ①②③... or numbered definitions
  const parts = [];
  let hasCircled = false;
  for (const ch of CIRCLED_NUMS) {
    if (text.includes(ch)) {
      hasCircled = true;
      break;
    }
  }

  if (hasCircled) {
    // Split by circled numbers
    let remaining = text;
    let idx = 0;
    while (idx < remaining.length) {
      const ci = CIRCLED_NUMS.indexOf(remaining[idx]);
      if (ci !== -1) {
        // Find the next circled number or end
        let end = remaining.length;
        for (let j = idx + 1; j < remaining.length; j++) {
          if (CIRCLED_NUMS.includes(remaining[j])) {
            end = j;
            break;
          }
        }
        parts.push({ number: ci + 1, text: remaining.slice(idx + 1, end).trim() });
        idx = end;
      } else {
        idx++;
      }
    }
  } else {
    // Single definition (no numbering)
    parts.push({ number: 1, text: text.trim() });
  }

  return parts;
}

function splitExamples(text) {
  // Examples are prefixed with ~
  // Find all ~ positions
  const tildePositions = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "~") tildePositions.push(i);
  }

  if (tildePositions.length === 0) return { meanings: text.trim(), examples: [] };

  // Text before first ~ is the meanings part
  const meanings = text.slice(0, tildePositions[0]).trim();

  const examples = [];
  for (let i = 0; i < tildePositions.length; i++) {
    const start = tildePositions[i] + 1; // skip ~
    // Example text goes to end of string
    // But clean trailing semicolons/colons that separate from next definitions
    let exText = text.slice(start).trim();

    // Only take text up to a semicolon followed by a circled number or end
    // This handles: "vade a scola 去学校；②..."
    const semiCircled = exText.match(/^(.*?)[;；]\s*(?=[①②③④⑤⑥⑦⑧⑨⑩])/);
    if (semiCircled) {
      exText = semiCircled[1].trim();
    }

    // Clean trailing semicolons
    exText = exText.replace(/[;；]\s*$/, "").trim();

    if (exText) examples.push(exText);
  }

  return { meanings, examples };
}

// ── Related word prefix types ────────────────────────────────────
// | word           -> "related" type
// - word           -> "variant" type (same root, different ending/gender)
// # word           -> "derived" type (suffix derivation)
// ^l| word         -> "prefix" type (natural prefix derivation)
// ^l# word         -> "prefix_suffix" type (prefix & suffix derivation)
// ^l|# word        -> "prefix_suffix" type
function parseRelatedPrefix(rawWord) {
  let type = "related";
  let w = rawWord;

  if (w.startsWith("^l|#")) {
    type = "prefix_suffix";
    w = w.slice(4).trim();
  } else if (w.startsWith("^l#")) {
    type = "prefix_suffix";
    w = w.slice(3).trim();
  } else if (w.startsWith("^l|")) {
    type = "prefix";
    w = w.slice(3).trim();
  } else if (w.startsWith("#")) {
    type = "derived";
    w = w.slice(1).trim();
  } else if (w.startsWith("-")) {
    type = "variant";
    w = w.slice(1).trim();
  }

  return { word: w, type };
}

// ── Parse a single entry ─────────────────────────────────────────
function parseEntry(line, letter) {
  // Entry format:
  //   word (pronunciation) [pos] {verbType} ①meaning1 ②meaning2 ~ example
  //   | relatedWord [pos] {vt} meaning
  //   - variantWord [pos] meaning
  //   # derivedWord [pos] meaning
  //
  // Multiple related words are separated by |
  // The first segment (before any |) is the main entry
  // Subsequent segments after | are related words

  const result = {
    word: "",
    partOfSpeech: "",
    verbType: null,
    definitions: [],
    relatedWords: [],
    pronunciation: {},
    compoundParts: [],
    genderForms: {},
    letter: letter,
  };

  // Split main entry from related words on |
  // But be careful: | might appear inside examples. We'll split conservatively.
  // Strategy: split on | that is preceded by space or is at start of segment
  const segments = splitOnPipe(line);

  // Parse main entry (first segment)
  const main = parseMainEntry(segments[0]);
  Object.assign(result, main);

  // Parse related words (remaining segments)
  for (let i = 1; i < segments.length; i++) {
    const rw = parseRelatedWord(segments[i]);
    if (rw) result.relatedWords.push(rw);
  }

  return result;
}

function splitOnPipe(line) {
  // Split on " | " (space-pipe-space) or pipe at beginning of segment
  // Avoid splitting inside examples (~ sentences)
  const segments = [];
  let current = "";
  let inExample = false;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === "~") inExample = true;

    if (!inExample && line[i] === "|" && (i === 0 || line[i - 1] === " ")) {
      segments.push(current.trim());
      current = "";
    } else {
      current += line[i];
    }

    // Reset inExample at sentence-ending punctuation followed by space
    if (inExample && line[i] === "。" && i + 1 < line.length && line[i + 1] === " ") {
      inExample = false;
    }
  }
  if (current.trim()) segments.push(current.trim());

  return segments;
}

function parseMainEntry(text) {
  const entry = {
    word: "",
    partOfSpeech: "",
    verbType: null,
    definitions: [],
    pronunciation: {},
    compoundParts: [],
    genderForms: {},
  };

  let remaining = text.trim();

  // Extract word: first token before any special bracket/paren
  // Word can contain letters, accented chars, hyphens
  const wordMatch = remaining.match(/^([\w\u00C0-\u024F\u0370-\u03FF\u1E00-\u1EFF\-]+(?:\s*,\s*[\w\u00C0-\u024F\u0370-\u03FF\u1E00-\u1EFF\-]+)*)/);
  if (!wordMatch) return entry;

  // Handle comma-separated alternate forms (e.g. "amice, amí")
  const wordStr = wordMatch[1];
  const words = wordStr.split(/\s*,\s*/);
  entry.word = words[0]; // primary word
  remaining = remaining.slice(wordMatch[0].length).trim();

  // Extract pronunciation hints in parens: (ácie), (acácia)
  const pronMatch = remaining.match(/^\(([^)]+)\)\s*/);
  if (pronMatch) {
    entry.pronunciation.stressNote = pronMatch[1];
    remaining = remaining.slice(pronMatch[0].length);
  }

  // Extract compound parts in angle brackets: <vi(a)+age>
  const compoundMatch = remaining.match(/^<([^>]+)>\s*/);
  if (compoundMatch) {
    entry.compoundParts = compoundMatch[1].split("+");
    remaining = remaining.slice(compoundMatch[0].length);
  }

  // Extract part of speech in brackets: [名], [动], [形], etc.
  // Can be multiple: [限][副] or [动][名]
  const posMatches = remaining.match(/\[([^\]]+)\]/g);
  if (posMatches) {
    entry.partOfSpeech = posMatches.map(m => m.slice(1, -1)).join("][");
    for (const m of posMatches) {
      remaining = remaining.replace(m, "").trim();
    }
  }

  // Extract verb type in braces: {他}, {自}, etc.
  const vtMatch = remaining.match(/\{([^}]+)\}/);
  if (vtMatch) {
    entry.verbType = vtMatch[1];
    remaining = remaining.replace(vtMatch[0], "").trim();
  }

  // Extract gender forms in ⟨⟩: ⟨vilana, vilano⟩
  const genderMatch = remaining.match(/⟨([^⟩]+)⟩/);
  if (genderMatch) {
    const parts = genderMatch[1].split(/\s*,\s*/);
    // Convention: feminine first, masculine second
    if (parts[0]) entry.genderForms.feminine = parts[0];
    if (parts[1]) entry.genderForms.masculine = parts[1];
    if (parts[2]) entry.genderForms.epicene = parts[2];
    remaining = remaining.replace(genderMatch[0], "").trim();
  }

  // Remaining text is definitions + examples
  // Some entries have inline verb types per sense: ①{他} meaning
  // First, extract inline verb types for definitions
  const definitions = parseDefinitions(remaining);
  entry.definitions = definitions;

  return entry;
}

function parseDefinitions(text) {
  if (!text.trim()) return [];

  // Parse numbered meanings first (split by circled numbers)
  const parts = parseNumberedMeanings(text);

  const definitions = [];
  for (const part of parts) {
    let defText = part.text;

    // Check for inline verb type: {他} meaning
    let defVerbType = null;
    const ivt = defText.match(/^\{([^}]+)\}\s*/);
    if (ivt) {
      defVerbType = ivt[1];
      defText = defText.slice(ivt[0].length);
    }

    // Extract examples from this specific definition (~ within it)
    const { meanings: cleanMeaning, examples: defExamples } = splitExamples(defText);

    let meaning = cleanMeaning || defText;
    // Clean trailing semicolons and whitespace
    meaning = meaning.replace(/[;；]\s*$/, "").trim();

    definitions.push({
      number: part.number,
      meaning: meaning,
      ...(defVerbType ? { verbType: defVerbType } : {}),
      examples: defExamples,
    });
  }

  // If no circled numbers, also check for global examples
  if (parts.length === 1 && parts[0].number === 1 && !text.match(/[①②③④⑤⑥⑦⑧⑨⑩]/)) {
    const { meanings, examples: globalExamples } = splitExamples(text);
    if (globalExamples.length > 0 && definitions.length > 0) {
      definitions[0].meaning = meanings.replace(/[;；]\s*$/, "").trim();
      definitions[0].examples = globalExamples;
    }
  }

  return definitions;
}

function parseRelatedWord(text) {
  if (!text.trim()) return null;

  let remaining = text.trim();

  // Parse the prefix type marker
  const { word: rawWord, type } = parseRelatedPrefix(remaining);
  remaining = rawWord;

  if (!remaining) return null;

  // Extract word
  const wordMatch = remaining.match(/^([\w\u00C0-\u024F\u0370-\u03FF\u1E00-\u1EFF\-\/]+)/);
  if (!wordMatch) return null;

  const word = wordMatch[1];
  remaining = remaining.slice(wordMatch[0].length).trim();

  // Extract pronunciation (if any)
  let stressNote = null;
  const pronMatch = remaining.match(/^\(([^)]+)\)\s*/);
  if (pronMatch) {
    stressNote = pronMatch[1];
    remaining = remaining.slice(pronMatch[0].length);
  }

  // Extract compound parts
  let compoundParts = [];
  const compoundMatch = remaining.match(/^<([^>]+)>\s*/);
  if (compoundMatch) {
    compoundParts = compoundMatch[1].split("+");
    remaining = remaining.slice(compoundMatch[0].length);
  }

  // Extract POS
  const posMatches = remaining.match(/\[([^\]]+)\]/g);
  let partOfSpeech = "";
  if (posMatches) {
    partOfSpeech = posMatches.map(m => m.slice(1, -1)).join("][");
    for (const m of posMatches) {
      remaining = remaining.replace(m, "").trim();
    }
  }

  // Extract verb type
  const vtMatch = remaining.match(/\{([^}]+)\}/);
  if (vtMatch) {
    remaining = remaining.replace(vtMatch[0], "").trim();
  }

  // Extract gender forms
  let genderForms = {};
  const genderMatch = remaining.match(/⟨([^⟩]+)⟩/);
  if (genderMatch) {
    const parts = genderMatch[1].split(/\s*,\s*/);
    if (parts[0]) genderForms.feminine = parts[0];
    if (parts[1]) genderForms.masculine = parts[1];
    if (parts[2]) genderForms.epicene = parts[2];
    remaining = remaining.replace(genderMatch[0], "").trim();
  }

  // Remaining is meaning (brief)
  let meaning = remaining.trim();
  // Clean trailing semicolons
  if (meaning.endsWith(";")) meaning = meaning.slice(0, -1).trim();
  // Remove inline examples from meaning for related words (keep it brief)
  const tildeIdx = meaning.indexOf(" ~ ");
  if (tildeIdx !== -1) {
    meaning = meaning.slice(0, tildeIdx).trim();
  }
  const tildeIdx2 = meaning.indexOf("~");
  if (tildeIdx2 === 0) meaning = meaning.slice(1).trim();

  return {
    word,
    type,
    partOfSpeech,
    meaning: meaning || word,
  };
}

// ── Main parser ──────────────────────────────────────────────────
function parseVocabulary(inputText) {
  const lines = inputText.split("\n");
  const entries = [];
  let currentLetter = "";
  let stats = { entries: 0, skipped: 0, errors: 0, letters: 0 };
  let inHeader = true; // Skip file header until first letter section

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();

    // Skip empty lines
    if (!line.trim()) continue;

    // Skip header section (before first letter header)
    if (inHeader) {
      // Detect first letter header: single uppercase letter on its own line
      if (/^[A-Z]$/.test(line.trim())) {
        inHeader = false;
        currentLetter = line.trim();
        stats.letters++;
        continue;
      }
      continue;
    }

    // Detect letter section headers
    if (/^[A-Z]$/.test(line.trim())) {
      currentLetter = line.trim();
      stats.letters++;
      continue;
    }

    // Skip lines that are purely structural (目录, 凡例, etc.)
    if (!currentLetter) continue;

    // Skip lines that look like continuation of header info
    if (/^[|～\-=\^#]/.test(line.trim())) continue;

    // Skip lines that are too short or look like non-entry text
    if (line.trim().length < 2) continue;

    // Entry lines should start with a word character
    const firstChar = line.trim()[0];
    if (!/[\w\u00C0-\u024F]/.test(firstChar)) continue;

    try {
      const entry = parseEntry(line.trim(), currentLetter);
      if (entry.word) {
        entries.push(entry);
        stats.entries++;
      } else {
        stats.skipped++;
      }
    } catch (e) {
      stats.errors++;
      if (stats.errors <= 5) {
        console.error(`Warning: failed to parse line ${i + 1}: ${e.message}`);
        console.error(`  Line: ${line.trim().slice(0, 80)}...`);
      }
    }
  }

  return { entries, stats };
}

// ── Main ─────────────────────────────────────────────────────────
function main() {
  const args = parseArgs(process.argv);

  const inputPath = args.input || path.resolve(__dirname, "../../docs/lexilibro_de_simplingua.txt");

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const inputText = fs.readFileSync(inputPath, "utf-8");
  const { entries, stats } = parseVocabulary(inputText);

  const json = args.pretty
    ? JSON.stringify(entries, null, 2)
    : JSON.stringify(entries);

  if (args.output) {
    const outDir = path.dirname(args.output);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(args.output, json, "utf-8");
    console.error(`Written ${entries.length} entries to ${args.output}`);
  } else {
    process.stdout.write(json);
  }

  console.error(`\nStats: ${stats.entries} entries, ${stats.letters} letters, ${stats.skipped} skipped, ${stats.errors} errors`);
}

main();
