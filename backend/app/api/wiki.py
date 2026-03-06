"""
Wiki API Router
Public knowledge base endpoints - search, words, grammar, phonetics, morphology
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.core.database import get_db
from app.models.word import Word
from app.models.grammar import Grammar
from app.models.grammar_sections import GrammarSection
from app.models.word_derivatives import WordDerivative
from app.schemas.word import (
    WordSearchRequest,
    WordSearchResponse,
    ConjugateRequest,
    ConjugationResponse,
    TranslateRequest,
    TranslateResponse,
    WordRelationsResponse,
    RandomWordRequest,
    WordResponse,
)
from app.schemas.grammar import (
    GrammarSectionListResponse,
    GrammarSearchRequest,
    GrammarResponse,
    GrammarAnalysisRequest,
    SentenceAnalysisResponse,
)
from app.schemas.chat import WikiSearchRequest, WikiSearchResponse

router = APIRouter(prefix="/api/v1/wiki", tags=["wiki"])


# =============================================================================
# Wiki Search (Unified Knowledge Base Search)
# =============================================================================

@router.get("/search", response_model=WikiSearchResponse)
async def search_wiki(
    query: str = Query(..., min_length=1),
    type: Optional[str] = Query(None, pattern="^(word|grammar|textbook)?$"),
    lang: str = "en",
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Search across words, grammar, and textbooks"""
    results = []

    # Search words
    if type in (None, "word"):
        word_results = db.query(Word).filter(
            or_(
                Word.word.ilike(f"%{query}%"),
                Word.description.ilike(f"%{query}%")
            )
        ).limit(limit // 2).offset(offset).all()

        for word in word_results:
            results.append({
                "type": "word",
                "title": f"{word.word} ({word.pos})",
                "content": word.description,
                "relevance": 0.9,
                "language": lang
            })

    # Search grammar
    if type in (None, "grammar"):
        grammar_results = db.query(Grammar).filter(
            or_(
                Grammar.name.ilike(f"%{query}%"),
                Grammar.content.ilike(f"%{query}%")
            )
        ).limit(limit // 2).offset(offset).all()

        for grammar in grammar_results:
            results.append({
                "type": "grammar",
                "title": grammar.name,
                "content": grammar.summary[:200] if grammar.summary else grammar.content[:200],
                "relevance": 0.85,
                "language": lang
            })

    return {
        "success": True,
        "results": results,
        "pagination": {
            "total": len(results),
            "limit": limit,
            "offset": offset
        }
    }


# =============================================================================
# Word/Lexicon APIs
# =============================================================================

@router.get("/words/search", response_model=WordSearchResponse)
async def search_words(
    q: str,
    pos: Optional[str] = None,
    verb_type: Optional[str] = None,
    language: str = "en",
    has_derivatives: Optional[bool] = None,
    has_pronunciation: Optional[bool] = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Comprehensive word search with linguistic context"""
    query = db.query(Word).filter(Word.status == "active")

    # Search term
    query = query.filter(
        or_(
            Word.word.ilike(f"%{q}%"),
            Word.description.ilike(f"%{q}%")
        )
    )

    # Filters
    if pos:
        query = query.filter(Word.pos == pos)
    if verb_type:
        query = query.filter(Word.verb_type == verb_type)
    if has_pronunciation:
        query = query.filter(Word.pronunciation.isnot(None))
    if has_derivatives:
        query = query.filter(Word.derivatives.isnot(None))

    results = query.limit(limit).offset(offset).all()

    # Get all derivatives for these words in one query
    word_ids = [w.id for w in results]
    derivatives_query = db.query(WordDerivative).filter(WordDerivative.word_id.in_(word_ids))
    all_derivatives = derivatives_query.all()

    # Group derivatives by word_id
    derivatives_by_word = {}
    natural_prefix_by_word = {}
    for derivative in all_derivatives:
        if derivative.word_id not in derivatives_by_word:
            derivatives_by_word[derivative.word_id] = []
            natural_prefix_by_word[derivative.word_id] = []

        # Parse gender variants if present
        gender_list = None
        if derivative.gender_variants:
            gender_list = [v.strip() for v in derivative.gender_variants.split(",")]

        derivative_dict = {
            "derivative_word": derivative.derivative_word,
            "derivative_type": derivative.derivative_type,
            "gender_variants": gender_list,
            "meaning": derivative.meaning,
            "examples": derivative.examples
        }

        # Categorize by derivative type
        if derivative.derivative_type.startswith("natural_prefix"):
            natural_prefix_by_word[derivative.word_id].append(derivative_dict)
        else:
            derivatives_by_word[derivative.word_id].append(derivative_dict)

    word_responses = []
    for word in results:
        word_responses.append({
            "id": str(word.id),
            "word": word.word,
            "pos": word.pos,
            "verb_type": word.verb_type,
            "pronunciation": word.pronunciation,
            "definitions": word.definitions if isinstance(word.definitions, list) else [],
            "examples": word.examples or [],
            "derivatives": derivatives_by_word.get(word.id, []),
            "natural_prefix_derivatives": natural_prefix_by_word.get(word.id, []),
            "synonyms": word.synonyms or [],
            "antonyms": word.antonyms or [],
            "frequency": word.frequency,
            "compound_marker": word.compound_marker,
            "gender_pair": word.gender_pair
        })

    return {
        "success": True,
        "results": word_responses,
        "pagination": {
            "total": query.count(),
            "limit": limit,
            "offset": offset
        }
    }


@router.get("/words/{word_id}", response_model=WordResponse)
async def get_word(word_id: str, db: Session = Depends(get_db)):
    """Get full word entry by ID"""
    word = db.query(Word).filter(Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    return {
        "id": str(word.id),
        "word": word.word,
        "pos": word.pos,
        "verb_type": word.verb_type,
        "pronunciation": word.pronunciation,
        "definitions": word.definitions if isinstance(word.definitions, list) else [],
        "examples": word.examples or [],
        "derivatives": [],
        "natural_prefix_derivatives": [],
        "synonyms": word.synonyms or [],
        "antonyms": word.antonyms or [],
        "frequency": word.frequency,
        "compound_marker": word.compound_marker,
        "gender_pair": word.gender_pair
    }


@router.get("/words/random", response_model=WordResponse)
async def get_random_word(
    pos: Optional[str] = None,
    difficulty: Optional[str] = "beginner",
    db: Session = Depends(get_db)
):
    """Get random word for learning exercises"""
    query = db.query(Word).filter(Word.status == "active")

    if pos:
        query = query.filter(Word.pos == f"[{pos}]")

    if difficulty == "beginner":
        query = query.filter(Word.frequency == "high")
    elif difficulty == "advanced":
        query = query.filter(Word.frequency == "low")

    word = query.order_by(func.random()).first()
    if not word:
        raise HTTPException(status_code=404, detail="No words found")

    return {
        "id": str(word.id),
        "word": word.word,
        "pos": word.pos,
        "verb_type": word.verb_type,
        "pronunciation": word.pronunciation,
        "definitions": word.definitions if isinstance(word.definitions, list) else [],
        "examples": word.examples or [],
        "derivatives": [],
        "natural_prefix_derivatives": [],
        "synonyms": word.synonyms or [],
        "antonyms": word.antonyms or [],
        "frequency": word.frequency,
        "compound_marker": word.compound_marker,
        "gender_pair": word.gender_pair
    }


@router.post("/words/conjugate", response_model=ConjugationResponse)
async def conjugate_verb(
    request: ConjugateRequest,
    db: Session = Depends(get_db)
):
    """Get verb conjugation and forms"""
    word = db.query(Word).filter(
        Word.word == request.word.lower()
    ).first()

    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    # Simplified conjugation - in production, use actual rules
    conjugations = {
        "infinitive": word.word,
        "active_participle": f"{word.word.rstrip('a')}nte" if word.word.endswith('a') else None,
        "passive_participle": f"{word.word.rstrip('a')}te" if word.word.endswith('a') else None,
        "noun_form": f"{word.word.rstrip('a')}ido" if word.word.endswith('a') else None
    }

    return {
        "word": word.word,
        "conjugations": conjugations,
        "examples": None
    }


@router.get("/translate", response_model=TranslateResponse)
async def translate_word(
    text: str,
    from_lang: str = "en",
    to: str = "sim",
    pos: Optional[str] = None,
    context: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Context-aware translation"""
    # In production, use actual translation or AI
    # This is a placeholder implementation
    words = db.query(Word).filter(Word.status == "active").all()

    translations = []
    examples = []

    for word in words:
        if word.word.lower() in text.lower():
            definitions = word.definitions if isinstance(word.definitions, list) else []
            for defn in definitions:
                translations.append({
                    "word": word.word,
                    "pos": word.pos,
                    "verb_type": word.verb_type,
                    "meaning": defn.get("meaning", ""),
                    "aspect": None,
                    "context": None
                })
            examples.extend(word.examples or [])

    return {
        "text": text,
        "from_lang": from_lang,
        "to": to,
        "translations": translations,
        "examples": examples[:5]
    }


@router.get("/words/{word_id}/relations", response_model=WordRelationsResponse)
async def get_word_relations(word_id: str, db: Session = Depends(get_db)):
    """Get synonyms and antonyms"""
    word = db.query(Word).filter(Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    synonyms = []
    for syn in (word.synonyms or []):
        synonyms.append({"word": syn, "pos": word.pos, "nuance": None})

    antonyms = []
    for ant in (word.antonyms or []):
        antonyms.append({"word": ant, "pos": word.pos, "meaning": "opposite"})

    return {
        "synonyms": synonyms,
        "antonyms": antonyms,
        "semantic_field": None
    }


# =============================================================================
# Grammar APIs
# =============================================================================

@router.get("/grammar/sections", response_model=GrammarSectionListResponse)
async def get_grammar_sections(db: Session = Depends(get_db)):
    """List all grammar sections"""
    sections = db.query(GrammarSection).order_by(GrammarSection.order_num).all()

    return {
        "sections": [
            {"id": s.id, "name": s.name, "order": s.order_num}
            for s in sections
        ]
    }


@router.get("/grammar/rules")
async def get_grammar_rules(
    section: Optional[str] = None,
    subsection: Optional[str] = None,
    rule_type: Optional[str] = None,
    language: str = "en",
    level: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Search grammar rules with filters"""
    query = db.query(Grammar).filter(Grammar.status == "active")

    if section:
        query = query.filter(Grammar.section_id == section)
    if subsection:
        query = query.filter(Grammar.subsection_id == subsection)
    if rule_type:
        query = query.filter(Grammar.rule_type == rule_type)
    if level:
        query = query.filter(Grammar.level == level)

    results = query.limit(limit).offset(offset).all()

    return {
        "results": [
            {
                "id": str(g.id),
                "section_id": g.section_id,
                "subsection_id": g.subsection_id,
                "name": g.name,
                "rule_type": g.rule_type,
                "level": g.level,
                "summary": g.summary,
                "content": g.content,
                "rules": g.rules if isinstance(g.rules, list) else [],
                "exceptions": g.exceptions if isinstance(g.exceptions, list) else [],
                "cross_references": g.cross_references if isinstance(g.cross_references, list) else [],
                "examples": g.examples or []
            }
            for g in results
        ],
        "total": query.count(),
        "limit": limit,
        "offset": offset
    }


@router.post("/grammar/sentences/analyze")
async def analyze_sentence(
    request: GrammarAnalysisRequest,
    db: Session = Depends(get_db)
):
    """Full grammatical analysis of a sentence"""
    # Placeholder - in production, use AI or rule-based analysis
    sentence = request.sentence
    language = request.language

    # Simple tokenization (placeholder)
    tokens = sentence.split()
    analysis = []

    for i, token in enumerate(tokens):
        # Try to find matching word in database
        word = db.query(Word).filter(Word.word == token).first()
        if word:
            analysis.append({
                "word": token,
                "pos": word.pos,
                "type": word.verb_type,
                "case": None,
                "person": None,
                "number": None,
                "function": "unknown"
            })
        else:
            analysis.append({
                "word": token,
                "pos": "unknown",
                "type": None,
                "case": None,
                "person": None,
                "number": None,
                "function": None
            })

    return {
        "sentence": sentence,
        "analysis": analysis,
        "word_order": "subject-verb-object",
        "translation": language  # Placeholder
    }
