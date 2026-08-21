/**
 * Mock credentials mapped to user ids.
 *
 * Separated from `users.mock.ts` deliberately. The `User` model has no password field
 * because a real user object returned from an API never carries one. These exist only
 * for the mock auth handler to match against, and they should be unreachable from
 * anything above the mock API — the same `no-restricted-imports` guard that protects
 * the rest of the seeds protects these.
 *
 * Passwords are plaintext because:
 * - There is no real security boundary to protect in a client-side mock.
 * - Hashing would require a dependency for something that will be deleted.
 * - Developers need to *read* them to sign in during development.
 *
 * Every active user has a credential entry so login can be tested for every role.
 * The invited and suspended users intentionally have entries too, to exercise the
 * rejection paths.
 */
export interface CredentialSeed {
  readonly userId: string;
  readonly email: string;
  readonly password: string;
}

export const CREDENTIAL_SEEDS: readonly CredentialSeed[] = [
  // Customers
  { userId: 'usr-1001', email: 'harriet.vance@example.com', password: 'Password1!' },
  { userId: 'usr-1002', email: 'declan.moore@example.com', password: 'Password1!' },
  { userId: 'usr-1003', email: 'priya.raman@example.com', password: 'Password1!' },
  { userId: 'usr-1004', email: 'tomas.eriksen@example.com', password: 'Password1!' },
  { userId: 'usr-1005', email: 'nadia.okafor@example.com', password: 'Password1!' },
  { userId: 'usr-1006', email: 'joel.whitaker@example.com', password: 'Password1!' },

  // Manager (new for this phase)
  { userId: 'usr-2003', email: 'claire.bell@lumenstore.example', password: 'Manager1!' },

  // Staff
  { userId: 'usr-2001', email: 'ruth.abara@lumenstore.example', password: 'Staff1!' },
  { userId: 'usr-2002', email: 'martin.lowe@lumenstore.example', password: 'Staff1!' },

  // Admin
  { userId: 'usr-3001', email: 'sofia.duarte@lumenstore.example', password: 'Admin1!' },
];
