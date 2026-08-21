import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type {
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
} from '@core/models';

import { ApiClient } from './api-client';

/**
 * Authentication HTTP data access.
 *
 * Pure transport: calls endpoints and returns observables. Holds no session state and
 * makes no routing decisions. The {@link AuthStore} owns state; this exists so the
 * store never constructs HTTP requests itself.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);

  /** `POST /auth/login`. */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', request);
  }

  /** `POST /auth/register`. */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', request);
  }

  /** `POST /auth/logout`. */
  logout(token: string): Observable<unknown> {
    return this.api.post<unknown>('/auth/logout', { token });
  }

  /** `GET /auth/me`. Requires a valid Bearer token. */
  me(token: string): Observable<User> {
    return this.api.getWithHeaders<User>('/auth/me', undefined, {
      Authorization: `Bearer ${token}`,
    });
  }

  /** `POST /auth/forgot-password`. */
  forgotPassword(request: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.api.post<ForgotPasswordResponse>('/auth/forgot-password', request);
  }

  /** `POST /auth/reset-password`. */
  resetPassword(request: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.api.post<ResetPasswordResponse>('/auth/reset-password', request);
  }
}
