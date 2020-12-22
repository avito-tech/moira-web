// @flow
import type { ContactConfig } from "./Config";

export const ContactTypes = {
    mail: "mail",
    pushover: "pushover",
    telegram: "telegram",
    slack: "slack",
    ["twilio sms"]: "twilio sms",
    ["twilio voice"]: "twilio voice",
    webhook: "webhook",
};

const ContactTypeCaptions = {
    mail: "EMail",
    email: "EMail",
    pushover: "Pushover",
    telegram: "Telegram",
    "twilio sms": "Twilio SMS",
    "twilio voice": "Twilio voice",
    slack: "slack",
    webhook: "WebHook",
};

export function getContactTypeCaption(contactConfig: ContactConfig): string {
    if (ContactTypeCaptions[contactConfig.type] != null) {
        return ContactTypeCaptions[contactConfig.type];
    }
    return contactConfig.type;
}
