// @flow

interface NotificationsSettings {
    author: string;
    disabled: boolean;
}

export interface GlobalSettings {
    notifications: NotificationsSettings;
}
