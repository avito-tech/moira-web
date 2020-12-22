// @flow
export interface Contact {
    id: string;
    type: string;
    user: string;
    value: string;
    fallback_value?: string;
}

export interface ContactList {
    list: Array<Contact>;
}
