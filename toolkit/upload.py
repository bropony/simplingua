#!/usr/bin/env python3
"""
Data Upload Script
Uploads parsed JSON data to PostgreSQL database
"""

import json
import sys
from pathlib import Path
from typing import Optional

try:
    import psycopg2
    from psycopg2.extras import execute_values
except ImportError:
    print("Error: psycopg2 not installed. Run: pip install psycopg2-binary")
    sys.exit(1)

try:
    import numpy as np
except ImportError:
    print("Warning: numpy not installed. Embeddings will be skipped.")
    np = None


class DataUploader:
    """Upload parsed data to database"""

    def __init__(self, db_url: str):
        self.db_url = db_url
        self.conn = None
        self.cursor = None

    def connect(self):
        """Connect to database"""
        self.conn = psycopg2.connect(self.db_url)
        self.cursor = self.conn.cursor()

    def disconnect(self):
        """Disconnect from database"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()

    def upload_grammar_sections(self, grammar_json: Path):
        """Upload grammar sections reference table"""
        with open(grammar_json, 'r', encoding='utf-8') as f:
            data = json.load(f)

        sections = data.get("sections", [])

        for section in sections:
            self.cursor.execute("""
                INSERT INTO grammar_sections (id, name, order_num)
                VALUES (%s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    order_num = EXCLUDED.order_num
            """, (section["id"], section["name"], section["order"]))

        self.conn.commit()
        print(f"Uploaded {len(sections)} grammar sections")

    def upload_words(self, words_json: Path):
        """Upload word entries to database"""
        with open(words_json, 'r', encoding='utf-8') as f:
            data = json.load(f)

        entries = data.get("entries", [])

        for entry in entries:
            word = entry.get("word", "")
            pos = entry.get("pos", "")

            # Handle verb types
            verb_type = None
            if "{他}" in entry.get("pos", ""):
                verb_type = "他"
            elif "{自}" in entry.get("pos", ""):
                verb_type = "自"
            elif "{系}" in entry.get("pos", ""):
                verb_type = "系"
            elif "{情态}" in entry.get("pos", ""):
                verb_type = "情态"
            elif "{无}" in entry.get("pos", ""):
                verb_type = "无"

            # Get first definition
            definitions = entry.get("definitions", [])
            first_def = definitions[0].get("meaning", "") if definitions else ""

            # Build examples array
            examples = []
            examples.extend(entry.get("examples", []))

            self.cursor.execute("""
                INSERT INTO words (
                    word, pos, verb_type, pronunciation,
                    direction, description, definitions, examples,
                    synonyms, antonyms, frequency, compound_marker, gender_pair
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                ) ON CONFLICT (word) DO UPDATE SET
                    pos = EXCLUDED.pos,
                    verb_type = EXCLUDED.verb_type,
                    pronunciation = EXCLUDED.pronunciation,
                    description = EXCLUDED.description,
                    updated_at = NOW()
                RETURNING id
            """, (
                word, pos, verb_type, entry.get("pronunciation"),
                "sim2zh", first_def, json.dumps(definitions), examples,
                entry.get("synonyms", []), entry.get("antonyms", []),
                entry.get("frequency", "medium"),
                entry.get("compound_marker", False),
                json.dumps(entry.get("gender_pair"))
            ))

            word_id = self.cursor.fetchone()[0]

            # Upload derivatives
            for derivative in entry.get("derivatives", []):
                self.cursor.execute("""
                    INSERT INTO word_derivatives (
                        word_id, derivative_word, derivative_type,
                        gender_variants, meaning, examples
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    word_id,
                    derivative.get("derivative_word"),
                    derivative.get("derivative_type"),
                    json.dumps(derivative.get("gender_variants")),
                    derivative.get("meaning"),
                    json.dumps(derivative.get("examples", {}))
                ))

        self.conn.commit()
        print(f"Uploaded {len(entries)} word entries")

    def upload_grammar(self, grammar_json: Path):
        """Upload grammar content to database"""
        with open(grammar_json, 'r', encoding='utf-8') as f:
            data = json.load(f)

        content = data.get("grammar_content", [])

        for section in content:
            section_id = section.get("section_id")
            section_name = section.get("section_name", "")
            rule_type = "inflectional"  # Default, could be refined

            self.cursor.execute("""
                INSERT INTO grammar (
                    section_id, subsection_id, name, rule_type, level,
                    language, category, summary, content,
                    rules, exceptions, cross_references, examples
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (
                section_id,
                section.get("subsections", [{}])[0].get("subsection_id") if section.get("subsections") else None,
                section_name,
                rule_type,
                section.get("level", "beginner"),
                "zh",
                None,  # category
                section.get("summary", ""),
                section.get("content", ""),
                json.dumps(section.get("rules", [])),
                json.dumps(section.get("exceptions", [])),
                json.dumps(section.get("cross_references", [])),
                [ex.get("chinese") + " " + ex.get("simplingua") for ex in section.get("examples", [])]
            ))

        self.conn.commit()
        print(f"Uploaded {len(content)} grammar sections")


def main():
    """Main entry point"""
    # Get database URL from environment or use default
    import os
    db_url = os.getenv(
        "DATABASE_URL",
        "postgresql://simplingua:dev_password@localhost:5432/simplingua_dev"
    )

    data_dir = Path(__file__).parent.parent / "data"
    words_json = data_dir / "words.json"
    grammar_json = data_dir / "grammar.json"

    if not words_json.exists() or not grammar_json.exists():
        print("Error: Parsed JSON files not found in data/ directory")
        print("Run the parsers first:")
        print("  python toolkit/parse_dictionary.py")
        print("  python toolkit/parse_grammar.py")
        return 1

    uploader = DataUploader(db_url)
    uploader.connect()

    try:
        uploader.upload_grammar_sections(grammar_json)
        uploader.upload_words(words_json)
        uploader.upload_grammar(grammar_json)
    except Exception as e:
        print(f"Error during upload: {e}")
        return 1
    finally:
        uploader.disconnect()

    print("\nUpload completed successfully!")
    return 0


if __name__ == "__main__":
    exit(main())
