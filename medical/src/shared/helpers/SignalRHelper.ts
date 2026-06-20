import { AppConsts } from 'src/app/shared/AppConsts';
import { LocalStorageService } from '../utils/local-storage.service';

export class SignalRHelper {
  static initSignalR(callback: () => void): void {
    new LocalStorageService().getItem(
      AppConsts.authorization.encrptedAuthTokenName,
      function (err: any, value: { token: any }) {
        let encryptedAuthToken = value?.token;

        abp.signalr = {
          autoConnect: false, // _zone.runOutsideAngular in ChatSignalrService
          // autoReconnect: true,
          // connect: undefined,
          // hubs: undefined,
          qs: encryptedAuthToken
            ? AppConsts.authorization.encrptedAuthTokenName + '=' + encodeURIComponent(encryptedAuthToken)
            : '',
          remoteServiceBaseUrl: AppConsts.remoteServiceBaseUrl,
          // startConnection: undefined,
          url: '/signalr',
          withUrlOptions: '',
        } as any;

        let script = document.createElement('script');
        script.onload = () => {
          callback();
        };

        script.src = AppConsts.appBaseUrl + '/assets/abp/abp.signalr-client.js';
        document.head.appendChild(script);
      },
    );
  }
}
