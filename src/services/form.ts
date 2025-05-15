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
import { Core, Http } from "@node-wot/browser-bundle";

const servient = new Core.Servient();
servient.addClientFactory(new Http.HttpClientFactory());
console.log("init servient");

const formConfigurations: Record<string, IFormConfigurations> = {
  readproperty: {
    color: "Green",
    title: "Read",
    level: "properties",
    callback: readProperty,
  },
  writeproperty: {
    color: "Blue",
    title: "Write",
    level: "properties",
    callback: writeProperty,
  },
  observeproperty: {
    color: "Orange",
    title: "Observe",
    level: "properties",
    callback: null,
  },
  unobserveproperty: {
    color: "Red",
    title: "Unobserve",
    level: "properties",
    callback: null,
  },
  invokeaction: {
    color: "Orange",
    title: "Invoke",
    level: "actions",
    callback: null,
  },
  subscribeevent: {
    color: "Orange",
    title: "Subscribe",
    level: "events",
    callback: null,
  },
  unsubscribeevent: {
    color: "Red",
    title: "Unsubscribe",
    level: "events",
    callback: null,
  },
  readmultipleproperties: {
    color: "Green",
    title: "Read Multiple",
    level: "thing",
    callback: null,
  },
  readallproperties: {
    color: "Green",
    title: "Read All",
    level: "thing",
    callback: null,
  },
  writemultipleproperties: {
    color: "Blue",
    title: "Write Multiple",
    level: "thing",
    callback: null,
  },
  writeallproperties: {
    color: "Blue",
    title: "Write All",
    level: "thing",
    callback: null,
  },
  observeallproperties: {
    color: "Orange",
    title: "Observe All",
    level: "thing",
    callback: null,
  },
  unobserveallproperties: {
    color: "Red",
    title: "Unobserve All",
    level: "thing",
    callback: null,
  },
};

function stripDoubleQuotes(str: string): string {
  return str.replace(/^"|"$/g, "");
}

/**
 * Description of the function
 * @name InteractionFunction
 * @function
 * @param {Object} td The actual Thing Description
 * @param {String} propertyName The name of the Property
 * @param {any} content What should be written in case of e.g. a writeproperty call
 */
const parseContent = (propertyType: string, content: string): any => {
  try {
    switch (propertyType) {
      case "boolean":
        return stripDoubleQuotes(content).toLowerCase() === "true";

      case "integer":
        const intVal = parseInt(stripDoubleQuotes(content), 10);
        if (isNaN(intVal)) {
          throw new Error(`Error on convert "${content}" to an integer.`);
        }
        return intVal;

      case "number":
        const numVal = parseFloat(stripDoubleQuotes(content));
        if (isNaN(numVal)) {
          throw new Error(`Error on convert "${content}" to a number.`);
        }
        return numVal;

      case "string":
        return stripDoubleQuotes(content);

      case "array":
        let temp = stripDoubleQuotes(content);
        if (Array.isArray(temp)) {
          return temp;
        }

        try {
          const parsedArray = JSON.parse(temp);
          if (Array.isArray(parsedArray)) {
            return parsedArray;
          }
        } catch {
          throw new Error(`Error on convert "${content}" to an array.`);
        }

      case "object":
        try {
          return JSON.parse(stripDoubleQuotes(content));
        } catch {
          throw new Error(`Error on convert "${content}" to an object.`);
        }

      default:
        throw new Error(`Unsupported type: "${propertyType}".`);
    }
  } catch (e) {
    console.error(`Failed to parse content for ${propertyType}:`, e);
  }
};

/** @type {InteractionFunction} */
async function readProperty(
  td: IThingDescription,
  propertyName: string,
  _
): Promise<{ result: string; err: Error | null }> {
  try {
    const thingFactory = await servient.start();
    const thing = await thingFactory.consume(td);

    const res = await thing.readProperty(propertyName);
    // always return the result even if the data schema doesn't fit
    res.ignoreValidation = true;
    const val = await res.value();

    return { result: JSON.stringify(val, null, 2), err: null };
  } catch (e) {
    console.debug(e);
    return { result: "", err: e };
  }
}

async function writeProperty(
  td: IThingDescription,
  propertyName: string,
  content: string
): Promise<{ result: string; err: Error | null }> {
  try {
    const propertyType = td.properties[propertyName].type;
    const contentConverted = parseContent(propertyType, content);

    const thingFactory = await servient.start();
    const thing = await thingFactory.consume(td);

    // no return value - only exception on error
    await thing.writeProperty(propertyName, contentConverted);

    return {
      result: `Successfully wrote ${
        JSON.stringify(contentConverted).length > 50
          ? JSON.stringify(contentConverted).slice(0, 50) + "..."
          : JSON.stringify(contentConverted)
      } to '${propertyName}'.`,
      err: null,
    };
  } catch (e) {
    console.debug(e);
    return { result: "", err: e as Error };
  }
}

export { formConfigurations, readProperty, writeProperty };
