/**
 * API Client
 * Functions for making requests to the backend API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  token?: string;
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const { method = "GET", body, headers = {}, token } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API request failed");
  }

  return response.json();
}

/**
 * Authentication APIs
 */
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest("/api/v1/auth/login", {
      method: "POST",
      body: { username, password },
    }),

  register: (username: string, email: string, password: string, preferredLanguage: string) =>
    apiRequest("/api/v1/auth/register", {
      method: "POST",
      body: { username, email, password, preferred_language: preferredLanguage },
    }),

  logout: () =>
    apiRequest("/api/v1/auth/logout", { method: "POST" }),

  refreshToken: (refreshToken: string) =>
    apiRequest("/api/v1/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    }),
};

/**
 * Wiki/Knowledge Base APIs
 */
export const wikiApi = {
  search: (params: Record<string, any>, token?: string) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/v1/wiki/search?${queryString}`, { token });
  },

  getWord: (wordId: string, token?: string) =>
    apiRequest(`/api/v1/wiki/words/${wordId}`, { token }),

  searchWords: (params: Record<string, any>, token?: string) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/v1/wiki/words/search?${queryString}`, { token });
  },

  getGrammarSections: (token?: string) =>
    apiRequest("/api/v1/wiki/grammar/sections", { token }),

  searchGrammar: (params: Record<string, any>, token?: string) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/v1/wiki/grammar/rules?${queryString}`, { token });
  },

  analyzeSentence: (data: { sentence: string; language: string }, token?: string) =>
    apiRequest("/api/v1/wiki/grammar/sentences/analyze", {
      method: "POST",
      body: data,
      token,
    }),

  translate: (text: string, from: string, to: string, pos?: string, context?: string, token?: string) => {
    const params: Record<string, string> = { text, from, to };
    if (pos) params.pos = pos;
    if (context) params.context = context;
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/v1/wiki/translate?${queryString}`, { token });
  },

  getRandomWord: (params: Record<string, any> = {}, token?: string) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/v1/wiki/words/random?${queryString}`, { token });
  },

  conjugateVerb: (data: { word: string; forms: string[] }, token?: string) =>
    apiRequest("/api/v1/wiki/words/conjugate", {
      method: "POST",
      body: data,
      token,
    }),

  getWordRelations: (wordId: string, token?: string) =>
    apiRequest(`/api/v1/wiki/words/${wordId}/relations`, { token }),
};

/**
 * Phonetics APIs
 */
export const phoneticsApi = {
  pronounce: (word: string, showStress: boolean = false, token?: string) => {
    const params = new URLSearchParams({ word, show_stress: showStress.toString() });
    return apiRequest(`/api/v1/phonetics/pronounce?${params}`, { token });
  },

  getRules: (token?: string) =>
    apiRequest("/api/v1/phonetics/rules", { token }),

  analyzePronunciation: (text: string, token?: string) =>
    apiRequest("/api/v1/phonetics/analyze", {
      method: "POST",
      body: { text },
      token,
    }),
};

/**
 * Morphology APIs
 */
export const morphologyApi = {
  getAffixes: (params: Record<string, any> = {}, token?: string) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/v1/morphology/affixes?${queryString}`, { token });
  },

  generateWord: (data: { root: string; affixes: string[] }, token?: string) =>
    apiRequest("/api/v1/morphology/generate", {
      method: "POST",
      body: data,
      token,
    }),

  analyzeWord: (word: string, token?: string) =>
    apiRequest(`/api/v1/morphology/analyze/${word}`, { token }),
};

/**
 * Etymology APIs
 */
export const etymologyApi = {
  getWordEtymology: (word: string, token?: string) =>
    apiRequest(`/api/v1/etymology/word?word=${encodeURIComponent(word)}`, { token }),

  getDerivationChain: (wordId: string, token?: string) =>
    apiRequest(`/api/v1/etymology/chain/${wordId}`, { token }),

  getRelatedWords: (wordId: string, token?: string) =>
    apiRequest(`/api/v1/etymology/related/${wordId}`, { token }),
};

/**
 * Chat APIs
 */
export const chatApi = {
  sendMessage: (message: string, context: any, token?: string) =>
    apiRequest("/api/v1/chat/message", {
      method: "POST",
      body: { message, context },
      token,
    }),
};

/**
 * User APIs
 */
export const userApi = {
  getProfile: (token: string) =>
    apiRequest("/api/v1/users/profile", { token }),

  updateProfile: (updates: any, token: string) =>
    apiRequest("/api/v1/users/profile", {
      method: "PUT",
      body: updates,
      token,
    }),

  deleteAccount: (token: string) =>
    apiRequest("/api/v1/users/account", {
      method: "DELETE",
      token,
    }),
};

/**
 * Forum (Valva) APIs
 */
export const forumApi = {
  getPosts: (params: Record<string, any> = {}, token?: string) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/v1/valva/posts?${queryString}`, { token });
  },

  getPost: (postId: string, token?: string) =>
    apiRequest(`/api/v1/valva/posts/${postId}`, { token }),

  createPost: (data: any, token: string) =>
    apiRequest("/api/v1/valva/posts", {
      method: "POST",
      body: data,
      token,
    }),

  updatePost: (postId: string, data: any, token: string) =>
    apiRequest(`/api/v1/valva/posts/${postId}`, {
      method: "PUT",
      body: data,
      token,
    }),

  deletePost: (postId: string, token: string) =>
    apiRequest(`/api/v1/valva/posts/${postId}`, {
      method: "DELETE",
      token,
    }),

  replyToPost: (postId: string, content: string, token: string) =>
    apiRequest(`/api/v1/valva/posts/${postId}/replies`, {
      method: "POST",
      body: { content },
      token,
    }),

  voteOnPost: (postId: string, voteType: string, token: string) =>
    apiRequest(`/api/v1/valva/posts/${postId}/vote`, {
      method: "POST",
      body: { vote_type: voteType },
      token,
    }),

  flagPost: (postId: string, token: string) =>
    apiRequest(`/api/v1/valva/posts/${postId}/flag`, {
      method: "POST",
      token,
    }),
};

export default {
  authApi,
  wikiApi,
  chatApi,
  userApi,
  forumApi,
};
