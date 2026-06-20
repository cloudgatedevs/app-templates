import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from './message.service';
import { LogService } from './log.service';

export interface HttpErrorMessage {
  message: string;
  details?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppHttpConfigurationService {
  defaultError: HttpErrorMessage = {
    message: 'An error has occurred!',
    details: 'Error details were not sent by server.',
  };

  defaultError401: HttpErrorMessage = {
    message: 'You are not authenticated!',
    details: 'You should be authenticated (sign in) in order to perform this operation.',
  };

  defaultError403: HttpErrorMessage = {
    message: 'You are not authorized!',
    details: 'You are not allowed to perform this operation.',
  };

  defaultError404: HttpErrorMessage = {
    message: 'Resource not found!',
    details: 'The resource requested could not be found on the server.',
  };

  constructor(
    private readonly messageService: MessageService,
    private readonly logService: LogService,
    private readonly router: Router,
  ) {}

  logError(error: HttpErrorMessage): void {
    this.logService.error(error);
  }

  showError(error: HttpErrorMessage): Promise<unknown> {
    if (error.details) {
      return this.messageService.error(error.details, error.message || this.defaultError.message);
    }
    return this.messageService.error(error.message || this.defaultError.message);
  }

  handleTargetUrl(targetUrl?: string): void {
    location.href = targetUrl || '/';
  }

  handleUnAuthorizedRequest(messagePromise: Promise<unknown> | null | undefined, targetUrl?: string): void {
    if (
      this.router.url &&
      (this.router.url.startsWith('/auth/sign-in') || this.router.url.startsWith('/account/session-locked'))
    ) {
      return;
    }

    if (messagePromise) {
      void messagePromise.then(() => {
        this.handleTargetUrl(targetUrl || '/');
      });
    } else {
      this.handleTargetUrl(targetUrl || '/');
    }
  }

  handleNonAbpErrorResponse(response: { status: number }): void {
    switch (response.status) {
      case 401:
        this.handleUnAuthorizedRequest(this.showError(this.defaultError401), '/');
        break;
      case 403:
        void this.showError(this.defaultError403);
        break;
      case 404:
        void this.showError(this.defaultError404);
        break;
      default:
        void this.showError(this.defaultError);
        break;
    }
  }
}
