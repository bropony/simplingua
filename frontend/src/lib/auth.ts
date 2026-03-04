/**
 * Authentication / JWT Token Management
 */

const TOKEN_KEY = "simplingua_access_token";
const REFRESH_TOKEN_KEY = "simplingua_refresh_token";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Set authentication tokens
 */
export function setTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

/**
 * Clear authentication tokens
 */
export function clearTokens(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Get Authorization header value
 */
export function getAuthHeader(): { Authorization: string } | null {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export default {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAuthenticated,
  getAuthHeader,
};
