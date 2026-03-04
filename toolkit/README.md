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
python parse_dictionary.py
```

Output: `data/words.json` with the following structure:
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
python parse_grammar.py
```

Output: `data/grammar.json` with the following structure:
- 21 grammar sections mapped to IDs
- Subsections with content
- Rules, exceptions, and examples
- Cross-references between concepts

### 3. Upload to Database

Upload parsed JSON data to PostgreSQL:

```bash
python upload.py
```

Environment variables:
- `DATABASE_URL` - PostgreSQL connection string (default: postgresql://simplingua:dev_password@localhost:5432/simplingua_dev)

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
    parser = NewParser(Path(__file__).parent.parent / "docs" / "file.txt")
    data = parser.parse_file()
    parser.save_json(Path(__file__).parent.parent / "data" / "output.json")

if __name__ == "__main__":
    main()
```

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and the DATABASE_URL is correct:

```bash
# Test connection
psql $DATABASE_URL
```

### Encoding Issues

If you see encoding errors, ensure your terminal supports UTF-8:

```bash
export PYTHONIOENCODING=utf-8
```

## License

MIT
