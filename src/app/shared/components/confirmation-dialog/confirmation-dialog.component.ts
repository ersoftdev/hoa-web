import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { Modal } from 'bootstrap';

import { ConfirmOptions, ConfirmationDialogService } from '../../services/confirmation-dialog.service';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent implements AfterViewInit, OnDestroy {
  private readonly service = inject(ConfirmationDialogService);
  private readonly modalElement = viewChild.required<ElementRef<HTMLElement>>('modalRef');

  private modal?: Modal;
  private resolveFn?: (value: boolean) => void;

  protected readonly options = signal<ConfirmOptions | null>(null);
  protected readonly pending = signal(false);

  ngAfterViewInit(): void {
    const element = this.modalElement().nativeElement;
    this.modal = new Modal(element, { backdrop: 'static' });
    element.addEventListener('hidden.bs.modal', () => this.settle(false));
    this.service.register(this);
  }

  open(options: ConfirmOptions): Promise<boolean> {
    this.options.set(options);
    this.modal?.show();
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  protected confirm(): void {
    this.settle(true);
    this.modal?.hide();
  }

  protected cancel(): void {
    this.modal?.hide();
  }

  private settle(value: boolean): void {
    this.resolveFn?.(value);
    this.resolveFn = undefined;
  }

  ngOnDestroy(): void {
    this.modal?.dispose();
  }
}
