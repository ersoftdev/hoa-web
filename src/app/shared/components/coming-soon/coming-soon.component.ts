import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { PageHeaderComponent } from '../page-header/page-header.component';

@Component({
  selector: 'app-coming-soon',
  imports: [PageHeaderComponent, EmptyStateComponent],
  templateUrl: './coming-soon.component.html',
})
export class ComingSoonComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly title = (this.route.snapshot.data['breadcrumb'] as string | undefined) ?? 'Coming soon';
  protected readonly description =
    (this.route.snapshot.data['description'] as string | undefined) ??
    'This area is on the roadmap and will be built in a later milestone.';
  protected readonly icon = (this.route.snapshot.data['icon'] as string | undefined) ?? 'cone-striped';
}
