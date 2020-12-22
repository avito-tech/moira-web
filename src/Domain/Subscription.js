// @flow
import type { Contact } from "./Contact";
import type { Schedule } from "./Schedule";

export type EscalationInfo = {
    contacts: Array<string>,
    offset_in_minutes: number,
};

export type EscalationFiltered = {
    id: string,
    offset_in_minutes: number,
    contacts: Array<Contact>,
};

export type Subscription = {
    sched: Schedule,
    tags: Array<string>,
    throttling: boolean,
    contacts: Array<string>,
    enabled: boolean,
    user: string,
    id: string,
    sendNotificationsOnTriggerDegradedOnly: ?boolean,
    doNotSendWarnNotifications: ?boolean,
    escalations: Array<EscalationInfo>,
};

export type SubscriptionFiltered = {
    id: string,
    enabled: boolean,
    tags: Array<string>,
    user: string,
    contacts: Array<Contact>,
    escalations: Array<EscalationFiltered>,
    matched_esc: Array<boolean>,
    matched_sub: boolean,
};

export type SubscriptionSearchResult = {
    list: Array<SubscriptionFiltered>,
};
