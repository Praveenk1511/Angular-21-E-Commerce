import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '@shared/components/button/button';
import { PageContainer } from '@shared/components/page-container/page-container';

/** Catch-all route for unknown URLs. */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, PageContainer, Button],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
