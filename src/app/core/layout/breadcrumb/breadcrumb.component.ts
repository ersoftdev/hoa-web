import { toSignal } from '@angular/core/rxjs-interop';
import { Component, inject } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);

  protected readonly breadcrumbs = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.buildBreadcrumbs(this.router.routerState.snapshot.root)),
    ),
    { initialValue: this.buildBreadcrumbs(this.router.routerState.snapshot.root) },
  );

  private buildBreadcrumbs(route: ActivatedRouteSnapshot, url = '', trail: Breadcrumb[] = []): Breadcrumb[] {
    for (const child of route.children) {
      const segment = child.url.map((s) => s.path).join('/');
      const nextUrl = segment ? `${url}/${segment}` : url;
      const label = child.data['breadcrumb'] as string | undefined;
      trail = label ? [...trail, { label, url: nextUrl }] : trail;
      trail = this.buildBreadcrumbs(child, nextUrl, trail);
    }
    return trail;
  }
}
