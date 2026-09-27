import { Component, inject, signal } from '@angular/core';

import { ApiError } from '../../../../core/http/api-error.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { RowAction, RowActionsComponent } from '../../../../shared/components/row-actions/row-actions.component';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog.service';
import { OfficerPositionApiService } from '../../data-access/officer-position-api.service';
import { OfficerPosition } from '../../models/officer-position.model';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-officer-positions',
  imports: [PageHeaderComponent, RowActionsComponent, EmptyStateComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './officer-positions.component.html',
})
export class OfficerPositionsComponent {
  private readonly api = inject(OfficerPositionApiService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly positions = signal<OfficerPosition[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);

  protected readonly addMode = signal(false);
  protected readonly newTitle = signal('');
  protected readonly addPending = signal(false);
  protected readonly addError = signal<string | null>(null);

  protected readonly editingId = signal<string | null>(null);
  protected readonly editTitle = signal('');
  protected readonly editPending = signal(false);
  protected readonly editError = signal<string | null>(null);

  protected readonly deletePendingId = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    this.api.list().subscribe({
      next: (positions) => {
        this.positions.set(positions);
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
    this.newTitle.set('');
    this.addMode.set(true);
  }

  protected onCancelAdd(): void {
    this.addMode.set(false);
  }

  protected onNewTitleInput(event: Event): void {
    this.newTitle.set((event.target as HTMLInputElement).value);
  }

  protected onConfirmAdd(): void {
    const title = this.newTitle().trim();
    if (!title || this.addPending()) return;

    this.addPending.set(true);
    this.addError.set(null);
    this.api.create({ title }).subscribe({
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

  protected onStartEdit(position: OfficerPosition): void {
    this.editError.set(null);
    this.editingId.set(position.id);
    this.editTitle.set(position.title);
  }

  protected onCancelEdit(): void {
    this.editingId.set(null);
  }

  protected onEditTitleInput(event: Event): void {
    this.editTitle.set((event.target as HTMLInputElement).value);
  }

  protected onConfirmEdit(position: OfficerPosition): void {
    const title = this.editTitle().trim();
    if (!title || this.editPending()) return;

    this.editPending.set(true);
    this.editError.set(null);
    this.api.update(position.id, { title }).subscribe({
      next: () => {
        this.editPending.set(false);
        this.editingId.set(null);
        this.load();
      },
      error: (error: ApiError) => {
        this.editError.set(error.message);
        this.editPending.set(false);
      },
    });
  }

  protected actionsFor(position: OfficerPosition): RowAction[] {
    if (this.editingId() === position.id) return [];
    return [
      { label: 'Edit', icon: 'pencil', onClick: () => this.onStartEdit(position) },
      {
        label: 'Delete',
        icon: 'trash',
        colorClass: 'text-danger',
        onClick: () => this.onDelete(position),
        pending: this.deletePendingId() === position.id,
      },
    ];
  }

  protected async onDelete(position: OfficerPosition): Promise<void> {
    const confirmed = await this.confirmationDialog.confirm({
      title: 'Delete officer position?',
      message: `Delete "${position.title}"? This can't be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    this.actionError.set(null);
    this.deletePendingId.set(position.id);
    this.api.delete(position.id).subscribe({
      next: () => {
        this.deletePendingId.set(null);
        this.load();
      },
      error: (error: ApiError) => {
        this.actionError.set(error.message);
        this.deletePendingId.set(null);
      },
    });
  }
}
