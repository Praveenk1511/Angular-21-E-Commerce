import { Injectable, computed, signal } from '@angular/core';

export type UserRole = 'CUSTOMER' | 'MANAGER' | 'ADMIN';
export type AdminUserStatus = 'active' | 'inactive';

export interface AdminUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly status: AdminUserStatus;
  readonly registeredAt: string;
  readonly lastActiveAt: string;
  readonly orderCount: number;
}

const ADMIN_USERS_KEY = 'lumen_admin_users';

const MOCK_INITIAL_USERS: readonly AdminUser[] = [
  {
    id: 'user-1',
    email: 'sarah.jenkins@example.com',
    name: 'Sarah Jenkins',
    role: 'CUSTOMER',
    status: 'active',
    registeredAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    orderCount: 3,
  },
  {
    id: 'user-2',
    email: 'marcus.vance@techcorp.com',
    name: 'Marcus Vance',
    role: 'MANAGER',
    status: 'active',
    registeredAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    orderCount: 5,
  },
  {
    id: 'user-3',
    email: 'elena.rostova@design.io',
    name: 'Elena Rostova',
    role: 'CUSTOMER',
    status: 'active',
    registeredAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    orderCount: 1,
  },
  {
    id: 'user-4',
    email: 'admin@lumen.store',
    name: 'Administrator',
    role: 'ADMIN',
    status: 'active',
    registeredAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date().toISOString(),
    orderCount: 12,
  },
  {
    id: 'user-5',
    email: 'david.m@offline.net',
    name: 'David Miller',
    role: 'CUSTOMER',
    status: 'inactive',
    registeredAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    orderCount: 0,
  },
];

export interface ConfirmUserActionPayload {
  readonly user: AdminUser;
  readonly action: 'activate' | 'deactivate' | 'change-role';
  readonly newRole?: UserRole;
}

/**
 * Root state manager for Admin User Management, user list pagination, search/filtering,
 * role assignment (CUSTOMER, MANAGER, ADMIN), account status toggling, and destructive confirmation modals.
 */
@Injectable({ providedIn: 'root' })
export class AdminUserStore {
  // ---------- State Signals ----------
  private readonly usersSignal = signal<readonly AdminUser[]>([]);
  readonly searchQuery = signal<string>('');
  readonly roleFilter = signal<UserRole | 'ALL'>('ALL');

  readonly activePage = signal<number>(1);
  readonly pageSize = signal<number>(5);

  readonly viewingUser = signal<AdminUser | null>(null);
  readonly confirmingAction = signal<ConfirmUserActionPayload | null>(null);

  // ---------- Derived Signals ----------

  readonly paginatedData = computed(() => {
    let list = [...this.usersSignal()];
    const q = this.searchQuery().trim().toLowerCase();
    const role = this.roleFilter();

    if (q) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q),
      );
    }

    if (role !== 'ALL') {
      list = list.filter((u) => u.role === role);
    }

    const totalCount = list.length;
    const size = this.pageSize();
    const totalPages = Math.max(1, Math.ceil(totalCount / size));
    const currentPage = Math.min(this.activePage(), totalPages);

    const startIndex = (currentPage - 1) * size;
    const items = list.slice(startIndex, startIndex + size);

    return {
      items,
      totalCount,
      totalPages,
      currentPage,
    };
  });

  readonly totalCount = computed(() => this.usersSignal().length);

  constructor() {
    this.readStoredUsers();
  }

  // ---------- Search & Filter Actions ----------

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
    this.activePage.set(1);
  }

  setRoleFilter(role: UserRole | 'ALL'): void {
    this.roleFilter.set(role);
    this.activePage.set(1);
  }

  setPage(page: number): void {
    this.activePage.set(page);
  }

  openViewModal(user: AdminUser): void {
    this.viewingUser.set(user);
  }

  closeModals(): void {
    this.viewingUser.set(null);
    this.confirmingAction.set(null);
  }

  // ---------- Confirmation Dialog Triggers ----------

  promptStatusToggle(user: AdminUser): void {
    const action = user.status === 'active' ? 'deactivate' : 'activate';
    this.confirmingAction.set({ user, action });
  }

  promptRoleChange(user: AdminUser, newRole: UserRole): void {
    if (user.role === newRole) return;
    this.confirmingAction.set({ user, action: 'change-role', newRole });
  }

  cancelAction(): void {
    this.confirmingAction.set(null);
  }

  confirmAction(): { success: boolean; message: string } {
    const payload = this.confirmingAction();
    if (!payload) return { success: false, message: 'No action pending.' };

    const { user, action, newRole } = payload;
    const list = [...this.usersSignal()];
    const idx = list.findIndex((u) => u.id === user.id);

    if (idx === -1) {
      this.cancelAction();
      return { success: false, message: 'User not found.' };
    }

    let updatedUser: AdminUser = { ...user };

    if (action === 'activate') {
      updatedUser = { ...user, status: 'active' };
    } else if (action === 'deactivate') {
      updatedUser = { ...user, status: 'inactive' };
    } else if (action === 'change-role' && newRole) {
      updatedUser = { ...user, role: newRole };
    }

    list[idx] = updatedUser;
    this.updateState(list);
    this.cancelAction();

    if (this.viewingUser()?.id === user.id) {
      this.viewingUser.set(updatedUser);
    }

    return {
      success: true,
      message: `User ${user.name} has been ${
        action === 'change-role' ? `assigned role ${newRole}` : `marked as ${updatedUser.status}`
      }.`,
    };
  }

  // ---------- Internals ----------

  private updateState(list: readonly AdminUser[]): void {
    this.usersSignal.set(list);
    this.persistUsers(list);
  }

  private readStoredUsers(): void {
    try {
      const raw = localStorage.getItem(ADMIN_USERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.usersSignal.set(parsed as AdminUser[]);
          return;
        }
      }
    } catch {
      // Swallowed
    }

    this.usersSignal.set(MOCK_INITIAL_USERS);
    this.persistUsers(MOCK_INITIAL_USERS);
  }

  private persistUsers(list: readonly AdminUser[]): void {
    try {
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(list));
    } catch {
      // Swallowed
    }
  }
}
