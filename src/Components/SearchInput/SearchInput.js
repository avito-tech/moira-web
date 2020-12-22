// @flow
import * as React from "react";
import Input from "retail-ui/components/Input/Input";
import Link from "retail-ui/components/Link";
import Spinner from "retail-ui/components/Spinner/Spinner";

import cn from "./SearchInput.less";

type Props = {|
    placeholder?: string,
    value?: string,
    width?: string,
    withSpinner?: boolean,

    onPressEnter?: () => void,
    onValueChange?: string => void,
|};

type State = {
    value: string,
};

export default class SearchInput extends React.Component<Props, State> {
    // eslint-disable-next-line no-unused-vars
    componentWillReceiveProps(nextProps: Props, nextContext: any) {
        this.setState({ value: nextProps.value });
    }

    onChange(newValue: string) {
        const self = this;
        self.props.onValueChange && self.props.onValueChange(newValue);
        self.setState({ value: newValue });
    }

    onKeyDown(e: KeyboardEvent) {
        const self = this;
        e.key === "Enter" && self.props.onPressEnter && self.props.onPressEnter();
    }

    render(): React.Node {
        const self = this;
        return (
            <div className={cn("search-input")}>
                <Input
                    className={cn(self.props.withSpinner ? "with-spinner" : "")}
                    onChange={(_, newValue) => self.onChange(newValue)}
                    onKeyDown={e => self.onKeyDown(e)}
                    placeholder={self.props.placeholder}
                    value={self.state ? self.state.value : ""}
                    width={self.props.width || ""}
                />
                <Link icon={"Search"} to={""}>
                    {self.props.withSpinner === true && (
                        <Spinner caption={""} type={"mini"} />
                    )}
                </Link>
            </div>
        );
    }
}
