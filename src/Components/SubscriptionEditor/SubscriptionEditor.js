// @flow
import * as React from "react";
import { difference, intersection, union } from "lodash";
import Checkbox from "retail-ui/components/Checkbox";
import Link from "retail-ui/components/Link";
import Tooltip from "retail-ui/components/Tooltip";
import { tooltip, type ValidationInfo, ValidationWrapperV1 } from "react-ui-validations";
import type { Contact } from "../../Domain/Contact";
import type { EscalationInfo } from "../../Domain/Subscription";
import type { Schedule } from "../../Domain/Schedule";
import ContactSelect from "../ContactSelect/ContactSelect";
import EscalationsEditor from "../EscalationsEditor/EscalationsEditor";
import TagDropdownSelect from "../TagDropdownSelect/TagDropdownSelect";
import ScheduleEdit from "../ScheduleEdit/ScheduleEdit";
import CodeRef from "../CodeRef/CodeRef";
import cn from "./SubscriptionEditor.less";

export type SubscriptionInfo = {
    sched: Schedule,
    tags: Array<string>,
    throttling: boolean,
    contacts: Array<string>,
    enabled: boolean,
    sendNotificationsOnTriggerDegradedOnly: ?boolean,
    doNotSendWarnNotifications: ?boolean,
    escalations: Array<EscalationInfo>,
};

type Props = {
    subscription: SubscriptionInfo,
    onChange: ($Shape<SubscriptionInfo>) => void,
    tags: Array<string>,
    contacts: Array<Contact>,
};

export const specialTags = ["DEGRADATION", "ERROR"];

export default class SubscriptionEditor extends React.Component<Props> {
    props: Props;

    renderThrottlingExplanation = () => {
        return <span>If trigger emit to many events they will be grouped into single message.</span>;
    };

    renderTagsExplanation = () => {
        return (
            <span>
                Notification will be sent if trigger contains <strong>ALL</strong> of selected tags.
            </span>
        );
    };

    renderDegradationExplanation = () => {
        return (
            <div>
                Only following state switches triggers notification:
                <div>
                    <CodeRef>OK</CodeRef> -&gt; <CodeRef>WARN</CodeRef>
                </div>
                <div>
                    <CodeRef>OK</CodeRef> -&gt; <CodeRef>ERROR</CodeRef>
                </div>
                <div>
                    <CodeRef>OK</CodeRef> -&gt; <CodeRef>NODATA</CodeRef>
                </div>
                <div>
                    <CodeRef>WARN</CodeRef> -&gt; <CodeRef>ERROR</CodeRef>
                </div>
                <div>
                    <CodeRef>WARN</CodeRef> -&gt; <CodeRef>NODATA</CodeRef>
                </div>
                <div>
                    <CodeRef>ERROR</CodeRef> -&gt; <CodeRef>NODATA</CodeRef>
                </div>
            </div>
        );
    };

    renderWarnExclusionExplanation = () => {
        return (
            <div>
                Do not triggers notification on following switches:
                <div>
                    <CodeRef>OK</CodeRef> -&gt; <CodeRef>WARN</CodeRef>
                </div>
                <div>
                    <CodeRef>WARN</CodeRef> -&gt; <CodeRef>OK</CodeRef>
                </div>
            </div>
        );
    };

    validateContacts(): ?ValidationInfo {
        const { subscription } = this.props;
        if (subscription.contacts.length === 0) {
            return {
                message: "Please add one or more delivery channels",
                type: "submit",
            };
        }
        return null;
    }

    validateTags(): ?ValidationInfo {
        const { subscription } = this.props;
        if (subscription.tags.length === 0) {
            return {
                message: "Please add one or more tags",
                type: "submit",
            };
        }
        return null;
    }

    getReceiveNotificationOnTriggerDegraded(): boolean {
        const { subscription } = this.props;
        return Boolean(
            (subscription.tags != null && subscription.tags.includes("DEGRADATION")) ||
                subscription.sendNotificationsOnTriggerDegradedOnly
        );
    }

    setReceiveNotificationOnTriggerDegraded(value: boolean) {
        const { subscription, onChange } = this.props;
        if (value) {
            onChange({
                tags: union(subscription.tags || [], ["DEGRADATION"]),
                sendNotificationsOnTriggerDegradedOnly: true,
            });
        } else {
            onChange({
                tags: difference(subscription.tags || [], ["DEGRADATION"]),
                sendNotificationsOnTriggerDegradedOnly: false,
            });
        }
    }

    getDoNotSendWarnEvents(): boolean {
        const { subscription } = this.props;
        return Boolean(
            (subscription.tags != null && subscription.tags.includes("ERROR")) ||
                subscription.doNotSendWarnNotifications
        );
    }

    setDoNotSendWarnEvents(value: boolean) {
        const { subscription, onChange } = this.props;
        if (value) {
            onChange({
                tags: union(subscription.tags || [], ["ERROR"]),
                doNotSendWarnNotifications: true,
            });
        } else {
            onChange({
                tags: difference(subscription.tags || [], ["ERROR"]),
                doNotSendWarnNotifications: false,
            });
        }
    }

    getUsedContactIds(): Array<string> {
        const { subscription } = this.props;
        let usedContactIds = subscription.contacts.slice();
        // TODO check with old triggers
        // subscription.escalations.map(e => {
        (subscription.escalations || []).map(e => {
            usedContactIds = usedContactIds.concat(e.contacts);
        });
        return usedContactIds;
    }

    render(): React.Node {
        const { subscription, contacts, onChange, tags } = this.props;
        const escalations = subscription.escalations || [];
        const usedContactIds = this.getUsedContactIds();
        return (
            <div className={cn("form")}>
                <div className={cn("row")}>
                    <div className={cn("caption")}>Target delivery channels:</div>
                    <div className={cn("value", "with-input")}>
                        <ValidationWrapperV1
                            renderMessage={tooltip("right middle")}
                            validationInfo={this.validateContacts()}>
                            <ContactSelect
                                contactIds={subscription.contacts}
                                usedContactIds={usedContactIds}
                                onChange={contactIds => onChange({ contacts: contactIds })}
                                availableContacts={contacts}
                            />
                        </ValidationWrapperV1>
                    </div>
                </div>
                <div className={cn("row")}>
                    <div className={cn("caption")}>
                        Tags:{" "}
                        <Tooltip
                            trigger="click"
                            render={this.renderTagsExplanation}
                            closeButton={false}
                            pos="right middle">
                            <Link use="grayed" icon="HelpDot" />
                        </Tooltip>
                    </div>
                    <div className={cn("value", "with-input")}>
                        <ValidationWrapperV1
                            renderMessage={tooltip("right middle")}
                            validationInfo={this.validateTags()}>
                            <TagDropdownSelect
                                width="470px"
                                value={subscription.tags.filter(x => !specialTags.includes(x))}
                                onChange={nextTags =>
                                    onChange({
                                        tags: union(nextTags, intersection(subscription.tags, specialTags)),
                                    })
                                }
                                availableTags={tags}
                            />
                        </ValidationWrapperV1>
                    </div>
                </div>

                <div className={cn("row")}>
                    <div className={cn("caption")}>Delivery schedule:</div>
                    <div className={cn("value")}>
                        <ScheduleEdit schedule={subscription.sched} onChange={value => onChange({ sched: value })} />
                    </div>
                </div>
                <div className={cn("row")}>
                    <Checkbox
                        checked={subscription.throttling}
                        onChange={(e, checked) => onChange({ throttling: checked })}>
                        Throttle messages
                    </Checkbox>{" "}
                    <Tooltip
                        trigger="click"
                        render={this.renderThrottlingExplanation}
                        closeButton={false}
                        pos="right middle">
                        <Link use="grayed" icon="HelpDot" />
                    </Tooltip>
                </div>
                <div className={cn("row")}>
                    <Checkbox
                        checked={this.getReceiveNotificationOnTriggerDegraded()}
                        onChange={(e, checked) => this.setReceiveNotificationOnTriggerDegraded(checked)}>
                        Send notifications when triggers degraded only
                    </Checkbox>{" "}
                    <Tooltip
                        trigger="click"
                        render={this.renderDegradationExplanation}
                        closeButton={false}
                        pos="right middle">
                        <Link use="grayed" icon="HelpDot" />
                    </Tooltip>
                </div>
                <div className={cn("row")}>
                    <Checkbox
                        checked={this.getDoNotSendWarnEvents()}
                        onChange={(e, checked) => this.setDoNotSendWarnEvents(checked)}>
                        Do not send <CodeRef>WARN</CodeRef> notifications
                    </Checkbox>{" "}
                    <Tooltip
                        trigger="click"
                        render={this.renderWarnExclusionExplanation}
                        closeButton={false}
                        pos="right middle">
                        <Link use="grayed" icon="HelpDot" />
                    </Tooltip>
                </div>
                <div className={cn("row")}>
                    <Checkbox checked={subscription.enabled} onChange={(e, checked) => onChange({ enabled: checked })}>
                        Enabled
                    </Checkbox>{" "}
                </div>

                <div className={cn("row")}>
                    {escalations.length > 0 && <div className={cn("caption")}>Escalations</div>}
                    <div className={cn("value", "with-input")}>
                        <EscalationsEditor
                            escalations={escalations}
                            usedContactIds={usedContactIds}
                            onChange={escalations => onChange({ escalations: escalations })}
                            availableContacts={contacts}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
