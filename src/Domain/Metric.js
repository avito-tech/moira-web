// @flow

import type { Status } from "./Status";
import type { Trigger } from "./Trigger";

export type Metric = {|
    state: Status,
    timestamp: number,
    suppressed?: boolean,
    event_timestamp?: number,
    value?: number,
    maintenance?: number,
|};

export type MetricList = {
    [metric: string]: Metric,
};

export type MetricStat = {|
    metric: string,
    trigger: Trigger,
    current_state: Status,
    error_count: number,
|};

export type MetricStats = {|
    list: Array<MetricStat>,
|};
