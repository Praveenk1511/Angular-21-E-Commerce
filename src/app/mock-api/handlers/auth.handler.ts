import type {
  AuthResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  User,
} from '@core/models';
import { CREDENTIAL_SEEDS, USER_SEEDS } from '@mock-data/index';

import { type MockRoute, conflict, created, notFound, ok, unprocessable } from '../mock-api.types';
import type { ApiFieldError } from '@core/models';

/**
 * Session state: tokens issued during the current runtime.
 *
 * Kept module-level so it resets on reload — a deliberate choice, because a
 * localStorage token that outlives the mock session causes confusing stale states.
 * The real session persistence lives in the client's AuthStore.
 */
let sessions: Map<string, string> | null = null;

function sessionStore(): Map<string, string> {
  sessions ??= new Map<string, string>();

  return sessions;
}

/** Newly registered users created during this session. */
let registeredUsers: User[] | null = null;

function registered(): User[] {
  registeredUsers ??= [];

  return registeredUsers;
}

/** Tokens issued for password resets. Maps token → email. */
let resetTokens: Map<string, string> | null = null;

function resets(): Map<string, string> {
  resetTokens ??= new Map<string, string>();

  return resetTokens;
}

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MIN_PASSWORD_LENGTH = 8;

export function createAuthRoutes(): readonly MockRoute[] {
  return [
    {
      method: 'POST',
      path: '/auth/login',
      handle: ({ body }) => {
        const payload = (body ?? {}) as Record<string, unknown>;
        const email = String(payload['email'] ?? '')
          .trim()
          .toLowerCase();
        const password = String(payload['password'] ?? '');

        const errors = validateLogin(email, password);
        if (errors.length > 0) {
          throw unprocessable('Please correct the errors below.', errors);
        }

        const credential = CREDENTIAL_SEEDS.find((c) => c.email.toLowerCase() === email);

        if (!credential || credential.password !== password) {
          throw unprocessable('Please correct the errors below.', [
            { field: 'email', message: 'Invalid email address or password.' },
          ]);
        }

        const user = findUser(credential.userId);
        if (!user) {
          throw notFound('Account not found.');
        }

        if (user.status === 'suspended') {
          throw conflict(
            'ACCOUNT_SUSPENDED',
            'This account has been suspended. Please contact support.',
          );
        }

        if (user.status === 'invited') {
          throw conflict(
            'ACCOUNT_NOT_ACTIVATED',
            'This account has not been activated yet. Check your email for an activation link.',
          );
        }

        return ok(issueSession(user));
      },
    },

    {
      method: 'POST',
      path: '/auth/register',
      handle: ({ body }) => {
        const payload = (body ?? {}) as Record<string, unknown>;
        const firstName = String(payload['firstName'] ?? '').trim();
        const lastName = String(payload['lastName'] ?? '').trim();
        const email = String(payload['email'] ?? '')
          .trim()
          .toLowerCase();
        const password = String(payload['password'] ?? '');
        const marketingOptIn = Boolean(payload['marketingOptIn']);

        const errors = validateRegister(firstName, lastName, email, password);
        if (errors.length > 0) {
          throw unprocessable('Please correct the errors below.', errors);
        }

        if (emailTaken(email)) {
          throw conflict('EMAIL_TAKEN', 'An account with this email address already exists.');
        }

        const user: User = {
          id: `usr-new-${Date.now()}`,
          email,
          firstName,
          lastName,
          role: 'customer',
          status: 'active',
          phone: null,
          createdAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
          orderCount: 0,
          marketingOptIn,
        };

        registered().push(user);

        return created(issueSession(user));
      },
    },

    {
      method: 'POST',
      path: '/auth/logout',
      handle: ({ body }) => {
        const payload = (body ?? {}) as Record<string, unknown>;
        const token = String(payload['token'] ?? '');

        sessionStore().delete(token);

        return ok({ message: 'Signed out successfully.' });
      },
    },

    {
      method: 'GET',
      path: '/auth/me',
      handle: ({ request }) => {
        const token = extractToken(request.headers.get('Authorization'));
        const userId = token ? sessionStore().get(token) : undefined;

        if (!userId) {
          throw notFound('No active session.');
        }

        const user = findUser(userId);
        if (!user) {
          throw notFound('Account not found.');
        }

        return ok(user);
      },
    },

    {
      method: 'POST',
      path: '/auth/forgot-password',
      handle: ({ body }) => {
        const payload = (body ?? {}) as Record<string, unknown>;
        const email = String(payload['email'] ?? '')
          .trim()
          .toLowerCase();

        if (!email || !email.includes('@')) {
          throw unprocessable('Please correct the errors below.', [
            { field: 'email', message: 'Enter a valid email address.' },
          ]);
        }

        // Always return success — revealing whether an email exists is an information
        // leak that real password reset endpoints avoid.
        const token = generateToken();

        // Only store a token if the email actually exists — a real system would send
        // an email; the mock just records the token for the reset endpoint to accept.
        if (emailExists(email)) {
          resets().set(token, email);
        }

        const response: ForgotPasswordResponse = {
          message: `If an account exists for ${email}, a password reset link has been sent.`,
        };

        return ok(response);
      },
    },

    {
      method: 'POST',
      path: '/auth/reset-password',
      handle: ({ body }) => {
        const payload = (body ?? {}) as Record<string, unknown>;
        const token = String(payload['token'] ?? '').trim();
        const password = String(payload['password'] ?? '');

        const errors: ApiFieldError[] = [];

        if (!token) {
          errors.push({ field: 'token', message: 'The reset token is missing or invalid.' });
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
          errors.push({
            field: 'password',
            message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
          });
        }

        if (errors.length > 0) {
          throw unprocessable('Please correct the errors below.', errors);
        }

        const email = resets().get(token);
        if (!email) {
          throw conflict(
            'INVALID_RESET_TOKEN',
            'This password reset link has expired or has already been used.',
          );
        }

        // Consume the token so it cannot be reused.
        resets().delete(token);

        const response: ResetPasswordResponse = {
          message: 'Your password has been reset. You can now sign in with the new password.',
        };

        return ok(response);
      },
    },
  ];
}

// ============================================================================
// Helpers
// ============================================================================

function findUser(userId: string): User | undefined {
  return (
    USER_SEEDS.find((user) => user.id === userId) ?? registered().find((user) => user.id === userId)
  );
}

function emailTaken(email: string): boolean {
  return (
    USER_SEEDS.some((user) => user.email.toLowerCase() === email) ||
    registered().some((user) => user.email.toLowerCase() === email)
  );
}

function emailExists(email: string): boolean {
  return emailTaken(email);
}

function issueSession(user: User): AuthResponse {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  sessionStore().set(token, user.id);

  return { user, token, expiresAt };
}

function extractToken(header: string | null): string | undefined {
  if (!header?.startsWith('Bearer ')) {
    return undefined;
  }

  return header.slice(7).trim() || undefined;
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function validateLogin(email: string, password: string): readonly ApiFieldError[] {
  const errors: ApiFieldError[] = [];

  if (!email) {
    errors.push({ field: 'email', message: 'Enter your email address.' });
  } else if (!email.includes('@')) {
    errors.push({ field: 'email', message: 'Enter a valid email address.' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Enter your password.' });
  }

  return errors;
}

function validateRegister(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): readonly ApiFieldError[] {
  const errors: ApiFieldError[] = [];

  if (!firstName) {
    errors.push({ field: 'firstName', message: 'Enter your first name.' });
  }

  if (!lastName) {
    errors.push({ field: 'lastName', message: 'Enter your last name.' });
  }

  if (!email) {
    errors.push({ field: 'email', message: 'Enter your email address.' });
  } else if (!email.includes('@')) {
    errors.push({ field: 'email', message: 'Enter a valid email address.' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Choose a password.' });
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push({
      field: 'password',
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    });
  }

  return errors;
}
