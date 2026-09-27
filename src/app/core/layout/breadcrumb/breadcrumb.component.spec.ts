import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterOutlet, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { BreadcrumbComponent } from './breadcrumb.component';

@Component({
  selector: 'app-dummy-shell',
  imports: [BreadcrumbComponent, RouterOutlet],
  template: '<app-breadcrumb /><router-outlet />',
})
class DummyShellComponent {}

@Component({ selector: 'app-dummy-leaf', template: '' })
class DummyLeafComponent {}

describe('BreadcrumbComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'parent',
            component: DummyShellComponent,
            data: { breadcrumb: 'Parent' },
            children: [{ path: 'child', component: DummyLeafComponent, data: { breadcrumb: 'Child' } }],
          },
        ]),
      ],
    });
  });

  it('does not throw when constructed as a sibling of <router-outlet>, before the nested route activates', async () => {
    const harness = await RouterTestingHarness.create('/parent/child');

    const crumbs = harness.routeNativeElement?.querySelectorAll('.breadcrumb-item');
    expect(crumbs?.length).toBe(2);
    expect(harness.routeNativeElement?.textContent).toContain('Parent');
    expect(harness.routeNativeElement?.textContent).toContain('Child');
  });
});
