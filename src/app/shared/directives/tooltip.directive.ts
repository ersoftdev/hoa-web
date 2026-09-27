import { Directive, ElementRef, Input, OnChanges, OnDestroy, inject } from '@angular/core';
import { Tooltip } from 'bootstrap';

/**
 * Bootstrap's `data-bs-toggle="dropdown"`/`"modal"` auto-init via its own
 * data-api, but `data-bs-toggle="tooltip"` does not — it needs an
 * explicit `new Tooltip(el)` call. Same direct-class-usage pattern
 * ConfirmationDialogComponent already uses for `Modal`, just wrapped as a
 * directive since a tooltip attaches to an arbitrary existing element
 * (e.g. `<app-status-badge>`) rather than owning its own template.
 *
 * Usage: `<app-status-badge [appTooltip]="'explanation text'" />`.
 */
@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective implements OnChanges, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private instance?: Tooltip;

  @Input('appTooltip') text = '';

  ngOnChanges(): void {
    this.instance?.dispose();
    this.instance = undefined;
    if (!this.text) return;

    const el = this.elementRef.nativeElement;
    el.setAttribute('data-bs-toggle', 'tooltip');
    el.setAttribute('title', this.text);
    this.instance = new Tooltip(el);
  }

  ngOnDestroy(): void {
    this.instance?.dispose();
  }
}
