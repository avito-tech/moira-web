// @flow
import * as React from "react";
import moment from "moment";
import Icon from "retail-ui/components/Icon";
import type { Metric } from "../../Domain/Metric";
import type { Maintenance } from "../../Domain/Maintenance";
import { roundValue } from "../../helpers";
import MaintenanceDropdown from "../MaintenanceDropdown/MaintenanceDropdown";
import StatusIndicator from "../StatusIndicator/StatusIndicator";
import Button from "retail-ui/components/Button";
import cn from "./MetricList.less";

export type SortingColum = "state" | "name" | "event" | "value";
type Props = {|
    status?: boolean,
    items: {
        [metric: string]: Metric,
    },
    sortingColumn?: SortingColum,
    sortingDown?: boolean,
    onSort?: (sorting: SortingColum) => void,
    onChange: (maintenance: Maintenance, metric: string) => void,
    onRemove: (metric: string) => void,
|};

export default function MetricList(props: Props): React.Node {
    const { status, items, onSort, onChange, onRemove, sortingColumn, sortingDown } = props;
    const sortingIcon = sortingDown ? "ArrowBoldDown" : "ArrowBoldUp";

    return (
        <section className={cn("table")}>
            <header className={cn("row", "header")}>
                {status && <div className={cn("state")} />}
                <div className={cn("name")}>
                    <span className={cn({ sorting: onSort })} onClick={onSort && (() => onSort("name"))}>
                        Name
                        {sortingColumn === "name" && (
                            <span className={cn("icon")}>
                                <Icon name={sortingIcon} />
                            </span>
                        )}
                    </span>
                </div>
                <div className={cn("event")}>
                    <span className={cn({ sorting: onSort })} onClick={onSort && (() => onSort("event"))}>
                        Last event{" "}
                        {sortingColumn === "event" && (
                            <span className={cn("icon")}>
                                <Icon name={sortingIcon} />
                            </span>
                        )}
                    </span>
                </div>
                <div className={cn("value")}>
                    <span className={cn({ sorting: onSort })} onClick={onSort && (() => onSort("value"))}>
                        Value{" "}
                        {sortingColumn === "value" && (
                            <span className={cn("icon")}>
                                <Icon name={sortingIcon} />
                            </span>
                        )}
                    </span>
                </div>
                <div className={cn("controls")} />
            </header>
            <div className={cn("items")}>
                {Object.keys(items).map(metric => {
                    const { value, state, maintenance, timestamp = 0 } = items[metric];
                    const eventTimestamp = items[metric].event_timestamp || timestamp;

                    return (
                        <div key={metric} className={cn("row")}>
                            {status && (
                                <div className={cn("state")}>
                                    <StatusIndicator statuses={[state]} size={10} />
                                </div>
                            )}
                            <div className={cn("name")}>{metric}</div>
                            <div className={cn("event")}>{moment.unix(eventTimestamp).format("MMMM D, HH:mm:ss")}</div>
                            <div className={cn("value")}>{roundValue(value)}</div>
                            <div className={cn("controls")}>
                                <MaintenanceDropdown
                                    maintenance={maintenance}
                                    onChange={newMaintenance => onChange(newMaintenance, metric)}
                                />
                                <Button use="link" icon="Trash" onClick={() => onRemove(metric)}>
                                    Del
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
