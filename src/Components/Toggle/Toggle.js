// @flow
import * as React from "react";
import Toggle from "retail-ui/components/Toggle";
import cn from "./Toggle.less";

type Props = {|
    checked?: boolean,
    classNameExtra?: string,
    label: string,
    onChange: (checked: boolean) => void,
|};

export default function ToggleWithLabel(props: Props): React.Element<any> {
    const { checked, classNameExtra, label, onChange } = props;
    return (
        <div className={cn("toggle", classNameExtra || "")} onClick={() => onChange(!checked)}>
            <Toggle checked={Boolean(checked)} /> {label}
        </div>
    );
}
