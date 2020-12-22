//@flow
import _ from "lodash";
import * as React from "react";
import type { ContextRouter } from "react-router-dom";
import Button from "retail-ui/components/Button/Button";

import type { IMoiraApi } from "../Api/MoiraAPI";
import { withMoiraApi } from "../Api/MoiraApiInjection";
import ContactTypeIcon from "../Components/ContactTypeIcon/ContactTypeIcon";
import { Fill, ColumnStack, RowStack } from "../Components/ItemsStack/ItemsStack";
import Layout, { LayoutContent, LayoutPlate, LayoutTitle } from "../Components/Layout/Layout";
import SearchInput from "../Components/SearchInput/SearchInput";
import TagGroup from "../Components/TagGroup/TagGroup";
import type { Contact } from "../Domain/Contact";
import type { SubscriptionFiltered } from "../Domain/Subscription";
import cn from "./SubscriptionSearchContainer.less";

type Props = ContextRouter & { moiraApi: IMoiraApi };
type State = {
    loading: boolean,
    error: ?string,
    list: Array<SubscriptionFiltered>,
    searchString: string,
    searchStringLast: string,
};

class SubscriptionSearchContainer extends React.Component<Props, State> {
    props: Props;
    state: State = {
        loading: false,
        error: null,
        list: null,
        searchString: "",
        searchStringLast: "",
    };

    isSubmitDisabled(): boolean {
        return this.state.searchString.length < 3;
    }

    async onHitSearch() {
        const self = this,
            { moiraApi } = self.props;

        if (self.isSubmitDisabled()) {
            return;
        }

        self.setState({
            error: null,
            loading: true,
        });

        try {
            const subscriptions = await moiraApi.searchSubscriptions(self.state.searchString);
            self.setState({
                ...subscriptions,
                searchStringLast: self.state.searchString,
            });
        } catch (error) {
            self.setState({ error: error.message });
        } finally {
            self.setState({ loading: false });
        }
    }

    render(): React.Node {
        const self = this;
        const { loading, error, list } = self.state;
        return (
            <Layout loading={loading} error={error}>
                <LayoutPlate>
                    <LayoutTitle>Search subscriptions and escalations</LayoutTitle>
                    <div className={cn("lc_search-wrap")}>
                        <SearchInput
                            placeholder={"Contact value (at least 3 symbols)"}
                            value={self.state.searchString}
                            width={"400px"}
                            onPressEnter={() => self.onHitSearch()}
                            onValueChange={value => self.setState({ searchString: value })}
                        />
                        <Button disabled={self.isSubmitDisabled()} onClick={() => self.onHitSearch()}>
                            Search
                        </Button>
                    </div>
                </LayoutPlate>
                <LayoutContent>{self.renderSubscriptionTable(list)}</LayoutContent>
            </Layout>
        );
    }

    renderExtractedContact(contacts: Array<Contact>, match: boolean): React.Node {
        const self = this,
            searchString = (self.state.searchStringLast || "").toLowerCase();

        const contactsFilter = _.filter(contacts, contact => {
            return !!searchString && contact.value.includes(searchString);
        });

        if (match && contactsFilter.length > 0) {
            return _.map(contactsFilter, contact => {
                return (
                    <span className={cn("lc_lc_t_r_contact")}>
                        <ContactTypeIcon type={contact.type} />
                        {contact.value}
                    </span>
                );
            });
        } else {
            return <span className={cn("lc_lc_t_r_no-result")}>nothing</span>;
        }
    }

    renderSubscriptionTable(list: Array<SubscriptionFiltered>): React.Node {
        if (!_.isEmpty(list)) {
            const self = this;
            return (
                <div className={cn("lc_lc_table")}>
                    <RowStack className={cn("lc_lc_t_row", "lc_lc_t_header")} block gap={2} horizontalAlign={"stretch"}>
                        <Fill className={cn("lc_lc_t_r_60")}>User</Fill>
                        <Fill className={cn("lc_lc_t_r_80")}>Tags</Fill>
                        <Fill>Search results</Fill>
                    </RowStack>
                    {_.map(list, item => {
                        return (
                            <RowStack className={cn("lc_lc_t_row")} block gap={2} horizontalAlign={"stretch"}>
                                <Fill className={cn("lc_lc_t_r_60", "lc_lc_t_r_user")}>{item.user}</Fill>
                                <Fill className={cn("lc_lc_t_r_80")}>
                                    <TagGroup tags={item.tags} />
                                </Fill>
                                <Fill>{self.renderSubscriptionSearchResult(item)}</Fill>
                            </RowStack>
                        );
                    })}
                </div>
            );
        } else {
            return <div className={cn("lc_lc_no-result")}>No subscriptions</div>;
        }
    }

    renderSubscriptionSearchResult(item: SubscriptionFiltered): React.Node {
        const self = this;
        return (
            <ColumnStack>
                <div className={cn("lc_lc_t_r_row")}>
                    <span>Subscription: </span>
                    {self.renderExtractedContact(item.contacts, item.matched_sub)}
                </div>
                {item.escalations &&
                    _.map(item.escalations, (escalation, i) => {
                        return (
                            <div className={cn("lc_lc_t_r_row")}>
                                <span>After {escalation.offset_in_minutes} minutes: </span>
                                {self.renderExtractedContact(escalation.contacts, item.matched_esc[i])}
                            </div>
                        );
                    })}
            </ColumnStack>
        );
    }
}

export default withMoiraApi(SubscriptionSearchContainer);
