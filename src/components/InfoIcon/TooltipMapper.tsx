/********************************************************************************
 * Copyright (c) 2025 Contributors to the Eclipse Foundation
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
  html: string;
  href: string;

  constructor(html: string, href: string) {
    this.html = html;
    this.href = href;
  }
}

type TooltipFunction = () => TooltipContent;

export const getPropertiesTooltipContent: TooltipFunction = () => {
  const html = `<h2 class='text-lg'>Web of Things Properties</h2>
                    <p>A Property is a simple attribute of a device. The value of a Property can be readable.</p>
                    <p>writable or observable. E.g. a Property for a lamp could indicate if it is on or off.</p>
                    <br />
                    <p>Click to get more information about Properties.</p> 
                `;
  const href =
    "https://www.w3.org/TR/wot-thing-description/#propertyaffordance";
  return new TooltipContent(html, href);
};

export const getActionsTooltipContent: TooltipFunction = () => {
  const html = `<h2 class='text-lg'>Web of Things Actions</h2>
                    <p>An Action is some kind of procedure that can be triggered on a device. An Action can</p>
                    <p>be started or cancelled. E.g. an Action for a lamp could be turning it on or off.</p>
                    <br />
                    <p>Click to get more information about Actions.</p>
                `;
  const href = "https://www.w3.org/TR/wot-thing-description/#actionaffordance";
  return new TooltipContent(html, href);
};

export const getEventsTooltipContent: TooltipFunction = () => {
  const html = `<h2 class='text-lg'>Web of Things Events</h2>
                <p>An Event is an asynchronously happening information flow. An Event is observable.</p>
                <p>E.g. an Event for a lamp could fire if it gets turned on or off.</p>
                <br />
                <p>Click to get more information about Events.</p>
            `;

  const href = "https://www.w3.org/TR/wot-thing-description/#eventaffordance";
  return new TooltipContent(html, href);
};

export const getFormsTooltipContent: TooltipFunction = () => {
  const html = `<h2 class='text-lg'>Web of Things Forms</h2>
                    <p>A Form contains all information needed to make a request to a device.</p>
                    <p>It can accompany a Property, Action, Event or a Thing itself.</p>
                    <br />
                    <p>Click to get more information about Forms.</p>
                `;
  const href = "https://www.w3.org/TR/wot-thing-description/#form";

  return new TooltipContent(html, href);
};

export const getLinksTooltipContent: TooltipFunction = () => {
  const html = `<h2 class='text-lg'>Web of Things Link</h2>
                    <p>A link can be viewed as a statement of the form link context has a relation type resource at link target</p>
                    <p>Used to link Thing Description with other ressources.</p>
                    <br />
                    <p>Click to get more information about Links.</p>
                `;
  const href = "https://www.w3.org/TR/wot-thing-description/#link";

  return new TooltipContent(html, href);
};

export const getUniIdTooltipContent: TooltipFunction = () => {
  const html = `<h2 class='text-lg'>Unit ID</h2>
                    <p>Slave address of the Modbus device.</p>
                    <br />
                    <p></p>
                `;
  const href =
    "https://w3c.github.io/wot-binding-templates/bindings/protocols/modbus/#url-terms";

  return new TooltipContent(html, href);
};

export const getAddressOffsetTooltipContent: TooltipFunction = () => {
  const html = `<h2 class='text-lg'>Address Offset</h2>
                    <p>Should all addresses shift by one (false) or not (true)</p>
                    <br />
                    <p></p>
                `;
  const href =
    "https://w3c.github.io/wot-binding-templates/bindings/protocols/modbus/#form-terms";

  return new TooltipContent(html, href);
};

export const getEndiannessTooltipContent: TooltipFunction = () => {
  const html = `<h2 class='text-lg'>Endianness</h2>
                    <p>Should the words or the bytes be swapped?</p>
                    <br />
                    <p></p>
                `;
  const href =
    "https://w3c.github.io/wot-binding-templates/bindings/protocols/modbus/#form-terms";

  return new TooltipContent(html, href);
};

export const getValidateTMContent: TooltipFunction = () => {
  const html = `<h2 class='text-lg'>Validate</h2>
                    <p>Validate the Thing Description against the WoT TD Schema.</p>
                   
                    <p>Click to get more information about the schema.</p>
                `;
  const href =
    "https://github.com/wot-oss/tmc/blob/main/internal/commands/validate/tmc-mandatory.schema.json";

  return new TooltipContent(html, href);
};

interface ITooltipMapper {
  properties: TooltipContent;
  actions: TooltipContent;
  events: TooltipContent;
  forms: TooltipContent;
  links: TooltipContent;
  unitId: TooltipContent;
  addressOffset: TooltipContent;
  endianness: TooltipContent;
  validateTM: TooltipContent;
}

export const tooltipMapper: ITooltipMapper = {
  properties: getPropertiesTooltipContent(),
  actions: getActionsTooltipContent(),
  events: getEventsTooltipContent(),
  forms: getFormsTooltipContent(),
  links: getLinksTooltipContent(),
  unitId: getUniIdTooltipContent(),
  addressOffset: getAddressOffsetTooltipContent(),
  endianness: getEndiannessTooltipContent(),
  validateTM: getValidateTMContent(),
};
