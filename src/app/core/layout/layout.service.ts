import { Injectable, effect, signal } from '@angular/core';


export type Theme = 'light' | 'dark';

const SIDEBAR_COLLAPSED_KEY = 'hoa.sidebar-collapsed';
const THEME_KEY = 'hoa.theme';
const MOBILE_BREAKPOINT_PX = 992; // matches styles/layout/_sidebar.scss

@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly sidebarCollapsed = signal(this.readStoredFlag(SIDEBAR_COLLAPSED_KEY));
  readonly mobileSidebarOpen = signal(false);
  readonly theme = signal<Theme>(this.readInitialTheme());

  constructor() {
    effect(() => {
      const theme = this.theme();
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-bs-theme', theme);
      }
      this.write(THEME_KEY, theme);
    });
  }

  toggleSidebar(): void {
    if (this.isMobileViewport()) {
      this.mobileSidebarOpen.update((open) => !open);
      return;
    }
    this.sidebarCollapsed.update((collapsed) => {
      const next = !collapsed;
      this.write(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  toggleTheme(): void {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  private isMobileViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT_PX;
  }

  private readStoredFlag(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(key) === 'true';
  }

  private readInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private write(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  }
}
