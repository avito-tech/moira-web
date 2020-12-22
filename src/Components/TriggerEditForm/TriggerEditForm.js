// @flow
import _ from 'lodash';
import * as React from "react";
import { Fill, Fit, RowStack } from "../ItemsStack/ItemsStack";
import type { Trigger } from "../../Domain/Trigger";
import { tooltip, type ValidationInfo, ValidationWrapperV1 } from "react-ui-validations";
import Icon from "retail-ui/components/Icon";
import Input from "retail-ui/components/Input";
import Textarea from "retail-ui/components/Textarea";
import Button from "retail-ui/components/Button";
import Tabs from "retail-ui/components/Tabs";
import Link from "retail-ui/components/Link";
import Tooltip from "retail-ui/components/Tooltip";
import FormattedNumberInput from "../FormattedNumberInput/FormattedNumberInput";
import { SaturationEdit, SaturationEditTooltip } from "../SaturationEdit/SaturationEdit";
import ScheduleEdit from "../ScheduleEdit/ScheduleEdit";
import TriggerSimpleModeEditor from "../TriggerSimpleModeEditor/TriggerSimpleModeEditor";
import StatusSelect from "../StatusSelect/StatusSelect";
import TagDropdownSelect from "../TagDropdownSelect/TagDropdownSelect";
import { Statuses } from "../../Domain/Status";
import CodeRef from "../CodeRef/CodeRef";
import { defaultNumberEditFormat, defaultNumberViewFormat } from "../../Helpers/Formats";
import cn from "./TriggerEditForm.less";
import ToggleWithLabel from "../Toggle/Toggle";

type Props = {|
    data: $Shape<Trigger>,
    tags: Array<string>,
    grafanaPrefixes: ?Array<string>,
    onChange: ($Shape<Trigger>) => void,
    showSaturation?: boolean,
|};

type State = {
    advancedMode: boolean,
};

export default class TriggerEditForm extends React.Component<Props, State> {
    props: Props;
    state: State;

    constructor(props: Props) {
        super(props);
        const { targets, expression } = props.data;
        this.state = {
            advancedMode: targets.length > 1 || expression.length > 0,
        };
    }

    validateRequiredString(value: string, message?: string): ?ValidationInfo {
        return value.trim().length === 0
            ? {
                  type: value.trim().length === 0 ? "submit" : "lostfocus",
                  message: message || "Can't be empty",
              }
            : null;
    }

    validateDashboard(valueRaw: string, grafanaPrefixes?: Array<string>): ValidationInfo | null {
        const value = valueRaw.trim();
        if (value.length === 0) {
            return null;
        }

        let url;
        try {
            url = new URL(value);
        } catch (e) {
            return {
                type: "lostfocus",
                message: e.toString(),
            };
        }

        const prefixes = grafanaPrefixes || [];
        const urlString = url.toString();
        const urlMatched = _.some(prefixes, prefix => {
            return urlString.startsWith(prefix);
        });

        if (!urlMatched) {
            let message;
            if (prefixes.length > 1) {
                message = "Invalid host. Should start with any of these: " + prefixes.join(", ");
            } else if (prefixes.length === 1) {
                message = "Invalid host. Should start with " + prefixes[0];
            } else {
                message = "Grafana is not configured. This field should be empty";
            }

            return {
                type: "lostfocus",
                message: message,
            };
        }

        let isPanelFound = false;
        let panelID;
        for (const pair of url.searchParams.entries()) {
            if (pair[0] === "panelId") {
                isPanelFound = true;
                panelID = pair[1];
                break;
            }
        }
        if (!isPanelFound) {
            return {
                type: "lostfocus",
                message: "Param panelId is not found in url",
            };
        }

        if (!(Number(panelID) > 0)) {
            return {
                type: "lostfocus",
                message: "Bad panelId value. Should be positive number",
            };
        }

        return null;
    }

    validateRequiredNumber(value: ?number): ?ValidationInfo {
        return typeof value !== "number"
            ? {
                  type: typeof value === "number" ? "lostfocus" : "submit",
                  message: "Can't be empty",
              }
            : null;
    }

    handleUpdateTarget(targetIndex: number, value: string) {
        const { onChange, data } = this.props;
        const { targets } = data;

        onChange({
            targets: [...targets.slice(0, targetIndex), value, ...targets.slice(targetIndex + 1)],
        });
    }

    handleRemoveTarget(targetIndex: number) {
        const { onChange, data } = this.props;
        const { targets } = data;

        onChange({
            targets: [...targets.slice(0, targetIndex), ...targets.slice(targetIndex + 1)],
        });
    }

    handleAddTarget() {
        const { onChange, data } = this.props;
        const { targets } = data;

        this.setState({ advancedMode: true });
        onChange({
            targets: [...targets, ""],
        });
    }

    handleUpdateParent(parentIndex: number, value: string) {
        const { onChange, data } = this.props;
        const { parents = [] } = data;

        onChange({
            parents: [...parents.slice(0, parentIndex), value, ...parents.slice(parentIndex + 1)],
        });
    }

    handleRemoveParent(parentIndex: number) {
        const { onChange, data } = this.props;
        const { parents = [] } = data;

        onChange({
            parents: [...parents.slice(0, parentIndex), ...parents.slice(parentIndex + 1)],
        });
    }

    handleAddParent() {
        const { onChange, data } = this.props;
        const { parents = [] } = data;

        onChange({
            parents: [...parents, ""],
        });
    }

    handleUpdateSaturation(saturationIndex: number, value: string) {
        const { onChange, data } = this.props;
        const { saturation = [] } = data;

        onChange({
            saturation: [...saturation.slice(0, saturationIndex), value, ...saturation.slice(saturationIndex + 1)],
        });
    }

    handleRemoveSaturation(saturationIndex: number) {
        const { onChange, data } = this.props;
        const { saturation = [] } = data;

        onChange({
            saturation: [...saturation.slice(0, saturationIndex), ...saturation.slice(saturationIndex + 1)],
        });
    }

    handleAddSaturation() {
        const { onChange, data } = this.props;
        const { saturation = [] } = data;

        onChange({
            saturation: [...saturation, {type: null}],
        });
    }

    renderDashboardHelp = (): React.Node => {
        return (
            <div className={cn("expression-help")}>
                <div className={cn("main-description")}>
                    Insert panel link here.<br /> Example: http://host/grafana/dashboard/db/dashboard?panelId=64
                    <br />
                    <b>panelId</b> is required
                </div>
            </div>
        );
    };

    renderExpressionHelp = (): React.Node => {
        return (
            <div className={cn("expression-help")}>
                <div className={cn("main-description")}>
                    Expression uses{" "}
                    <Link target="_blank" href="https://github.com/Knetic/govaluate/blob/master/MANUAL.md">
                        govaluate
                    </Link>{" "}
                    with predefined constants:
                </div>
                <div>
                    <CodeRef>t1</CodeRef>, <CodeRef>t2</CodeRef>, ... are values from your targets.
                </div>
                <div>
                    <CodeRef>OK</CodeRef>, <CodeRef>WARN</CodeRef>, <CodeRef>ERROR</CodeRef>, <CodeRef>NODATA</CodeRef>{" "}
                    are states that must be the result of evaluation.
                </div>
                <div>
                    <CodeRef>PREV_STATE</CodeRef> is equal to previously set state, and allows you to prevent frequent
                    state changes.
                </div>

                <div className={cn("note")}>
                    NOTE: Only T1 target can resolve into multiple metrics in Advanced Mode. T2, T3, ... must resolve to
                    single metrics.
                </div>
            </div>
        );
    };

    renderPendingIntervalHelp = (): React.Node => {
        return (
            <div className={cn("pending-inteval-help")}>
                <div className={cn("main-description")}>
                    The option causes Moira to wait for a certain duration (in seconds) between first encountering a new
                    trigger state and counting an alert as firing for this element.
                </div>
            </div>
        );
    };

    render(): React.Node {
        const { advancedMode } = this.state;
        const { data, onChange, tags: allTags, grafanaPrefixes, showSaturation = true } = this.props;
        const {
            name,
            targets,
            parents = [],
            tags,
            expression,
            ttl,
            ttl_state: ttlState,
            is_pull_type: isPullType,
            dashboard,
            sched,
            desc,
            pending_interval: pendingInterval,
            saturation = [],
        } = data;
        if (sched == null) {
            throw new Error("InvalidProgramState");
        }
        return (
            <Form>
                <FormRow label="Name">
                    <ValidationWrapperV1
                        validationInfo={this.validateRequiredString(name)}
                        renderMessage={tooltip("right middle")}>
                        <Input width="100%" value={name} onChange={(e, value) => onChange({ name: value })} />
                    </ValidationWrapperV1>
                </FormRow>
                <FormRow label="Description" useTopAlignForLabel>
                    <Textarea width="100%" value={desc || ""} onChange={(e, value) => onChange({ desc: value })} />
                </FormRow>
                {!_.isEmpty(grafanaPrefixes) && (
                    <FormRow label="Dashboard" useTopAlignForLabel>
                        <RowStack baseline block gap={2}>
                            <Fill>
                                <ValidationWrapperV1
                                    validationInfo={this.validateDashboard(dashboard || "", grafanaPrefixes)}
                                    renderMessage={tooltip("right middle")}>
                                    <Input
                                        width="100%"
                                        value={dashboard || ""}
                                        onChange={(e, value) => onChange({ dashboard: value || "" })}
                                    />
                                </ValidationWrapperV1>
                            </Fill>
                            <Fit>
                                <Tooltip className={cn("tooltip")} pos="top right" render={this.renderDashboardHelp} trigger="click">
                                    <Link icon="HelpDot" />
                                </Tooltip>
                            </Fit>
                        </RowStack>
                    </FormRow>
                )}
                <FormRow label="Target" useTopAlignForLabel>
                    {targets.map((x, i) => (
                        <div key={i} className={cn("target")}>
                            <label className={cn("target-number")}>T{i + 1}</label>
                            <div className={cn("fgroup")}>
                                <div className={cn("fgroup-field")}>
                                    <ValidationWrapperV1
                                        validationInfo={this.validateRequiredString(x)}
                                        renderMessage={tooltip("right middle")}>
                                        <Input
                                            width="100%"
                                            value={x}
                                            onChange={(e, value) => this.handleUpdateTarget(i, value)}
                                        />
                                    </ValidationWrapperV1>
                                </div>
                                {targets.length > 1 && (
                                    <div className={cn("fgroup-control")}>
                                        <Button onClick={() => this.handleRemoveTarget(i)}>
                                            <Icon name="Remove" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <Button use="link" icon="Add" onClick={() => this.handleAddTarget()}>
                        Add one more
                    </Button>
                </FormRow>

                <FormRow>
                    <Tabs
                        value={advancedMode ? "advanced" : "simple"}
                        onChange={(e, value) => {
                            if (targets.length > 1) {
                                if (value === "advanced") {
                                    this.setState({ advancedMode: value === "advanced" });
                                }
                            } else {
                                this.setState({ advancedMode: value === "advanced" });
                            }
                        }}>
                        <Tabs.Tab id="simple" style={{ color: targets.length > 1 ? "#888888" : undefined }}>
                            Simple mode
                        </Tabs.Tab>
                        <Tabs.Tab id="advanced">Advanced mode</Tabs.Tab>
                    </Tabs>
                </FormRow>
                {!advancedMode && (
                    <FormRow style={{ marginLeft: "-10px" }}>
                        <TriggerSimpleModeEditor
                            value={{ error_value: data.error_value, warn_value: data.warn_value }}
                            onChange={value => onChange(value)}
                        />
                    </FormRow>
                )}
                {advancedMode && (
                    <FormRow label="Expression">
                        <RowStack baseline block gap={2}>
                            <Fill>
                                <ValidationWrapperV1
                                    validationInfo={this.validateRequiredString(
                                        expression,
                                        "Expression can't be empty"
                                    )}
                                    renderMessage={tooltip("right middle")}>
                                    <Input
                                        width="100%"
                                        value={expression}
                                        onChange={(e, value) => onChange({ expression: value })}
                                        placeholder="t1 >= 10 ? ERROR : (t1 >= 1 ? WARN : OK)"
                                    />
                                </ValidationWrapperV1>
                            </Fill>
                            <Fit>
                                <Tooltip className={cn("tooltip")} pos="top right" render={this.renderExpressionHelp} trigger="click">
                                    <Link icon="HelpDot" />
                                </Tooltip>
                            </Fit>
                        </RowStack>
                    </FormRow>
                )}
                <FormRow singleLineControlGroup>
                    <StatusSelect
                        value={ttlState}
                        availableStatuses={Object.keys(Statuses).filter(x => x !== Statuses.EXCEPTION)}
                        onChange={value => onChange({ ttl_state: value })}
                    />
                    <span>if has no value for</span>
                    <ValidationWrapperV1
                        validationInfo={this.validateRequiredNumber(ttl)}
                        renderMessage={tooltip("right middle")}>
                        <FormattedNumberInput
                            width={80}
                            value={typeof ttl === "number" ? ttl : null}
                            editFormat={defaultNumberEditFormat}
                            viewFormat={defaultNumberViewFormat}
                            onChange={(e, value) => onChange({ ttl: value || 0 })}
                        />
                    </ValidationWrapperV1>
                </FormRow>
                <FormRow singleLineControlGroup>
                    <span>Pending interval</span>

                    <ValidationWrapperV1
                        validationInfo={this.validateRequiredNumber(pendingInterval)}
                        renderMessage={tooltip("right middle")}>
                        <FormattedNumberInput
                            width={80}
                            value={typeof pendingInterval === "number" ? pendingInterval : null}
                            editFormat={defaultNumberEditFormat}
                            viewFormat={defaultNumberViewFormat}
                            onChange={(e, value) => onChange({ pending_interval: value || 0 })}
                        />
                    </ValidationWrapperV1>
                    <Fit>
                        <Tooltip className={cn("tooltip")} pos="top right" render={this.renderPendingIntervalHelp} trigger="click">
                            <Link icon="HelpDot" />
                        </Tooltip>
                    </Fit>
                </FormRow>

                <FormRow label="Parent triggers" useTopAlignForLabel>
                    {parents.map((x, i) => (
                        <div key={i} className={cn("parent")}>
                            <div className={cn("fgroup")}>
                                <div className={cn("fgroup-field")}>
                                    <ValidationWrapperV1
                                        validationInfo={this.validateRequiredString(x)}
                                        renderMessage={tooltip("right middle")}>
                                        <Input
                                            width="100%"
                                            value={x}
                                            onChange={(e, value) => this.handleUpdateParent(i, value)}
                                        />
                                    </ValidationWrapperV1>
                                </div>
                                <div className={cn("fgroup-control")}>
                                    <Button onClick={() => this.handleRemoveParent(i)}>
                                        <Icon name="Remove" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button use="link" icon="Add" onClick={() => this.handleAddParent()}>
                        Add one more
                    </Button>
                </FormRow>

                <FormRow label="Watch time">
                    <ScheduleEdit schedule={sched} onChange={schedule => onChange({ sched: schedule })} />
                </FormRow>
                <FormRow label="Tags" useTopAlignForLabel>
                    <ValidationWrapperV1
                        validationInfo={
                            tags.length === 0
                                ? {
                                      type: "submit",
                                      message: "Select at least one tag",
                                  }
                                : null
                        }
                        renderMessage={tooltip("right top")}>
                        <TagDropdownSelect
                            allowCreateNewTags
                            value={tags}
                            availableTags={allTags}
                            width={650}
                            onChange={tags =>
                                onChange({
                                    tags: tags,
                                })
                            }
                        />
                    </ValidationWrapperV1>
                </FormRow>
                <FormRow>
                    <ToggleWithLabel
                        checked={isPullType}
                        label="Pull from graphite"
                        onChange={checked => onChange({ is_pull_type: checked })}
                    />
                </FormRow>

                {showSaturation && <FormRow label="Saturation" useTopAlignForLabel>
                    {saturation.map((x, i) => (
                        <div key={i} className={cn("saturation")}>
                            <div className={cn("fgroup")}>
                                <div className={cn("fgroup-field")}>
                                    <SaturationEdit
                                        width={"100%"}
                                        value={x}
                                        onChange={value => this.handleUpdateSaturation(i, value)}
                                    />
                                </div>
                                <div>
                                    <div className={cn("fgroup-control")}>
                                        <Button onClick={() => this.handleRemoveSaturation(i)}>
                                            <Icon name="Remove" />
                                        </Button>
                                    </div>
                                </div>
                                <div className={cn("saturation-tooltip-wrapper")}>
                                    <div className={cn("fgroup-control", "saturation-tooltip")}>
                                        <SaturationEditTooltip className={cn("tooltip")} type={x.type} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button use="link" icon="Add" onClick={() => this.handleAddSaturation()}>
                        Add one more
                    </Button>
                </FormRow>}

            </Form>
        );
    }
}

type FormProps = {
    children?: any,
};

function Form({ children }: FormProps): React.Node {
    return <div className={cn("form")}>{children}</div>;
}

type FormRowProps = {
    label?: string,
    useTopAlignForLabel?: boolean,
    singleLineControlGroup?: boolean,
    style?: {},
    children?: any,
};

function FormRow({ label, useTopAlignForLabel, singleLineControlGroup, children, style }: FormRowProps): React.Node {
    return (
        <div className={cn("row")}>
            {label != null && <div className={cn("label", { ["label-for-group"]: useTopAlignForLabel })}>{label}</div>}
            <div className={cn("control")}>
                <div style={style} className={cn({ ["group"]: singleLineControlGroup })}>
                    {children}
                </div>
            </div>
        </div>
    );
}
