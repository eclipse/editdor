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
/**
 * 
 * @param {*} firstAttribute 
 * @param {*} object 
 * @param {*} dontRender is a list of keys that shouldn't be packed into the attribute list.
 * 
 * @description
 * Parses all key-value pairs of an object into an object'. 
 */
export const buildAttributeListObject = (firstAttribute, object, dontRender) => {
    let attributeListObject = {...firstAttribute}
    
    for (const [key, value] of Object.entries(object)) {
        if (!dontRender.includes(key)) {
            attributeListObject[key] = value
        }
    }

    return attributeListObject;
}

/**
 * 
 * @param {*} forms 
 * 
 * @description
 * Converts Forms that have an array as the "op" value into multiple separate Forms 
 * which only have a string as "op" value.
 */
export const separateForms = (forms) => {
    if (forms === undefined && !forms) {
        return []
    }

    const newForms = [];

    for (let i = 0; i < forms.length; i++) {
        const form = forms[i];

        if (!Array.isArray(form.op)) {
            newForms.push(form);
            continue;
        }

        for (let i = 0; i < form.op.length; i++) {
            const temp = { ...form };
            temp.op = form.op[i];
            newForms.push(temp);
        }
    }

    return newForms;
}