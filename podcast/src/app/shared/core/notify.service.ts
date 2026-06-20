import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';

const notifyDefaults: SweetAlertOptions = {
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  padding: 5,
  toast: true,
};

function showNotify(type: string, message: string, title?: string, options?: SweetAlertOptions): void {
  const iconClass =
    type === 'success'
      ? 'fa fa-check-circle'
      : type === 'info'
        ? 'fa fa-info-circle'
        : type === 'warning'
          ? 'fa fa-exclamation-triangle'
          : 'fa fa-exclamation-circle';

  const background =
    type === 'success'
      ? '#34bfa3'
      : type === 'info'
        ? '#36a3f7'
        : type === 'warning'
          ? '#ffb822'
          : '#f4516c';

  const merged = {
    ...notifyDefaults,
    ...options,
    background: options?.background ?? background,
  } as SweetAlertOptions;

  const icon = merged.icon ? '' : `<i class="me-2 text-white ${iconClass}"></i>`;
  if (title) {
    merged.title = icon + `<span class="text-white">${title}</span>`;
  }
  merged.html = (title ? '' : icon) + `<span class="text-white">${message}</span>`;

  void Swal.fire(merged);
}

@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  info(message: string, title?: string, options?: SweetAlertOptions): void {
    showNotify('info', message, title, options);
  }

  success(message: string, title?: string, options?: SweetAlertOptions): void {
    showNotify('success', message, title, options);
  }

  warn(message: string, title?: string, options?: SweetAlertOptions): void {
    showNotify('warning', message, title, options);
  }

  error(message: string, title?: string, options?: SweetAlertOptions): void {
    showNotify('error', message, title, options);
  }
}
