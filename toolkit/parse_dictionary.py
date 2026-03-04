#!/usr/bin/env python3
"""
Simplingua Dictionary Parser
Parses dictionary-in-cn.txt into structured JSON format
"""

import re
import json
import argparse
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
        self.errors = []

    def parse_pronunciation(self, line: str) -> Optional[str]:
        """Extract IPA pronunciation from line"""
        match = re.search(r'\(([a-záéíóúñü\s\'\-\.,]+)\)', line)
        if match:
            return match.group(1)
        return None

    def parse_examples(self, line: str) -> List[str]:
        """Extract examples from line"""
        examples = []
        for match in re.finditer(r'~\s*([^.!?]+[.!?])', line):
            examples.append(match.group(1).strip())
        return examples

    def parse_inline_derivatives(self, text: str) -> List[Dict[str, Any]]:
        """Parse derivatives that are inline in the same line, separated by |"""
        derivatives = []
        parts = re.split(r'\s*\|\s*', text)
        for part in parts:
            part = part.strip()
            if not part:
                continue
            # Check if this looks like a derivative (word followed by [pos])
            if re.search(r'^[a-záéíóúñü\']+\s+\[[^\]]+\]', part):
                derivative_match = re.match(r'^([a-záéíóúñü\']+)\s+', part)
                if derivative_match:
                    derivative_word = derivative_match.group(1).strip()
                    rest = part[derivative_match.end():].strip()
                    derivative = {
                        "derivative_word": derivative_word,
                        "derivative_type": "inline_deriv"
                    }
                    # Extract pronunciation if present
                    pron_match = re.match(r'\(([a-záéíóúñü\s\'\-\.,]+)\)\s*', rest)
                    if pron_match:
                        derivative["pronunciation"] = pron_match.group(1)
                        rest = rest[pron_match.end():].strip()
                    # Extract POS and meaning
                    pos_match = re.match(r'(\[[^\]]+\])\s*', rest)
                    if pos_match:
                        derivative["pos"] = pos_match.group(1)
                        rest = rest[pos_match.end():].strip()
                    # Extract and remove verb type marker if present
                    verb_type_match = re.match(r'\{([^\}]+)\}\s*', rest)
                    if verb_type_match:
                        verb_type_marker = verb_type_match.group(1)
                        # Map to verb type name
                        for vtype, vname in self.VERB_TYPES.items():
                            if vtype == "{" + verb_type_marker + "}":
                                derivative["verb_type"] = vname
                                break
                        rest = rest[verb_type_match.end():].strip()
                    # Remove numbered markers
                    meaning = re.sub(r'[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]\s*', '', rest).strip()
                    if meaning:
                        derivative["meaning"] = meaning
                    # Extract gender variants
                    gender_match = re.search(r'⟨([^,]+),\s*([^)]+)\⟩', rest)
                    if gender_match:
                        derivative["gender_variants"] = [gender_match.group(1), gender_match.group(2)]
                    derivatives.append(derivative)
        return derivatives

    def parse_word_line(self, line: str) -> Dict[str, Any]:
        """Parse a main word entry line"""
        result = {}

        # Extract pronunciation in parentheses (before POS tag)
        pronunciation = self.parse_pronunciation(line)
        if pronunciation:
            result["pronunciation"] = f"/{pronunciation}/"

        # Extract word and POS
        # First, try to find the word (letters before first space or parenthesis)
        word_match = re.match(r'^([a-záéíóúñü\']+(?:\s+[a-záéíóúñü\']+)*\s?)', line)
        if word_match:
            word = word_match.group(1).strip()
            result["word"] = word

            # Find POS tag after the word
            rest = line[word_match.end():].strip()
            pos_match = re.match(r'(\[[^\]]+\])', rest)
            if pos_match:
                result["pos"] = pos_match.group(1)

        return result

    def extract_verb_type(self, pos_tag: str) -> str:
        """Extract verb type from POS tag"""
        for vtype, vname in self.VERB_TYPES.items():
            if vtype in pos_tag:
                return vname
        return ""

    def process_meaning_text(self, text: str, pos_tag: str = "") -> List[Dict[str, Any]]:
        """Process meaning text to extract numbered meanings and examples"""
        definitions = []
        examples = []

        # Check for numbered markers
        numbered_parts = re.split(r'([①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳])', text)
        has_numbered = any(p in numbered_parts for p in ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'])

        if has_numbered:
            for i in range(1, len(numbered_parts), 2):
                marker = numbered_parts[i]
                part_text = numbered_parts[i + 1] if i + 1 < len(numbered_parts) else ""
                if part_text:
                    # Split by ~ to separate meaning from example
                    part_sections = part_text.split(' ~ ', 1)
                    meaning_only = part_sections[0].strip()
                    example_only = part_sections[1].strip() if len(part_sections) > 1 else ""

                    # Remove verb type markers
                    meaning_only = re.sub(r'\{[^\}]+\}\s*', '', meaning_only).strip()

                    # Clean up the meaning (remove trailing semicolon, etc.)
                    meaning_only = re.sub(r'[；；\s]+$', '', meaning_only)

                    # Add definition
                    if meaning_only:
                        def_entry = {"meaning": meaning_only, "language": "zh"}
                        if pos_tag:
                            def_entry["pos_tag"] = pos_tag
                        definitions.append(def_entry)

                    # Add example if present and valid
                    if example_only and not example_only.startswith('['):
                        examples.append(example_only)
        else:
            # No numbered markers, add the whole meaning
            if text:
                text = re.sub(r'[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]\s*', '', text).strip()
                if text:
                    def_entry = {"meaning": text, "language": "zh"}
                    if pos_tag:
                        def_entry["pos_tag"] = pos_tag
                    definitions.append(def_entry)

        return definitions, examples

    def parse_file(self) -> List[Dict[str, Any]]:
        """Main parsing method"""
        with open(self.filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')
        i = 0
        line_num = 0

        # Flag to track when we've started parsing actual dictionary entries
        # (skip the intro sections: 凡例, 缩略词表)
        parsing_started = False

        while i < len(lines):
            line = lines[i].strip()
            line_num += 1

            if not line or line.startswith('#'):
                i += 1
                continue

            # Check if this is a letter header (A, B, C, etc.) - start parsing from here
            if re.match(r'^[A-Z]$', line):
                parsing_started = True
                i += 1
                continue

            # Skip lines before we hit the first letter header
            if not parsing_started:
                i += 1
                continue

            # Check if this is a new word entry
            if re.match(r'^[a-záéíóúñü\']', line):
                # Save previous entry if exists
                if self.current_entry and self.current_entry.get("word"):
                    self.entries.append(self.current_entry)
                    self.current_entry = {}

                # Parse new word
                word_data = self.parse_word_line(line)
                word = word_data.get("word", "")

                if not word:
                    self.errors.append(f"Line {line_num}: Could not parse word from '{line[:50]}...'")
                    i += 1
                    continue

                # Initialize new entry
                self.current_entry = {
                    "word": word,
                    "pos": word_data.get("pos", ""),
                    "verb_type": "",
                    "pronunciation": word_data.get("pronunciation", ""),
                    "definitions": [],
                    "examples": [],
                    "synonyms": [],
                    "antonyms": [],
                    "frequency": "medium",
                    "compound_marker": False
                }

                # Extract verb type from POS if present
                pos_tag = word_data.get("pos", "")
                if pos_tag:
                    self.current_entry["verb_type"] = self.extract_verb_type(pos_tag)

                # Process the rest of the line
                rest = line

                # Remove the word itself
                if word:
                    word_pos = rest.find(word)
                    if word_pos != -1:
                        rest = rest[word_pos + len(word):].strip()

                # Remove pronunciation if present
                pron_match = re.match(r'\(([a-záéíóúñü\s\'\-\.,]+)\)\s*', rest)
                if pron_match:
                    rest = rest[pron_match.end():].strip()

                # Extract and remove verb type marker if present (use search instead of match)
                verb_type_match = re.search(r'\{([^\}]+)\}\s*', rest)
                if verb_type_match:
                    verb_type_marker = verb_type_match.group(1)
                    # Map to verb type name
                    for vtype, vname in self.VERB_TYPES.items():
                        if vtype == "{" + verb_type_marker + "}":
                            self.current_entry["verb_type"] = vname
                            break
                    # Remove the verb type marker from rest
                    rest = rest[:verb_type_match.start()] + rest[verb_type_match.end():].strip()

                # Check for compound marker <word+word>
                compound_match = re.search(r'<([^>]+)>', rest)
                if compound_match:
                    self.current_entry["compound_marker"] = True
                    self.current_entry["compound_parts"] = compound_match.group(1)
                    rest = rest[:compound_match.start()] + rest[compound_match.end():]

                # Extract inline derivatives from rest
                inline_derivatives = self.parse_inline_derivatives(rest)
                if inline_derivatives:
                    self.current_entry["derivatives"] = inline_derivatives
                    # Remove the derivatives part to get the meaning
                    first_pipe = rest.find('|')
                    if first_pipe != -1:
                        rest = rest[:first_pipe].strip()

                # Find all POS tags and their meanings in the rest
                pos_matches = list(re.finditer(r'\[([^\]]+)\](?!\s*\{[^\}]+\}\s*\[)', rest))

                if pos_matches:
                    for pos_m in pos_matches:
                        current_pos_tag = f"[{pos_m.group(1)}]"
                        start = pos_m.end()
                        # Find the next [pos] or end
                        next_bracket = rest.find('[', start)
                        if next_bracket == -1:
                            meaning_text = rest[start:].strip()
                        else:
                            meaning_text = rest[start:next_bracket].strip()

                        # Update verb type if found
                        verb_type = self.extract_verb_type(current_pos_tag)
                        if verb_type and not self.current_entry.get("verb_type"):
                            self.current_entry["verb_type"] = verb_type

                        # Set the first POS tag as the main pos
                        if not self.current_entry.get("pos") or pos_m.start() == pos_matches[0].start():
                            self.current_entry["pos"] = current_pos_tag

                        # Process meaning text
                        definitions, examples = self.process_meaning_text(meaning_text, current_pos_tag)
                        self.current_entry["definitions"].extend(definitions)
                        self.current_entry["examples"].extend(examples)
                else:
                    # No POS tag found, just process as meaning
                    definitions, examples = self.process_meaning_text(rest)
                    self.current_entry["definitions"].extend(definitions)
                    self.current_entry["examples"].extend(examples)

            elif line.startswith('| ') or line.startswith('- ') or line.startswith('# '):
                # Collect derivatives for the current word
                if self.current_entry:
                    if "derivatives" not in self.current_entry:
                        self.current_entry["derivatives"] = []
                    # Parse this derivative line
                    prefix = line[:2]
                    if prefix == '| ':
                        derivative_type = "natural_prefix_deriv"
                    elif prefix == '- ':
                        derivative_type = "base_deriv"
                    elif prefix == '# ':
                        derivative_type = "natural_suffix_deriv"
                    else:
                        i += 1
                        continue

                    # Extract derivative word
                    rest = line[2:].strip()
                    derivative_match = re.match(r'^([a-záéíóúñü\']+(?:\s+[a-záéíóúñü\']+)*\s?)', rest)
                    if derivative_match:
                        derivative_word = derivative_match.group(1).strip()
                        derivative_rest = rest[derivative_match.end():].strip()

                        derivative = {
                            "derivative_word": derivative_word,
                            "derivative_type": derivative_type
                        }

                        # Extract pronunciation if present
                        pron_match = re.match(r'\(([a-záéíóúñü\s\'\-\.,]+)\)\s*', derivative_rest)
                        if pron_match:
                            derivative["pronunciation"] = pron_match.group(1)
                            derivative_rest = derivative_rest[pron_match.end():].strip()

                        # Extract POS and meaning
                        pos_match = re.match(r'(\[[^\]]+\])\s*', derivative_rest)
                        if pos_match:
                            derivative["pos"] = pos_match.group(1)
                            derivative_rest = derivative_rest[pos_match.end():].strip()

                        # Extract and remove verb type marker if present
                        verb_type_match = re.match(r'\{([^\}]+)\}\s*', derivative_rest)
                        if verb_type_match:
                            verb_type_marker = verb_type_match.group(1)
                            # Map to verb type name
                            for vtype, vname in self.VERB_TYPES.items():
                                if vtype == "{" + verb_type_marker + "}":
                                    derivative["verb_type"] = vname
                                    break
                            derivative_rest = derivative_rest[verb_type_match.end():].strip()

                        # Extract gender variants
                        gender_match = re.search(r'⟨([^,]+),\s*([^)]+)\⟩', derivative_rest)
                        if gender_match:
                            derivative["gender_variants"] = [gender_match.group(1), gender_match.group(2)]
                            derivative_rest = derivative_rest[:gender_match.start()] + derivative_rest[gender_match.end():]

                        # Remove numbered markers
                        meaning = re.sub(r'[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]\s*', '', derivative_rest).strip()
                        if meaning:
                            derivative["meaning"] = meaning

                        # Extract examples
                        example_match = re.search(r'~\s*([^.!?]+[.!?])', derivative_rest)
                        if example_match:
                            derivative["examples"] = example_match.group(1).strip()

                        self.current_entry["derivatives"].append(derivative)

                i += 1
                continue

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
        if self.current_entry and self.current_entry.get("word"):
            self.entries.append(self.current_entry)

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

        if self.errors:
            print(f"\nWarnings/Errors encountered: {len(self.errors)}")
            for error in self.errors[:10]:  # Show first 10 errors
                print(f"  - {error}")
            if len(self.errors) > 10:
                print(f"  ... and {len(self.errors) - 10} more errors")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Parse Simplingua dictionary from text file to JSON"
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=Path(__file__).parent.parent / "docs" / "dictionary-in-cn.txt",
        help="Input dictionary text file path (default: ../docs/dictionary-in-cn.txt)"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).parent.parent / "data" / "words.json",
        help="Output JSON file path (default: ../data/words.json)"
    )

    args = parser.parse_args()

    if not args.input.exists():
        print(f"Error: Dictionary file not found at {args.input}")
        return 1

    args.output.parent.mkdir(parents=True, exist_ok=True)

    parser = DictionaryParser(args.input)
    parser.parse_file()
    parser.save_json(args.output)

    return 0


if __name__ == "__main__":
    exit(main())
