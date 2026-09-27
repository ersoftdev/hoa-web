import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, computed, effect, inject, input, viewChild } from '@angular/core';
import { Chart, type ChartConfiguration } from 'chart.js/auto';
import { LayoutService } from '../../../core/layout/layout.service';

export interface DonutChartSlice {
  label: string;
  value: number;
  meta?: string;
}

const CATEGORICAL_LIGHT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
const CATEGORICAL_DARK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];
const MAX_SLOTS = CATEGORICAL_LIGHT.length;

@Component({
  selector: 'app-donut-chart',
  imports: [DecimalPipe],
  templateUrl: './donut-chart.component.html',
  styles: [
    `
      .donut-chart-wrap {
        position: relative;
        width: 220px;
        height: 220px;
      }
      canvas {
        width: 100% !important;
        height: 100% !important;
      }
      .donut-legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-top: 0.35rem;
      }
    `,
  ],
})
export class DonutChartComponent implements OnDestroy {
  private readonly layout = inject(LayoutService);
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  readonly data = input<DonutChartSlice[]>([]);

  protected readonly slices = computed<DonutChartSlice[]>(() => {
    const all = this.data();
    if (all.length <= MAX_SLOTS) return all;
    const kept = all.slice(0, MAX_SLOTS - 1);
    const rest = all.slice(MAX_SLOTS - 1);
    const otherValue = rest.reduce((sum, s) => sum + s.value, 0);
    return [...kept, { label: 'Other', value: otherValue }];
  });

  protected readonly total = computed(() => this.slices().reduce((sum, s) => sum + s.value, 0));

  private chart?: Chart;

  constructor() {
    effect(() => {
      const slices = this.slices();
      const theme = this.layout.theme();
      this.render(slices, theme);
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  protected colorFor(index: number): string {
    const palette = this.layout.theme() === 'dark' ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;
    return palette[index % palette.length];
  }

  private render(slices: DonutChartSlice[], theme: 'light' | 'dark'): void {
    const ref = this.canvasRef();
    if (!ref) {
      this.chart?.destroy();
      this.chart = undefined;
      return;
    }
    const ctx = ref.nativeElement.getContext('2d');
    if (!ctx) return;

    const isDark = theme === 'dark';
    const palette = isDark ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;
    const tooltipBg = isDark ? '#1e293b' : '#ffffff';
    const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
    const ringGap = isDark ? '#1e293b' : '#ffffff';

    const maxValue = Math.max(0, ...slices.map((s) => s.value));

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: slices.map((s) => s.label),
        datasets: [
          {
            data: slices.map((s) => s.value),
            backgroundColor: slices.map((_, i) => palette[i % palette.length]),
            borderColor: ringGap,
            borderWidth: 2,
            hoverOffset: 10,
            offset: slices.map((s) => (maxValue > 0 && s.value === maxValue ? 14 : 0)),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '52%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tooltipBg,
            titleColor: isDark ? '#f1f5f9' : '#1e293b',
            bodyColor: isDark ? '#cbd5e1' : '#475569',
            borderColor: tooltipBorder,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (item) => `${item.label}: ${Number(item.parsed).toLocaleString()}`,
            },
          },
        },
      },
    };

    if (this.chart) {
      this.chart.data = config.data;
      this.chart.options = config.options ?? {};
      this.chart.update();
    } else {
      this.chart = new Chart(ctx, config);
    }
  }
}
