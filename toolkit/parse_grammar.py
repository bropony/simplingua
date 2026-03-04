#!/usr/bin/env python3
"""
Simplingua Grammar Parser
Parses grammar-in-cn.txt into structured JSON format
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Any


class GrammarParser:
    """Parser for Simplingua grammar format"""

    # Grammar sections mapping
    SECTIONS = {
        "名词": "nouns",
        "限定词": "determiners",
        "代词": "pronouns",
        "形容词和副词": "adjectives_adverbs",
        "动词": "verbs",
        "非谓语动词": "non_finite_verbs",
        "系动词与存现动词": "copula_existential",
        "连词": "conjunctions",
        "介词": "prepositions",
        "数词": "numerals",
        "句子的组成": "sentence_structure",
        "语序": "word_order",
        "间接宾语：给予动词和表达动词": "indirect_objects",
        "名词性从句": "noun_clauses",
        "补语：使役句与使变句": "complements",
        "疑问句": "questions",
        "时间的表达": "time_expression",
        "状语从句": "adverbial_clauses",
        "定语从句": "relative_clauses",
        "假设的表达": "conditionals",
        "构词法": "word_formation"
    }

    # Difficulty levels based on complexity
    LEVEL_MAP = {
        "名词": "beginner",
        "限定词": "beginner",
        "代词": "beginner",
        "形容词和副词": "beginner",
        "动词": "beginner",
        "非谓语动词": "intermediate",
        "系动词与存现动词": "beginner",
        "连词": "beginner",
        "介词": "beginner",
        "数词": "beginner",
        "句子的组成": "beginner",
        "语序": "beginner",
        "间接宾语：给予动词和表达动词": "intermediate",
        "名词性从句": "intermediate",
        "补语：使役句与使变句": "intermediate",
        "疑问句": "beginner",
        "时间的表达": "beginner",
        "状语从句": "intermediate",
        "定语从句": "intermediate",
        "假设的表达": "intermediate",
        "构词法": "advanced"
    }

    def __init__(self, filepath: Path):
        self.filepath = filepath
        self.sections = []

    def extract_section_info(self, line: str) -> Optional[Dict[str, str]]:
        """Extract section information from header line"""
        # Match pattern: 【section_name】
        match = re.match(r'^【(.+?)】', line)
        if match:
            section_name = match.group(1)
            section_id = self.SECTIONS.get(section_name)
            level = self.LEVEL_MAP.get(section_name, "beginner")

            if section_id:
                return {
                    "section_id": section_id,
                    "section_name": section_name,
                    "level": level
                }
        return None

    def extract_subsection(self, line: str) -> Optional[str]:
        """Extract subsection name"""
        # Match patterns like: 一、xxx, 二、xxx, etc.
        match = re.match(r'^[一二三四五六七八九十]+、\s*(.+)', line)
        if match:
            return match.group(1)
        return None

    def extract_examples(self, text: str) -> List[str]:
        """Extract example sentences"""
        examples = []
        # Pattern: Chinese example + Simplingua translation
        lines = text.split('\n')
        for i, line in enumerate(lines):
            if re.search(r'[。？！]', line):
                # Check if next line has Simplingua example
                if i + 1 < len(lines) and re.match(r'^[A-Z]', lines[i + 1]):
                    examples.append({
                        "chinese": line.strip(),
                        "simplingua": lines[i + 1].strip()
                    })
        return examples

    def extract_rules(self, content: str) -> List[Dict[str, Any]]:
        """Extract grammatical rules from content"""
        rules = []

        # Look for patterns like: noun + s → plural
        patterns = [
            (r'(\w+)\s*\+\s*([a-záéíóúñü\'\s]+)', "pattern"),
            (r'(\w+)\s*→\s*(\w+)', "transformation"),
            (r'([\u4e00-\u9fff]+)', "description")
        ]

        for pattern_type, pattern in patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                rules.append({
                    "type": pattern_type,
                    "content": match.group(0)
                })
                if pattern_type != "description":
                    rules[-1]["parts"] = [match.group(i) for i in range(1, len(match.groups()) + 1)]

        return rules

    def parse_file(self) -> List[Dict[str, Any]]:
        """Main parsing method"""
        with open(self.filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')
        i = 0

        current_section = None
        current_subsection = None
        current_content = []

        while i < len(lines):
            line = lines[i].strip()

            # Check for section header
            section_info = self.extract_section_info(line)
            if section_info:
                # Save previous section
                if current_section and current_content:
                    full_content = '\n'.join(current_content)
                    current_section.update({
                        "summary": full_content[:200] + "...",
                        "content": full_content,
                        "examples": self.extract_examples(full_content),
                        "rules": self.extract_rules(full_content)
                    })
                    self.sections.append(current_section)

                current_section = {
                    **section_info,
                    "subsections": []
                }
                current_subsection = None
                current_content = []
                i += 1
                continue

            # Check for subsection
            subsection_name = self.extract_subsection(line)
            if subsection_name and current_section:
                # Save previous subsection
                if current_subsection and current_content:
                    full_content = '\n'.join(current_content)
                    current_subsection.update({
                        "content": full_content,
                        "examples": self.extract_examples(full_content)
                    })
                    current_section["subsections"].append(current_subsection)

                current_subsection = {
                    "subsection_name": subsection_name,
                    "subsection_id": self._to_snake_case(subsection_name)
                }
                current_content = []
                i += 1
                continue

            # Skip empty lines
            if not line:
                i += 1
                continue

            # Add content
            current_content.append(line)
            i += 1

        # Don't forget last section
        if current_section and current_content:
            full_content = '\n'.join(current_content)
            current_section.update({
                "summary": full_content[:200] + "...",
                "content": full_content,
                "examples": self.extract_examples(full_content),
                "rules": self.extract_rules(full_content)
            })
            self.sections.append(current_section)

        # Add final subsection if exists
        if current_subsection and current_content:
            full_content = '\n'.join(current_content)
            current_subsection.update({
                "content": full_content,
                "examples": self.extract_examples(full_content)
            })
            if current_section:
                current_section["subsections"].append(current_subsection)

        return self.sections

    def _to_snake_case(self, text: str) -> str:
        """Convert Chinese to snake_case identifier"""
        return re.sub(r'[^\w]', '_', text.lower())

    def save_json(self, output_path: Path):
        """Save parsed grammar to JSON file"""
        # Create section mapping
        sections_map = []
        for i, section in enumerate(self.sections):
            sections_map.append({
                "id": section.get("section_id", ""),
                "name": section.get("section_name", ""),
                "order": i + 1
            })

        output = {
            "version": "2.6",
            "language": "simplingua",
            "documentation_language": "zh",
            "sections": sections_map,
            "total_sections": len(self.sections),
            "grammar_content": self.sections
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        print(f"Saved {len(self.sections)} grammar sections to {output_path}")


def main():
    """Main entry point"""
    grammar_path = Path(__file__).parent.parent / "docs" / "grammar-in-cn.txt"
    output_path = Path(__file__).parent.parent / "data" / "grammar.json"

    if not grammar_path.exists():
        print(f"Error: Grammar file not found at {grammar_path}")
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)

    parser = GrammarParser(grammar_path)
    parser.parse_file()
    parser.save_json(output_path)

    return 0


if __name__ == "__main__":
    exit(main())
