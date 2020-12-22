// @flow
import _, { intersection, concat, difference, flattenDeep, uniq, isEqual } from "lodash";
import moment from "moment";
import queryString from "query-string";
import * as React from "react";
import type { ContextRouter } from "react-router-dom";

import type { IMoiraApi } from "../Api/MoiraAPI";
import { withMoiraApi } from "../Api/MoiraApiInjection";
import AddingButton from "../Components/AddingButton/AddingButton";
import { ColumnStack, RowStack, Fill } from "../Components/ItemsStack/ItemsStack";
import Layout, { LayoutPlate, LayoutContent, LayoutPaging } from "../Components/Layout/Layout";
import Paging from "../Components/Paging/Paging";
import SearchInput from "../Components/SearchInput/SearchInput";
import { specialTags } from "../Components/SubscriptionEditor/SubscriptionEditor";
import TagDropdownSelect2 from "../Components/TagDropdownSelect2/TagDropdownSelect2";
import ToggleWithLabel from "../Components/Toggle/Toggle";
import TriggerListView from "../Components/TriggerList/TriggerList";
import type { Config } from "../Domain/Config";
import { getPageLink } from "../Domain/Global";
import { getMaintenanceTime, Maintenance } from "../Domain/Maintenance";
import type { TriggerList } from "../Domain/Trigger";

type Props = ContextRouter & { moiraApi: IMoiraApi };
type State = {
    loading: boolean,
    error: ?string,
    subscriptions: ?Array<string>,
    tags: ?Array<string>,
    triggers: ?TriggerList,
    config: ?Config,
    spinner: ?boolean,
    triggerName: ?string,
};

type LocationSearch = {|
    onlyProblems: boolean,
    page: number,
    tags: Array<string>,
    triggerName: string,
|};

class TriggerListContainer extends React.Component<Props, State> {
    props: Props;
    state: State = {
        loading: true,
        error: null,
        subscriptions: null,
        tags: null,
        triggers: null,
        config: null,
        spinner: false,
        triggerName: "",
    };

    triggerNameSearchTimeout = null;

    async getData(props: Props): Promise<void> {
        const { moiraApi, location } = props;
        const { onlyProblems, page, tags: parsedTags, triggerName } = this.parseLocationSearch(location.search);
        const localDataString = localStorage.getItem("moiraSettings");
        const { tags: localTags, onlyProblems: localOnlyProblems } =
            typeof localDataString === "string" ? JSON.parse(localDataString) : {};

        let searchToUpdate = null;
        if (parsedTags.length === 0 && localTags && localTags.length) {
            searchToUpdate = { ...(searchToUpdate || {}), tags: localTags };
        }

        if (!onlyProblems && localOnlyProblems) {
            searchToUpdate = { ...(searchToUpdate || {}), onlyProblems: localOnlyProblems };
        }
        if (searchToUpdate != null) {
            this.changeLocationSearch(searchToUpdate);
            return;
        }

        try {
            const { subscriptions } = await moiraApi.getSettings();
            const { list: allTags } = await moiraApi.getTagList();
            const config = await moiraApi.getConfig();
            const selectedTags = intersection(parsedTags, allTags);
            const triggers = await moiraApi.getTriggerList(page - 1, onlyProblems, selectedTags, triggerName);

            if (page > Math.ceil(triggers.total / triggers.size) && triggers.total !== 0) {
                const rightLastPage = Math.ceil(triggers.total / triggers.size) || 1;
                this.changeLocationSearch({ page: rightLastPage });
                return;
            }

            this.setState({
                config: config,
                loading: false,
                error: null,
                subscriptions: uniq(flattenDeep(subscriptions.map(x => x.tags))),
                tags: allTags,
                triggerName: triggerName,
                triggers,
            });
        } catch (error) {
            this.setState({ error: error.message });
        }
    }

    componentDidMount() {
        this.getData(this.props);
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState({ loading: true });
        this.getData(nextProps);
        if (this.needScrollToTop(this.props, nextProps)) {
            try {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "smooth",
                });
            } catch (e) {
                // Do nothing. Strange unstable exception on chrome
            }
        }
    }

    needScrollToTop(prevProps: Props, nextProps: Props): boolean {
        const { page: prevPage } = this.parseLocationSearch(prevProps.location.search);
        const { page: nextPage } = this.parseLocationSearch(nextProps.location.search);
        return !isEqual(prevPage, nextPage);
    }

    parseLocationSearch(search: string): LocationSearch {
        const {
            onlyProblems,
            page,
            tags,
            triggerName,
        }: {
            [key: string]: string | Array<string>,
        } = queryString.parse(search, { arrayFormat: "index" });
        return {
            onlyProblems: onlyProblems === "true" || false,
            page: typeof page === "string" ? Number(page.replace(/\D/g, "")) || 1 : 1,
            tags: Array.isArray(tags) ? tags : [],
            triggerName: triggerName,
        };
    }

    changeLocationSearch(update: $Shape<LocationSearch>) {
        const { location, history } = this.props;
        const search = {
            ...this.parseLocationSearch(location.search),
            ...update,
        };
        localStorage.setItem("moiraSettings", JSON.stringify(search));
        history.push(
            "?" +
                queryString.stringify(search, {
                    arrayFormat: "index",
                    encode: true,
                })
        );
    }

    triggerNameSearchDelay(triggerName: string) {
        const self = this;
        self.setState({
            spinner: true,
            triggerName: triggerName,
        });
        if (self.triggerNameSearchTimeout === null) {
            self.triggerNameSearchTimeout = window.setTimeout(() => {
                self.triggerNameSearchImmediately(self.state.triggerName);
            }, 1600);
        }
    }

    triggerNameSearchImmediately(triggerName: string) {
        const self = this;
        self.setState({ spinner: false });

        if (self.triggerNameSearchTimeout !== null) {
            window.clearTimeout(self.triggerNameSearchTimeout);
        }
        self.triggerNameSearchTimeout = null;

        self.changeLocationSearch({ triggerName: triggerName });
    }

    async setMaintenance(triggerId: string, maintenance: Maintenance, metric: string): Promise<void> {
        this.setState({ loading: true });
        const maintenanceTime = getMaintenanceTime(maintenance);
        await this.props.moiraApi.setMaintenance(triggerId, {
            [metric]:
                maintenanceTime > 0
                    ? moment
                          .utc()
                          .add(maintenanceTime, "minutes")
                          .unix()
                    : maintenanceTime,
        });
        this.getData(this.props);
    }

    async removeMetric(triggerId: string, metric: string): Promise<void> {
        this.setState({ loading: true });
        await this.props.moiraApi.delMetric(triggerId, metric);
        this.getData(this.props);
    }

    render(): React.Node {
        const self = this;
        const { loading, error, triggers, tags, subscriptions, config, triggerName } = self.state;
        const { location } = self.props;
        const { page, onlyProblems, tags: parsedTags } = self.parseLocationSearch(location.search);
        const selectedTags = tags ? intersection(parsedTags, tags) : [];
        const subscribedTags = subscriptions ? difference(subscriptions, selectedTags) : [];
        const remainedTags = difference(tags, concat(selectedTags, subscribedTags));
        const pageCount = triggers ? Math.ceil(triggers.total / triggers.size) : 1;

        return (
            <Layout loading={loading} error={error}>
                <LayoutPlate>
                    <RowStack verticalAlign="baseline" block gap={3}>
                        <Fill>
                            <TagDropdownSelect2
                                placeholder={"Filter by tags"}
                                width="100%"
                                selected={selectedTags}
                                subscribed={subscribedTags.filter(x => !specialTags.includes(x))}
                                remained={remainedTags}
                                onSelect={tag =>
                                    this.changeLocationSearch({
                                        tags: concat(selectedTags, [tag]),
                                    })
                                }
                                onRemove={tag =>
                                    self.changeLocationSearch({
                                        tags: difference(selectedTags, [tag]),
                                    })
                                }
                            />
                            <ToggleWithLabel
                                checked={onlyProblems}
                                classNameExtra={"stacked"}
                                label="Only Problems"
                                onChange={checked =>
                                    self.changeLocationSearch({
                                        onlyProblems: checked,
                                    })
                                }
                            />
                        </Fill>
                        <Fill>
                            <SearchInput
                                onPressEnter={() => self.triggerNameSearchImmediately(self.state.triggerName)}
                                onValueChange={newValue => self.triggerNameSearchDelay(newValue)}
                                placeholder={"Filter by trigger name"}
                                value={triggerName}
                                width={"100%"}
                                withSpinner={self.state.spinner}
                            />
                        </Fill>
                    </RowStack>
                </LayoutPlate>
                {triggers &&
                    config != null && (
                        <LayoutContent>
                            <ColumnStack block gap={6} horizontalAlign="stretch">
                                <AddingButton to={getPageLink("triggerAdd")} />
                                <TriggerListView
                                    supportEmail={config.supportEmail}
                                    items={triggers.list || []}
                                    onChange={(triggerId, maintenance, metric) => {
                                        this.setMaintenance(triggerId, maintenance, metric);
                                    }}
                                    onRemove={(triggerId, metric) => {
                                        this.removeMetric(triggerId, metric);
                                    }}
                                />
                            </ColumnStack>
                        </LayoutContent>
                    )}
                {pageCount > 1 && (
                    <LayoutPaging>
                        <Paging
                            activePage={page}
                            pagesCount={pageCount}
                            onPageChange={page => this.changeLocationSearch({ page })}
                        />
                    </LayoutPaging>
                )}
            </Layout>
        );
    }
}

export default withMoiraApi(TriggerListContainer);
