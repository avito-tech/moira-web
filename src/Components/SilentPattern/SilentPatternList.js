// @flow
import _ from "lodash";
import moment from "moment";
import * as React from "react";
import Button from "retail-ui/components/Button";
import Checkbox from "retail-ui/components/Checkbox";

import { getTimeOffset, SilentPattern, TimeOffsets } from "../../Domain/Silent";
import cn from "./SilentPatternList.less";
import ProlongDropdown from "./ProlongDropdown";
import SilentPatternListItem from "./SilentPatternListItem";

type ListProps = ReactExactProps<{
    items: Array<SilentPattern>,
    onChange: (Array<SilentPattern>, number) => void,
    onRemove: (Array<SilentPattern>) => void,
    onSort: (key: string, order: string) => void,
    searchString: string,
    sortKey: string,
    sortOrder: string,
}>;

type ListState = {
    items: Array<SilentPattern>,
    itemsAvailable: Array<SilentPattern>,
    itemsChecked: {
        [key: string]: boolean,
    },
    itemsCheckedAll: boolean,
    itemsCheckedNone: boolean,
};

export default class SilentPatternList extends React.Component<ListProps, ListState> {
    props: ListProps;

    // eslint-disable-next-line no-unused-vars
    componentWillReceiveProps(nextProps: ListProps, nextContext: any) {
        const self = this,
            searchString = nextProps.searchString,
            searchTriggered = !_.isEmpty(searchString),
            sortKey = nextProps.sortKey,
            sortOrder = nextProps.sortOrder,
            itemsAvailable = nextProps.items,
            itemsChecked = self.state ? self.state.itemsChecked : {};

        let itemsCheckedAll = true,
            itemsCheckedNone = true;

        _.each(itemsAvailable, item => {
            const key = self.key(item);
            item.isVisible = searchTriggered
                ? item.pattern.includes(searchString) || item.login.includes(searchString)
                : true;
            item.pk = key;
        });

        const items = _.orderBy(_.filter(itemsAvailable, "isVisible"), [sortKey], [sortOrder]);
        _.each(items, item => {
            const checked = itemsChecked[item.pk] || false;
            if (checked === true) {
                itemsCheckedNone = false;
            } else {
                itemsCheckedAll = false;
            }
        });

        self.setState({
            items: items,
            itemsAvailable: itemsAvailable,
            itemsChecked: itemsChecked,
            itemsCheckedAll: itemsCheckedAll,
            itemsCheckedNone: itemsCheckedNone,
            sortKey: sortKey,
            sortOrder: sortOrder,
        });
    }

    getCheckedItems(): Array<SilentPattern> {
        const self = this;
        return _.filter(self.state.items, item => {
            return self.state.itemsChecked[item.pk] === true;
        });
    }

    /**
     * Вызываем сортировку по какому-либо столбцу (столбец передаётся в параметре `key`).
     * Повторная сортировка по тому же столбцу означает смену порядка на обратный.
     * */
    hitSort(newSortKey: string) {
        let newSortOrder;
        const self = this,
            props = self.props,
            currentSortKey = props.sortKey,
            currentSortOrder = props.sortOrder;

        if (currentSortKey === newSortKey) {
            // новая сортировка по тому же столбцу, что и старая
            // это означает, что мы меняем порядок сотрировки на обратный
            newSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
        } else {
            // новая сортировка по другому стоолбцу
            // это означает, что мы меняем порядок сортировки на порядок по умолчанию
            newSortOrder = "asc";
        }

        // пробрасываем событие сортировки наверх
        props.onSort(newSortKey, newSortOrder);
    }

    key(item: SilentPattern): string {
        return _.isEmpty(item.id) ? item.pattern : item.id;
    }

    onAllSelectedChange(offset: string) {
        const self = this;
        if (offset in TimeOffsets) {
            const until = moment().unix() + getTimeOffset(offset) * 60;
            self.props.onChange(self.getCheckedItems(), until);
        }
    }

    onAllSelectedRemove() {
        const self = this;
        self.props.onRemove(self.getCheckedItems());
    }

    onCheckAll(newChecked: boolean) {
        const self = this,
            itemsChecked = {};

        // выделение всех или снятие выделения со всех относится ко всем строчкам, не только видимым
        _.each(self.state.itemsAvailable, item => {
            itemsChecked[item.pk] = newChecked;
        });
        self.setState({
            itemsChecked: itemsChecked,
            itemsCheckedAll: newChecked,
            itemsCheckedNone: !newChecked,
        });
    }

    onListItemChange(item: SilentPattern, offset: string) {
        const self = this;
        if (offset in TimeOffsets) {
            const until = moment().unix() + getTimeOffset(offset) * 60;
            self.props.onChange([item], until);
        }
    }

    onListItemCheck(item: SilentPattern, newChecked: boolean) {
        // устанавливаем/снимаем выбор конкретной строчки
        const self = this,
            itemsChecked = self.state.itemsChecked;
        itemsChecked[item.pk] = newChecked;

        // проверяем, выбраны ли все строчки одновременно или нет
        let itemsCheckedAll = true,
            itemsCheckedNone = true;
        _.each(self.state.items, item => {
            if (itemsChecked[item.pk] === true) {
                itemsCheckedNone = false;
            } else {
                itemsCheckedAll = false;
            }
        });

        // проставляем галочки
        this.setState({
            itemsChecked: itemsChecked,
            itemsCheckedAll: itemsCheckedAll,
            itemsCheckedNone: itemsCheckedNone,
        });
    }

    onListItemRemove(item: SilentPattern) {
        this.props.onRemove([item]);
    }

    render(): React.Node {
        const self = this;
        const items = self.state ? self.state.items : [];
        const itemsChecked = self.state ? self.state.itemsChecked : {};

        return (
            <div>
                {self.state && self.renderHeader()}
                {_.map(items, item => (
                    <SilentPatternListItem
                        checked={itemsChecked[item.pk]}
                        key={item.pk}
                        silentPatternData={item}
                        onChange={offset => self.onListItemChange(item, offset)}
                        onCheck={newChecked => self.onListItemCheck(item, newChecked)}
                        onRemove={() => self.onListItemRemove(item)}
                    />
                ))}
            </div>
        );
    }

    renderHeader(): React.Node {
        const self = this;
        return (
            <div className={cn("row", "header")}>
                <div className={cn("check")}>
                    <Checkbox
                        checked={self.state.itemsCheckedAll && _.size(self.state.items) !== 0}
                        disabled={_.size(self.state.items) === 0}
                        onChange={(e, checked) => self.onCheckAll(checked)}
                    />
                </div>
                {self.renderHeaderCaptionSortable("pattern", "Pattern")}
                {self.renderHeaderCaptionSortable("login", "Creator")}
                {self.renderHeaderCaptionSortable("created_at", "Created at")}
                <div className={cn("control")}>
                    <ProlongDropdown
                        disabled={self.state.itemsCheckedNone}
                        onSelect={offset => self.onAllSelectedChange(offset)}
                        title={"Change all selected"}
                    />
                </div>
                <div className={cn("trash")}>
                    <Button
                        disabled={self.state.itemsCheckedNone}
                        use="link"
                        icon="Trash"
                        onClick={() => self.onAllSelectedRemove()}>
                        Del all selected
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * Рисуем заголовок одного столбца с возможностью сортировки.
     * */
    renderHeaderCaptionSortable(key: string, text: string): React.Node {
        const self = this;
        const currentSortKey = self.props.sortKey,
            currentSortOrder = self.props.sortOrder,
            isSorted = currentSortKey === key;

        return (
            <div
                className={cn(key, "sortable", isSorted ? "sorted" : "", isSorted ? currentSortOrder : "")}
                onClick={() => self.hitSort(key)}>
                {text}
            </div>
        );
    }
}
