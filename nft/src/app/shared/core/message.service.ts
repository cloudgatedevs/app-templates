import { Injectable } from '@angular/core';
import type { SweetAlertResult } from 'sweetalert2';

type MessageOptions = Record<string, unknown> & { isHtml?: boolean };

function showMessage(type: string, message: string, title?: string, options?: MessageOptions): Promise<SweetAlertResult> {
  const opts: Record<string, unknown> = { ...(options ?? {}) };
  opts.titleText = title;
  opts.icon = type;
  opts.confirmButtonText = opts.confirmButtonText ?? 'OK';
  if (options?.isHtml) {
    opts.html = message;
  } else {
    opts.text = message;
  }
  return window.Swal.fire(opts as any);
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  info(message: string, title?: string, options?: MessageOptions): Promise<SweetAlertResult> {
    return showMessage('info', message, title, options);
  }

  success(message: string, title?: string, options?: MessageOptions): Promise<SweetAlertResult> {
    return showMessage('success', message, title, options);
  }

  warn(message: string, title?: string, options?: MessageOptions): Promise<SweetAlertResult> {
    return showMessage('warning', message, title, options);
  }

  error(message: string, title?: string, options?: MessageOptions): Promise<SweetAlertResult> {
    return showMessage('error', message, title, options);
  }

  confirm(
    message: string,
    title?: string,
    callback?: (value: boolean, result: SweetAlertResult) => void,
    options?: MessageOptions,
  ): Promise<SweetAlertResult> {
    const opts: Record<string, unknown> = { ...(options ?? {}) };
    opts.title = title ?? 'Are you sure?';
    opts.icon = 'warning';
    opts.confirmButtonText = opts.confirmButtonText ?? 'Yes';
    opts.cancelButtonText = opts.cancelButtonText ?? 'Cancel';
    opts.showCancelButton = true;
    if (opts.isHtml) {
      opts.html = message;
    } else {
      opts.text = message;
    }
    return window.Swal.fire(opts as any).then((result) => {
      callback?.(!!result.value, result);
      return result;
    });
  }
}
