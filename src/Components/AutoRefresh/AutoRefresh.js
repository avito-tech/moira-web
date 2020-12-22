// @flow
import * as React from "react";

import moment from "moment";

type Props = {|
    interval: number,   // seconds
    onInterval: () => void,
|};

type State = {
    intervalId: ?number,
};

export default class AutoRefresh extends React.Component<Props, State> {
    props: Props;
    state: State;

    constructor(props: Props) {
        super(props);
        const { interval, onInterval } = props;

        let intervalId;
        if (interval > 0) {
            intervalId = setInterval(onInterval, interval * 1000);
        }
        this.state = {
            intervalId: intervalId,
        };
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps) {
        if (this.props.interval !== prevProps.interval) {
            const { intervalId: oldIntervalId } = this.state;
            clearInterval(oldIntervalId);

            const {
                interval: newInterval,
                onInterval,
            } = this.props;
            let newIntervalId;
            if (newInterval > 0) {
                newIntervalId = setInterval(onInterval, newInterval * 1000);
            }
            this.setState({
                intervalId: newIntervalId,
            });
        }
    }

    componentWillUnmount() {
        const { intervalId } = this.state;
        clearInterval(intervalId);
    }

    render(): React.Node {
        return null
    }
}
