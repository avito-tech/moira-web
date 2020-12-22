// @flow
import * as React from "react";
import _ from "lodash";

import { tooltip, type ValidationInfo, ValidationWrapperV1 } from "react-ui-validations";
import Input from "retail-ui/components/Input";
import Select from "retail-ui/components/Select";
import Tooltip from "retail-ui/components/Tooltip";
import Link from "retail-ui/components/Link";
import TriggerSaturation from "../../Domain/Trigger";
import { SaturationDescriptions, getSaturationInfoByType, type SaturationType } from "../../Domain/Saturation";
import { ColumnStack, Fit } from "../ItemsStack/ItemsStack";
import cn from "./SaturationEdit.less";

type Props = {|
    value: $Shape<TriggerSaturation>,
    onChange: TriggerSaturation => void,
    width: ?(number | string),  // type copied from retail-ui@v0.10.4/components/Input/Input.js
|};

type State = {
};

function renderItem(value: string, item: string) {
    return item;
    /*
    return (
        <ColumnStack baseline block gap={2}>
            <Fit>{value}</Fit>
            <Fit>{item}</Fit>
        </ColumnStack>
    );
    */
}

export class SaturationEdit extends React.Component<Props, State> {
    props: Props;
    state: State;

    validateNotEmpty(value: ?string, fieldName: string): ?ValidationInfo {
        if (!value) {
            return {
                type: "submit",
                message: fieldName + " should not be empty",
            }
        }
        return null
    }

    render(): React.Node {
        const {
            value,
            onChange,
            width = null,
        } = this.props;
        const {
            type,
            fallback,
            extra_parameters: extraParameters = {},
        } = value;

        const saturationProperties = getSaturationInfoByType(type);

        return (
            <div width={width}>
                <div className={cn("fgroup")}>
                    <Select
                        width={"100%"}
                        value={type}
                        placeholder="Select saturation type"
                        renderItem={renderItem}
                        // renderValue={renderItem}
                        items={SaturationDescriptions.map(({type, description} = x) => [type, description])}
                        onChange={(e, type) => onChange({...value, type})}
                    />
                </div>

                {type === "check-port" && <div className={cn("fgroup")}>
                    <span className={cn("fgroup-label")}>Port:&nbsp;</span>
                    <Input
                        className={cn("fgroup-field", "shrinked-input")}
                        placeholder={"22"}
                        value={extraParameters["port"] || null}
                        onChange={(e, port) => onChange({...value, extra_parameters: {...extraParameters, port: parseInt(port)}})}
                    />
                </div>}

            </div>
        );
    }
}

const saturationTooltipTexts = {

    "check-port": (
        <div className={cn("saturation-help")}>
            <p>Tries to establish a TCP connection to a specified port,
            using the first part of the metric name as the device name.
            If the port is reachable, adds tag <code>port-$port-reachable</code>,
            else adds tag <code>port-$port-unreachable</code>.</p>
            <p>Example: if a metric is named <code>avi-horse01.cpus.0.temp</code>,
            port 25 is specified to be checked and it is unreachable,
            the tag will be <code>port-25-unreachable</code>.</p>
        </div>
    ),

    "render-description": (
        <div className={cn("saturation-help")}>
            <p>Renders a <a href="https://github.com/gobuffalo/plush">Plush</a> template in the Description field of the trigger. </p>
        </div>
    ),

};

export class SaturationEditTooltip extends React.Component<Props, State> {
    props: {|
        type: SaturationType,
        className?: string,
    |};

    render(): React.Node {
        const {type, className} = this.props;
        if (_.has(saturationTooltipTexts, type)) {
            return (
                <Tooltip className={className} pos="top right" render={() => saturationTooltipTexts[type]} trigger="click">
                    <Link icon="HelpDot" />
                </Tooltip>
            );
        };
        return null;
    }
}
