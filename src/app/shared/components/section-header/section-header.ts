import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Heading row for a page section, with optional subtitle and "View all" link.
 *
 * Every home page section shares this layout: a heading, sometimes a short line of
 * supporting text, and sometimes a link to the full listing. Keeping it in one
 * component means the heading level, spacing, and responsive behaviour are uniform.
 */
@Component({
  selector: 'app-section-header',
  imports: [RouterLink],
  templateUrl: './section-header.html',
  styleUrl: './section-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeader {
  readonly heading = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly ctaLabel = input<string | null>(null);
  readonly ctaUrl = input<string | null>(null);
}
