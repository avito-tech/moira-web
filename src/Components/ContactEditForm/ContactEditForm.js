// @flow
import * as React from "react";
import Input from "retail-ui/components/Input";
import Select from "retail-ui/components/Select";
import { ValidationWrapperV1, tooltip, type ValidationInfo } from "react-ui-validations";
import { getContactTypeCaption } from "../../Domain/ContactType";
import type { ContactConfig } from "../../Domain/Config";
import validateContact from "../../Helpers/ContactValidator";
import ContactTypeIcon from "../ContactTypeIcon/ContactTypeIcon";
import cn from "./ContactEditForm.less";

export type ContactInfo = {
    type: ?string,
    value: string,
    fallback_value?: string;
};

export type ContactInfoUpdate = $Shape<{
    type: string,
    value: string,
    fallback_value?: string;
}>;

type Props = ReactExactProps<{
    contactDescriptions: Array<ContactConfig>,
    contactInfo: ContactInfo,
    onChange: ($Shape<ContactInfoUpdate>) => void,
}>;

export default class ContactEditForm extends React.Component<Props> {
    props: Props;

    getPlaceholderForContactType(contactConfig: ?ContactConfig): string {
        if (contactConfig == null) {
            return "";
        }
        const contactType = contactConfig.type;
        if (contactType === "telegram") {
            return "Enter telegram #channel, @username or group";
        }
        if (contactType === "twilio sms" || contactType === "twilio voice") {
            return "Enter your phone number (e.g. +79.......)";
        }
        if (contactType === "pushover") {
            return "Enter your pushover user key";
        }
        if (contactType === "slack") {
            return "Enter slack #channel or @username";
        }
        if (contactType === "email") {
            return "Enter email address";
        }

        if (contactType === "webhook") {
            return "Enter webhook url";
        }
        if (contactConfig.title != null) {
            return contactConfig.title;
        }
        if (contactType.includes("mail")) {
            return "Enter email address";
        }
        return "";
    }

    getCommentTextFor(contactConfig: ?ContactConfig): string {
        if (contactConfig == null) {
            return "";
        }
        const contactType = contactConfig.type;
        if (contactType === "telegram") {
            return "You have to grant @KonturMoiraBot admin privileges for channel, or execute /start command for groups or personal chats.";
        }
        return contactConfig.help || "";
    }

    validateValue(): ?ValidationInfo {
        const { contactInfo, contactDescriptions } = this.props;
        const { value, type, fallback_value: fallbackValue = "" } = contactInfo;
        const currentContactConfig = contactDescriptions.find(x => x.type === type);
        if (type == null || currentContactConfig == null) {
            return null;
        }
        return validateContact(currentContactConfig, value, fallbackValue);
    }

    render(): React.Node {
        const { onChange, contactInfo, contactDescriptions } = this.props;
        const { value, type, fallback_value: fallbackValue = "" } = contactInfo;
        const currentContactConfig = contactDescriptions.find(x => x.type === type);

        return (
            <div className={cn("form")}>
                <div className={cn("row")}>
                    <Select
                        placeholder="Select channel type"
                        width={"100%"}
                        value={type}
                        renderItem={(value, item) => (
                            <span>
                                <ContactTypeIcon type={value} /> {item}
                            </span>
                        )}
                        renderValue={(value, item) => (
                            <span>
                                <ContactTypeIcon type={value} /> {item}
                            </span>
                        )}
                        onChange={(e, value) => onChange({ type: value })}
                        items={contactDescriptions.map(x => [x.type, getContactTypeCaption(x)])}
                    />
                </div>
                <div className={cn("row")}>
                    <ValidationWrapperV1 renderMessage={tooltip("top left")} validationInfo={this.validateValue()}>
                        <Input
                            width={"100%"}
                            disabled={type == null}
                            placeholder={this.getPlaceholderForContactType(currentContactConfig)}
                            value={value}
                            onChange={(e, value) => onChange({ value: value })}
                        />
                    </ValidationWrapperV1>
                </div>

                { currentContactConfig !== undefined && currentContactConfig.can_have_fallback_value && <div className={cn("row")}>
                    <ValidationWrapperV1 renderMessage={tooltip("top left")} validationInfo={this.validateValue()}>
                        <Input
                            width={"100%"}
                            disabled={type == null}
                            placeholder={"Fallback value (required in some cases)"}
                            value={fallbackValue}
                            onChange={(e, fallbackValue) => onChange({ fallback_value: fallbackValue })}
                        />
                    </ValidationWrapperV1>
                </div> }

                <div className={cn("row", "comment")}>
                    {currentContactConfig != null && this.getCommentTextFor(currentContactConfig)}
                </div>
            </div>
        );
    }
}
