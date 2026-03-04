"""
Phonetics API Router
Pronunciation rules and phonological analysis
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.phonetics import (
    PhoneticsRulesResponse,
    PronunciationResponse,
    PhoneticsAnalysisRequest,
    PhoneticsAnalysisResponse,
)

router = APIRouter(prefix="/api/v1/phonetics", tags=["phonetics"])


@router.get("/rules", response_model=PhoneticsRulesResponse)
async def get_phonetics_rules():
    """Get phonological rules"""

    return {
        "rules": [
            {
                "type": "consonant_softening",
                "description": "c, g + e, i = soft",
                "examples": [
                    {"from_consonant": "c", "to_sound": "/tʃ/", "condition": "before e or i"},
                    {"from_consonant": "g", "to_sound": "/dʒ/", "condition": "before e or i"}
                ]
            },
            {
                "type": "stress",
                "rule": "penultimate syllable",
                "exceptions": ["-ia", "-io", "-ie", "-ion", "-ua", "-ue", "-uo"],
                "exception_rule": "antepenultimate syllable"
            }
        ]
    }


@router.get("/pronounce", response_model=PronunciationResponse)
async def get_pronunciation(
    word: str,
    show_stress: bool = False,
    db: Session = Depends(get_db)
):
    """Get pronunciation for a word"""

    from app.models.word import Word
    db_word = db.query(Word).filter(Word.word == word).first()

    if not db_word or not db_word.pronunciation:
        # Generate phonetic approximation
        return generate_phonetic_approximation(word, show_stress)

    return {
        "word": word,
        "ipa": db_word.pronunciation,
        "stress_marked": add_stress_marks(word, db_word.pronunciation) if show_stress else None,
        "syllables": split_into_syllables(word),
        "stress_pattern": determine_stress_pattern(word)
    }


def generate_phonetic_approximation(word: str, show_stress: bool) -> dict:
    """Generate phonetic approximation for word not in database"""
    # Simplified phonetic approximation
    # In production, use actual phonetic rules or AI
    syllables = split_into_syllables(word)
    ipa = "".join([syl_to_ipa(syl) for syl in syllables])
    stress_pattern = determine_stress_pattern(word)

    result = {
        "word": word,
        "ipa": f"/{ipa}/",
        "syllables": syllables,
        "stress_pattern": stress_pattern
    }

    if show_stress:
        result["stress_marked"] = add_stress_marks(word, result["ipa"])

    return result


def split_into_syllables(word: str) -> List[str]:
    """Split word into syllables"""
    # Simplified syllable division
    # In production, use proper linguistic rules
    vowels = "aeiouáéíóú"
    syllables = []
    current = ""

    for char in word:
        current += char
        if char.lower() in vowels:
            syllables.append(current)
            current = ""

    if current:
        syllables.append(current)

    return syllables


def syl_to_ipa(syllable: str) -> str:
    """Convert syllable to IPA approximation"""
    # Simplified mapping - in production use full phonetic rules
    mapping = {
        'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u',
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'g',
        'h': 'h', 'j': 'j', 'l': 'l', 'm': 'm', 'n': 'n',
        'p': 'p', 'q': 'k', 'r': 'r', 's': 's', 't': 't',
        'v': 'v', 'w': 'w', 'x': 'ks', 'z': 'z'
    }

    ipa = ""
    for char in syllable:
        ipa += mapping.get(char, char)

    return ipa


def determine_stress_pattern(word: str) -> str:
    """Determine stress pattern for word"""
    # Count syllables
    syllable_count = len(split_into_syllables(word))

    # Exceptions: -ia, -io, -ie, -ion, -ua, -ue, -uo
    exceptions = ["ia", "io", "ie", "ion", "ua", "ue", "uo"]
    for exc in exceptions:
        if word.lower().endswith(exc):
            if syllable_count >= 3:
                return "antepenultimate"
            break

    if syllable_count == 1:
        return "monosyllabic"
    elif syllable_count == 2:
        return "penultimate"
    else:
        return "penultimate"


def add_stress_marks(word: str, ipa: str) -> str:
    """Add stress marks to IPA transcription"""
    syllables = split_into_syllables(word)
    stress_pattern = determine_stress_pattern(word)

    if stress_pattern == "monosyllabic" and len(syllables) > 1:
        # Mark first syllable as stressed
        if len(syllables) > 0:
            syllables[0] = f"'{syllables[0]}"
    elif stress_pattern in ["penultimate", "antepenultimate"]:
        # Mark appropriate syllable
        if stress_pattern == "penultimate" and len(syllables) >= 2:
            syllables[-2] = f"'{syllables[-2]}"
        elif stress_pattern == "antepenultimate" and len(syllables) >= 3:
            syllables[-3] = f"'{syllables[-3]}"

    return "".join([syl_to_ipa(syl) for syl in syllables])


@router.post("/analyze", response_model=PhoneticsAnalysisResponse)
async def analyze_pronunciation(
    data: PhoneticsAnalysisRequest = Body(...),
    db: Session = Depends(get_db)
):
    """Analyze pronunciation of text"""
    words = data.text.split()
    all_syllables = [split_into_syllables(word) for word in words]
    stress_marks = []

    # Determine stress for each word
    for word in words:
        pattern = determine_stress_pattern(word)
        syllables = split_into_syllables(word)
        if pattern == "penultimate" and len(syllables) >= 2:
            stress_marks.append(len(all_syllables) - 2)
        elif pattern == "antepenultimate" and len(syllables) >= 3:
            stress_marks.append(len(all_syllables) - 3)
        else:
            stress_marks.append(len(all_syllables) - 1 if len(syllables) > 1 else 0)

    ipa_transcription = " ".join([syl_to_ipa(syl) for syl in data.text.split()])

    return {
        "text": data.text,
        "syllables": all_syllables,
        "stress_marks": stress_marks,
        "ipa_transcription": ipa_transcription
    }
