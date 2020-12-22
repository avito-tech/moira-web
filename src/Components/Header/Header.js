// @flow
import * as React from "react";
import { Link } from "react-router-dom";
import { getPageLink } from "../../Domain/Global";
import LinkUI from "retail-ui/components/Link";
import RouterLink from "../RouterLink/RouterLink";
import cn from "./Header.less";
import svgLogo from "./moira-logo.svg";

type Props = {|
    className?: string,
|};

export default function Header(props: Props): React.Node {
    return (
        <header className={cn("header", props.className)}>
            <div className={cn("container")}>
                <Link to={getPageLink("index")} className={cn("logo-link")}>
                    <img className={cn("logo-img")} src={svgLogo} alt="Moira" />
                </Link>
                <nav className={cn("menu")}>
                    <RouterLink to={getPageLink("settings")} icon="Settings">
                        Notifications
                    </RouterLink>
                    <RouterLink to={getPageLink("silent_patterns")} icon="EyeClosed">
                        Silent Patterns
                    </RouterLink>
                    <RouterLink to={getPageLink("silent_tags")} icon="EyeClosed">
                        Silent Tags
                    </RouterLink>
                    <RouterLink to={getPageLink("tags")} icon="Mail2">
                        Tags and subscriptions
                    </RouterLink>
                    <RouterLink to={getPageLink("subscriptionSearch")} icon="Search">
                        Search subscriptions
                    </RouterLink>
                    <LinkUI href={getPageLink("docs")} icon="HelpBook">
                        Help
                    </LinkUI>
                </nav>
            </div>
        </header>
    );
}
