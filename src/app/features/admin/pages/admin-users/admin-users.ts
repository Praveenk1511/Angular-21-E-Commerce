import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Badge, type BadgeVariant } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Icon } from '@shared/components/icon/icon';
import { ToastService } from '@shared/components/toast/toast.service';
import { AdminUserStore, type AdminUser, type UserRole } from '@state/admin-user.store';

/**
 * Admin User Management Page (/admin/users).
 *
 * Renders Registered User Data Table, Search & Role Filter pills, User Profile Details modal,
 * Role Assignment (CUSTOMER, MANAGER, ADMIN), Status toggling, and Destructive Confirmation Modals.
 */
@Component({
  selector: 'app-admin-users',
  imports: [
    DatePipe,
    Badge,
    Button,
    Icon,
    EmptyState,
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsers {
  protected readonly store = inject(AdminUserStore);
  private readonly toast = inject(ToastService);

  protected onRoleSelectChange(user: AdminUser, event: Event): void {
    const newRole = (event.target as HTMLSelectElement).value as UserRole;
    if (!newRole || newRole === user.role) return;

    this.store.promptRoleChange(user, newRole);
  }

  protected confirmUserAction(): void {
    const res = this.store.confirmAction();
    if (res.success) {
      this.toast.success('Action Confirmed', res.message);
    } else {
      this.toast.error('Action Failed', res.message);
    }
  }

  protected getRoleBadgeVariant(role: UserRole): BadgeVariant {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'MANAGER':
        return 'brand';
      case 'CUSTOMER':
      default:
        return 'neutral';
    }
  }

  protected getUserInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
