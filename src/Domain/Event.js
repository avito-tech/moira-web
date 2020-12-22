// @flow
import type { Status } from "./Status";

export type Event = {|
    state: Status,
    old_state: Status,
    timestamp: number,
    value?: number,
    old_value?: number,
    metric: string,
    msg?: string,
    trigger_id: string,
    muted_reason: number,
    muted_verbose: string,
|};

export type EventList = {|
    total: number,
    list: Array<Event>,
    page: number,
    size: number,
|};
