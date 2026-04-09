#!/usr/bin/env node
/**
 * resource — Static asset generator for Simplingua
 *
 * Generates SVG alphabet charts and OG images for the web app.
 * Audio generation requires external TTS and is not included.
 *
 * Usage:
 *   node tools/resource/index.js [options]
 *   Options:
 *     -t, --type <type>     Resource type: all|alphabet|og (default: all)
 *     -o, --output <dir>    Output directory (default: public/resources)
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ── CLI arg parsing ──────────────────────────────────────────────
function parseArgs(argv) {
  const args = { type: "all", output: null };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case "-t":
      case "--type":
        args.type = argv[++i];
        break;
      case "-o":
      case "--output":
        args.output = argv[++i];
        break;
      case "-h":
      case "--help":
        console.log(`
resource — Static asset generator for Simplingua

Usage:
  node tools/resource/index.js [options]

Options:
  -t, --type <type>     Resource type: all|alphabet|og (default: all)
  -o, --output <dir>    Output directory (default: public/resources)
  -h, --help            Show this help
`);
        process.exit(0);
    }
  }
  return args;
}

// ── Simplingua Phonology Data ────────────────────────────────────
const LETTERS = [
  { letter: "A", ipa: "/a/", note: "如汉语拼音 a" },
  { letter: "B", ipa: "/b/", note: "" },
  { letter: "C", ipa: "/k/ /tʃ/", note: "e,i前发/tʃ/" },
  { letter: "D", ipa: "/d/", note: "" },
  { letter: "E", ipa: "/e/", note: "如汉语拼音 ê" },
  { letter: "F", ipa: "/f/", note: "" },
  { letter: "G", ipa: "/g/ /dʒ/", note: "e,i前发/dʒ/" },
  { letter: "H", ipa: "/h/ /x/", note: "允许[x]" },
  { letter: "I", ipa: "/i/", note: "如汉语拼音 i" },
  { letter: "J", ipa: "/ʒ/", note: "" },
  { letter: "L", ipa: "/l/", note: "不软化" },
  { letter: "M", ipa: "/m/", note: "" },
  { letter: "N", ipa: "/n/", note: "" },
  { letter: "O", ipa: "/o/", note: "" },
  { letter: "P", ipa: "/p/", note: "送气[pʰ]" },
  { letter: "Q", ipa: "/kw/ /k/", note: "与u连用" },
  { letter: "R", ipa: "/ɹ/ /ə/", note: "词尾发/ə/" },
  { letter: "S", ipa: "/s/", note: "" },
  { letter: "T", ipa: "/t/", note: "送气[tʰ]" },
  { letter: "U", ipa: "/u/", note: "如汉语拼音 u" },
  { letter: "V", ipa: "/v/", note: "" },
  { letter: "W", ipa: "/w/", note: "" },
  { letter: "X", ipa: "/ks/", note: "" },
  { letter: "Z", ipa: "/z/", note: "允许[dz]" },
];

const DIGRAPHS = [
  { letters: "ch", ipa: "/tʃ/", note: "" },
  { letters: "sc", ipa: "/sk/ /ʃ/", note: "e,i前发/ʃ/" },
  { letters: "gu", ipa: "/gw/ /g/", note: "a,o前发/gw/" },
  { letters: "qu", ipa: "/kw/ /k/", note: "e,i前发/k/" },
];

const DIPHTHONGS = [
  { letters: "ai", ipa: "/ai/" },
  { letters: "au", ipa: "/au/" },
  { letters: "ei", ipa: "/ei/" },
  { letters: "eu", ipa: "/eu/" },
  { letters: "oi", ipa: "/oi/" },
  { letters: "ou", ipa: "/ou/" },
];

// ── SVG Alphabet Chart ───────────────────────────────────────────
function generateAlphabetChart() {
  const cols = 4;
  const cellW = 220;
  const cellH = 64;
  const headerH = 60;
  const padX = 30;
  const padY = 20;
  const digraphSectionY = headerH + padY + Math.ceil(LETTERS.length / cols) * cellH + 40;
  const dipthongSectionY = digraphSectionY + headerH + padY + Math.ceil(DIGRAPHS.length / cols) * cellH + 40;
  const totalH = dipthongSectionY + headerH + padY + Math.ceil(DIPHTHONGS.length / 6) * cellH + padY;

  const totalW = padX * 2 + cols * cellW;

  function makeSectionHeader(y, title) {
    return `<text x="${padX}" y="${y + 30}" font-family="sans-serif" font-size="20" font-weight="bold" fill="#1e293b">${title}</text>
    <line x1="${padX}" y1="${y + 42}" x2="${totalW - padX}" y2="${y + 42}" stroke="#cbd5e1" stroke-width="1"/>`;
  }

  function makeCell(x, y, letter, ipa, note) {
    const noteText = note
      ? `<text x="${x + 68}" y="${y + 42}" font-family="sans-serif" font-size="10" fill="#94a3b8">${escapeXml(note)}</text>`
      : "";
    return `<rect x="${x}" y="${y}" width="${cellW - 8}" height="${cellH - 6}" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
<text x="${x + 14}" y="${y + 30}" font-family="monospace" font-size="22" font-weight="bold" fill="#2563eb">${escapeXml(letter)}</text>
<text x="${x + 68}" y="${y + 28}" font-family="monospace" font-size="14" fill="#475569">${escapeXml(ipa)}</text>
${noteText}`;
  }

  function makeGrid(items, startY, itemCols, itemCellW) {
    const cw = itemCellW || cellW;
    const c = itemCols || cols;
    let svg = "";
    items.forEach((item, i) => {
      const col = i % c;
      const row = Math.floor(i / c);
      const x = padX + col * cw;
      const y = startY + padY + row * cellH;
      svg += makeCell(x, y, item.letter || item.letters, item.ipa, item.note || "") + "\n";
    });
    return svg;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">
  <rect width="100%" height="100%" fill="white"/>
  <text x="${padX}" y="38" font-family="sans-serif" font-size="24" font-weight="bold" fill="#0f172a">简语字母发音表 · Simplingua Alphabet</text>

  ${makeSectionHeader(headerH, "24个字母")}
  ${makeGrid(LETTERS, headerH, cols, cellW)}

  ${makeSectionHeader(digraphSectionY, "辅音字母组合")}
  ${makeGrid(DIGRAPHS, digraphSectionY, cols, cellW)}

  ${makeSectionHeader(dipthongSectionY, "双元音")}
  ${makeGrid(DIPHTHONGS, dipthongSectionY, 6, Math.floor((totalW - padX * 2) / 6))}
</svg>`;

  return svg;
}

// ── OG Image Generator ───────────────────────────────────────────
function generateOgImage(title, description, filename) {
  const w = 1200;
  const h = 630;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e40af"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="80" y="200" font-family="sans-serif" font-size="80" font-weight="bold" fill="white">${escapeXml(title)}</text>
  <text x="80" y="280" font-family="sans-serif" font-size="36" fill="rgba(255,255,255,0.7)">${escapeXml(description)}</text>
  <rect x="80" y="340" width="120" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
  <text x="80" y="420" font-family="sans-serif" font-size="24" fill="rgba(255,255,255,0.6)">简语 Simplingua · 人造语言学习平台</text>
</svg>`;
  return { svg, filename };
}

// ── Utility ──────────────────────────────────────────────────────
function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Main ─────────────────────────────────────────────────────────
function main() {
  const args = parseArgs(process.argv);
  const outDir = args.output || "public/resources";

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const stats = { generated: 0, errors: 0 };

  if (args.type === "all" || args.type === "alphabet") {
    try {
      const chart = generateAlphabetChart();
      const outPath = path.join(outDir, "alphabet-chart.svg");
      fs.writeFileSync(outPath, chart, "utf8");
      console.log(`[alphabet] Generated: ${outPath}`);
      stats.generated++;
    } catch (err) {
      console.error(`[alphabet] Error: ${err.message}`);
      stats.errors++;
    }
  }

  if (args.type === "all" || args.type === "og") {
    const ogImages = [
      generateOgImage("简语 Simplingua", "学习简语，探索人造语言的魅力", "og-default.svg"),
      generateOgImage("词汇表", "简语词汇浏览与搜索", "og-vocabulary.svg"),
      generateOgImage("语法书", "简语语法参考手册", "og-grammar.svg"),
      generateOgImage("讨论区", "简语学习者社区", "og-discussions.svg"),
    ];

    for (const { svg, filename } of ogImages) {
      try {
        const outPath = path.join(outDir, filename);
        fs.writeFileSync(outPath, svg, "utf8");
        console.log(`[og] Generated: ${outPath}`);
        stats.generated++;
      } catch (err) {
        console.error(`[og] Error generating ${filename}: ${err.message}`);
        stats.errors++;
      }
    }
  }

  console.log(`\nDone: ${stats.generated} generated, ${stats.errors} errors`);
  process.exit(stats.errors > 0 ? 1 : 0);
}

main();
