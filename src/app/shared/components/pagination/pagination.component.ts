import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  protected readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const windowSize = Math.min(5, total);
    let start = Math.max(1, this.page() - Math.floor(windowSize / 2));
    const end = Math.min(total, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  protected goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.page()) {
      this.pageChange.emit(page);
    }
  }
}
