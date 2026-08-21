export type UserRole = 'customer' | 'staff' | 'admin';

export type UserStatus = 'active' | 'invited' | 'suspended';

export interface User {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly phone: string | null;
  /** ISO 8601. */
  readonly createdAt: string;
  /** ISO 8601, or `null` if the account has never been used. */
  readonly lastSeenAt: string | null;
  readonly orderCount: number;
  readonly marketingOptIn: boolean;
}

export type AddressType = 'shipping' | 'billing';

export interface Address {
  readonly id: string;
  readonly userId: string;
  readonly type: AddressType;
  readonly label: string;
  readonly recipient: string;
  readonly line1: string;
  readonly line2: string | null;
  readonly city: string;
  readonly region: string;
  readonly postcode: string;
  readonly countryCode: string;
  readonly phone: string | null;
  readonly isDefault: boolean;
}

/** Query accepted by the user list endpoint. */
export interface UserListQuery {
  readonly page?: number;
  readonly pageSize?: number;
  /** Matches name or email. */
  readonly q?: string;
  readonly role?: UserRole;
  readonly status?: UserStatus;
}
