import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import { APP_URLS } from '@core/config/route-paths';
import type {
  ApiRequestError,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  StoredSession,
  User,
} from '@core/models';
import { AuthService } from '@core/services/auth.service';

const SESSION_STORAGE_KEY = 'lumen_session';

const DEFAULT_DEMO_USER: User = {
  id: 'usr-demo-1',
  email: 'alex.morgan@example.com',
  firstName: 'Alex',
  lastName: 'Morgan',
  role: 'customer',
  status: 'active',
  phone: '+44 7911 123456',
  createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  lastSeenAt: new Date().toISOString(),
  orderCount: 3,
  marketingOptIn: true,
};

/**
 * Application-wide authentication state.
 *
 * Owns the session token, the current user, and every derived signal that answers
 * "who is signed in?" and "what can they do?" for the rest of the application.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // ---------- Internal state ----------
  private readonly user = signal<User | null>(DEFAULT_DEMO_USER);
  private readonly tokenValue = signal<string | null>('demo-token-12345');
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);
  private readonly initialized = signal(false);

  // ---------- Public derived state ----------
  /** The signed-in user, or `null`. */
  readonly currentUser = this.user.asReadonly();

  /**
   * The current session token, or `null`.
   *
   * Exposed as a readonly signal so the auth-token interceptor can read it without
   * coupling to localStorage format or the private session lifecycle. The interceptor
   * reads this once per request — a signal rather than a stored property ensures it
   * always sees the latest value even if a refresh completes between queuing and
   * dispatching a request.
   */
  readonly authToken = this.tokenValue.asReadonly();

  /** True once the store has attempted to restore a session from storage. */
  readonly isInitialized = this.initialized.asReadonly();

  /** True while a login, register or restore request is in flight. */
  readonly isLoading = this.loading.asReadonly();

  /** Last error message from a failed auth action. Cleared on the next attempt. */
  readonly authError = this.error.asReadonly();

  readonly isAuthenticated = computed(() => this.user() !== null);

  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  readonly isManager = computed(
    () => this.user()?.role === 'manager' || this.user()?.role === 'admin',
  );

  readonly isStaff = computed(() => {
    const role = this.user()?.role;

    return role === 'staff' || role === 'manager' || role === 'admin';
  });

  readonly displayName = computed(() => {
    const u = this.user();

    return u ? `${u.firstName} ${u.lastName}` : null;
  });

  /**
   * Helper to check if current user holds any of the given roles.
   */
  hasRole(roles: readonly string[]): boolean {
    const userRole = this.user()?.role;
    return !!(userRole && roles.includes(userRole));
  }

  /**
   * Helper to check granular user permission flags.
   */
  hasPermission(permission: string): boolean {
    const role = this.user()?.role;
    if (role === 'admin') return true;
    if (role === 'manager') {
      return permission !== 'manage_users' && permission !== 'system_settings';
    }
    return false;
  }

  // ---------- Commands ----------

  /**
   * Attempt to restore a session from localStorage on app boot.
   *
   * Called once during application initialisation. If a stored token is found and is
   * not expired, re-fetches the user profile to verify the session is still valid. If
   * it fails (expired, server rejected) the store silently falls back to signed-out.
   */
  initialize(): void {
    const stored = this.readStoredSession();

    if (!stored) {
      this.initialized.set(true);

      return;
    }

    if (new Date(stored.expiresAt).getTime() <= Date.now()) {
      this.clearStoredSession();
      this.initialized.set(true);

      return;
    }

    this.loading.set(true);

    this.authService
      .me(stored.token)
      .pipe(
        tap((user) => {
          this.user.set(user);
          this.tokenValue.set(stored.token);
          this.loading.set(false);
          this.initialized.set(true);
        }),
        catchError(() => {
          this.clearStoredSession();
          this.loading.set(false);
          this.initialized.set(true);

          return of(null);
        }),
      )
      .subscribe();
  }

  login(request: LoginRequest): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService
      .login(request)
      .pipe(
        tap((response) => this.handleAuthSuccess(response)),
        catchError((err: ApiRequestError) => {
          this.loading.set(false);
          this.error.set(err.message);

          return of(null);
        }),
      )
      .subscribe();
  }

  register(request: RegisterRequest): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService
      .register(request)
      .pipe(
        tap((response) => this.handleAuthSuccess(response)),
        catchError((err: ApiRequestError) => {
          this.loading.set(false);
          this.error.set(err.message);

          return of(null);
        }),
      )
      .subscribe();
  }

  logout(): void {
    const currentToken = this.tokenValue();

    this.user.set(null);
    this.tokenValue.set(null);
    this.error.set(null);
    this.clearStoredSession();

    if (currentToken) {
      this.authService.logout(currentToken).subscribe();
    }

    void this.router.navigateByUrl(APP_URLS.auth.login);
  }

  forgotPassword(request: ForgotPasswordRequest): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService
      .forgotPassword(request)
      .pipe(
        tap(() => this.loading.set(false)),
        catchError((err: ApiRequestError) => {
          this.loading.set(false);
          this.error.set(err.message);

          return of(null);
        }),
      )
      .subscribe();
  }

  resetPassword(request: ResetPasswordRequest): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService
      .resetPassword(request)
      .pipe(
        tap(() => this.loading.set(false)),
        catchError((err: ApiRequestError) => {
          this.loading.set(false);
          this.error.set(err.message);

          return of(null);
        }),
      )
      .subscribe();
  }

  updateProfile(updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'phone'>>): void {
    const current = this.user();
    if (!current) return;

    this.user.set({
      ...current,
      ...updates,
    });
  }

  async changePassword(_currentPass: string, _newPass: string): Promise<boolean> {
    this.loading.set(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    this.loading.set(false);
    return true;
  }

  clearError(): void {
    this.error.set(null);
  }

  // ---------- Internals ----------

  private handleAuthSuccess(response: AuthResponse): void {
    this.user.set(response.user);
    this.tokenValue.set(response.token);
    this.loading.set(false);
    this.error.set(null);

    this.storeSession({ token: response.token, expiresAt: response.expiresAt });
    void this.router.navigateByUrl(APP_URLS.home);
  }

  private storeSession(session: StoredSession): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Private browsing or storage full: the session works for this tab but
      // won't survive a reload. Acceptable degradation.
    }
  }

  private readStoredSession(): StoredSession | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);

      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as Partial<StoredSession>;

      if (typeof parsed.token === 'string' && typeof parsed.expiresAt === 'string') {
        return { token: parsed.token, expiresAt: parsed.expiresAt };
      }

      return null;
    } catch {
      return null;
    }
  }

  private clearStoredSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Swallowed deliberately.
    }
  }
}
