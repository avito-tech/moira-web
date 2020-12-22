// @flow
import * as React from "react";
import moment from "moment";
import RouterLink from "../RouterLink/RouterLink";
import Link from "retail-ui/components/Link";
import Icon from "retail-ui/components/Icon";
import Button from "retail-ui/components/Button";

import { getYAMLContent } from "../../helpers";
import { getPageLink } from "../../Domain/Global";
import type { Schedule } from "../../Domain/Schedule";
import type { Trigger, TriggerState } from "../../Domain/Trigger";
import { getSaturationInfoByType } from "../../Domain/Saturation";
import MaintenanceDropdown from "../MaintenanceDropdown/MaintenanceDropdown";
import TagGroup from "../TagGroup/TagGroup";
import cn from "./TriggerInfo.less";

type Props = {|
    data: Trigger,
    triggerState: TriggerState,
    supportEmail: string,
    onAckEscalations: (triggerId: string) => void,
    onThrottlingRemove: (triggerId: string) => void,
    showSaturation: boolean,
|};

function ParentsView({ data }: Props): React.Node {
    const {
        parents = [],
        _parent_triggers: parentTriggers = [],
    } = data;
    const parentLinks = parentTriggers.map(
        (parentTrigger, i) => parentTrigger
            ? <div key={i}><RouterLink to={`/trigger/${parentTrigger.id}/`}>{parentTrigger.name} ({parentTrigger.id})</RouterLink></div>
            : <div key={i}>not found ({parents[i]})</div>
    );
    return (
        <div>{parentLinks}</div>
    );
}

function ScheduleView(props: { data: Schedule }): React.Node {
    const { days, startOffset, endOffset } = props.data;
    const enabledDays = days.filter(({ enabled }) => enabled);
    const viewDays = days.length === enabledDays.length ? "Everyday" : enabledDays.map(({ name }) => name).join(", ");
    const viewTime =
        moment("1900-01-01 00:00:00")
            .add(startOffset, "minutes")
            .format("HH:mm") +
        "–" +
        moment("1900-01-01 00:00:00")
            .add(endOffset, "minutes")
            .format("HH:mm");
    return (
        <div>
            {viewDays} {viewTime}
        </div>
    );
}

export default function TriggerInfo({
    data,
    triggerState,
    supportEmail,
    onAckEscalations,
    onThrottlingRemove,
    onMaintenanceChange,
    showSaturation = true,
}: Props): React.Node {
    const {
        id,
        name,
        targets,
        dashboard,
        parents = [],
        desc,
        expression,
        error_value: errorValue,
        warn_value: warnValue,
        ttl_state: ttlState,
        ttl,
        sched,
        tags,
        throttling,
        is_pull_type: isPullType,
        has_escalations: hasEscalations,
        saturation = [],
    } = data;
    const {
        state,
        maintenance = 0,
        msg: exceptionMessage,
    } = triggerState;

    const hasExpression = expression != null && expression !== "";
    const hasMultipleTargets = targets.length > 1;

    return (
        <section>
            <header className={cn("header")}>
                <h1 className={cn("title")}>{name != null && name !== "" ? name : "[No name]"}</h1>
                <div className={cn("controls")}>
                    {throttling !== 0 && (
                        <Link use="danger" icon="Clear" onClick={() => onThrottlingRemove(id)}>
                            Disable throttling
                        </Link>
                    )}

                    <MaintenanceDropdown
                        maintenance={maintenance}
                        onChange={newMaintenance => onMaintenanceChange(newMaintenance)}
                    />

                    <RouterLink to={getPageLink("triggerEdit", id)} icon="Edit">
                        Edit
                    </RouterLink>

                    <a
                        href="#download"
                        onClick={(event: Event) => {
                            const target = event.currentTarget;
                            if (target instanceof HTMLAnchorElement) {
                                target.href = getYAMLContent(data);
                            }
                        }}
                        download={`trigger-${id}.yaml`}>
                        <Button use="link" icon="Export">
                            Export
                        </Button>
                    </a>
                </div>
            </header>
            <dl className={cn("list")}>
                <dt>Target</dt>
                <dd>{targets.map((target, i) => <div key={i}>{target}</div>)}</dd>
                {desc && <dt>Description</dt>}
                {desc && <dd>{desc}</dd>}
                {dashboard && <dt>Dashboard</dt>}
                {dashboard && (
                    <dd>
                        <a href={dashboard} target="_blank">
                            Open link in new tab
                        </a>
                    </dd>
                )}
                {!expression && <dt>Value</dt>}
                {!expression && (
                    <dd>
                        Warning: {warnValue}, Error: {errorValue}, Set {ttlState} if has no value for {ttl} seconds
                    </dd>
                )}
                {expression && <dt>Expression</dt>}
                {expression && <dd>{expression}</dd>}
                {sched && <dt>Schedule</dt>}
                {sched && (
                    <dd>
                        <ScheduleView data={sched} />
                    </dd>
                )}
                <dt>Tags</dt>
                <dd>
                    <TagGroup tags={tags} />
                </dd>
                <dt>Pull</dt>
                <dd>{isPullType ? <span>YES</span> : <span>NO</span>}</dd>
                {state === "EXCEPTION" && <dt />}
                {state === "EXCEPTION" && (
                    <dd className={cn("exception-explanation")}>
                        <div className={cn("line-1")}>
                            <Icon name="Error" color={"#D43517"} size={16} /> Trigger in EXCEPTION state.{" "}
                            {exceptionMessage}
                        </div>
                        <div className={cn("line-2")}>
                            Please <RouterLink to={`/trigger/${data.id}/edit`}>verify</RouterLink> trigger target{hasMultipleTargets
                                ? "s"
                                : ""}
                            {hasExpression ? " and expression" : ""} on{" "}
                            <RouterLink to={`/trigger/${data.id}/edit`}>trigger edit page</RouterLink>.
                            {supportEmail != null && (
                                <span>
                                    {" "}
                                    Or <Link href={`mailto:${supportEmail}`}>contact</Link> with server administrator.
                                </span>
                            )}
                        </div>
                    </dd>
                )}
                {parents.length > 0 && (
                    <dt>Parents</dt>
                )}
                {parents.length > 0 && (
                    <dd><ParentsView data={data} /></dd>
                )}
                {showSaturation && saturation.length > 0 && (
                    <dt>Saturation</dt>
                )}
                {showSaturation && saturation.length > 0 && (
                    <dd>{saturation.map((currentSaturation, i) => <div key={i}>{
                        getSaturationInfoByType(currentSaturation.type)
                            ? getSaturationInfoByType(currentSaturation.type).description
                            : "unknown saturation type (" + currentSaturation.type + ")"
                    }</div>)}</dd>
                )}
                <dd>
                    {hasEscalations && (
                        <Button use="success" onClick={() => onAckEscalations(id)}>
                            Acknowledge alert!
                        </Button>
                    )}
                </dd>
            </dl>
        </section>
    );
}
