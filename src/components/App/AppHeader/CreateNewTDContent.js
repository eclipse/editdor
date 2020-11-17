/********************************************************************************
 * Copyright (c) 2018 - 2020 Contributors to the Eclipse Foundation
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

export function RequestTdMetadata() {
    return `${formField("ID", "urn:thing-id", "thing-id", "url")}
            ${formField("Title", "Thing Title", "thing-title", "text")}
            ${formField("Base", "http://www.example.com/thing-path", "thing-base", "url")}`;
};

export function RequestTdDescription() {
    return `<textarea rows="5"
    class="bg-gray-200 
    appearance-none 
    border-2 border-gray-200 rounded w-full 
    py-2 px-4 
    text-gray-700 
    leading-tight 
    focus:outline-none 
    focus:bg-white 
    focus:border-blue-500" 
    id="thing-description" 
    placeholder="A short description of what the Thing does...">`;
};

export function RequestTdSecurity() {
    return `
    <div class="relative">
        <select class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="thing-security">
            <option>nosec</option>
            <option>basic</option>
            <option>digest</option>
            <option>bearer</option>
            <option>psk</option>
            <option>oauth2</option>
            <option>apikey</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
  </div>`;
};

const formField = (label, placeholder, id, type) => {
    return `<div class="md:flex md:items-center mb-6">
    <div class="md:w-1/6">
        <label class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" for="${id}">
            ${label}
        </label>
    </div>
    <div class="md:w-5/6">
        <input class="bg-gray-200 
        appearance-none 
        border-2 border-gray-200 rounded w-full 
        py-2 px-4 
        text-gray-700 
        leading-tight 
        focus:outline-none 
        focus:bg-white 
        focus:border-blue-500" 
        id="${id}" 
        placeholder="${placeholder}"
        type="${type}">
    </div>
</div>`
}