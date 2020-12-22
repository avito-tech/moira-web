// @flow
import * as React from "react";

import { LayoutContent, LayoutErrorMessage, LayoutTitle } from "../Layout/Layout";
import type { GlobalSettings } from "../../Domain/GlobalSettings";
import ToggleWithLabel from "../Toggle/Toggle";

import cn from "./GlobalSettingsContainer.less";

type Props = {
    globalSettings: GlobalSettings,
    onToggle: () => void,
};

type State = {};

export default class GlobalSettingsContainer extends React.Component<Props, State> {
    onPressToggleButton(): void {
        const { globalSettings, onToggle } = this.props;
        const action = globalSettings.notifications.disabled ? "enable" : "disable";

        if (confirm("Do you really want to " + action + " all notifications?")) {
            onToggle();
        }
    }

    render(): React.Node {
        const { globalSettings } = this.props;
        return (
            <LayoutContent>
                <LayoutTitle>Global settings</LayoutTitle>
                <LayoutErrorMessage>
                    Warning! These settings are system-wide, change it with caution.
                </LayoutErrorMessage>
                <ToggleWithLabel
                    classNameExtra={cn("aside")}
                    checked={globalSettings.notifications.disabled}
                    label={"All notifications are disabled"}
                    onChange={() => this.onPressToggleButton()}
                />
            </LayoutContent>
        );
    }
}
