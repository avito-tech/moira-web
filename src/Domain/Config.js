// @flow

export type ContactConfig = {|
    type: string,
    validation: string,
    title?: string,
    help?: string,
    can_have_fallback_value?: boolean,
|};

export type Config = {|
    supportEmail: string,
    contacts: Array<ContactConfig>,
    grafana_prefixes: Array<string>,
|};
