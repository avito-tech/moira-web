// @flow
import _ from "lodash";
import * as React from "react";
import Button from "retail-ui/components/Button";
import Icon from "retail-ui/components/Icon";

import cn from "./TagList.less";
import type { TagStat } from "../../Domain/Tag";
import type { Contact } from "../../Domain/Contact";

type Props = ReactExactProps<{
    items: Array<TagStat>,
    contacts: Array<Contact>,
    onRemove: (tag: string) => void,
    onRemoveContact: (subscriptionId: string) => void,
}>;

export default function TagList(props: Props): React.Node {
    const { items, contacts, onRemove, onRemoveContact } = props;
    return (
        <div>
            <div className={cn("row", "header")}>
                <div className={cn("name")}>Tag</div>
                <div className={cn("trigger-counter")}>Triggers</div>
                <div className={cn("subscription-counter")}>Subscriptions</div>
                <div className={cn("control")} />
            </div>
            {items.map(item => (
                <TagListItem
                    key={item.name}
                    data={item}
                    allContacts={contacts}
                    onRemove={() => onRemove(item.name)}
                    onRemoveContact={id => onRemoveContact(id)}
                />
            ))}
        </div>
    );
}

type ItemProps = {
    data: TagStat,
    allContacts: Array<Contact>,
    onRemove: () => void,
    onRemoveContact: (subscriptionId: string) => void,
};
type ItemState = {
    showInfo: boolean,
};

class TagListItem extends React.Component<ItemProps, ItemState> {
    props: ItemProps;
    state: ItemState = {
        showInfo: false,
    };

    renderContactIcon(type: string): React.Node {
        let name;
        switch (type) {
            case "telegram":
                name = "Telegram2";
                break;
            default:
                name = "Mail2";
                break;
        }
        return <Icon name={name} />;
    }

    render(): React.Node {
        const { data, allContacts, onRemove, onRemoveContact } = this.props;
        const { showInfo } = this.state;
        const { name, subscriptions, triggers } = data;
        const isSubscriptions = subscriptions.length !== 0;
        return (
            <div className={cn("row", { active: showInfo, clicable: isSubscriptions })}>
                <div className={cn("name")} onClick={isSubscriptions && (() => this.setState({ showInfo: !showInfo }))}>
                    {name}
                </div>
                <div className={cn("trigger-counter")}>{triggers.length}</div>
                <div className={cn("subscription-counter")}>{subscriptions.length}</div>
                <div className={cn("control")}>
                    <Button use="link" icon="Trash" onClick={() => onRemove()}>
                        Delete
                    </Button>
                </div>
                {showInfo && (
                    <div className={cn("info")}>
                        {isSubscriptions && (
                            <div className={cn("group")}>
                                <div key={null} className={cn("item")}>
                                    <div className={cn("enabled")} />
                                    <div className={cn("user")}>
                                        <strong>User</strong>
                                    </div>
                                    <div className={cn("tags")}>
                                        <strong>Tags</strong>
                                    </div>
                                    <div className={cn("contacts")}>
                                        <strong>Channel</strong>
                                    </div>
                                    <div className={cn("sub-control")}>
                                        <strong>Delete</strong>
                                    </div>
                                </div>
                                {subscriptions.map(({ id, enabled, user, contacts, tags }) => (
                                    <div key={id} className={cn("item")}>
                                        <div className={cn("enabled")}>
                                            {enabled ? <Icon name="Ok" /> : <Icon name="Delete" />}
                                        </div>
                                        <div className={cn("user")}>{user}</div>
                                        <div className={cn("tags")}>
                                            {_.join(
                                                _.map(
                                                    _.sortBy(tags, tag => [tag !== "MONAD", tag]),
                                                    tag => `[${tag}]`
                                                ),
                                                ""
                                            )}
                                        </div>
                                        <div className={cn("contacts")}>
                                            {_.flatten(contacts.map(x => allContacts.filter(y => y.id === x))).map(
                                                ({ id, type, value }) => (
                                                    <div key={id}>
                                                        {this.renderContactIcon(type)} {value}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        <div className={cn("sub-control")}>
                                            <Button use="link" icon="Trash" onClick={() => onRemoveContact(id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}
