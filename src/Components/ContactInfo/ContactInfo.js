// @flow
import * as React from "react";
import type { Contact } from "../../Domain/Contact";
import ContactTypeIcon from "../ContactTypeIcon/ContactTypeIcon";
import cn from "./ContactInfo.less";

type Props = {
    contact: Contact,
    className?: string,
};

export default function ContactInfo({ contact, className }: Props): React.Node {
    return (
        <span className={className}>
            <ContactTypeIcon type={contact.type} /> {contact.value}
            {contact.fallback_value && (<span><span className={cn("fallback-arrow")}>&#x2192;</span>{contact.fallback_value}</span>)}
        </span>
    );
}
