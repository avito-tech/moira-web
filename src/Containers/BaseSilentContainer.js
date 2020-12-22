//@flow
import _ from "lodash";
import queryString from "query-string";
import * as React from "react";
import type { ContextRouter } from "react-router-dom";
import Link from "retail-ui/components/Link";
import Tooltip from "retail-ui/components/Tooltip";

import type { IMoiraApi } from "../Api/MoiraAPI";
import { withMoiraApi } from "../Api/MoiraApiInjection";
import Layout, { LayoutContent, LayoutTitle } from "../Components/Layout/Layout";
import SilentPatternForm from "../Components/SilentPattern/SilentPatternForm";
import SilentPatternList from "../Components/SilentPattern/SilentPatternList";
import type { SilentPattern } from "../Domain/Silent";
import cn from "./BaseSilentContainer.less";

export type Props = ContextRouter & {
    moiraApi: IMoiraApi,
    pageCaption: string,
    silentPatternType: number,
};
export type State = {
    loading: boolean,
    error: ?string,
    list: ?Array<SilentPattern>,
    tags: ?Array<string>,
    searchString: string,
    sortKey: string,
    sortOrder: string,
};

class BaseSilentContainer extends React.Component<Props, State> {
    props: Props;
    state: State = {
        loading: true,
        error: null,
        list: null,
        tags: null,
        searchString: "",
        sortKey: null,
        sortOrder: null,
    };

    availableSortKey = ["created_at", "login", "pattern"];
    availableSortOrder = ["asc", "desc"];

    componentDidMount() {
        const self = this;
        self.getData(self.props).then(() => {
            // noinspection JSUnresolvedVariable
            const pseudoParams = queryString.parse(window.location.hash.replace("#", "")),
                sortKey =
                    _.indexOf(self.availableSortKey, pseudoParams.sort_key) === -1
                        ? "created_at"
                        : pseudoParams.sort_key,
                sortOrder =
                    _.indexOf(self.availableSortOrder, pseudoParams.sort_order) === -1
                        ? "desc"
                        : pseudoParams.sort_order;
            self.setState({
                sortKey: sortKey,
                sortOrder: sortOrder,
            });
        });
    }

    // eslint-disable-next-line no-unused-vars
    componentWillReceiveProps(nextProps: Props, nextContext: any) {
        this.setState({ loading: true });
        this.getData(nextProps);
    }

    async getData(props: Props) {
        const self = this,
            { moiraApi } = props;

        self.setState({
            error: null,
            loading: true,
        });

        try {
            const patterns = await moiraApi.getSilentPatternList(props.silentPatternType);
            self.setState({ ...patterns });

            if (props.silentPatternType === 1) {
                const { list: tags } = await moiraApi.getTagList();
                self.setState({ tags: tags });
            }
        } catch (error) {
            self.setState({ error: error.message });
        } finally {
            self.setState({ loading: false });
        }
    }

    async setSilentPatterns(silentPatterns: Array<SilentPattern>, until: number) {
        const self = this,
            data = { list: silentPatterns };

        self.setState({
            error: null,
            loading: true,
        });

        try {
            if (until !== null) {
                // until не null - значит, обновление уже созданных паттернов
                _.each(silentPatterns, silentPattern => {
                    silentPattern.until = until;
                });
                await self.props.moiraApi.updateSilentPatterns(data);
            } else {
                // until null - значит, создаём новые паттерны
                _.each(silentPatterns, silentPattern => {
                    silentPattern.type = self.props.silentPatternType;
                });
                await self.props.moiraApi.addSilentPatterns(data);
            }
            // обновляем список
            await self.getData(self.props);
        } catch (error) {
            self.setState({ error: error.message });
        } finally {
            self.setState({ loading: false });
        }
    }

    async delSilentPatterns(silentPatterns: Array<SilentPattern>) {
        const self = this,
            data = { list: silentPatterns };

        self.setState({
            error: null,
            loading: true,
        });

        try {
            await self.props.moiraApi.delSilentPatterns(data);
            await self.getData(self.props);
        } catch (error) {
            self.setState({ error: error.message });
        } finally {
            self.setState({ loading: false });
        }
    }

    onListSortChanged(newSortKey: string, newSortOrder: string) {
        const self = this;
        self.setState({
            sortKey: newSortKey,
            sortOrder: newSortOrder,
        });
        window.location.hash = queryString.stringify({
            sort_key: newSortKey,
            sort_order: newSortOrder,
        });
    }

    render(): React.Node {
        const self = this,
            pageCaption = self.props.pageCaption;
        const { loading, error, list } = self.state;

        return (
            <Layout loading={loading} error={error}>
                <LayoutContent>
                    <div className={cn("layout-title-wrap")}>
                        <LayoutTitle>{pageCaption}</LayoutTitle>
                        <Tooltip className={cn("silent-pattern-help")} pos="top right" render={() => {}}>
                            <Link
                                icon="HelpDot"
                                href="https://cf/display/BD/Silent+patterns"
                                target="_blank"
                                title="Documentation"
                                to={""}
                            />
                        </Tooltip>
                    </div>

                    <SilentPatternForm
                        onCreate={silentPatterns => self.setSilentPatterns(silentPatterns, null)}
                        onSearch={newSearchString => self.setState({ searchString: newSearchString })}
                        searchString={self.state.searchString}
                        silentPatternType={self.props.silentPatternType}
                        tags={self.state.tags}
                    />

                    {list && (
                        <SilentPatternList
                            items={list}
                            onChange={(silentPatterns, offset) => self.setSilentPatterns(silentPatterns, offset)}
                            onRemove={silentPatterns => self.delSilentPatterns(silentPatterns)}
                            onSort={(newSortKey, newSortOrder) => self.onListSortChanged(newSortKey, newSortOrder)}
                            searchString={self.state.searchString}
                            sortKey={self.state.sortKey}
                            sortOrder={self.state.sortOrder}
                        />
                    )}
                </LayoutContent>
            </Layout>
        );
    }
}

export default withMoiraApi(BaseSilentContainer);
