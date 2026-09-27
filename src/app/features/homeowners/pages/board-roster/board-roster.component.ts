import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog.service';
import { ConfigurationApiService } from '../../../configuration/data-access/configuration-api.service';
import { BoardMembershipApiService } from '../../data-access/board-membership-api.service';
import { OfficerPositionApiService } from '../../data-access/officer-position-api.service';
import { BoardMembership } from '../../models/board-membership.model';
import { Homeowner } from '../../models/homeowner.model';

type RosterMode = 'members' | 'officers';
type LoadState = 'loading' | 'success' | 'error';

const YEAR_HISTORY_DEPTH = 5;

@Component({
  selector: 'app-board-roster',
  imports: [RouterLink, PageHeaderComponent, EmptyStateComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './board-roster.component.html',
})
export class BoardRosterComponent {
  private readonly membershipApi = inject(BoardMembershipApiService);
  private readonly configurationApi = inject(ConfigurationApiService);
  private readonly officerPositionApi = inject(OfficerPositionApiService);
  private readonly auth = inject(AuthService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);
  private readonly route = inject(ActivatedRoute);

  protected readonly mode: RosterMode = (this.route.snapshot.data['mode'] as RosterMode | undefined) ?? 'members';
  protected readonly pageTitle = this.mode === 'officers' ? 'Officers' : 'Board Members';
  protected readonly canManage = this.auth.hasPermission('CAN_MANAGE_HOMEOWNERS');

  protected readonly state = signal<LoadState>('loading');
  protected readonly roster = signal<BoardMembership[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);

  protected readonly selectedYear = signal<number>(new Date().getFullYear());
  protected readonly yearOptions = signal<number[]>([this.selectedYear()]);

  protected readonly addMode = signal(false);
  protected readonly loadingEligible = signal(false);
  protected readonly eligibleError = signal<string | null>(null);
  protected readonly eligibleHomeowners = signal<Homeowner[]>([]);
  protected readonly selectedHomeownerId = signal<string | null>(null);
  protected readonly officerPositions = signal<string[]>([]);
  protected readonly selectedOfficerPosition = signal<string | null>(null);
  protected readonly addPending = signal(false);
  protected readonly addError = signal<string | null>(null);

  protected readonly removePendingId = signal<string | null>(null);

  constructor() {
    this.configurationApi.get().subscribe({
      next: (config) => {
        this.selectedYear.set(config.operationYear);
        this.yearOptions.set(Array.from({ length: YEAR_HISTORY_DEPTH + 1 }, (_, i) => config.operationYear - i));
        this.load();
      },
      error: () => this.load(),
    });
  }

  protected onYearChange(event: Event): void {
    this.selectedYear.set(Number((event.target as HTMLSelectElement).value));
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    this.membershipApi.list(this.selectedYear(), this.mode === 'officers').subscribe({
      next: (roster) => {
        this.roster.set(roster);
        this.state.set('success');
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.state.set('error');
      },
    });
  }

  protected onStartAdd(): void {
    this.addError.set(null);
    this.selectedHomeownerId.set(null);
    this.selectedOfficerPosition.set(null);
    this.addMode.set(true);
    this.loadEligible();
    if (this.mode === 'officers') this.loadOfficerPositions();
  }

  protected onCancelAdd(): void {
    this.addMode.set(false);
  }

  protected onHomeownerSelect(event: Event): void {
    this.selectedHomeownerId.set((event.target as HTMLSelectElement).value || null);
  }

  protected onOfficerPositionSelect(event: Event): void {
    this.selectedOfficerPosition.set((event.target as HTMLSelectElement).value || null);
  }

  protected async onConfirmAdd(): Promise<void> {
    const homeownerId = this.selectedHomeownerId();
    if (!homeownerId) return;
    if (this.mode === 'officers' && !this.selectedOfficerPosition()) return;

    const homeownerName = this.eligibleHomeowners().find((h) => h.id === homeownerId)?.fullName ?? 'this homeowner';
    const noun = this.mode === 'officers' ? 'officer' : 'board';
    const confirmed = await this.confirmationDialog.confirm({
      title: this.mode === 'officers' ? 'Add officer?' : 'Add board member?',
      message: `Add ${homeownerName} to the ${this.selectedYear()} ${noun} roster?`,
      confirmLabel: 'Add',
    });
    if (!confirmed) return;

    this.addPending.set(true);
    this.addError.set(null);
    this.membershipApi
      .add({
        hoaYear: this.selectedYear(),
        homeownerId,
        officerPosition: this.mode === 'officers' ? this.selectedOfficerPosition() : null,
      })
      .subscribe({
        next: () => {
          this.addPending.set(false);
          this.addMode.set(false);
          this.load();
        },
        error: (error: ApiError) => {
          this.addError.set(error.message);
          this.addPending.set(false);
        },
      });
  }

  protected async onRemove(membership: BoardMembership): Promise<void> {
    const noun = this.mode === 'officers' ? 'officer' : 'board';
    const confirmed = await this.confirmationDialog.confirm({
      title: 'Remove from roster?',
      message: `Remove ${membership.homeownerName} from the ${this.selectedYear()} ${noun} roster?`,
      confirmLabel: 'Remove',
      variant: 'danger',
    });
    if (!confirmed) return;

    this.actionError.set(null);
    this.removePendingId.set(membership.id);
    this.membershipApi.remove(membership.id).subscribe({
      next: () => {
        this.removePendingId.set(null);
        this.load();
      },
      error: (error: ApiError) => {
        this.actionError.set(error.message);
        this.removePendingId.set(null);
      },
    });
  }

  private loadEligible(): void {
    this.loadingEligible.set(true);
    this.eligibleError.set(null);
    this.membershipApi.listEligibleHomeowners(this.selectedYear(), this.mode === 'officers').subscribe({
      next: (homeowners) => {
        this.eligibleHomeowners.set(homeowners);
        this.loadingEligible.set(false);
      },
      error: (error: ApiError) => {
        this.eligibleError.set(error.message);
        this.loadingEligible.set(false);
      },
    });
  }

  private loadOfficerPositions(): void {
    this.officerPositionApi.list().subscribe({
      next: (positions) => this.officerPositions.set(positions.map((p) => p.title)),
      error: () => {
      },
    });
  }
}
