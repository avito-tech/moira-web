// @flow
import type { Contact } from "./Contact";
import type { Subscription } from "./Subscription";

export interface Settings {
    isSuperUser: boolean;
    login: string;
    contacts: Array<Contact>;
    subscriptions: Array<Subscription>;
}
