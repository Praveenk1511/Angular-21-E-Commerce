import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import type { Review, ReviewSortField } from '@core/models';
import { Badge } from '@shared/components/badge/badge';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { Icon } from '@shared/components/icon/icon';
import { Rating } from '@shared/components/rating/rating';
import { ToastService } from '@shared/components/toast/toast.service';
import { AuthStore } from '@state/auth.store';
import { ReviewStore } from '@state/review.store';

/**
 * Interactive Customer Review & Rating System component.
 *
 * Renders aggregate rating summary, star distribution progress breakdown, filter tabs,
 * sort controls, review card list with helpful voting, pagination, and Reactive Forms for
 * creating, editing, and deleting reviews.
 */
@Component({
  selector: 'app-product-reviews',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    Badge,
    Button,
    Icon,
    Rating,
    EmptyState,
  ],
  templateUrl: './product-reviews.html',
  styleUrl: './product-reviews.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductReviews {
  readonly productId = input.required<string>();
  readonly productName = input.required<string>();

  protected readonly reviewStore = inject(ReviewStore);
  protected readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly isFormOpen = signal<boolean>(false);
  protected readonly editingReviewId = signal<string | null>(null);
  protected readonly formSubmitted = signal<boolean>(false);

  // ---------- Derived Data Signals ----------

  protected readonly summary = computed(() =>
    this.reviewStore.getRatingSummary(this.productId()),
  );

  protected readonly paginatedData = computed(() =>
    this.reviewStore.getPaginatedReviews(this.productId()),
  );

  protected readonly hasPurchased = computed(() =>
    this.reviewStore.hasUserPurchasedProduct(this.productId()),
  );

  // ---------- Reactive Review Form ----------

  private readonly user = this.authStore.currentUser();

  protected readonly reviewForm: FormGroup = this.fb.group({
    score: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    authorName: [
      this.user ? `${this.user.firstName} ${this.user.lastName}` : 'Alex Morgan',
      [Validators.required, Validators.minLength(2)],
    ],
    title: ['', [Validators.required, Validators.minLength(3)]],
    body: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected setFormScore(star: number): void {
    this.reviewForm.patchValue({ score: star });
  }

  protected isControlInvalid(controlName: string): boolean {
    const control = this.reviewForm.get(controlName);
    return !!(control && control.invalid && (control.touched || this.formSubmitted()));
  }

  // ---------- Modal & Action Handlers ----------

  protected openAddForm(): void {
    this.editingReviewId.set(null);
    this.formSubmitted.set(false);
    this.reviewForm.reset({
      score: 5,
      authorName: this.user ? `${this.user.firstName} ${this.user.lastName}` : 'Alex Morgan',
      title: '',
      body: '',
    });
    this.isFormOpen.set(true);
  }

  protected openEditForm(review: Review): void {
    this.editingReviewId.set(review.id);
    this.formSubmitted.set(false);
    this.reviewForm.patchValue({
      score: review.score,
      authorName: review.authorName,
      title: review.title,
      body: review.body,
    });
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.isFormOpen.set(false);
    this.editingReviewId.set(null);
    this.formSubmitted.set(false);
  }

  protected submitReview(): void {
    this.formSubmitted.set(true);

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      this.toast.error('Invalid Review Details', 'Please fill out all required fields.');
      return;
    }

    const val = this.reviewForm.value as {
      score: number;
      authorName: string;
      title: string;
      body: string;
    };

    const editId = this.editingReviewId();

    if (editId) {
      this.reviewStore.updateReview(editId, val);
      this.toast.success('Review Updated', 'Your product review has been updated.');
    } else {
      this.reviewStore.addReview(this.productId(), val);
      this.toast.success(
        'Review Submitted',
        'Thank you! Your product review has been published.',
      );
    }

    this.closeForm();
  }

  protected deleteReview(reviewId: string): void {
    const ok = this.reviewStore.deleteReview(reviewId);
    if (ok) {
      this.toast.show({
        variant: 'info',
        title: 'Review Deleted',
        message: 'Your review has been removed.',
      });
    }
  }

  protected onSortChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as ReviewSortField;
    this.reviewStore.setSort(val);
  }

  protected getAuthorInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return (name[0] ?? 'A').toUpperCase();
  }

  protected getScoreLabel(score: number): string {
    switch (score) {
      case 5:
        return 'Excellent';
      case 4:
        return 'Very Good';
      case 3:
        return 'Average';
      case 2:
        return 'Poor';
      case 1:
        return 'Terrible';
      default:
        return 'Rate Product';
    }
  }
}
