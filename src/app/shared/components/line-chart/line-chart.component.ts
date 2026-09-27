import { Component, ElementRef, OnDestroy, effect, inject, input, viewChild } from '@angular/core';
import { Chart, type ChartConfiguration } from 'chart.js/auto';
import dayjs from 'dayjs';
import { LayoutService } from '../../../core/layout/layout.service';
import { CurrencyService } from '../../services/currency.service';

export interface LineChartPoint {
  date: string;
  amount: number;
}

@Component({
  selector: 'app-line-chart',
  template: `<div class="line-chart-wrap"><canvas #canvas></canvas></div>`,
  styles: [
    `
      .line-chart-wrap {
        position: relative;
        height: 280px;
        /* Breathing room around the canvas itself — Chart.js's own
         * \`layout.padding\` (below) keeps the plotted line off the plot
         * area's edges; this keeps the plot area off the card's edges. */
        padding: 1.25rem 0.5rem 0;
      }
      canvas {
        width: 100% !important;
        height: 100% !important;
      }
    `,
  ],
})
export class LineChartComponent implements OnDestroy {
  private readonly layout = inject(LayoutService);
  private readonly currency = inject(CurrencyService);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  readonly data = input<LineChartPoint[]>([]);
  readonly valuePrefix = input<string>();

  private chart?: Chart;

  constructor() {
    effect(() => {
      const points = this.data();
      const theme = this.layout.theme();
      this.render(points, theme);
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(points: LineChartPoint[], theme: 'light' | 'dark'): void {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = theme === 'dark';
    const lineColor = isDark ? '#818cf8' : '#6366f1';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const tickColor = isDark ? '#94a3b8' : '#64748b';
    const tooltipBg = isDark ? '#1e293b' : '#ffffff';
    const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, isDark ? 'rgba(129, 140, 248, 0.28)' : 'rgba(99, 102, 241, 0.22)');
    gradient.addColorStop(1, isDark ? 'rgba(129, 140, 248, 0)' : 'rgba(99, 102, 241, 0)');

    const labels = points.map((p) => dayjs(p.date).format(points.length > 45 ? 'MMM' : 'MMM D'));
    const values = points.map((p) => p.amount);

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: lineColor,
            backgroundColor: gradient,
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: lineColor,
            pointHoverBorderColor: tooltipBg,
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 16, right: 12, bottom: 4, left: 4 } },
        interaction: { mode: 'index', intersect: false },
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
            displayColors: false,
            callbacks: {
              label: (item) => `${this.valuePrefix() ?? this.currency.symbol()}${Number(item.parsed.y).toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tickColor, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
            border: { display: false },
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              callback: (value) => `${this.valuePrefix() ?? this.currency.symbol()}${Number(value).toLocaleString()}`,
            },
            border: { display: false },
            beginAtZero: true,
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
