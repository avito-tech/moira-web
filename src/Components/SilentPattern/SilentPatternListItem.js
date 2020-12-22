// @flow
import moment from "moment";
import * as React from "react";
import Button from "retail-ui/components/Button";
import Checkbox from "retail-ui/components/Checkbox";

import { SilentPattern } from "../../Domain/Silent";
import ProlongDropdown from "./ProlongDropdown";
import cn from "./SilentPatternList.less";

type ItemProps = {
    checked: boolean,
    silentPatternData: SilentPattern,
    onChange: string => void,
    onCheck: boolean => void,
    onRemove: () => void,
};

type ItemState = {
    checked: boolean,
    silentPatternData: SilentPattern,
};

export default class SilentPatternListItem extends React.Component<ItemProps, ItemState> {
    props: ItemProps;

    render(): React.Node {
        const self = this;
        const { onChange, onCheck, onRemove } = self.props;
        const { checked, silentPatternData } = self.props;

        return (
            <div className={cn("row")}>
                <div className={cn("check")}>
                    <Checkbox checked={checked} onChange={(e, newChecked) => onCheck(newChecked)} />
                </div>
                <div className={cn("pattern")}>{silentPatternData.pattern}</div>
                <div className={cn("login")}>{silentPatternData.login}</div>
                <div className={cn("created_at")}>
                    {moment.unix(silentPatternData.created_at).format("MMMM D, HH:mm:ss")}
                </div>

                <div className={cn("control")}>
                    <ProlongDropdown
                        disabled={false}
                        onSelect={offset => onChange(offset)}
                        title={silentPatternData.until}
                    />
                </div>
                <div className={cn("trash")}>
                    <Button use="link" icon="Trash" onClick={onRemove}>
                        Del
                    </Button>
                </div>
            </div>
        );
    }
}
