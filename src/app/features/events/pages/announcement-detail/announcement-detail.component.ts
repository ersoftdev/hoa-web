import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error.model';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog.service';
import { AnnouncementsApiService } from '../../data-access/announcements-api.service';
import { Announcement } from '../../models/announcement.model';
import { ContentLifecycleAction, VISIBILITY_LABELS } from '../../models/content-visibility.model';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-announcement-detail',
  imports: [RouterLink, DatePipe, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './announcement-detail.component.html',
})
export class AnnouncementDetailComponent {
  private readonly api = inject(AnnouncementsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);

  protected readonly canManage = this.auth.hasPermission('CAN_MANAGE_ANNOUNCEMENTS');
  protected readonly visibilityLabels = VISIBILITY_LABELS;

  protected readonly state = signal<LoadState>('loading');
  protected readonly announcement = signal<Announcement | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly actionPending = signal(false);
  protected readonly actionError = signal<string | null>(null);

  protected readonly nextAction = computed<{ action: ContentLifecycleAction; label: string; variant: 'primary' | 'danger' } | null>(
    () => {
      switch (this.announcement()?.status) {
        case 'Draft':
          return { action: 'publish', label: 'Publish', variant: 'primary' };
        case 'Published':
          return { action: 'cancel', label: 'Retract', variant: 'danger' };
        default:
          return null;
      }
    },
  );

  protected readonly canArchive = computed(() => this.announcement()?.status === 'Cancelled');

  constructor() {
    this.load();
  }

  protected load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Missing announcement id.');
      this.state.set('error');
      return;
    }

    this.state.set('loading');
    this.api.get(id).subscribe({
      next: (announcement) => {
        this.announcement.set(announcement);
        this.state.set('success');
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.state.set('error');
      },
    });
  }

  protected async onLifecycleAction(action: ContentLifecycleAction, label: string, variant: 'primary' | 'danger'): Promise<void> {
    const announcement = this.announcement();
    if (!announcement) return;

    const confirmed = await this.confirmationDialog.confirm({
      title: `${label}?`,
      message:
        action === 'cancel'
          ? `"${announcement.title}" will be retracted and no longer visible to its audience.`
          : action === 'archive'
            ? 'Archived announcements are hidden from the list.'
            : `"${announcement.title}" will become visible to its audience.`,
      confirmLabel: label,
      variant,
    });
    if (!confirmed) return;

    this.actionPending.set(true);
    this.actionError.set(null);
    this.api.setStatus(announcement.id, action).subscribe({
      next: (updated) => {
        this.announcement.set(updated);
        this.actionPending.set(false);
      },
      error: (error: ApiError) => {
        this.actionError.set(error.message);
        this.actionPending.set(false);
      },
    });
  }
}
