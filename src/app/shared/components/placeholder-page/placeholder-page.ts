import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PageContainer } from '@shared/components/page-container/page-container';

/**
 * Reusable "not built yet" view.
 *
 * Every routed placeholder in the application renders this component, so the
 * empty-state markup, spacing and copy exist exactly once. Feature placeholders
 * stay one-liners and are replaced wholesale when their phase lands.
 *
 * It accepts its text as inputs, which means it works both as a child component
 * (`<app-placeholder-page heading="Cart" />`) and as a routed component whose
 * inputs are filled from static route `data` by `withComponentInputBinding()`.
 */
@Component({
  selector: 'app-placeholder-page',
  imports: [PageContainer],
  templateUrl: './placeholder-page.html',
  styleUrl: './placeholder-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderPage {
  readonly heading = input.required<string>();
  readonly description = input("We're still building this section. Please check back soon.");
}
