import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ChartType = 'line' | 'bar' | 'donut';

export interface ChartDataItem {
  readonly label: string;
  readonly value: number;
  readonly formattedValue?: string;
  readonly color?: string;
}

/**
 * Modular Chart Component Abstraction Layer.
 *
 * Renders smooth SVG line charts, bar charts, or donut charts using input data.
 * Decouples chart rendering behind a clean API so the chart library can be replaced seamlessly in the future.
 */
@Component({
  selector: 'app-admin-chart',
  imports: [],
  templateUrl: './admin-chart.html',
  styleUrl: './admin-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminChartComponent {
  readonly type = input.required<ChartType>();
  readonly title = input<string>('');
  readonly data = input.required<readonly ChartDataItem[]>();
  readonly unit = input<string>('');

  protected readonly maxVal = computed(() => {
    const list = this.data();
    if (list.length === 0) return 1;
    return Math.max(1, ...list.map((d) => d.value));
  });

  protected readonly totalVal = computed(() => {
    return this.data().reduce((sum, item) => sum + item.value, 0);
  });

  // ---------- SVG Math Helpers ----------

  protected readonly linePoints = computed(() => {
    const list = this.data();
    if (list.length === 0) return '';
    const max = this.maxVal();
    const width = 480;
    const height = 180;
    const stepX = list.length > 1 ? width / (list.length - 1) : width;

    return list
      .map((d, i) => {
        const x = i * stepX;
        const y = height - (d.value / max) * (height - 20) - 10;
        return `${x},${y}`;
      })
      .join(' ');
  });

  protected readonly areaPoints = computed(() => {
    const pts = this.linePoints();
    if (!pts) return '';
    const list = this.data();
    const width = 480;
    const height = 180;
    const lastX = (list.length - 1) * (list.length > 1 ? width / (list.length - 1) : width);

    return `0,${height} ${pts} ${lastX},${height}`;
  });

  protected getBarHeightPct(val: number): number {
    const max = this.maxVal();
    return Math.max(4, Math.round((val / max) * 100));
  }

  protected getDonutSegment(val: number, cumulative: number): { strokeDash: string; strokeOffset: number } {
    const total = this.totalVal() || 1;
    const circumference = 2 * Math.PI * 40; // R=40, circumference ~251.3
    const pct = val / total;
    const strokeDash = `${pct * circumference} ${circumference}`;
    const strokeOffset = -(cumulative / total) * circumference;

    return { strokeDash, strokeOffset };
  }

  protected getCumulativeValues(): readonly number[] {
    const list = this.data();
    const cum: number[] = [0];
    let running = 0;
    for (let i = 0; i < list.length - 1; i++) {
      running += list[i]!.value;
      cum.push(running);
    }
    return cum;
  }
}
