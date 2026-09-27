import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error.model';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog.service';
import { AnnouncementsApiService } from '../../../events/data-access/announcements-api.service';
import { Announcement } from '../../../events/models/announcement.model';
import { HomeownersApiService } from '../../data-access/homeowners-api.service';
import { Homeowner, HomeownerStatus } from '../../models/homeowner.model';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-homeowner-detail',
  imports: [RouterLink, DatePipe, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './homeowner-detail.component.html',
})
export class HomeownerDetailComponent {
  private readonly api = inject(HomeownersApiService);
  private readonly announcementsApi = inject(AnnouncementsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);

  protected readonly canManage = this.auth.hasPermission('CAN_MANAGE_HOMEOWNERS');
  protected readonly canManageAnnouncements = this.auth.hasPermission('CAN_MANAGE_ANNOUNCEMENTS');

  protected readonly state = signal<LoadState>('loading');
  protected readonly homeowner = signal<Homeowner | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly actionPending = signal(false);
  protected readonly actionError = signal<string | null>(null);

  protected readonly statusChangeMode = signal(false);
  protected readonly loadingAnnouncements = signal(false);
  protected readonly announcementsError = signal<string | null>(null);
  protected readonly availableAnnouncements = signal<Announcement[]>([]);
  protected readonly selectedAnnouncementId = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Missing homeowner id.');
      this.state.set('error');
      return;
    }

    this.state.set('loading');
    this.api.get(id).subscribe({
      next: (homeowner) => {
        this.homeowner.set(homeowner);
        this.state.set('success');
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.state.set('error');
      },
    });
  }

  protected onStartStatusChange(): void {
    this.actionError.set(null);
    this.selectedAnnouncementId.set(null);
    this.statusChangeMode.set(true);
    this.loadAnnouncements();
  }

  protected onCancelStatusChange(): void {
    this.statusChangeMode.set(false);
  }

  protected onSelectAnnouncement(event: Event): void {
    this.selectedAnnouncementId.set((event.target as HTMLSelectElement).value || null);
  }

  protected async onConfirmStatusChange(): Promise<void> {
    const homeowner = this.homeowner();
    const announcementId = this.selectedAnnouncementId();
    if (!homeowner || !announcementId) return;

    const nextStatus: HomeownerStatus = homeowner.status === 'Inactive' ? 'Active' : 'Inactive';
    const activating = nextStatus === 'Active';
    const confirmed = await this.confirmationDialog.confirm({
      title: activating ? 'Activate homeowner?' : 'Deactivate homeowner?',
      message: activating
        ? `${homeowner.fullName} will regain access to the portal. The selected announcement will be linked to this change.`
        : `${homeowner.fullName} will lose access to the portal until reactivated. The selected announcement will be linked to this change.`,
      confirmLabel: activating ? 'Activate' : 'Deactivate',
      variant: activating ? 'primary' : 'danger',
    });
    if (!confirmed) return;

    this.actionPending.set(true);
    this.actionError.set(null);
    this.api.setStatus(homeowner.id, { status: nextStatus, announcementId }).subscribe({
      next: (updated) => {
        this.homeowner.set(updated);
        this.actionPending.set(false);
        this.statusChangeMode.set(false);
      },
      error: (error: ApiError) => {
        this.actionError.set(error.message);
        this.actionPending.set(false);
      },
    });
  }

  private loadAnnouncements(): void {
    this.loadingAnnouncements.set(true);
    this.announcementsError.set(null);
    this.announcementsApi.list({ page: 1, pageSize: 50, status: 'Published' }).subscribe({
      next: (result) => {
        this.availableAnnouncements.set(result.items);
        this.loadingAnnouncements.set(false);
      },
      error: (error: ApiError) => {
        this.announcementsError.set(error.message);
        this.loadingAnnouncements.set(false);
      },
    });
  }
}
