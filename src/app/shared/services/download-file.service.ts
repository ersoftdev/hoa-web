import { Injectable } from '@angular/core';

/** Saves a Blob returned by an API call (e.g. HoaApiService.getBlob) as a
 * regular browser download — nothing in the repo streams a file yet, so
 * this is the first. A plain injectable rather than a bare function to
 * match this directory's other cross-cutting helpers
 * (shared/services/confirmation-dialog.service.ts). */
@Injectable({ providedIn: 'root' })
export class DownloadFileService {
  save(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  /** Pulls the filename out of a `Content-Disposition:
   * attachment; filename="…"` header, falling back to `fallback` if the
   * header is missing or unparsable. */
  filenameFromContentDisposition(header: string | null, fallback: string): string {
    const match = header?.match(/filename="?([^";]+)"?/i);
    return match?.[1] ?? fallback;
  }
}
