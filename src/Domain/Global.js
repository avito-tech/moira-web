// @flow
export const PagesPaths = {
    index: "/",
    trigger: "/trigger/:id",
    triggerEdit: "/trigger/:id/edit",
    triggerAdd: "/trigger/new",
    settings: "/settings",
    metricStats: "/stats/metrics",
    notifications: "/notifications",
    patterns: "/patterns",
    tags: "/tags",
    silent_patterns: "/silent-patterns",
    silent_tags: "/silent-tags",
    subscriptionSearch: "/subscription-search",
};

export const PagesLinks = {
    docs: "//moira.readthedocs.org/",
    index: "/",
    trigger: "/trigger/%id%",
    triggerEdit: "/trigger/%id%/edit",
    triggerAdd: "/trigger/new",
    settings: "/settings",
    metricStats: "/stats/metrics",
    notifications: "/notifications",
    patterns: "/patterns",
    tags: "/tags",
    silent_patterns: "/silent-patterns",
    silent_tags: "/silent-tags",
    subscriptionSearch: "/subscription-search",
};

export type PagePath = $Keys<typeof PagesPaths>;

export type PageLink = $Keys<typeof PagesLinks>;

export function getPagePath(page: PagePath): string {
    return PagesPaths[page];
}

export function getPageLink(page: PageLink, id?: string): string {
    return id ? PagesLinks[page].replace("%id%", id) : PagesLinks[page];
}
