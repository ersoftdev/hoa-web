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
import { EventsApiService } from '../../data-access/events-api.service';
import { ContentLifecycleAction, VISIBILITY_LABELS } from '../../models/content-visibility.model';
import { Event } from '../../models/event.model';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-event-detail',
  imports: [RouterLink, DatePipe, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './event-detail.component.html',
})
export class EventDetailComponent {
  private readonly api = inject(EventsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);

  protected readonly canManage = this.auth.hasPermission('CAN_MANAGE_EVENTS');
  protected readonly canApproveEvents = this.auth.hasPermission('CAN_APPROVE_EVENTS');
  protected readonly visibilityLabels = VISIBILITY_LABELS;

  protected readonly state = signal<LoadState>('loading');
  protected readonly event = signal<Event | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly actionPending = signal(false);
  protected readonly actionError = signal<string | null>(null);

  protected readonly nextAction = computed<{ action: ContentLifecycleAction; label: string; variant: 'primary' | 'danger' } | null>(
    () => {
      switch (this.event()?.status) {
        case 'Draft':
          return { action: 'publish', label: 'Publish', variant: 'primary' };
        case 'Published':
          return { action: 'cancel', label: 'Cancel Event', variant: 'danger' };
        default:
          return null;
      }
    },
  );

  protected readonly canArchive = computed(() => this.event()?.status === 'Cancelled');
  protected readonly canPerformNextAction = computed(() => {
    const next = this.nextAction();
    if (!next) return false;
    return next.action === 'publish' ? this.canApproveEvents : this.canManage;
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Missing event id.');
      this.state.set('error');
      return;
    }

    this.state.set('loading');
    this.api.get(id).subscribe({
      next: (event) => {
        this.event.set(event);
        this.state.set('success');
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message);
        this.state.set('error');
      },
    });
  }

  protected async onLifecycleAction(action: ContentLifecycleAction, label: string, variant: 'primary' | 'danger'): Promise<void> {
    const event = this.event();
    if (!event) return;

    const confirmed = await this.confirmationDialog.confirm({
      title: `${label}?`,
      message:
        action === 'cancel'
          ? `Homeowners will see "${event.title}" as cancelled.`
          : action === 'archive'
            ? 'Archived events are hidden from the list.'
            : `"${event.title}" will become visible to its audience.`,
      confirmLabel: label,
      variant,
    });
    if (!confirmed) return;

    this.actionPending.set(true);
    this.actionError.set(null);
    this.api.setStatus(event.id, action).subscribe({
      next: (updated) => {
        this.event.set(updated);
        this.actionPending.set(false);
      },
      error: (error: ApiError) => {
        this.actionError.set(error.message);
        this.actionPending.set(false);
      },
    });
  }
}
