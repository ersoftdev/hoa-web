import { Component, input } from '@angular/core';

export type StatCardVariant = 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'secondary';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input('graph-up');
  readonly variant = input<StatCardVariant>('primary');
  readonly trendLabel = input<string>();
  readonly trendDirection = input<'up' | 'down'>('up');
}
