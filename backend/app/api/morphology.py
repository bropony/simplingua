"""
Morphology API Router
Affix reference and word formation
"""

from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.word import Word
from app.schemas.morphology import (
    AffixesResponse,
    WordGenerateRequest,
    WordGenerationResponse,
    WordAnalysisResponse,
)

router = APIRouter(prefix="/api/v1/morphology", tags=["morphology"])


@router.get("/affixes", response_model=AffixesResponse)
async def get_affixes(
    type: str = Query(..., pattern="^(prefix|suffix|infix)$"),
    category: str = None,
    db: Session = Depends(get_db)
):
    """Get affix reference"""

    # In production, query from database
    affixes = [
        {
            "affix": "-nte",
            "type": "suffix",
            "category": "verb_forming",
            "meaning": "active participle (doing)",
            "produces_pos": "形",
            "examples": [
                {"base": "ama", "derived": "amante", "meaning": "loving"},
                {"base": "scribe", "derived": "scribante", "meaning": "writing"}
            ]
        },
        {
            "affix": "-te",
            "type": "suffix",
            "category": "verb_forming",
            "meaning": "passive participle (done)",
            "produces_pos": "形",
            "examples": [
                {"base": "scribe", "derived": "scribete", "meaning": "written"},
                {"base": "face", "derived": "facete", "meaning": "done/made"}
            ]
        },
        {
            "affix": "-eza",
            "type": "suffix",
            "category": "noun_forming",
            "meaning": "abstract noun of quality",
            "produces_pos": "名",
            "examples": [
                {"base": "bele", "derived": "beleza", "meaning": "beauty"},
                {"base": "bon", "derived": "boneza", "meaning": "goodness"}
            ]
        }
    ]

    # Filter by type and category
    if type == "suffix":
        affixes = [a for a in affixes if a["type"] == "suffix"]
    elif type == "prefix":
        affixes = [a for a in affixes if a["type"] == "prefix"]

    if category:
        affixes = [a for a in affixes if a["category"] == category]

    return {"affixes": affixes}


@router.post("/generate", response_model=WordGenerationResponse)
async def generate_from_affixes(
    data: WordGenerateRequest = Body(...),
    db: Session = Depends(get_db)
):
    """Generate word from affixes"""

    root = data.root
    affixes = data.affixes

    # Simplified word formation logic
    # In production, use proper linguistic rules or AI

    result_word = root

    for affix in affixes:
        if affix.startswith("-"):
            result_word += affix[1:]  # Suffix
        elif affix.endswith("-"):
            result_word = affix[:-1] + result_word  # Prefix

    rule_applied = f"{root} + {' + '.join(affixes)}"

    return {
        "result": result_word,
        "valid": True,
        "meaning": f"Generated word using {len(affixes)} affix(es)",
        "rule_applied": rule_applied,
        "alternatives": []
    }


@router.get("/analyze/{word}", response_model=WordAnalysisResponse)
async def analyze_word(
    word: str,
    db: Session = Depends(get_db)
):
    """Analyze word morphology"""

    # Check if word exists in database
    db_word = db.query(Word).filter(Word.word == word).first()

    # Get derivatives if word exists
    from app.models.word_derivatives import WordDerivative
    derivatives = []
    if db_word:
        derivative_records = db.query(WordDerivative).filter(
            WordDerivative.word_id == db_word.id
        ).all()

        derivatives = [
            {
                "affix": rec.derivative_word,
                "type": rec.derivative_type,
                "category": rec.derivative_type,
                "meaning": rec.meaning,
                "examples": [{"base": word, "derived": rec.derivative_word}]
            }
            for rec in derivative_records
        ]

    return {
        "word": word,
        "root": word if not derivatives else word.split("-")[0] if "-" in word else None,
        "affixes": derivatives,
        "meaning": db_word.definitions[0].get("meaning") if db_word and db_word.definitions else None
    }
