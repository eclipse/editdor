/********************************************************************************
 * Copyright (c) 2018 Contributors to the Eclipse Foundation
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
import { tdValidator, tmValidator } from "../external/TdPlayground";
import { isThingModel } from "../util";

self.onmessage = async (message) => {
  console.debug("validation worker received message...");
  let tdStr = message.data;

  let td = {};
  try {
    td = JSON.parse(message.data);
  } catch (e) {
    console.debug(`ran into error while parsing TD: ${e}`);
    postMessage(undefined);
  }

  try {
    let result = undefined;
    if (td && isThingModel(td)) {
      result = await tmValidator(tdStr, console.debug, {});
    } else {
      result = await tdValidator(tdStr, console.debug, {});
    }
    postMessage(result);
  } catch (e) {
    postMessage(undefined);
    console.debug(e);
  }

  console.debug("validation worker sent response...");
};
