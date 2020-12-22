// @flow
import _ from "lodash";
import moment from "moment";
import * as React from "react";
import Button from "retail-ui/components/Button/Button";
import Input from "retail-ui/components/Input/Input";

import {
    getTimeOffset,
    getTimeOffsetCaption,
    SilentPattern,
    TimeOffsets,
    TimeOffsetsCaptions,
} from "../../Domain/Silent";
import ProlongDropdown from "./ProlongDropdown";
import SearchInput from "../SearchInput/SearchInput";
import TagDropdownSelect2 from "../TagDropdownSelect2/TagDropdownSelect2";
import cn from "./SilentPatternForm.less";

type Props = {|
    searchString: string,
    silentPatternType: number,
    tags: ?Array<string>,
    onCreate: (Array<SilentPattern>) => void,
    onSearch: string => void,
|};

type State = {
    pattern: string,
    offset: number,
    offsetCaption: string,
};

export default class SilentPatternForm extends React.Component<Props, State> {
    state: State = {
        pattern: "",
        offset: TimeOffsets.quarterHour,
        offsetCaption: TimeOffsetsCaptions.quarterHour,
    };

    isSubmitDisabled(): boolean {
        const self = this;
        if (self.props.silentPatternType === 1) {
            return self.state.pattern === "";
        } else {
            return self.state.pattern.length < 2;
        }
    }

    onInputNewKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter" && !this.isSubmitDisabled()) {
            this.submitHandler();
        }
    }

    setOffset(offset: string) {
        if (offset in TimeOffsetsCaptions) {
            this.setState({
                offset: getTimeOffset(offset),
                offsetCaption: getTimeOffsetCaption(offset),
            });
        }
    }

    submitHandler() {
        const self = this,
            { onCreate } = self.props,
            patternCreated: SilentPattern = {
                pattern: self.state.pattern,
                until: moment().unix() + self.state.offset * 60,
            };

        onCreate([patternCreated]);
        self.setState({ pattern: "" });
    }

    render(): React.Node {
        const self = this;
        const { onSearch, searchString } = self.props;

        return (
            <div className={cn("silent-pattern-form")}>
                <div className={cn("spf_block-new")}>
                    {self.props.silentPatternType === 1 ? self._renderTagsDropdown() : self._renderInput()}
                    <ProlongDropdown
                        disabled={false}
                        onSelect={offset => {
                            self.setOffset(offset);
                        }}
                        title={self.state.offsetCaption}
                    />
                    <Button disabled={self.isSubmitDisabled()} onClick={() => self.submitHandler()}>
                        Add
                    </Button>
                </div>

                <SearchInput
                    onValueChange={newSearchString => onSearch(newSearchString)}
                    placeholder={"Filter by Pattern or Creator"}
                    value={searchString}
                />
            </div>
        );
    }

    _renderInput(): React.Node {
        const self = this;
        return (
            <Input
                onChange={(_, pattern) => self.setState({ pattern: pattern })}
                onKeyDown={e => self.onInputNewKeyDown(e)}
                placeholder={"Add silent pattern"}
                value={self.state.pattern}
            />
        );
    }

    _renderTagsDropdown(): React.Node {
        const self = this,
            tagsSelected = self.state.pattern !== "" ? [self.state.pattern] : [],
            tagsRemained = _.difference(self.props.tags, tagsSelected);
        return (
            <TagDropdownSelect2
                placeholder={"Add silent tag"}
                width={"250px"}
                selected={tagsSelected}
                subscribed={[]}
                remained={tagsRemained}
                onSelect={tag => self.setState({ pattern: tag })}
                onRemove={_ => self.setState({ pattern: "" })}
            />
        );
    }
}
