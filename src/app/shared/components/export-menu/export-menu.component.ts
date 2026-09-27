import { Component, input, output } from '@angular/core';

export type ReportExportFormat = 'pdf' | 'excel' | 'csv';

@Component({
  selector: 'app-export-menu',
  templateUrl: './export-menu.component.html',
})
export class ExportMenuComponent {
  readonly pending = input(false);
  readonly formatSelected = output<ReportExportFormat>();
}
