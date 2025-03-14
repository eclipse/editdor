import {
  extractSchemaUrisFromContext,
  extractSchemaUriFromBase,
  fetchSchemas,
  updateSchemaCache,
} from "./workerFunctions";

import { isThingModel } from "../util";

// If the JSON sent to the worker is faulty it returns the last valid schema map.
let lastSentSchemaMap = new Map();

const tdSchema =
  "https://raw.githubusercontent.com/thingweb/thingweb-playground/%40thing-description-playground/web%401.0.0/packages/playground-core/td-schema.json";
const tmSchema =
  "https://raw.githubusercontent.com/w3c/wot-thing-description/main/validation/tm-json-schema-validation.json";

// eslint-disable-next-line no-restricted-globals
self.onmessage = async (message) => {
  // Check that prevents messages sent from webpack and react scripts to be executed.
  // Not sure why this is happening at the moment. This is only a "quick" fix.
  if (!(typeof message.data === "string" || message.data instanceof String)) {
    return;
  }

  let td = {};
  try {
    td = JSON.parse(message.data);
  } catch (e) {
    console.debug(`ran into error while parsing TD: ${e}`);
    postMessage(lastSentSchemaMap);
    return;
  }

  if (typeof td !== "object" || td.constructor === Array || !td) {
    return;
  }

  let basicSchema = !isThingModel(td) ? tdSchema : tmSchema;
  let contextSchemaUris = extractSchemaUrisFromContext(td["@context"]);
  let baseSchemaUris = extractSchemaUriFromBase(td);

  let newSchemas = [basicSchema, ...contextSchemaUris, ...baseSchemaUris];
  if (isThingModel) {
    newSchemas = newSchemas.filter(
      (schema) => schema !== "https://www.w3.org/2019/wot/td/v1"
    );
  }

  let schemaMap = await fetchSchemas(newSchemas);
  updateSchemaCache(schemaMap);

  lastSentSchemaMap = schemaMap;
  postMessage(schemaMap);
  console.debug("schema worker sent response...");
};
