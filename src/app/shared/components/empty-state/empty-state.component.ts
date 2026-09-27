import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input('Nothing here yet');
  readonly description = input<string>();
}
