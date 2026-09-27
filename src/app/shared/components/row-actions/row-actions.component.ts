import { Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dropdown } from 'bootstrap';

export interface RowAction {
  label: string;
  icon: string;
  colorClass?: string;
  routerLink?: readonly unknown[] | string;
  queryParams?: Record<string, string>;
  onClick?: () => void;
  pending?: boolean;
}

@Component({
  selector: 'app-row-actions',
  imports: [RouterLink],
  templateUrl: './row-actions.component.html',
})
export class RowActionsComponent implements OnDestroy {
  readonly actions = input.required<RowAction[]>();

  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private dropdown?: Dropdown;

  constructor() {
    effect(() => {
      this.dropdown?.dispose();
      this.dropdown = undefined;

      const el = this.trigger()?.nativeElement;
      if (!el) return;
      this.dropdown = new Dropdown(el, {
        popperConfig: (defaults) => ({ ...defaults, strategy: 'fixed' }),
      });
    });
  }

  ngOnDestroy(): void {
    this.dropdown?.dispose();
  }
}
