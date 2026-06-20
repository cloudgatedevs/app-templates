import { Injectable } from '@angular/core';
import { NotifyService } from 'src/app/shared/core/notify.service';

export interface FileDto {
  fileName?: string;
  fileType?: string;
  fileToken?: string;
}

@Injectable()
export class FileDownloadService {
  constructor(private readonly notify: NotifyService) {}

  /** Legacy ABP temp-file download — not available without remoteServiceBaseUrl. */
  downloadTempFile(_file: FileDto) {
    this.notify.warn('File download is not available in this template.');
  }
}
