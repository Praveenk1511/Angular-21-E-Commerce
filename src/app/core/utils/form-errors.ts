import type { ApiRequestError } from '@core/models';

/**
 * Maps an API's field-level errors into a `Record<fieldName, message>` that a
 * reactive form can consume directly.
 *
 * @example
 * ```ts
 * catchError((err: ApiRequestError) => {
 *   const errors = mapFieldErrors(err);
 *   if (errors['email']) {
 *     this.form.controls.email.setErrors({ server: errors['email'] });
 *   }
 *   return EMPTY;
 * })
 * ```
 *
 * Returns an empty record when the error carries no field-level detail — callers
 * should show the top-level `error.message` in that case rather than assuming a
 * specific field caused the failure.
 */
export function mapFieldErrors(error: ApiRequestError): Readonly<Record<string, string>> {
  if (!error.fieldErrors || error.fieldErrors.length === 0) {
    return {};
  }

  const map: Record<string, string> = {};

  for (const fieldError of error.fieldErrors) {
    // First error per field wins. Multiple errors for the same field are rare, and
    // showing more than one at a time is overwhelming rather than helpful.
    if (!(fieldError.field in map)) {
      map[fieldError.field] = fieldError.message;
    }
  }

  return map;
}

/**
 * Checks whether an unknown caught value is an `ApiRequestError`.
 *
 * Useful in `catchError` callbacks where the error is typed `unknown` — saves
 * repeating the `instanceof` check and type assertion in every store.
 */
export function isApiError(error: unknown): error is ApiRequestError {
  return error !== null && typeof error === 'object' && 'status' in error && 'code' in error;
}

/**
 * Returns a user-safe message for any error, preferring the API's own message when
 * available and falling back to a generic one otherwise.
 *
 * Intentionally returns a string — a component rendering an error in its template does
 * not want to handle `null | undefined` at the binding site.
 */
export function userMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
