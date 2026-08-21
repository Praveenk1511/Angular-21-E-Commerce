import type { User } from './user.model';

// ============================================================================
// Request payloads
// ============================================================================

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface RegisterRequest {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
  readonly marketingOptIn: boolean;
}

export interface ForgotPasswordRequest {
  readonly email: string;
}

export interface ResetPasswordRequest {
  readonly token: string;
  readonly password: string;
}

// ============================================================================
// Response payloads
// ============================================================================

/**
 * Successful authentication response.
 *
 * The token is opaque to the client: it is stored and sent back, but never parsed.
 * In the mock it is a randomly generated string; in a real backend it would be a JWT
 * or session reference.
 */
export interface AuthResponse {
  readonly user: User;
  readonly token: string;
  /** ISO 8601 when the token ceases to be valid. */
  readonly expiresAt: string;
}

/** Confirmation returned by the forgot-password endpoint. */
export interface ForgotPasswordResponse {
  readonly message: string;
}

/** Confirmation returned by the reset-password endpoint. */
export interface ResetPasswordResponse {
  readonly message: string;
}

// ============================================================================
// Client-side session
// ============================================================================

/**
 * Locally persisted session state.
 *
 * Written to `localStorage` on login, read back on app start to restore the session
 * without a re-login, and deleted on logout. Only the token and expiry are stored;
 * the full user profile is fetched fresh via `GET /auth/me` so a stale name or role
 * cannot linger on a device.
 */
export interface StoredSession {
  readonly token: string;
  readonly expiresAt: string;
}
