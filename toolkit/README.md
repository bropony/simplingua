# Simplingua Toolkit

Command-line tools for parsing and uploading Simplingua language data.

## Overview

This toolkit provides utilities to:
1. Parse the dictionary text file into structured JSON
2. Parse the grammar text file into structured JSON
3. Upload parsed data to the PostgreSQL database

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### 1. Parse Dictionary

Convert `docs/dictionary-in-cn.txt` to JSON format:

```bash
# Use default paths
python parse_dictionary.py

# Specify custom input/output paths
python parse_dictionary.py --input /path/to/dictionary.txt --output /path/to/output.json
```

**Command-line options:**
- `--input PATH`: Input dictionary text file path (default: `../docs/dictionary-in-cn.txt`)
- `--output PATH`: Output JSON file path (default: `../data/words.json`)
- `--help`: Show help message

Output: JSON file with the following structure:
- Word entries with part of speech
- Verb classifications (他/自/系/情态/无)
- Pronunciation (IPA)
- Definitions and examples
- Derivatives and gender pairs
- Synonyms and antonyms
- Frequency ratings

### 2. Parse Grammar

Convert `docs/grammar-in-cn.txt` to JSON format:

```bash
# Use default paths
python parse_grammar.py

# Specify custom input/output paths
python parse_grammar.py --input /path/to/grammar.txt --output /path/to/output.json
```

**Command-line options:**
- `--input PATH`: Input grammar text file path (default: `../docs/grammar-in-cn.txt`)
- `--output PATH`: Output JSON file path (default: `../data/grammar.json`)
- `--help`: Show help message

Output: JSON file with the following structure:
- 21 grammar sections mapped to IDs
- Subsections with content
- Rules, exceptions, and examples
- Cross-references between concepts

### 3. Upload to Database

Upload parsed JSON data to PostgreSQL:

```bash
# Use default paths and DATABASE_URL env var
python upload.py

# Specify custom database URL
python upload.py --db-url postgresql://user:pass@host:5432/db

# Specify custom JSON file paths
python upload.py --words-json /path/to/words.json --grammar-json /path/to/grammar.json
```

**Command-line options:**
- `--db-url URL`: PostgreSQL database connection URL (default: `DATABASE_URL` env var or `postgresql://simplingua:dev_password@localhost:5432/simplingua_dev`)
- `--words-json PATH`: Input words JSON file path (default: `../data/words.json`)
- `--grammar-json PATH`: Input grammar JSON file path (default: `../data/grammar.json`)
- `--help`: Show help message

**Priority for database URL:**
1. `--db-url` command-line argument (highest priority)
2. `DATABASE_URL` environment variable
3. Built-in default (lowest priority)

## Data Format

### Words JSON

```json
{
  "version": "2.6",
  "language": "simplingua",
  "documentation_language": "zh",
  "total_entries": 12345,
  "entries": [
    {
      "word": "amate",
      "pos": "[动]",
      "verb_type": "他",
      "pronunciation": "/a.'ma.te/",
      "definitions": [
        {
          "meaning": "爱; 喜欢",
          "language": "zh"
        }
      ],
      "examples": ["Ila ama chocolate."],
      "derivatives": [...],
      "synonyms": ["vole"],
      "antonyms": ["ódia"],
      "frequency": "high",
      "compound_marker": false,
      "gender_pair": null
    }
  ]
}
```

### Grammar JSON

```json
{
  "version": "2.6",
  "sections": [
    { "id": "nouns", "name": "名词", "order": 1 }
  ],
  "grammar_content": [
    {
      "section_id": "nouns",
      "section_name": "名词",
      "level": "beginner",
      "subsections": [...],
      "content": "...",
      "rules": [...],
      "exceptions": [...],
      "examples": [...]
    }
  ]
}
```

## Development

### Adding New Parsers

Create a new parser file following the pattern:

```python
#!/usr/bin/env python3
"""Parser description"""

import argparse
import json
from pathlib import Path

class NewParser:
    def __init__(self, filepath: Path):
        self.filepath = filepath

    def parse_file(self):
        """Parse logic here"""
        return []

    def save_json(self, output_path: Path):
        """Save to JSON"""
        pass

def main():
    parser = argparse.ArgumentParser(description="Parser description")
    parser.add_argument("--input", type=Path, default=Path(__file__).parent.parent / "docs" / "file.txt")
    parser.add_argument("--output", type=Path, default=Path(__file__).parent.parent / "data" / "output.json")

    args = parser.parse_args()

    parser = NewParser(args.input)
    data = parser.parse_file()
    parser.save_json(args.output)

if __name__ == "__main__":
    main()
```

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and the database URL is correct:

```bash
# Test connection with DATABASE_URL
psql $DATABASE_URL

# Or test with custom URL
psql postgresql://user:pass@host:5432/db
```

### Encoding Issues

If you see encoding errors, ensure your terminal supports UTF-8:

```bash
# On Linux/macOS
export PYTHONIOENCODING=utf-8

# On Windows (PowerShell)
$env:PYTHONIOENCODING="utf-8"

# On Windows (CMD)
set PYTHONIOENCODING=utf-8
```

## License

MIT
