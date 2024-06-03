/********************************************************************************
 * Copyright (c) 2018 - 2024 Contributors to the Eclipse Foundation
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
import { compress, decompress } from "./external/TdPlayground"
import { isThingModel } from "./util"

const tdPrefix = "tdjson";
const tmPrefix = "tmjson";

/**
 * 
 * @param {string} td 
 * @returns {string | undefined}
 * 
 * @description
 * prepareTdForSharing takes a TD/TM string and tries to compress
 * it for sharing. If the string is no valid JSON, this function will
 * return undefined.
 */
export const prepareTdForSharing = (td) => {
    let tdJSON;
    try {
        tdJSON = JSON.parse(td);
    } catch (e) {
        console.debug(e);
        return undefined
    }

    let prefix = tdPrefix;
    if (isThingModel(tdJSON)) {
        prefix = tmPrefix;
    }

    const compressedTD = compress(prefix.concat(td));
    return compressedTD;
}

/**
 * 
 * @param {string} lzString 
 * @returns {object | undefined}
 * 
 * @description
 * decompressSharedTd takes a lz string as input, then tries
 * to decompress and parse it as a TD/TM, which it returns. 
 * If any of these operations fail, this function returns undefined.
 */
export const decompressSharedTd = (lzString) => {
    let decompressedTd = decompress(lzString);
    if (decompressedTd == null || decompressedTd === "") {
        return undefined;
    };

    decompressedTd = decompressedTd.substring(6);
    try {
        return JSON.parse(decompressedTd);
    } catch (e) {
        console.debug(e);
    }

    return undefined;
}