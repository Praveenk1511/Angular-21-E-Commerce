import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Panel surface with optional header and footer slots.
 *
 * Purely a container: it adds no heading level, no landmark and no interactive
 * behaviour. `interactive` only supplies hover elevation for cards that a caller has
 * made clickable by putting a link inside — the card itself never becomes the
 * click target, because a clickable `div` wrapping a link is a keyboard trap
 * waiting to happen.
 */
@Component({
  selector: 'app-card',
  template: `
    <div class="card__header">
      <ng-content select="[cardHeader]" />
    </div>

    <div class="card__body">
      <ng-content />
    </div>

    <div class="card__footer">
      <ng-content select="[cardFooter]" />
    </div>
  `,
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Card {
  readonly padding = input<CardPadding>('md');

  /** Adds hover elevation for cards whose content is a link. */
  readonly interactive = input(false);

  protected readonly hostClasses = computed(() => {
    const classes = ['card', `card--pad-${this.padding()}`];

    if (this.interactive()) {
      classes.push('card--interactive');
    }

    return classes.join(' ');
  });
}
