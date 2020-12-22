/* eslint-disable no-else-return */
// @flow
import _ from "lodash";
import moment from "moment";
import * as React from "react";
import Dropdown from "retail-ui/components/Dropdown";
import MenuItem from "retail-ui/components/MenuItem";

import { getTimeOffsetCaption, TimeOffsets } from "../../Domain/Silent";

type Props = {
    disabled: boolean,
    onSelect: string => void,
    title: number,
};

type State = {};

export default class ProlongDropdown extends React.Component<Props, State> {
    props: Props;

    caption(title: [number, string]): string {
        if (typeof title === "number") {
            const delta = title - moment.utc().unix();
            return delta <= 0 ? "EXPIRED" : moment.duration(delta * 1000).humanize();
        } else {
            return title;
        }
    }

    render(): React.Node {
        const self = this;
        const { disabled, onSelect, title } = self.props;
        return (
            <Dropdown caption={self.caption(title)} disabled={disabled} use="link">
                {_.map(_.keys(TimeOffsets), key => {
                    return (
                        <MenuItem key={key} onClick={() => onSelect(key)}>
                            {getTimeOffsetCaption(key)}
                        </MenuItem>
                    );
                })}
            </Dropdown>
        );
    }
}
