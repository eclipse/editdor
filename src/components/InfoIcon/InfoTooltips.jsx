/********************************************************************************
 * Copyright (c) 2018 - 2021 Contributors to the Eclipse Foundation
 * 
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 * 
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 * 
 * SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 ********************************************************************************/

class TooltipContent {
    constructor(html, href) {
        this.html = html;
        this.href = href;
    }
}

export const getPropertiesTooltipContent = () => {
    const html = `<h2 class='text-lg'>Web of Things Properties</h2>
                    <p>A Property is a simple attribute of a device. The value of a Property can be readable.</p>
                    <p>writable or observable. E.g. a Property for a lamp could indicate if it is on or off.</p>
                    <br />
                    <p>Click to get more information about Properties.</p> 
                `
    const href = "https://www.w3.org/TR/wot-thing-description/#propertyaffordance";
    return new TooltipContent(html, href);
}

export const getActionsTooltipContent = () => {
    const html = `<h2 class='text-lg'>Web of Things Actions</h2>
                    <p>An Action is some kind of procedure that can be triggered on a device. An Action can</p>
                    <p>be started or cancelled. E.g. an Action for a lamp could be turning it on or off.</p>
                    <br />
                    <p>Click to get more information about Actions.</p>
                `
    const href = "https://www.w3.org/TR/wot-thing-description/#actionaffordance";
    return new TooltipContent(html, href);
}

export const getEventsTooltipContent = () => {
    const html = `<h2 class='text-lg'>Web of Things Events</h2>
                <p>An Event is an asynchronously happening information flow. An Event is observable.</p>
                <p>E.g. an Event for a lamp could fire if it gets turned on or off.</p>
                <br />
                <p>Click to get more information about Events.</p>
            `

    const href = "https://www.w3.org/TR/wot-thing-description/#eventaffordance";
    return new TooltipContent(html, href);
}

export const getFormsTooltipContent = () => {
    const html = `<h2 class='text-lg'>Web of Things Forms</h2>
                    <p>A Form contains all information needed to make a request to a device.</p>
                    <p>It can accompany a Property, Action, Event or a Thing itself.</p>
                    <br />
                    <p>Click to get more information about Forms.</p>
                `
    const href = "https://www.w3.org/TR/wot-thing-description/#form";

    return new TooltipContent(html, href);
}

export const getLinksTooltipContent = () => {
    const html = `<h2 class='text-lg'>Web of Things Link</h2>
                    <p>A link can be viewed as a statement of the form link context has a relation type resource at link target</p>
                    <p>Used to link Thing Description with other ressources.</p>
                    <br />
                    <p>Click to get more information about Links.</p>
                `
    const href = "https://www.w3.org/TR/wot-thing-description/#link";

    return new TooltipContent(html, href);
}

export const tooltipMapper = {
    "properties": getPropertiesTooltipContent(),
    "actions": getActionsTooltipContent(),
    "events": getEventsTooltipContent(),
    "forms": getFormsTooltipContent(),
    "links": getLinksTooltipContent(),
};