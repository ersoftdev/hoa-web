import { Component, computed, inject, signal } from '@angular/core';

import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error.model';
import { DonutChartComponent, DonutChartSlice } from '../../../../shared/components/donut-chart/donut-chart.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LineChartComponent } from '../../../../shared/components/line-chart/line-chart.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { HoaCurrencyPipe } from '../../../../shared/pipes/hoa-currency.pipe';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { CurrencyService } from '../../../../shared/services/currency.service';
import { ACTIVITY_CATEGORY_ICONS } from '../../../activities/models/activity.model';
import { DashboardApiService } from '../../data-access/dashboard-api.service';
import { DashboardRange, DashboardSummary, FinancialOverviewPoint } from '../../models/dashboard-summary.model';

type LoadState = 'loading' | 'error' | 'success';

const RANGE_OPTIONS: Array<{ value: DashboardRange; label: string }> = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' },
];

@Component({
  selector: 'app-dashboard',
  imports: [
    HoaCurrencyPipe,
    TimeAgoPipe,
    PageHeaderComponent,
    StatCardComponent,
    LineChartComponent,
    DonutChartComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly currency = inject(CurrencyService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly summary = signal<DashboardSummary | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly financialOverview = signal<FinancialOverviewPoint[]>([]);

  protected readonly currentUser = this.auth.currentUser;
  protected readonly isAdmin = computed(() => this.auth.hasPermission('CAN_MANAGE_HOMEOWNERS'));
  protected readonly isBoardMember = computed(() => this.currentUser()?.roles.includes('BoardMember') ?? false);

  protected readonly range = signal<DashboardRange>('7d');
  protected readonly rangeOptions = RANGE_OPTIONS;
  protected readonly categoryIcons = ACTIVITY_CATEGORY_ICONS;
  protected readonly chartLoading = signal(false);
  protected readonly chartError = signal<string | null>(null);

  protected readonly paymentTypeSlices = computed<DonutChartSlice[]>(() => {
    const data = this.summary();
    if (!data) return [];
    return data.paymentTypeBreakdown
      .filter((entry) => entry.count > 0)
      .map((entry) => ({ label: entry.label, value: entry.count, meta: `${this.currency.symbol()}${entry.totalAmount.toLocaleString()}` }));
  });

  protected readonly serviceRequestSlices = computed<DonutChartSlice[]>(() => {
    const data = this.summary();
    if (!data) return [];
    return data.serviceRequestBreakdown.map((entry) => ({ label: entry.serviceName, value: entry.count }));
  });

  protected readonly recurringServiceRequestSlices = computed<DonutChartSlice[]>(() => {
    const data = this.summary();
    if (!data) return [];
    return data.recurringServiceRequestBreakdown.map((entry) => ({ label: entry.serviceName, value: entry.count }));
  });

  protected readonly recurringServicePaymentSlices = computed<DonutChartSlice[]>(() => {
    const data = this.summary();
    if (!data) return [];
    return data.recurringServicePaymentBreakdown
      .filter((entry) => entry.count > 0)
      .map((entry) => ({ label: entry.label, value: entry.count, meta: `${this.currency.symbol()}${entry.totalAmount.toLocaleString()}` }));
  });

  constructor() {
    this.load();
  }

  protected onRangeChange(range: DashboardRange): void {
    this.range.set(range);
    this.chartLoading.set(true);
    this.chartError.set(null);
    this.dashboardApi.getFinancialOverview(range).subscribe({
      next: (financialOverview) => {
        this.financialOverview.set(financialOverview);
        this.chartLoading.set(false);
      },
      error: (error: ApiError) => {
        this.chartError.set(error.message);
        this.chartLoading.set(false);
      },
    });
  }

  protected load(): void {
    this.state.set('loading');
    this.dashboardApi.getSummary(this.range()).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.financialOverview.set(summary.financialOverview);
        this.state.set('success');
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.state.set('error');
      },
    });
  }
}
