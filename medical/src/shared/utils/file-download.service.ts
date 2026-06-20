import { Injectable } from '@angular/core';

export interface FileDto {
  fileName?: string;
  fileType?: string;
  fileToken?: string;
}

@Injectable()
export class FileDownloadService {
  downloadTempFile(_file: FileDto) {
    // Legacy ABP file download removed — not used in Cloudgate demo templates.
  }
}
