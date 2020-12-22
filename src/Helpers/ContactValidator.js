// @flow
import * as React from "react";
import { type ContactConfig } from "../Domain/Config";
import type { ValidationInfo } from "react-ui-validations";

const protocolAndDomainRE = /^(?:http|https):\/\/(\S+)$/;
const ip10xRe = /^10\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?::\d+)?/;
const nonLocalhostDomainRE = /^.+\.ru(?::\d+)?/;


function isUrl(string){
    if (typeof string !== 'string') {
        return false;
    }

    let match = string.match(protocolAndDomainRE);
    if (!match) {
        return false;
    }

    let everythingAfterProtocol = match[1];
    if (!everythingAfterProtocol) {
        return false;
    }

    return ip10xRe.test(everythingAfterProtocol) ||
        nonLocalhostDomainRE.test(everythingAfterProtocol);

}


export default function validateContact(contactConfig: ContactConfig, value: string, fallbackValue: ?string): ?ValidationInfo {
    const contactType = contactConfig.type;
    switch (contactType) {
        case "email": {
            if (value == null || value.trim() === "" || !value.includes("@")) {
                return { message: "Please enter a valid email address", type: "submit" };
            }
            break;
        }
        case "pushover": {
            if (value == null || value.trim() === "" || value.trim().includes(" ")) {
                return { message: "Please enter a valid pushover user key", type: "submit" };
            }
            break;
        }
        case "telegram": {
            if (value == null || value.trim() === "") {
                return { message: "Enter a valid telegram #channel, @username or group", type: "submit" };
            }
            break;
        }
        case "slack": {
            if (value == null || value.trim() === "") {
                return { message: "Enter a valid slack #channel, @username or group", type: "submit" };
            }
            if (value[0] != '@' && value[0] != '#' && (fallbackValue == null || fallbackValue.trim() === "")) {
                return { massage: "Enter a fallback #channel, @username or group", type: "submit" };
            }
            break;
        }

        case "webhook": {
            if (value == null || value.trim() === "" || !isUrl(value)) {
                return { message: "Enter valid url", type: "submit" };
            }
            break;
        }
        case "twilio sms":
        case "twilio voice": {
            if (value == null || value.trim() === "") {
                return { message: "Enter your phone number", type: "submit" };
            }
            if (!/((\+7)|8)?\d{10}/.test(value.trim())) {
                return {
                    message: (
                        <span>
                            Enter a valid russian phone number<br />
                            Phone number should starts with 8 or +7.
                        </span>
                    ),
                    type: "submit",
                };
            }
            break;
        }
        default:
            if (contactConfig.validation != null && contactConfig.validation !== "") {
                try {
                    const regexp = new RegExp(contactConfig.validation);
                    if (!regexp.test(value)) {
                        return {
                            message: `Please enter value in correct format${
                                contactConfig.help != null && contactConfig.help !== ""
                                    ? ": " + contactConfig.help
                                    : "."
                            }`,
                            type: "submit",
                        };
                    }
                } catch (e) {
                    return null;
                }
            }
    }
    return null;
}
