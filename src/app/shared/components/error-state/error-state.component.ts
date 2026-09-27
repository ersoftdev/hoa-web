import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  templateUrl: './error-state.component.html',
})
export class ErrorStateComponent {
  readonly title = input('Unable to load this page');
  readonly description = input('Something went wrong. Please try again.');
  readonly retry = output<void>();
}
