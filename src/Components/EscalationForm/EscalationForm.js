// @flow
import * as React from "react";
import { tooltip, type ValidationInfo, ValidationWrapperV1 } from "react-ui-validations";
import type { Contact } from "../../Domain/Contact";
import type { EscalationInfo } from "../../Domain/Subscription";
import ContactSelect from "../ContactSelect/ContactSelect";
import FormattedNumberInput from "../FormattedNumberInput/FormattedNumberInput";
import cn from "./EscalationForm.less";

type Props = {
    escalation: EscalationInfo,
    onChange: ($Shape<EscalationInfo>) => void,
    usedContactIds: Array<string>,
    availableContacts: Array<Contact>,
};

export default class EscalationForm extends React.Component<Props> {
    props: Props;

    validateContacts(): ?ValidationInfo {
        const { escalation } = this.props;
        if (escalation.contacts.length === 0) {
            return {
                message: "Please add one or more delivery channels",
                type: "submit",
            };
        }
        return null;
    }

    validateOffset(): ?ValidationInfo {
        const { escalation: { offset_in_minutes: value } } = this.props;

        if (value == null) {
            return {
                message: "Offset can't be empty",
                type: "submit",
            };
        }
        return null;
    }

    render(): React.Node {
        const { escalation, usedContactIds, availableContacts, onChange } = this.props;

        return (
            <div className={cn("form")}>
                <div className={cn("group")}>
                    <span>Escalate after</span>
                    <ValidationWrapperV1 renderMessage={tooltip("right middle")} validationInfo={this.validateOffset()}>
                        <FormattedNumberInput
                            value={escalation.offset_in_minutes}
                            width="45px"
                            mask="999"
                            maskChar=" "
                            onChange={(e, value) => onChange({ ...escalation, offset_in_minutes: value || 0 })}
                            viewFormat="0"
                            editFormat="0"
                        />
                    </ValidationWrapperV1>
                    <span>minutes to:</span>
                </div>
                <div className={cn("row")}>
                    <div>
                        <ValidationWrapperV1
                            renderMessage={tooltip("right middle")}
                            validationInfo={this.validateContacts()}>
                            <ContactSelect
                                contactIds={escalation.contacts}
                                onChange={contacts => onChange({ ...escalation, contacts: contacts })}
                                usedContactIds={usedContactIds}
                                availableContacts={availableContacts}
                            />
                        </ValidationWrapperV1>
                    </div>
                </div>
            </div>
        );
    }
}
