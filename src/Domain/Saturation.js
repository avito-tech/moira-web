// @flow

import _ from "lodash";

export type TriggerSaturation = {|
    type: SaturationType,
    fallback: ?string,
    extra_parameters: ?{ [key: string]: any},
|};

export const SaturationDescriptions = [
    {
        type: "check-port",
        description: "Check remote port.",
    },
    {
        type: "render-description",
        description: "Render a template in the trigger description.",
    },
];

const saturationTypes = SaturationDescriptions.reduce(
    (acc, value) => {return {...acc, [value.type]: value}},
    {},
)
export type SaturationType = $Keys<typeof saturationTypes>;
export function getSaturationInfoByType(saturationType: SaturationType): ?TriggerSaturation {
    if (_.has(saturationTypes, saturationType)) {
        return saturationTypes[saturationType];
    } else {
        return null;
    }
}
