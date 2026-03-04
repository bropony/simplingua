/**
 * TypeScript Type Definitions
 */

// User
export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "moderator" | "admin" | "super";
  preferred_language: string;
  theme: "light" | "dark" | "auto";
  bio?: string;
  website?: string;
  avatar_url?: string;
  join_date: string;
  last_login?: string;
}

// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  preferred_language: string;
}

// Word
export interface Word {
  id: string;
  word: string;
  pos: string;
  verb_type?: string;
  pronunciation?: string;
  definitions: WordDefinition[];
  examples: string[];
  derivatives: WordDerivative[];
  natural_prefix_derivatives: WordDerivative[];
  synonyms: string[];
  antonyms: string[];
  frequency: "high" | "medium" | "low";
  compound_marker: boolean;
  gender_pair?: {
    feminine?: string;
    masculine?: string;
  };
}

export interface WordDefinition {
  meaning: string;
  language: string;
  examples?: string[];
}

export interface WordDerivative {
  derivative_word: string;
  derivative_type: string;
  gender_variants?: string[];
  meaning?: string;
  examples?: Record<string, string>;
}

// Grammar
export interface GrammarRule {
  id: string;
  section_id: string;
  subsection_id?: string;
  name: string;
  rule_type?: string;
  level: string;
  summary?: string;
  content: string;
  rules?: any[];
  exceptions?: GrammarException[];
  cross_references?: any[];
  examples: string[];
}

export interface GrammarSection {
  id: string;
  name: string;
  order: number;
}

export interface GrammarException {
  word?: string;
  plural?: string;
  note?: string;
}

// Forum
export interface ForumPost {
  id: string;
  title?: string;
  content: string;
  author_id: string;
  author_username?: string;
  category: string;
  tags: string[];
  language: string;
  parent_id?: string;
  status: string;
  view_count: number;
  reply_count: number;
  vote_score: number;
  user_vote?: string;
  created_at: string;
  last_modified?: string;
}

export interface ForumReply {
  content: string;
}

export interface Vote {
  vote_type: "up" | "down";
}

// Chat
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export interface ChatContext {
  language: string;
  conversation_id?: string;
  ai_provider: "deepseek" | "openai" | "anthropic" | "local";
}

export interface ChatEvent {
  type: "message" | "thinking" | "done" | "error";
  content: string;
  conversation_id?: string;
  timestamp?: string;
}

export type ChatEventType = ChatEvent["type"];

// Phonetics
export interface PronunciationResponse {
  word: string;
  ipa: string;
  stress_marked?: string;
  syllables: string[];
  stress_pattern: string;
}

export interface PhoneticsRule {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

// Morphology
export interface Affix {
  id: string;
  affix: string;
  type: "prefix" | "suffix" | "infix";
  meaning: string;
  position: "before" | "after" | "middle";
}

export interface WordGeneration {
  result: string;
  valid: boolean;
  meaning: string;
  rule_applied?: string;
  alternatives?: string[];
}

export interface WordAnalysis {
  word: string;
  root?: string;
  affixes: Affix[];
  meaning?: string;
}

// Etymology
export interface Etymology {
  word: string;
  root: string;
  derivation_chain: WordDerivative[];
  related_words: string[];
}

// Wiki Search
export interface WikiSearchResult {
  type: "word" | "grammar";
  id: string;
  title: string;
  content: string;
  score: number;
}

export interface WikiSearchResults {
  results: WikiSearchResult[];
  total: number;
}
