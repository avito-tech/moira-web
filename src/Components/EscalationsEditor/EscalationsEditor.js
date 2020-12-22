// @flow
import * as React from "react";
import Button from "retail-ui/components/Button";
import Icon from "retail-ui/components/Icon";
import type { Contact } from "../../Domain/Contact";
import type { EscalationInfo } from "../../Domain/Subscription";

import EscalationForm from "../EscalationForm/EscalationForm";

import cn from "./EscalationsEditor.less";

type Props = {
    escalations: Array<EscalationInfo>,
    onChange: (Array<EscalationInfo>) => void,
    usedContactIds: Array<string>,
    availableContacts: Array<Contact>,
};

export default class EscalationsEditor extends React.Component<Props> {
    props: Props;

    static createEscalation(offset: number): EscalationInfo {
        return {
            offset_in_minutes: offset,
            contacts: [],
        };
    }

    handleAddEscalation() {
        const { onChange, escalations } = this.props;
        const maxOffset = escalations.reduce((a, b) => Math.max(a, b.offset_in_minutes), 0);

        onChange([...escalations, EscalationsEditor.createEscalation(maxOffset + 20)]);
    }

    handleRemoveEscalation(index: number) {
        const { onChange, escalations } = this.props;
        onChange([...escalations.slice(0, index), ...escalations.slice(index + 1)]);
    }

    handleUpdateEscalation(index: number, esc: EscalationInfo) {
        const { onChange, escalations } = this.props;
        onChange([...escalations.slice(0, index), esc, ...escalations.slice(index + 1)]);
    }

    render(): React.Node {
        const { escalations, usedContactIds, availableContacts } = this.props;

        return (
            <div className={cn("form")}>
                {escalations.map((escalation, i) => (
                    <div className={cn("row")} key={i}>
                        <EscalationForm
                            escalation={escalation}
                            onChange={esc => this.handleUpdateEscalation(i, esc)}
                            usedContactIds={usedContactIds}
                            availableContacts={availableContacts}
                        />
                        <div className={cn("fgroup-control")}>
                            <Button onClick={() => this.handleRemoveEscalation(i)}>
                                <Icon name="Remove" />
                            </Button>
                        </div>
                    </div>
                ))}

                <Button use="link" icon="Add" onClick={() => this.handleAddEscalation()}>
                    Add {escalations.length > 0 ? "one more" : ""} escalation
                </Button>
            </div>
        );
    }
}
