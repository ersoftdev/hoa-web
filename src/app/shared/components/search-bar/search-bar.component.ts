import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, input, output } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
})
export class SearchBarComponent {
  readonly placeholder = input('Search…');
  readonly debounceMs = input(300);
  readonly search = output<string>();

  private readonly input$ = new Subject<string>();

  constructor() {
    this.input$
      .pipe(debounceTime(this.debounceMs()), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.search.emit(value));
  }

  protected onInput(event: Event): void {
    this.input$.next((event.target as HTMLInputElement).value);
  }
}
