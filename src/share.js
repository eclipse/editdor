import { compress, decompress } from "./external/TdPlayground";
import * as wotTdService from "./services/thingsApiService";
import { getTargetUrl } from "./services/targetUrl";
import { isThingModel } from "./util";

const tdPrefix = "tdjson";
const tmPrefix = "tmjson";

/**
 *
 * @param {string} td
 * @returns {string | undefined}
 * @description
 * prepareTdForSharing takes a TD/TM string and tries to compress
 * it for sharing.
 */
export const prepareTdForSharing = (td) => {
  let tdJSON;
  try {
    tdJSON = JSON.parse(td);
  } catch (e) {
    console.debug(e);
    return undefined;
  }

  let prefix = tdPrefix;
  if (isThingModel(tdJSON)) {
    prefix = tmPrefix;
  }

  const compressedTD = compress(prefix.concat(td));
  return compressedTD;
};

/**
 *
 * @param {string} lzString
 * @returns {object | undefined}
 * @description DecompressSharedTd takes a lz string as input, then tries
 * to decompress and parse it as a TD/TM, which it returns.
 * If any of these operations fail, this function returns undefined.
 */
export const decompressSharedTd = (lzString) => {
  let decompressedTd = decompress(lzString);
  if (decompressedTd == null || decompressedTd === "") {
    return undefined;
  }

  decompressedTd = decompressedTd.substring(6);
  try {
    return JSON.parse(decompressedTd);
  } catch (e) {
    console.debug(e);
  }

  return undefined;
};

/**
 *
 * @param {string} tdId
 * @returns {Object | undefined}
 * @description Contacts the  proxy WoT native API to fetch a Thing Description.
 */
export const fetchTdFromProxy = async (tdId) => {
  const targetUrl = getTargetUrl();

  try {
    let td = await wotTdService.getTD(tdId, targetUrl);

    return td;
  } catch (error) {
    console.debug(error);
  }

  return undefined;
};
