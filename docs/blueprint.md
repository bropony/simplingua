# Simplingua Project Blueprint

## Overview

Simplingua is a constructed language (conlang) platform that provides comprehensive tools for language learning, documentation, and community interaction. The system follows a secure two-tier architecture with clear separation of concerns and trust boundaries.

## Architecture Overview

```
Frontend (Next.js)
    ↓ [HTTP/HTTPS with Authentication]
Backend Server (FastAPI + LangGraph + PostgreSQL/pgvector)
```

### Trust Model
- **Frontend → Backend**: Untrusted boundary - requires authentication, authorization, rate limiting, and input validation
- **Backend**: Single unified service handling all business logic, AI orchestration, and data access

## Architecture Components

### 1. Backend Server (Unified Service)
**Purpose**: Unified service handling business logic, AI orchestration, authentication, and data management

**Technology Stack**:
- **FastAPI**: Web framework for API endpoints
- **LangGraph**: AI orchestration framework for building agent workflows
- **PostgreSQL**: Relational database with pgvector extension for vector storage
- **JWT**: Token-based authentication
- **Bcrypt**: Password hashing and validation
- **Provider-Agentic AI Interface**: Support for multiple AI providers with DeepSeek as default

**Network Access**:
- **External API**: Exposed to frontend (HTTPS)
- **Port**: 8000 (configurable)

**AI Provider Support**:
- **Chat Default**: DeepSeek (deepseek-chat, deepseek-coder models)
- **Embedding Default**: OpenAI (text-embedding-3-small) or SentenceTransformer (moka-ai/m3e-base for local)
- **Additional Chat Support**: OpenAI (GPT-4, GPT-4o), Anthropic Claude, local models (Ollama, LM Studio)
- **Additional Embedding Support**: DeepSeek (deepseek-embeddings), OpenAI, SentenceTransformer, local models
- **Provider Selection**: Configurable via environment variables and per-request settings

**API Endpoints** (Base URL: `/api/v1`):

#### Public APIs (No Authentication Required)

##### Information Retrieval
- **GET** `/api/v1/wiki/search`: Search knowledge base

  Query Parameters:
  ```
  ?query=<search_term>&type=<word|grammar|textbook>&lang=<language>&limit=<number>
  ```

  Response:
  ```json
  {
    "success": true,
    "results": [
      {
        "type": "word|grammar|textbook",
        "title": "string",
        "content": "string",
        "relevance": "number",
        "language": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "limit": "number",
      "offset": "number"
    }
  }
  ```

##### Word/Lexicon APIs (Enhanced for Conlang Learning)

- **GET** `/api/v1/words/search`: Comprehensive word search with linguistic context

  Query Parameters:
  ```
  ?q=<search_term>&pos=<part_of_speech>&verb_type=<他|自|系|情态|无>&language=<en|zh|es|fr|...>&has_derivatives=<boolean>&has_pronunciation=<boolean>&limit=<number>&offset=<number>
  ```

  Response:
  ```json
  {
    "success": true,
    "results": [
      {
        "id": "uuid",
        "word": "amate",
        "pos": "动",
        "verb_type": "他",
        "pronunciation": "/a.'ma.te/",
        "definitions": [
          {
            "meaning": "love; like",
            "language": "en",
            "examples": ["Mi ama ti.", "Ila ama chocolate."]
          }
        ],
        "derivatives": [
          {
            "type": "active_participle",
            "form": "amante",
            "gender_variants": ["amanta", "amanto"],
            "meaning": "lover; girlfriend/boyfriend"
          },
          {
            "type": "noun_form",
            "form": "amo",
            "meaning": "love"
          }
        ],
        "natural_prefix_derivatives": [
          {
            "prefix": "inter-",
            "form": "interama",
            "meaning": "interact; communicate"
          }
        ],
        "synonyms": ["vole", "fave"],
        "frequency": "high",
        "compound_marker": false,
        "gender_pair": null
      }
    ],
    "pagination": {
      "total": 123,
      "limit": 20,
      "offset": 0
    }
  }
  ```

- **GET** `/api/v1/words/{id}`: Get full word entry

  Response: Complete word entry with all linguistic fields

- **GET** `/api/v1/words/random`: Random word for learning exercises

  Query Parameters:
  ```
  ?pos=<part_of_speech>&difficulty=<beginner|intermediate|advanced>
  ```

- **POST** `/api/v1/words/conjugate`: Verb conjugation and forms

  Request:
  ```json
  {
    "word": "scriba",
    "forms": ["infinitive", "active_participle", "passive_participle"]
  }
  ```

  Response:
  ```json
  {
    "word": "scriba",
    "conjugations": {
      "infinitive": "scriba",
      "active_participle": "scribante",
      "passive_participle": "scribete",
      "noun_form": "scribido"
    },
    "examples": {
      "active_participle": "Mi ja vide un amante scribe un libro."
    }
  }
  ```

- **GET** `/api/v1/translate`: Context-aware translation

  Query Parameters:
  ```
  ?text=<text>&from=<sim|en|zh|...>&to=<sim|en|zh|...>&pos=<part_of_speech>&context=<context_string>
  ```

  Response:
  ```json
  {
    "text": "dance",
    "from": "en",
    "to": "sim",
    "translations": [
      {
        "word": "danza",
        "pos": "动",
        "verb_type": "自",
        "meaning": "to dance",
        "aspect": "present",
        "context": "as action"
      },
      {
        "word": "danza",
        "pos": "名",
        "meaning": "a dance",
        "gender": "feminine",
        "context": "as noun"
      }
    ],
    "examples": [
      "Mi danza in le sala.",
      "Le fema face un bela danza."
    ]
  }
  ```

- **GET** `/api/v1/words/{id}/relations`: Synonyms and antonyms

  Response:
  ```json
  {
    "synonyms": [
      { "word": "vole", "pos": "动", "nuance": "want; desire" },
      { "word": "fave", "pos": "动", "nuance": "like; favor" }
    ],
    "antonyms": [
      { "word": "ódia", "pos": "动", "meaning": "to hate" }
    ],
    "semantic_field": "emotions"
  }
  ```

##### Grammar APIs (Restructured with Hierarchy)

- **GET** `/api/v1/grammar/sections`: List grammar sections

  Response:
  ```json
  {
    "sections": [
      { "id": "nouns", "name": "名词", "order": 1 },
      { "id": "determiners", "name": "限定词", "order": 2 },
      { "id": "pronouns", "name": "代词", "order": 3 },
      { "id": "adjectives_adverbs", "name": "形容词和副词", "order": 4 },
      { "id": "verbs", "name": "动词", "order": 5 },
      { "id": "conjunctions", "name": "连词", "order": 6 },
      { "id": "prepositions", "name": "介词", "order": 7 },
      { "id": "numerals", "name": "数词", "order": 8 }
    ]
  }
  ```

- **GET** `/api/v1/grammar/rules`: Search grammar rules

  Query Parameters:
  ```
  ?section=<nouns|verbs|...>&subsection=<number|gender|aspects|...>&rule_type=<inflectional|syntactic|morphological|phonological>&language=<en|zh|...>&level=<beginner|intermediate|advanced>
  ```

  Response:
  ```json
  {
    "results": [
      {
        "id": "uuid",
        "section": "nouns",
        "subsection": "number",
        "name": "名词的数",
        "rule_type": "inflectional",
        "level": "beginner",
        "summary": "可数名词有复数形式，一般直接在名词后方加上-s",
        "content": "完整的语法规则内容...",
        "rules": [
          {
            "pattern": "noun + s",
            "example_from": "studente",
            "example_to": "studentes",
            "condition": "ends with vowel"
          }
        ],
        "exceptions": [
          { "word": "mater", "plural": "maters", "note": "-er结尾保持发音不变" }
        ],
        "cross_references": [
          { "section": "pronouns", "rule_id": "personal_pronouns", "relation": "related" }
        ],
        "examples": ["Mi ama flores.", "Un cate veni in nos domo."]
      }
    ]
  }
  ```

- **POST** `/api/v1/grammar/sentences/analyze`: Sentence grammatical analysis

  Request:
  ```json
  {
    "sentence": "Mi ama le fema.",
    "language": "zh"
  }
  ```

  Response:
  ```json
  {
    "sentence": "Mi ama le fema.",
    "analysis": [
      {
        "word": "Mi",
        "pos": "代词",
        "type": "personal_pronoun",
        "case": "nominative",
        "person": "first",
        "number": "singular",
        "function": "subject"
      },
      {
        "word": "ama",
        "pos": "动",
        "verb_type": "他",
        "tense": "present",
        "aspect": "current",
        "function": "predicate"
      },
      {
        "word": "le",
        "pos": "限",
        "type": "definite_article",
        "function": "determiner"
      },
      {
        "word": "fema",
        "pos": "名",
        "number": "singular",
        "gender": "feminine_natural",
        "function": "object"
      }
    ],
    "word_order": "subject-verb-object",
    "translation": "我爱那个女人。"
  }
  ```

##### Phonetics & Pronunciation APIs

- **GET** `/api/v1/phonetics/rules`: Phonological rules

  Response:
  ```json
  {
    "rules": [
      {
        "type": "consonant_softening",
        "description": "c, g + e, i = soft",
        "examples": [
          { "from": "c", "to": "/tʃ/", "condition": "before e or i" },
          { "from": "g", "to": "/dʒ/", "condition": "before e or i" }
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
  ```

- **GET** `/api/v1/phonetics/pronounce`: Get pronunciation

  Query Parameters:
  ```
  ?word=<word>&show_stress=<boolean>
  ```

  Response:
  ```json
  {
    "word": "maters",
    "ipa": "ma.'tərs",
    "stress_marked": "máters",
    "syllables": ["ma", "ters"],
    "stress_pattern": "penultimate"
  }
  ```

##### Morphology & Word Formation APIs

- **GET** `/api/v1/morphology/affixes`: Affix reference

  Query Parameters:
  ```
  ?type=<prefix|suffix|infix>&category=<verb_forming|noun_forming|adjective_forming|...>
  ```

  Response:
  ```json
  {
    "affixes": [
      {
        "affix": "-nte",
        "type": "suffix",
        "category": "verb_forming",
        "meaning": "active participle (doing)",
        "produces_pos": "形",
        "examples": [
          { "base": "ama", "derived": "amante", "meaning": "loving" },
          { "base": "scribe", "derived": "scribante", "meaning": "writing" }
        ]
      },
      {
        "affix": "-te",
        "type": "suffix",
        "category": "verb_forming",
        "meaning": "passive participle (done)",
        "produces_pos": "形",
        "examples": [
          { "base": "scribe", "derived": "scribete", "meaning": "written" }
        ]
      }
    ]
  }
  ```

- **POST** `/api/v1/morphology/generate`: Generate word from affixes

  Request:
  ```json
  {
    "root": "bele",
    "affixes": ["-eza"],
    "type": "noun_from_adjective"
  }
  ```

  Response:
  ```json
  {
    "result": "beleza",
    "valid": true,
    "meaning": "beauty",
    "rule_applied": "adjective + eza = abstract noun of quality"
  }
  ```

##### Etymology APIs

- **GET** `/api/v1/words/{id}/etymology`: Word derivation chain

  Response:
  ```json
  {
    "word": "interage",
    "root": "age",
    "derivation_chain": [
      { "form": "age", "type": "base_verb", "meaning": "to act" },
      { "form": "interage", "type": "prefix_deriv", "prefix": "inter-", "meaning": "interact" }
    ],
    "related_words": ["age", "reacta", "agente", "agenda"]
  }
  ```

##### AI Chat Interface
- **POST** `/api/v1/chat/message`: Send message to chatbot

  Request:
  ```json
  {
    "message": "string",
    "context": {
      "language": "string",
      "conversationId": "string",
      "aiProvider": "deepseek|openai|anthropic|local"
    }
  }
  ```

  Response (Server-Sent Events):
  ```json
  {
    "type": "message|thinking|done",
    "content": "string",
    "conversationId": "string",
    "timestamp": "string"
  }
  ```

#### Authenticated APIs (JWT Required)

##### Authentication & User Management
- **POST** `/api/v1/auth/register`: User registration

  Request:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "preferredLanguage": "string"
  }
  ```

  Response:
  ```json
  {
    "success": true,
    "user": {
      "id": "string",
      "username": "string",
      "role": "user"
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string",
      "expiresIn": "number"
    }
  }
  ```

- **POST** `/api/v1/auth/login`: User authentication
- **POST** `/api/v1/auth/logout`: User logout
- **POST** `/api/v1/auth/refresh`: Refresh access token
- **GET** `/api/v1/users/profile`: Get user profile
- **PUT** `/api/v1/users/profile`: Update user profile
- **DELETE** `/api/v1/users/account`: Delete user account

##### Forum (Valva) - Authenticated Operations
- **GET** `/api/v1/valva/posts`: List forum posts with filtering

  Query Parameters:
  ```
  ?category=<category>&author=<username>&tags=<tag1,tag2>&limit=<number>&offset=<number>
  ```

- **POST** `/api/v1/valva/posts`: Create new forum post

  Request:
  ```json
  {
    "title": "string",
    "content": "string",
    "category": "string",
    "tags": ["string"],
    "language": "string"
  }
  ```

- **GET** `/api/v1/valva/posts/{id}`: Get specific post with replies
- **PUT** `/api/v1/valva/posts/{id}`: Update post (author/moderator only)
- **DELETE** `/api/v1/valva/posts/{id}`: Delete post (author/moderator only)
- **POST** `/api/v1/valva/posts/{id}/replies`: Reply to post
- **POST** `/api/v1/valva/posts/{id}/vote`: Vote on post
- **POST** `/api/v1/valva/posts/{id}/flag`: Flag inappropriate content

#### Administrative APIs (Admin/Super Roles)

##### Content Management (Enhanced)
- **POST** `/api/v1/admin/words`: Add/update word entries

  Request:
  ```json
  {
    "entries": [
      {
        "word": "amate",
        "pos": "动",
        "verb_type": "他",
        "pronunciation": "/a.'ma.te/",
        "direction": "sim2zh",
        "definitions": [
          {
            "meaning": "love; like",
            "language": "en",
            "examples": ["Mi ama ti.", "Ila ama chocolate."]
          }
        ],
        "synonyms": ["vole", "fave"],
        "antonyms": ["ódia"],
        "frequency": "high"
      }
    ]
  }
  ```

- **DELETE** `/api/v1/admin/words/{id}`: Delete word entry
- **POST** `/api/v1/admin/words/{id}/derivatives`: Add word derivatives

  Request:
  ```json
  {
    "derivative_word": "amante",
    "derivative_type": "active_participle",
    "gender_variants": ["amanta", "amanto"],
    "meaning": "lover",
    "examples": [
      { "simplingua": "Mi vide un amante scribe.", "translation": "I see a lover writing." }
    ]
  }
  ```

- **POST** `/api/v1/admin/words/{id}/etymology`: Add etymology data

  Request:
  ```json
  {
    "root_word": "age",
    "derivation_chain": [
      { "form": "age", "type": "base_verb", "meaning": "to act" },
      { "form": "interama", "type": "prefix_deriv", "prefix": "inter-", "meaning": "interact" }
    ],
    "related_words": ["age", "reacta", "agente", "agenda"]
  }
  ```

- **POST** `/api/v1/admin/grammar`: Add/update grammar entries

  Request:
  ```json
  {
    "entries": [
      {
        "section_id": "nouns",
        "subsection_id": "number",
        "name": "名词的数",
        "rule_type": "inflectional",
        "level": "beginner",
        "summary": "可数名词有复数形式",
        "content": "完整的语法规则内容...",
        "rules": [
          {
            "pattern": "noun + s",
            "example_from": "studente",
            "example_to": "studentes",
            "condition": "ends with vowel"
          }
        ],
        "exceptions": [
          { "word": "mater", "plural": "maters", "note": "-er结尾保持发音不变" }
        ],
        "cross_references": [
          { "section": "pronouns", "rule_id": "personal_pronouns", "relation": "related" }
        ],
        "examples": ["Mi ama flores.", "Un cate veni in nos domo."]
      }
    ]
  }
  ```

- **DELETE** `/api/v1/admin/grammar/{id}`: Delete grammar entry
- **POST** `/api/v1/admin/textbooks`: Add/update textbooks
- **DELETE** `/api/v1/admin/textbooks/{id}`: Delete textbook
- **POST** `/api/v1/admin/content/approve`: Approve pending content
- **POST** `/api/v1/admin/content/reject`: Reject pending content
- **POST** `/api/v1/admin/affixes`: Add morphology affix

  Request:
  ```json
  {
    "affix": "-nte",
    "type": "suffix",
    "category": "verb_forming",
    "meaning": "active participle (doing)",
    "produces_pos": "形",
    "examples": [
      { "base": "ama", "derived": "amante", "meaning": "loving" },
      { "base": "scribe", "derived": "scribante", "meaning": "writing" }
    ]
  }
  ```

##### User Administration
- **GET** `/api/v1/admin/users`: List users with filtering
- **PUT** `/api/v1/admin/users/{id}/role`: Change user role (super only)
- **PUT** `/api/v1/admin/users/{id}/status`: Update user status
- **GET** `/api/v1/admin/analytics`: System usage analytics
- **POST** `/api/v1/admin/backup`: Create system backup

### 2. Frontend (Presentation Layer)
**Purpose**: User interface and client-side application

**Technology Stack**:
- **Next.js**: React framework with SSR/SSG
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first styling
- **SSE (Server-Sent Events)**: Real-time chat interface streaming

**Security Features**:
- **JWT Token Management**: Automatic token refresh and storage
- **Input Validation**: Client-side validation before API calls
- **XSS Protection**: Content sanitization and CSP headers
- **Rate Limiting Display**: User feedback for rate-limited requests

## LangGraph AI Orchestration

### Architecture

The backend uses **LangGraph** to orchestrate AI interactions in a structured, stateful manner:

```
User Request
    ↓
LangGraph State Management
    ↓
┌─────────────────────────────────────┐
│  1. Intent Analysis Agent          │  ← Analyzes user intent
├─────────────────────────────────────┤
│  2. Knowledge Retrieval Agent      │  ← Queries PostgreSQL/pgvector
├─────────────────────────────────────┤
│  3. Response Generation Agent      │  ← Calls AI Provider (default: DeepSeek)
├─────────────────────────────────────┤
│  4. Response Validation Agent      │  ← Validates response quality
└─────────────────────────────────────┘
    ↓
Formatted Response to User
```

### LangGraph State

```typescript
interface ChatState {
  messages: Message[];
  conversationId: string;
  language: string;
  aiProvider: 'deepseek' | 'openai' | 'anthropic' | 'local';
  retrievedContext?: Context[];
  intent?: Intent;
  needsClarification: boolean;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface Context {
  type: 'word' | 'grammar' | 'textbook';
  id: string;
  relevanceScore: number;
  content: string;
}

interface Intent {
  type: 'translation' | 'explanation' | 'example' | 'practice' | 'general';
  keywords: string[];
  confidence: number;
}
```

### AI Provider Configuration

```python
# Chat AI Provider Configuration (environment variables)
CHAT_AI_DEFAULT_PROVIDER="deepseek"  # Default chat provider
AI_DEEPSEEK_API_KEY="your_deepseek_key"
AI_DEEPSEEK_MODEL="deepseek-chat"
AI_OPENAI_API_KEY="your_openai_key"  # Optional
AI_OPENAI_MODEL="gpt-4o"  # Optional
AI_ANTHROPIC_API_KEY="your_anthropic_key"  # Optional
AI_ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"  # Optional
AI_LOCAL_BASE_URL="http://localhost:11434"  # For Ollama, optional
AI_LOCAL_MODEL="llama3.2"  # For local models, optional

# Embedding AI Provider Configuration (environment variables)
EMBEDDING_AI_DEFAULT_PROVIDER="openai"  # Default embedding provider
# DeepSeek embeddings
EMBEDDING_DEEPSEEK_MODEL="deepseek-embeddings"
EMBEDDING_DEEPSEEK_DIMENSION=1024
# OpenAI embeddings
EMBEDDING_OPENAI_MODEL="text-embedding-3-small"
EMBEDDING_OPENAI_DIMENSION=1536
# SentenceTransformer (local models)
EMBEDDING_SENTENCETRANSFORMER_MODEL="moka-ai/m3e-base"
EMBEDDING_SENTENCETRANSFORMER_DIMENSION=768
# Local embeddings (Ollama, LM Studio)
EMBEDDING_LOCAL_MODEL="nomic-embed-text"
EMBEDDING_LOCAL_DIMENSION=768
```

### Provider-Agentic Interface

```python
# Abstract provider interface for LangGraph integration
class AIProvider(Protocol):
    async def generate(self, messages: List[Message], **kwargs) -> AsyncIterator[str]:
        """Generate streaming response"""
        pass

    async def embed(self, text: str) -> List[float]:
        """Generate embedding for vector search"""
        pass

# Concrete implementations for each chat provider
class DeepSeekProvider(AIProvider): ...
class OpenAIProvider(AIProvider): ...
class AnthropicProvider(AIProvider): ...
class LocalProvider(AIProvider): ...

# Concrete implementations for each embedding provider
class DeepSeekEmbeddingProvider: ...
class OpenAIEmbeddingProvider: ...
class SentenceTransformerEmbeddingProvider: ...
class LocalEmbeddingProvider: ...

# Chat provider factory
def get_provider(provider_name: str) -> AIProvider:
    """Get AI chat provider instance by name"""
    providers = {
        'deepseek': DeepSeekProvider,
        'openai': OpenAIProvider,
        'anthropic': AnthropicProvider,
        'local': LocalProvider,
    }
    return providers[provider_name]()

# Embedding provider factory
def get_embedding_provider(provider_name: str = None) -> EmbeddingProvider:
    """Get embedding provider instance by name"""
    if provider_name is None:
        provider_name = settings.EMBEDDING_AI_DEFAULT_PROVIDER
    providers = {
        'deepseek': DeepSeekEmbeddingProvider,
        'openai': OpenAIEmbeddingProvider,
        'sentencetransformer': SentenceTransformerEmbeddingProvider,
        'local': LocalEmbeddingProvider,
    }
    return providers[provider_name]()

# Get embedding dimension for a provider
def get_embedding_dimension(provider_name: str = None) -> int:
    """Get the dimension of embedding vectors for a provider"""
    ...
```

## Security Implementation

### Authentication Flow
1. **User Registration/Login** → Backend validates credentials → JWT tokens issued
2. **API Requests** → Backend validates JWT → Authorized requests processed
3. **Token Refresh** → Automatic renewal before expiration

### Input Validation & Sanitization
- **Frontend**: Client-side validation for UX
- **Backend**: Server-side validation and sanitization using Pydantic models
- **Database**: Type validation via SQLAlchemy ORM

### Rate Limiting
- **Per-User Limits**: Authenticated users get higher limits
- **Per-IP Limits**: Anonymous users have stricter limits
- **API Endpoint Limits**: Different limits per endpoint type

### Authorization Levels
1. **Anonymous**: Wiki browsing, chat (limited), public forum reading
2. **User**: Full forum access, profile management, unlimited chat
3. **Moderator**: Content moderation, user warnings
4. **Admin**: Content management, user management
5. **Super**: System administration, backup/restore

## Data Models (PostgreSQL + pgvector)

### User Schema
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'super')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
    preferred_language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    bio TEXT,
    website VARCHAR(255),
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Word Entries Schema (Enhanced)
```sql
CREATE TABLE words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word VARCHAR(200) NOT NULL,
    pos VARCHAR(50) NOT NULL,  -- Part of speech: 名|动|形|副|数|介|代|限|连|呼|组
    verb_type VARCHAR(20),  -- {他}|{自}|{系}|{情态}|{无} for verbs only
    pronunciation VARCHAR(200),  -- IPA transcription
    direction VARCHAR(20) NOT NULL,  -- cn2sim, en2sim, sim2cn, etc.
    description TEXT NOT NULL,
    definitions JSONB,  -- Multiple definitions with language support
    examples TEXT[],  -- Array of example sentences
    synonyms TEXT[],  -- Related words with similar meaning
    antonyms TEXT[],  -- Words with opposite meaning
    frequency VARCHAR(20) DEFAULT 'medium',  -- high|medium|low
    compound_marker BOOLEAN DEFAULT FALSE,  -- Marked with <> in dictionary
    gender_pair JSONB,  -- ⟨vilana, vilano⟩ format for natural gender
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected')),
    approved_by UUID REFERENCES users(id),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector embedding for semantic search
ALTER TABLE words ADD COLUMN embedding vector(1536);
CREATE INDEX idx_words_embedding ON words USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_words_word ON words(word);
CREATE INDEX idx_words_pos ON words(pos);
CREATE INDEX idx_words_direction ON words(direction);
CREATE INDEX idx_words_pronunciation ON words(pronunciation);
CREATE INDEX idx_words_frequency ON words(frequency);

-- Derivatives table (for morphological relationships)
CREATE TABLE word_derivatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    derivative_word VARCHAR(200) NOT NULL,
    derivative_type VARCHAR(50) NOT NULL,  -- active_participle|passive_participle|noun_form|adjective_form|prefix_deriv|suffix_deriv
    gender_variants JSONB,  -- For gender-specific forms: ["amanta", "amanto"]
    meaning TEXT,
    examples JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_derivatives_word ON word_derivatives(word_id);
CREATE INDEX idx_derivatives_type ON word_derivatives(derivative_type);

-- Etymology table
CREATE TABLE word_etymology (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    derivation_chain JSONB,  -- Ordered list of derivation steps
    root_word VARCHAR(200),
    related_words TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_etymology_word ON word_etymology(word_id);
```

### Grammar Entries Schema (Restructured)
```sql
CREATE TABLE grammar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id VARCHAR(100) NOT NULL,  -- nouns|verbs|determiners|pronouns|...
    subsection_id VARCHAR(100),  -- number|gender|aspects|mood|...
    name VARCHAR(200) NOT NULL,
    rule_type VARCHAR(50),  -- inflectional|syntactic|morphological|phonological
    level VARCHAR(20) DEFAULT 'beginner',  -- beginner|intermediate|advanced
    language VARCHAR(10) NOT NULL,  -- Documentation language
    category VARCHAR(100),
    summary TEXT,  -- Brief explanation
    content TEXT NOT NULL,
    rules JSONB,  -- Pattern-based rules with examples
    exceptions JSONB,  -- Irregular forms
    cross_references JSONB,  -- Related grammar concepts
    examples TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected')),
    approved_by UUID REFERENCES users(id),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector embedding for semantic search
ALTER TABLE grammar ADD COLUMN embedding vector(1536);
CREATE INDEX idx_grammar_embedding ON grammar USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_grammar_section ON grammar(section_id);
CREATE INDEX idx_grammar_subsection ON grammar(subsection_id);
CREATE INDEX idx_grammar_rule_type ON grammar(rule_type);
CREATE INDEX idx_grammar_level ON grammar(level);
CREATE INDEX idx_grammar_name ON grammar(name);
CREATE INDEX idx_grammar_language ON grammar(language);

-- Grammar sections reference table
CREATE TABLE grammar_sections (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    order_num INTEGER NOT NULL
);

INSERT INTO grammar_sections (id, name, order_num) VALUES
('nouns', '名词', 1),
('determiners', '限定词', 2),
('pronouns', '代词', 3),
('adjectives_adverbs', '形容词和副词', 4),
('verbs', '动词', 5),
('non_finite_verbs', '非谓语动词', 6),
('copula_existential', '系动词与存现动词', 7),
('conjunctions', '连词', 8),
('prepositions', '介词', 9),
('numerals', '数词', 10),
('sentence_structure', '句子的组成', 11),
('word_order', '语序', 12),
('indirect_objects', '间接宾语', 13),
('noun_clauses', '名词性从句', 14),
('complements', '补语', 15),
('questions', '疑问句', 16),
('time_expression', '时间的表达', 17),
('adverbial_clauses', '状语从句', 18),
('relative_clauses', '定语从句', 19),
('conditionals', '假设的表达', 20),
('word_formation', '构词法', 21);

-- Morphology affixes table
CREATE TABLE morphology_affixes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affix VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,  -- prefix|suffix|infix
    category VARCHAR(50),  -- verb_forming|noun_forming|adjective_forming|...
    meaning TEXT,
    produces_pos VARCHAR(50),
    examples JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_affixes_type ON morphology_affixes(type);
CREATE INDEX idx_affixes_category ON morphology_affixes(category);
```

### Textbook Entries Schema
```sql
CREATE TABLE textbooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    author VARCHAR(200),
    language VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,  -- Full textbook content
    chapters JSONB,  -- Structured chapter data
    date_published DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected')),
    approved_by UUID REFERENCES users(id),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector embedding for semantic search
ALTER TABLE textbooks ADD COLUMN embedding vector(1536);
CREATE INDEX idx_textbooks_embedding ON textbooks USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_textbooks_title ON textbooks(title);
CREATE INDEX idx_textbooks_author ON textbooks(author);
```

### Forum Posts Schema
```sql
CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    tags TEXT[],
    language VARCHAR(10) NOT NULL,
    parent_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,  -- For replies
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'locked', 'deleted', 'flagged')),
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    flag_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector embedding for semantic search
ALTER TABLE forum_posts ADD COLUMN embedding vector(1536);
CREATE INDEX idx_forum_posts_embedding ON forum_posts USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_posts_parent ON forum_posts(parent_id);
CREATE INDEX idx_forum_posts_tags ON forum_posts USING GIN(tags);

-- Votes table
CREATE TABLE forum_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_forum_votes_post ON forum_votes(post_id);
CREATE INDEX idx_forum_votes_user ON forum_votes(user_id);
```

### Analytics Schema
```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
```

## Deployment Architecture

### Development Environment
```yaml
# docker-compose.dev.yml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      - POSTGRES_DB=simplingua_dev
      - POSTGRES_USER=simplingua
      - POSTGRES_PASSWORD=dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - internal

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ENV=development
      - DATABASE_URL=postgresql://simplingua:dev_password@postgres:5432/simplingua_dev
      - JWT_SECRET=dev_secret_change_in_production
      - AI_DEFAULT_PROVIDER=deepseek
      - AI_DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
    depends_on:
      - postgres
    networks:
      - internal
      - external

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    networks:
      - external

volumes:
  postgres_data:

networks:
  internal:
    driver: bridge
  external:
    driver: bridge
```

### Production Environment
- **Backend**: Containerized service behind reverse proxy (nginx/caddy) with SSL termination
- **Frontend**: CDN deployment (Vercel/Netlify) or static hosting
- **PostgreSQL**: Managed database service (RDS, Supabase, Neon) with automated backups
- **Monitoring**: Prometheus + Grafana for metrics collection
- **Scaling**: Horizontal scaling of backend instances with connection pooling

## Security Considerations

### Network Security
- **SSL/TLS**: All external communication encrypted
- **CORS**: Properly configured CORS headers
- **Rate Limiting**: Prevent abuse and DoS attacks

### Data Protection
- **Encryption**: Passwords hashed with bcrypt
- **Backups**: Automated encrypted backups with key rotation
- **Privacy Controls**: GDPR-compliant data export/deletion
- **SQL Injection Prevention**: Parameterized queries via SQLAlchemy

### Application Security
- **Input Validation**: Multi-layer validation (frontend, backend via Pydantic, database)
- **XSS Protection**: Content sanitization and CSP headers
- **CSRF Protection**: Token-based CSRF protection for state-changing operations
- **API Key Management**: Secure storage of AI provider API keys via environment variables

### Monitoring & Alerting
- **Failed Authentication Attempts**: Monitor and alert on suspicious activity
- **API Rate Limiting**: Track and alert on unusual usage patterns
- **Error Logging**: Comprehensive error tracking and alerting
- **Performance Monitoring**: Response time and resource usage tracking
- **AI Provider Monitoring**: Track API costs and response times per provider

## Development Roadmap

### Phase 1: Core Infrastructure ✅
- PostgreSQL with pgvector setup
- Basic FastAPI backend structure
- LangGraph agent workflow implementation
- AI provider abstraction layer with DeepSeek as default

### Phase 2: User Interface 🚧
- Next.js frontend implementation
- Chat interface with SSE streaming
- Wiki browsing functionality
- User authentication UI

### Phase 3: Community Features 📋
- Forum implementation (Valva)
- User profile management
- Content moderation tools
- Advanced content management

### Phase 4: Enhancements 📋
- Mobile application support
- Advanced search capabilities with RAG
- Analytics and usage reporting
- Multi-modal content support (audio, images)
- Additional AI provider integrations (if needed)

## Monitoring & Maintenance

### Logging
- Comprehensive API request logging
- LangGraph agent state tracking
- AI interaction and cost tracking
- Error monitoring and alerting

### Performance Metrics
- Response time monitoring
- Database query optimization
- AI provider latency tracking
- User engagement analytics

### Content Quality Assurance
- Automated content validation
- Community moderation tools
- Regular linguistic accuracy reviews
- Vector embedding quality monitoring
