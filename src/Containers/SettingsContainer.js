// @flow
import * as React from "react";
import type { ContextRouter } from "react-router-dom";

import type { IMoiraApi } from "../Api/MoiraAPI";
import { withMoiraApi } from "../Api/MoiraApiInjection";
import ContactList from "../Components/ContactList/ContactList";
import GlobalSettingsContainer from "../Components/GlobalSettings/GlobalSettingsContainer";
import Layout, { LayoutContent, LayoutTitle } from "../Components/Layout/Layout";
import type { NewContactInfo } from "../Components/NewContactModal/NewContactModal";
import SubscriptionList, { type SubscriptionInfo } from "../Components/SubscriptionList/SubscriptionList";
import type { Config } from "../Domain/Config";
import type { Contact } from "../Domain/Contact";
import type { GlobalSettings } from "../Domain/GlobalSettings";
import type { Settings } from "../Domain/Settings";
import type { Subscription } from "../Domain/Subscription";

import cn from "./SettingsContainer.less";

type Props = ContextRouter & { moiraApi: IMoiraApi };
type State = {
    loading: boolean,
    error: ?string,
    globalSettings: ?GlobalSettings,
    settings: ?Settings,
    config: ?Config,
    tags: ?Array<string>,
};

class SettingsContainer extends React.Component<Props, State> {
    props: Props;
    state: State = {
        config: null,
        loading: true,
        error: null,
        globalSettings: null,
        settings: null,
        tags: null,
    };

    componentDidMount() {
        this.getData();
    }

    normalizeContactValueForApi(contactType: string, value: string): string {
        let result = value.trim();
        if (contactType === "twilio voice" || contactType === "twilio sms") {
            if (result.length >= 11) {
                result = result.replace(/^8/, "+7");
                result = result.replace(/^7/, "+7");
            } else if (result.length === 10) {
                result = "+7" + result;
            }
            return result;
        }
        if (contactType === "webhook") {
            return result.toLowerCase()
        }
        return result;
    }

    normalizeContactValueForUi(contactType: string, value: string): string {
        return value;
    }

    async getData(): Promise<void> {
        const { moiraApi } = this.props;
        try {
            const config = await moiraApi.getConfig();
            const tags = (await moiraApi.getTagList()).list;

            let globalSettings = null;
            let settings = await moiraApi.getSettings();

            if (settings.isSuperUser) {
                globalSettings = await moiraApi.getGlobalSettings();
            }

            settings = {
                ...settings,
                contacts: settings.contacts.map(x => ({
                    ...x,
                    value: this.normalizeContactValueForUi(x.type, x.value),
                })),
            };
            this.setState({
                loading: false,
                globalSettings: globalSettings,
                settings: settings,
                config: config,
                tags: tags,
            });
        } catch (error) {
            this.setState({ error: error.message });
        }
    }

    async handleToggleNotificationsDisabled(): Promise<void> {
        try {
            const { globalSettings } = this.state;
            const { moiraApi } = this.props;
            globalSettings.notifications.disabled = !globalSettings.notifications.disabled;

            await moiraApi.setGlobalSettings(globalSettings);
        } catch (error) {
            this.setState({ error: error.message });
        }

        this.getData();
    }

    handleTestContact = async (contact: Contact): Promise<void> => {
        const { moiraApi } = this.props;
        try {
            await moiraApi.testContact(contact.id);
        } catch (error) {
            this.setState({ error: error.message });
        }
    };

    handleTestSubscription = async (subscription: Subscription): Promise<void> => {
        const { moiraApi } = this.props;
        try {
            await moiraApi.testSubscription(subscription.id);
        } catch (error) {
            this.setState({ error: error.message });
        }
    };

    handleAddContact = async (contact: NewContactInfo): Promise<?Contact> => {
        const { moiraApi } = this.props;
        const { settings } = this.state;
        if (settings == null) {
            throw new Error("InvalidProgramState");
        }
        const contactType = contact.type;
        if (contactType == null) {
            throw new Error("InvalidProgramState");
        }
        try {
            let newContact = await moiraApi.addContact({
                value: this.normalizeContactValueForApi(contactType, contact.value),
                fallback_value: contact.fallback_value,
                type: contactType,
                user: settings.login,
            });
            newContact = {
                ...newContact,
                value: this.normalizeContactValueForUi(newContact.type, newContact.value),
            };
            this.setState({
                settings: {
                    ...settings,
                    contacts: [...settings.contacts, newContact],
                },
            });
            return newContact;
        } catch (error) {
            this.setState({ error: error.message });
        }
        return null;
    };

    handleUpdateContact = async (contact: Contact): Promise<void> => {
        const { moiraApi } = this.props;
        const { settings } = this.state;
        if (settings == null) {
            throw new Error("InvalidProgramState");
        }
        const { contacts } = settings;
        try {
            await moiraApi.updateContact({
                ...contact,
                value: this.normalizeContactValueForApi(contact.type, contact.value),
            });
            const index = contacts.findIndex(x => x.id === contact.id);
            this.setState({
                settings: {
                    ...settings,
                    contacts: [...contacts.slice(0, index), contact, ...contacts.slice(index + 1)],
                },
            });
        } catch (error) {
            this.setState({ error: error.message });
        }
    };

    handleAddSubscription = async (subscription: SubscriptionInfo): Promise<void> => {
        const { moiraApi } = this.props;
        const { settings } = this.state;
        if (settings == null) {
            throw new Error("InvalidProgramState");
        }
        try {
            const newSubscriptions = await moiraApi.addSubscription({
                sched: subscription.sched,
                tags: subscription.tags,
                throttling: subscription.throttling,
                contacts: subscription.contacts,
                enabled: subscription.enabled,
                escalations: subscription.escalations,
                user: settings.login,
            });
            this.setState({
                settings: {
                    ...settings,
                    subscriptions: [...settings.subscriptions, newSubscriptions],
                },
            });
        } catch (error) {
            this.setState({ error: error.message });
        }
    };

    handleUpdateSubscription = async (subscription: Subscription): Promise<void> => {
        const { moiraApi } = this.props;
        const { settings } = this.state;
        if (settings == null) {
            throw new Error("InvalidProgramState");
        }
        const { subscriptions } = settings;
        try {
            await moiraApi.updateSubscription(subscription);
            const index = subscriptions.findIndex(x => x.id === subscription.id);
            this.setState({
                settings: {
                    ...settings,
                    subscriptions: [...subscriptions.slice(0, index), subscription, ...subscriptions.slice(index + 1)],
                },
            });
        } catch (error) {
            this.setState({ error: error.message });
        }
    };

    handleRemoveSubscription = async (subscription: Subscription): Promise<void> => {
        const { moiraApi } = this.props;
        const { settings } = this.state;
        if (settings == null) {
            throw new Error("InvalidProgramState");
        }
        try {
            await moiraApi.deleteSubscription(subscription.id);
            this.setState({
                settings: {
                    ...settings,
                    subscriptions: settings.subscriptions.filter(x => x.id !== subscription.id),
                },
            });
        } catch (error) {
            this.setState({ error: error.message });
        }
    };

    handleRemoveContact = async (contact: Contact): Promise<void> => {
        const { moiraApi } = this.props;
        const { settings } = this.state;
        if (settings == null) {
            throw new Error("InvalidProgramState");
        }
        try {
            await moiraApi.deleteContact(contact.id);
            this.setState({
                settings: {
                    ...settings,
                    contacts: settings.contacts.filter(x => x.id !== contact.id),
                },
            });
        } catch (error) {
            this.setState({ error: error.message });
        }
    };

    render(): React.Node {
        const { loading, error, tags, globalSettings, settings, config } = this.state;
        return (
            <Layout loading={loading} error={error}>
                <LayoutContent>
                    <LayoutTitle>Notifications</LayoutTitle>
                    {config != null && settings != null && settings.contacts != null && (
                        <div className={cn("contact-list")}>
                            <ContactList
                                contactDescriptions={config.contacts}
                                items={settings.contacts}
                                onTestContact={this.handleTestContact}
                                onAddContact={this.handleAddContact}
                                onUpdateContact={this.handleUpdateContact}
                                onRemoveContact={this.handleRemoveContact}
                            />
                        </div>
                    )}
                    {settings != null &&
                        tags != null &&
                        settings.subscriptions != null &&
                        settings.contacts != null &&
                        settings.contacts.length > 0 && (
                            <SubscriptionList
                                tags={tags}
                                contacts={settings.contacts}
                                subscriptions={settings.subscriptions}
                                onTestSubscription={this.handleTestSubscription}
                                onAddSubscription={this.handleAddSubscription}
                                onRemoveSubscription={this.handleRemoveSubscription}
                                onUpdateSubscription={this.handleUpdateSubscription}
                            />
                        )}
                </LayoutContent>
                {globalSettings != null && (
                    <GlobalSettingsContainer
                        globalSettings={globalSettings}
                        onToggle={() => this.handleToggleNotificationsDisabled()}
                    />
                )}
            </Layout>
        );
    }
}

export default withMoiraApi(SettingsContainer);
