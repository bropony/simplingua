#!/usr/bin/env python3
"""
Simplingua Dictionary Parser
Parses dictionary-in-cn.txt into structured JSON format
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Any


class DictionaryParser:
    """Parser for Simplingua dictionary format"""

    # Part of speech tags
    POS_TAGS = {
        "[名]": "名词",
        "[动]": "动词",
        "[形]": "形容词",
        "[副]": "副词",
        "[数]": "数词",
        "[介]": "介词",
        "[代]": "代词",
        "[限]": "限定词",
        "[连]": "连词",
        "[呼]": "招呼词",
        "[组]": "词组"
    }

    # Verb types
    VERB_TYPES = {
        "{他}": "他",
        "{自}": "自",
        "{系}": "系",
        "{情态}": "情态",
        "{无}": "无"
    }

    def __init__(self, filepath: Path):
        self.filepath = filepath
        self.entries = []
        self.current_entry = {}

    def parse_pronunciation(self, line: str) -> Optional[str]:
        """Extract IPA pronunciation from line"""
        match = re.search(r'\(([a-zʧʒəɹ̠]+(?:,\s[a-zʧʒəɹ̠]+)*\)', line)
        if match:
            return match.group(1)
        return None

    def parse_examples(self, line: str) -> List[str]:
        """Extract examples from line"""
        examples = []
        for match in re.finditer(r'~\s*([^.!?]+[.!?])', line):
            examples.append(match.group(1).strip())
        return examples

    def parse_derivatives(self, lines: List[str]) -> List[Dict[str, Any]]:
        """Parse derivative words with their markers"""
        derivatives = []
        for line in lines:
            if line.startswith('| ') or line.startswith('- ') or line.startswith('# '):
                # Determine derivative type
                prefix = line[:2]
                if prefix == '| ':
                    derivative_type = "natural_prefix_deriv"
                elif prefix == '- ':
                    derivative_type = "base_deriv"
                elif prefix == '# ':
                    derivative_type = "natural_suffix_deriv"
                else:
                    continue

                # Extract derivative word
                match = re.match(r'^[#|-]\s*(\w+)', line)
                if match:
                    derivative_word = match.group(1)
                    rest_of_line = line[match.end():].strip()

                    derivative = {
                        "derivative_word": derivative_word,
                        "derivative_type": derivative_type
                    }

                    # Extract gender variants
                    gender_match = re.search(r'⟨([^,]+),\s*([^)]+)\⟩', rest_of_line)
                    if gender_match:
                        derivative["gender_variants"] = [gender_match.group(1), gender_match.group(2)]
                        rest_of_line = rest_of_line[:gender_match.start()]

                    # Extract meaning and examples
                    parts = rest_of_line.split(' ~ ')
                    if len(parts) > 0:
                        derivative["meaning"] = parts[0].strip()
                    if len(parts) > 1:
                        derivative["examples"] = parts[1].strip()

                    derivatives.append(derivative)

        return derivatives

    def parse_word_line(self, line: str) -> Dict[str, Any]:
        """Parse a main word entry line"""
        result = {}

        # Extract pronunciation in parentheses
        pronunciation = self.parse_pronunciation(line)
        if pronunciation:
            result["pronunciation"] = f"/{pronunciation}/"

        # Extract word and POS
        # Format: word  [pos] meaning ~ examples | derivatives
        match = re.match(r'^([a-z\(\)áéíóúñü\']+\s?)\s+(\[[^\]]+\])', line)
        if match:
            result["word"] = match.group(1).strip()
            result["pos"] = match.group(2)
        else:
            # Try without POS tag
            match = re.match(r'^([a-z\(\)áéíóúñü\']+\s?)\s+', line)
            if match:
                result["word"] = match.group(1).strip()

        return result

    def parse_file(self) -> List[Dict[str, Any]]:
        """Main parsing method"""
        with open(self.filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Split into entry blocks
        # Entries are typically separated by newlines and start with a word
        lines = content.split('\n')
        i = 0

        while i < len(lines):
            line = lines[i].strip()

            if not line or line.startswith('#'):
                i += 1
                continue

            # Check if this is a new word entry
            if re.match(r'^[a-záéíóúñü\']', line):
                # Save previous entry if exists
                if self.current_entry:
                    self.entries.append(self.current_entry)
                    self.current_entry = {}

                # Parse new word
                word_data = self.parse_word_line(line)
                self.current_entry = {
                    "word": word_data.get("word", ""),
                    "pos": word_data.get("pos", ""),
                    "pronunciation": word_data.get("pronunciation", ""),
                    "definitions": [],
                    "examples": [],
                    "synonyms": [],
                    "antonyms": [],
                    "frequency": "medium",
                    "compound_marker": False
                }

                # Extract meaning and first example
                rest = line[line.find(word_data.get("word", "")) + len(word_data.get("word", "")):]
                if "[pos]" in rest.lower():
                    rest = rest[rest.find("]") + 1:].strip()

                if rest:
                    # Split by ~ for examples
                    parts = rest.split(' ~ ')
                    if parts[0]:
                        self.current_entry["definitions"].append({
                            "meaning": parts[0].strip(),
                            "language": "zh"
                        })

            elif line.startswith('| ') or line.startswith('- ') or line.startswith('# '):
                # Derivatives will be processed later
                pass

            elif line.startswith('~ '):
                # Example
                example = line[2:].strip()
                if example:
                    self.current_entry["examples"].append(example)

            elif line.startswith('⟨') or line.startswith('(('):
                # Gender pairs or pronunciation variants
                gender_match = re.search(r'⟨([^,]+),\s*([^)]+)\⟩', line)
                if gender_match:
                    self.current_entry["gender_pair"] = {
                        "feminine": gender_match.group(1),
                        "masculine": gender_match.group(2)
                    }

            elif re.match(r'^[a-záéíóúñü\']+.*\s+⟨', line):
                # Alternative word form with gender
                match = re.match(r'^([a-záéíóúñü\']+)\s+⟨([^,]+),\s*([^)]+)\⟩', line)
                if match:
                    self.current_entry["gender_pair"] = {
                        "feminine": match.group(2),
                        "masculine": match.group(3)
                    }

            i += 1

        # Don't forget last entry
        if self.current_entry:
            self.entries.append(self.current_entry)

        # Second pass: extract derivatives and related words
        with open(self.filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        lines = content.split('\n')

        current_word_idx = 0
        derivatives_buffer = []

        for line in lines:
            if line.startswith('| ') or line.startswith('- ') or line.startswith('# '):
                derivatives_buffer.append(line)
            elif re.match(r'^[a-záéíóúñü\']', line):
                # Save derivatives for previous word
                if current_word_idx > 0 and derivatives_buffer:
                    derivatives = self.parse_derivatives(derivatives_buffer)
                    if current_word_idx < len(self.entries):
                        self.entries[current_word_idx]["derivatives"] = derivatives
                derivatives_buffer = []
                current_word_idx += 1

        return self.entries

    def save_json(self, output_path: Path):
        """Save parsed entries to JSON file"""
        output = {
            "version": "2.6",
            "language": "simplingua",
            "documentation_language": "zh",
            "total_entries": len(self.entries),
            "entries": self.entries
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        print(f"Saved {len(self.entries)} entries to {output_path}")


def main():
    """Main entry point"""
    dictionary_path = Path(__file__).parent.parent / "docs" / "dictionary-in-cn.txt"
    output_path = Path(__file__).parent.parent / "data" / "words.json"

    if not dictionary_path.exists():
        print(f"Error: Dictionary file not found at {dictionary_path}")
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)

    parser = DictionaryParser(dictionary_path)
    parser.parse_file()
    parser.save_json(output_path)

    return 0


if __name__ == "__main__":
    exit(main())
