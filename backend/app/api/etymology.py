"""
Etymology API Router
Word derivation chain and etymology
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.word import Word
from app.schemas.etymology import (
    EtymologyResponse,
    RelatedWordsResponse,
)

router = APIRouter(prefix="/api/v1/etymology", tags=["etymology"])


@router.get("/word", response_model=EtymologyResponse)
async def get_etymology_by_word(
    word: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    """Get word derivation chain by word"""

    db_word = db.query(Word).filter(Word.word == word).first()

    if not db_word:
        raise HTTPException(status_code=404, detail="Word not found")

    # Simplified etymology extraction
    # In production, this would be stored in the database
    root_word = extract_root_word(word)
    related_words = find_related_words(word, db)

    derivation_chain = [
        {"form": root_word, "type": "base_word", "meaning": "root or base form"},
        {"form": word, "type": "current", "meaning": db_word.definitions[0].get("meaning") if db_word.definitions else ""}
    ]

    # Add derivatives if any
    from app.models.word_derivatives import WordDerivative
    derivative_records = db.query(WordDerivative).filter(
        WordDerivative.word_id == db_word.id
    ).all()

    for deriv in derivative_records:
        derivation_chain.append({
            "form": deriv.derivative_word,
            "type": deriv.derivative_type,
            "meaning": deriv.meaning or ""
        })

    return {
        "word": word,
        "root": root_word,
        "derivation_chain": derivation_chain,
        "related_words": related_words
    }


@router.get("/chain/{word_id}", response_model=EtymologyResponse)
async def get_etymology_by_id(word_id: str, db: Session = Depends(get_db)):
    """Get word derivation chain by ID"""

    word = db.query(Word).filter(Word.id == word_id).first()

    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    # Simplified etymology extraction
    root_word = extract_root_word(word.word)
    related_words = find_related_words(word.word, db)

    derivation_chain = [
        {"form": root_word, "type": "base_word", "meaning": "root or base form"},
        {"form": word.word, "type": "current", "meaning": word.definitions[0].get("meaning") if word.definitions else ""}
    ]

    # Add derivatives if any
    from app.models.word_derivatives import WordDerivative
    derivative_records = db.query(WordDerivative).filter(
        WordDerivative.word_id == word.id
    ).all()

    for deriv in derivative_records:
        derivation_chain.append({
            "form": deriv.derivative_word,
            "type": deriv.derivative_type,
            "meaning": deriv.meaning or ""
        })

    return {
        "word": word.word,
        "root": root_word,
        "derivation_chain": derivation_chain,
        "related_words": related_words
    }


@router.get("/related/{word_id}", response_model=RelatedWordsResponse)
async def get_related_by_id(
    word_id: str,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get related words"""

    word = db.query(Word).filter(Word.id == word_id).first()

    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    related_words = find_related_words(word.word, db, limit)

    return {
        "word": word.word,
        "related": related_words,
        "count": len(related_words)
    }


def extract_root_word(word: str) -> str:
    """Extract root word from word form"""
    # Simplified root extraction
    # Remove common suffixes
    suffixes = ["ante", "ente", "te", "ido", "eza", "or", "a"]
    root = word

    for suffix in suffixes:
        if word.endswith(suffix) and len(word) > len(suffix) + 2:
            root = word[:-len(suffix)]
            break

    return root


def find_related_words(word: str, db: Session, limit: int = 5) -> list:
    """Find related words based on shared components"""
    root = extract_root_word(word)

    # Find words with same root
    related = db.query(Word).filter(
        Word.word.ilike(f"{root}%")
    ).filter(Word.status == "active").limit(limit).all()

    return [w.word for w in related if w.word != word]
