export interface UserNotificationPayload {
  notification: {
    data: {
      properties: {
        Message: string;
      };
    };
    notificationName: string;
  };
}
