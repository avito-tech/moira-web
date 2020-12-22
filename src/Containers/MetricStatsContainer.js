// @flow
import * as React from "react";
import _ from "lodash";
import moment from "moment";
import queryString from "query-string";

import Icon from "retail-ui/components/Icon";
import { Link as ReactRouterLink } from "react-router-dom";
import { getPageLink } from "../Domain/Global";
import type { ContextRouter } from "react-router-dom";
import type { IMoiraApi } from "../Api/MoiraAPI";
import { withMoiraApi } from "../Api/MoiraApiInjection";
import Select from "retail-ui/components/Select";
import Layout, { LayoutContent, LayoutPlate } from "../Components/Layout/Layout";
import { RowStack, Fill } from "../Components/ItemsStack/ItemsStack";
import StatusIcon from "../Components/StatusIcon/StatusIcon";
import TagDropdownSelect from "../Components/TagDropdownSelect/TagDropdownSelect";
import TagGroup from "../Components/TagGroup/TagGroup";
import ToggleWithLabel from "../Components/Toggle/Toggle";
import AutoRefresh from "../Components/AutoRefresh/AutoRefresh";
import { MetricStat } from "../Domain/Metric";
import cn from "./MetricStatsContainer.less";

type Props = ContextRouter & { moiraApi: IMoiraApi };
type State = {
    loading: boolean,
    error: ?string,
    metricStats: ?Array<MetricStat>,
    selectedTags: Array<string>,
    availableTags: Array<string>,
    onlyProblems: boolean,
    autoRefreshPeriod: Number,

    sortingColumn: string,
    sortingDown: boolean,
};

type LocationSearch = {|
    onlyProblems: boolean,
    tags: Array<string>,
    intervalLength: Number,
|};

class MetricStatsContainer extends React.Component<Props, State> {
    props: Props;
    state: State = {
        loading: true,
        error: null,
        metricStats: null,
        selectedTags: [],
        availableTags: [],
        onlyProblems: false,
        intervalLength: 0,
        autoRefreshPeriod: 60,

        sortingColumn: "error_count",
        sortingDown: false,
    };

    componentDidMount() {
        const { location } = this.props;
        const {
            onlyProblems,
            tags,
            intervalLength,
            autoRefreshPeriod,
        } = this.parseLocationSearch(location.search);
        this.setState({ onlyProblems, selectedTags: tags, intervalLength, autoRefreshPeriod });
        this.getData(this.props);
    }

    componentWillReceiveProps(nextProps: Props) {
        // this.setState({ loading: true });
        // this.getData(nextProps);
    }

    parseLocationSearch(search: string): LocationSearch {
        const {
            onlyProblems,
            tags,
            intervalLength,
            autoRefreshPeriod,
        }: {
            [key: string]: string | Array<string>,
        } = queryString.parse(search, { arrayFormat: "index" });
        return {
            onlyProblems: onlyProblems === "true" || false,
            tags: Array.isArray(tags) ? tags : [],
            intervalLength: Number(intervalLength) || 60*60*24,  // 1 day is the default value
            autoRefreshPeriod: (autoRefreshPeriod !== null && autoRefreshPeriod !== undefined)
                ? Number(autoRefreshPeriod)
                : 60,
        };
    }

    changeLocationSearch(update: $Shape<LocationSearch>) {
        const { location, history } = this.props;
        const {
            selectedTags: tags = null,
            ...updateProcessed,
        } = update;
        if (tags !== null) {
            updateProcessed.tags = tags;
        }
        const search = {
            ...this.parseLocationSearch(location.search),
            ...updateProcessed,
        };
        // localStorage.setItem("moiraSettings", JSON.stringify(search));
        history.push(
            "?" +
                queryString.stringify(search, {
                    arrayFormat: "index",
                    encode: true,
                })
        );
    }

    onChange(update: { onlyProblems: ?boolean, selectedTags: ?Array<String>, intervalLength: ?Number }, refetchData = true) {
        this.setState({ loading: refetchData, ...update });
        this.changeLocationSearch(update);
        if (refetchData) {
            this.getData(this.props);
        }
    }

    async getData(props: Props): Promise<void> {
        const { moiraApi } = props;

        try {
            const { list: allTags } = await moiraApi.getTagList();

            let metricStats = null;
            const { selectedTags, onlyProblems, intervalLength } = this.state;
            if (selectedTags && Array.isArray(selectedTags) && selectedTags.length > 0) {
                metricStats = await moiraApi.getMetricStats(intervalLength, onlyProblems, selectedTags);
                metricStats = metricStats.list;
            }

            this.setState({
                loading: false,
                error: null,
                metricStats: metricStats,
                availableTags: allTags,
            });
        } catch (error) {
            this.setState({ error: error.message });
        }
    }

    sortMetricStats(metricStats: Array<MetricStat>): Array<MetricStat> {
        const {sortingColumn, sortingDown} = this.state;
        const cmp = (left, right) => {
            if (left < right) {
                return sortingDown ? -1 : 1;
            }
            if (left > right) {
                return sortingDown ? 1 : -1;
            }
            return 0;
        };
        const sorting = {
            trigger: (x, y) => {
                const triggerNameA = x.trigger.name;
                const triggerNameB = y.trigger.name;
                return cmp(triggerNameA, triggerNameB);
            },
            metric: (x, y) => {
                const metricA = x.metric;
                const metricB = y.metric;
                return cmp(metricA, metricB);
            },
            error_count: (x, y) => {
                const errorCountA = x.error_count;
                const errorCountB = y.error_count;
                return cmp(errorCountA, errorCountB);
            },
        };

        return metricStats.sort(sorting[sortingColumn]);
    }

    renderSortIcon(column: String): React.Node {
        const {sortingColumn, sortingDown} = this.state;
        if (column !== sortingColumn) {
            return null;
        }
        const sortingIcon = sortingDown ? "ArrowBoldDown" : "ArrowBoldUp";
        return <span>&nbsp;<Icon name={sortingIcon} /></span>;
    }

    setSort(column: String) {
        const {sortingColumn, sortingDown} = this.state;
        if (column !== sortingColumn) {
            this.setState({
                sortingColumn: column,
                sortingDown: true,
            });
        } else {
            this.setState({
                sortingDown: !sortingDown,
            });
        }
    }

    render(): React.Node {
        const self = this;
        const {
            loading,
            error,
            metricStats,
            selectedTags: tags,
            availableTags: allTags,
            onlyProblems,
            intervalLength,
            autoRefreshPeriod,
        } = self.state;
        const { location } = self.props;

        const SECONDS_IN_A_DAY = 60 * 60 * 24;
        const availableIntervals = [
            [SECONDS_IN_A_DAY, "1 day"],
            [SECONDS_IN_A_DAY*7, "7 days",],
            [SECONDS_IN_A_DAY*30, "30 days"],
        ];
        const renderIntervalLength = function(intervalLength) {
            for (let item of availableIntervals) {
                if (item[0] == intervalLength) {
                    return item[1];
                }
            }
            return moment.duration(intervalLength * 1000).humanize();
        }

        const renderAutoRefreshPeriod = function(autoRefreshPeriod) {
            if (autoRefreshPeriod === 0) {
                return "Never";
            } else {
                return autoRefreshPeriod + " sec";
            }
        }

        return (
            <Layout loading={loading} error={error}>
                <AutoRefresh
                    interval={autoRefreshPeriod}
                    onInterval={() => {
                        self.getData(self.props);
                    }}
                />

                <LayoutPlate>
                    <RowStack verticalAlign="baseline" block gap={1}>
                        <Fill>
                            <TagDropdownSelect
                                value={tags}
                                placeholder={"Filter by tags"}
                                availableTags={allTags}
                                width="100%"
                                onChange={tags => self.onChange({ selectedTags: tags })}
                            />
                            <RowStack verticalAlign="baseline" block gap={1}>
                                <div className={cn("inlineControl")}>
                                    <ToggleWithLabel
                                        checked={onlyProblems}
                                        classNameExtra={"stacked"}
                                        label="Only Problems"
                                        onChange={checked => self.onChange({ onlyProblems: checked })}
                                    />
                                </div>
                                <div className={cn("inlineControl")}>
                                    Show stats for&nbsp;
                                    <Select
                                        width={130}
                                        value={intervalLength}
                                        renderValue={renderIntervalLength}
                                        items={availableIntervals}
                                        onChange={(e, value) => self.onChange({ intervalLength: value })}
                                    />
                                </div>
                                <div className={cn("inlineControl")}>
                                    <Icon name="refresh" />&nbsp;Refresh every&nbsp;
                                    <Select
                                        width={130}
                                        value={autoRefreshPeriod}
                                        renderValue={renderAutoRefreshPeriod}
                                        items={[
                                            [60, "60 sec"],
                                            [120, "120 sec"],
                                            [600, "600 sec"],
                                            [0, "Never"],
                                        ]}
                                        onChange={(e, value) => self.onChange({ autoRefreshPeriod: value }, false)}
                                    />
                                </div>
                            </RowStack>
                        </Fill>
                    </RowStack>
                </LayoutPlate>

                <LayoutContent>
                    <div className={cn("metricTable")}>
                        {metricStats &&
                            <RowStack className={cn("metricRow")} block gap={2} horizontalAlign="stretch">
                                <Fill onClick={() => self.setSort("metric")} className={cn("metricItem", "metric", "sorting")}>Metric{self.renderSortIcon("metric")}</Fill>
                                <Fill onClick={() => self.setSort("trigger")} className={cn("metricItem", "trigger", "sorting")}>Trigger{self.renderSortIcon("trigger")}</Fill>
                                <Fill className={cn("metricItem")}>Tags</Fill>
                                <Fill onClick={() => self.setSort("error_count")} className={cn("metricItem", "errorCount", "sorting")}>Err.{self.renderSortIcon("error_count")}</Fill>
                            </RowStack>
                        }

                        {metricStats && this.sortMetricStats(metricStats).map((metricStat, i) => {
                            const {
                                metric,
                                trigger,
                                current_state,
                                error_count,
                            } = metricStat;
                            return (
                                <RowStack className={cn("metricRow")} block gap={2} horizontalAlign="stretch" key={i}>
                                    <Fill className={cn("metricItem", "metric")} title={metric}>
                                        <span className={cn("statusIcon")}><StatusIcon status={current_state} size={10} /></span>{metric}
                                    </Fill>
                                    <Fill className={cn("metricItem", "trigger")}>
                                        <ReactRouterLink className={cn("link")} to={getPageLink("trigger", trigger.id)}>
                                            <div className={cn("name")} title={trigger.name}>{trigger.name}</div>
                                        </ReactRouterLink>
                                    </Fill>
                                    <Fill className={cn("metricItem")}>
                                        <div className={cn("tags")}><TagGroup tags={_.difference(trigger.tags, tags)} /></div>
                                    </Fill>
                                    <Fill className={cn("metricItem", "errorCount")}>{error_count}</Fill>
                                </RowStack>
                            )
                        })}

                        {(metricStats === null) && <div>Please choose some tags to see stats.</div>}
                    </div>

                </LayoutContent>
            </Layout>
        )
    }
}

export default withMoiraApi(MetricStatsContainer);
