import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { LayoutService } from '../layout.service';
import { NAV_ITEMS, NavItem } from '../navigation.model';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  protected readonly layout = inject(LayoutService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly expandedLabels = signal<ReadonlySet<string>>(new Set());
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly visibleItems = computed(() => NAV_ITEMS.filter((item) => this.isVisible(item)));

  protected visibleChildren(item: NavItem): NavItem[] {
    return (item.children ?? []).filter((child) => this.isVisible(child));
  }

  protected isExpanded(item: NavItem): boolean {
    return this.expandedLabels().has(item.label) || this.hasActiveChild(item);
  }

  protected hasActiveChild(item: NavItem): boolean {
    return this.visibleChildren(item).some((child) => this.isChildActive(child));
  }

  protected isChildActive(child: NavItem): boolean {
    const url = this.currentUrl();
    if (url.startsWith(this.route(child))) return true;
    return (child.activePrefixes ?? []).some((prefix) => url.startsWith(`/app/${prefix}`));
  }

  protected toggleExpanded(item: NavItem): void {
    const next = new Set(this.expandedLabels());
    if (next.has(item.label)) {
      next.delete(item.label);
    } else {
      next.add(item.label);
    }
    this.expandedLabels.set(next);
  }

  protected route(item: NavItem): string {
    return `/app/${item.route}`;
  }

  protected onNavigate(): void {
    this.layout.closeMobileSidebar();
  }

  private isVisible(item: NavItem): boolean {
    return !item.permission || this.auth.hasPermission(item.permission);
  }
}
