# Tools Specification

## Overview
Three Node.js CLI tools for data conversion and resource generation. Each tool reads source files from `/docs` and outputs JSON to stdout or a specified file.

## Tool: lexi (Vocabulary Converter)

### Purpose
Convert `docs/lexilibro_de_simplingua.txt` to a JSON array suitable for database import.

### Input Format Analysis
The vocabulary file uses a structured plain-text format:
- **Letter headers**: Single uppercase letters (A, B, C...) mark sections
- **Word entries**: Start with the Simplingua word, followed by pronunciation hints in parens, part of speech in brackets, verb type in braces
- **Definitions**: Numbered with ①②③ or plain definitions separated by semicolons
- **Example sentences**: Prefixed with `~` (tilde)
- **Related words**: Separated by `|` (pipe), with types marked by `-` (root variant), `#` (derived)
- **Compound words**: Etymology in angle brackets like `<vi(a)+age>`
- **Gender forms**: In angle brackets like `⟨vilana, vilano⟩`
- **Stress marks**: In parentheses like `(ácie)` or `(acácia)`

### Output Format
Array of objects matching the `vocabulary` data model schema.

### Parsing Rules
1. Detect letter section headers (single uppercase letter on its own line)
2. For each entry line:
   - Extract word (first token before `[`)
   - Extract pronunciation hints (parenthesized content)
   - Extract part of speech (`[名]`, `[动]`, etc.)
   - Extract verb type (`{他}`, `{自}`, etc.)
   - Parse numbered definitions with meanings and examples
   - Parse related words separated by `|`
   - Parse compound etymology in `<>`
   - Parse gender forms in `⟨⟩`
3. Handle multi-line entries (continuation lines indented)

### CLI Usage
```bash
node tools/lexi/index.js [options]
Options:
  -i, --input <file>    Input file path (default: docs/lexilibro_de_simplingua.txt)
  -o, --output <file>   Output file path (default: stdout)
  --pretty              Pretty-print JSON output
```

---

## Tool: regla (Grammar Converter)

### Purpose
Convert `docs/lingua_regla_de_simplingua.txt` to a JSON array of chapter objects suitable for database import.

### Input Format Analysis
The grammar file uses a structured plain-text format:
- **Chapter headers**: Marked with `【chapter name】` brackets
- **Section headers**: Headers within chapters (e.g., "一、名词的数")
- **Content paragraphs**: Regular text
- **Example sentences**: Simplingua sentences with Chinese translations, often separated by spaces or on separate lines

### Output Format
Array of objects matching the `grammar` data model schema.

### Parsing Rules
1. Parse table of contents from `【目录】` section
2. Detect chapter headers with `【...】` pattern
3. Detect section/subsection headers (numbered like 一、二、三、)
4. Extract example sentences (pairs of Simplingua and Chinese)
5. Preserve content as Markdown or structured HTML
6. Assign ordering based on table of contents position

### CLI Usage
```bash
node tools/regla/index.js [options]
Options:
  -i, --input <file>    Input file path (default: docs/lingua_regla_de_simplingua.txt)
  -o, --output <file>   Output file path (default: stdout)
  --pretty              Pretty-print JSON output
```

---

## Tool: resource (Resource Generator)

### Purpose
Generate static image and audio resources needed by the web application.

### Generated Resources
1. **Alphabet chart**: Letter-to-sound correspondence image
2. **Pronunciation guide**: Audio clips for each phoneme
3. **OG images**: Social media sharing images for the site

### Implementation Notes
- This tool is lower priority than lexi and regla
- May use external TTS for audio generation
- Images can be simple SVG or generated HTML screenshots
- Audio resources should be web-friendly formats (MP3, OGG)

### CLI Usage
```bash
node tools/resource/index.js [options]
Options:
  -t, --type <type>     Resource type: all|alphabet|audio|og
  -o, --output <dir>    Output directory (default: public/resources)
```

---

## Shared Tooling
- Each tool is a standalone Node.js script with its own `package.json` or part of the monorepo
- Tools should validate output against JSON schema before writing
- Tools should report parsing statistics (entries found, skipped, errors)
