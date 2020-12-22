// @flow
import * as React from "react";
import moment from "moment";

import Dropdown from "retail-ui/components/Dropdown";
import MenuItem from "retail-ui/components/MenuItem";

import { Maintenances, getMaintenanceCaption } from "../../Domain/Maintenance";

function stringifyMaintenance(maintenance: ?number): string {
    const delta = (maintenance || 0) - moment.utc().unix();
    return delta <= 0 ? "Maintenance" : moment.duration(delta * 1000).humanize();
}

type Props = {|
    maintenance?: number,
    onChange: (newMaintenance: number) => void,
|};

export default function MaintenanceDropdown(props: Props): React.Node {
    const {
        maintenance,
        onChange,
    } = props;
    return (
        <Dropdown caption={stringifyMaintenance(maintenance)} use="link">
            {Object.keys(Maintenances).map(key => (
                <MenuItem key={key} onClick={() => onChange(key)}>
                    {getMaintenanceCaption(key)}
                </MenuItem>
            ))}
        </Dropdown>
    );
}
