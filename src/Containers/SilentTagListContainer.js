// @flow
import * as React from "react";

import BaseSilentContainer from "./BaseSilentContainer";
import type { Props, State } from "./BaseSilentContainer";

export default class SilentTagListContainer extends React.Component<Props, State> {
    render(): React.Node {
        return <BaseSilentContainer pageCaption={"Silent tags"} silentPatternType={1} />;
    }
}
