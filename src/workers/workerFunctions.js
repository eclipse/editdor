// Caches the fetched schemas and is used for future requests to the same schema address.
let schemaCache = new Map();

export { extractSchemaUrisFromContext, extractSchemaUriFromBase, isThingModel, fetchSchemas, updateSchemaCache }

/**
* Extracts the schemas from a WoT context.
* Example that can be parsed by this function:
* 1:
*      "http://www.example.com"
* 2:
*      [
*           "http://www.example1.com",
*           "http://www.example2.com",
*           "http://www.example3.com",
*           {
*               "a": "http://www.exampleA.com",
*               "b": "http://www.exampleB.com",
*           },
*           {
*               "c": "http://www.exampleA.com"
*           }
*      ]
* 
* Any part of the second example object can be removed and the function will still
* be able to parse it. Also any elements that are not in the format stated above
* will be ignored. This function is following the WoT @context definition.
* @param {String | Array<String>} context 
* @returns {Array<String>}
*/
function extractSchemaUrisFromContext(context) {
    if (!context) {
        return [];
    }

    let contextType = typeof context;
    if (contextType !== "string" && context.constructor !== Array) {
        return [];
    }

    if (contextType === "string") {
        return [context];
    }

    // context is an array
    let schemaUris = [];
    for (let i = 0; i < context.length; i++) {
        let schema = context[i];

        // schema is neither an object nor a string
        if (!(typeof schema === 'object' && !Array.isArray(schema) && schema !== null) && typeof schema !== "string") {
            continue;
        }

        if (typeof schema === "string") {
            schemaUris.push(schema);
            continue;
        }

        // schema is object
        for (const ontologyName in schema) {
            if (!schema.hasOwnProperty(ontologyName)) {
                continue;
            }

            let schemaUri = schema[ontologyName];
            if (typeof schemaUri !== "string") {
                continue;
            }

            schemaUris.push(schemaUri);
        }
    }

    return schemaUris;
}

/**
 * @param {Object} td
 * @returns {boolean}
 */
function isThingModel(td) {
    if (!td.hasOwnProperty("@type")) {
        return false;
    }

    return td["@type"].indexOf("ThingModel") > -1;
}

/**
* Parses the base attribute of a TD/TM, retrieves the protocol used and returns
* a link to the according json schema document if known.
* @param {Object} td
* @returns {Array<String>}
*/
function extractSchemaUriFromBase(td) {
    if (!td.hasOwnProperty("base")) {
        return [];
    }

    let base = td["base"];
    let parsedBaseUrl;

    try {
        parsedBaseUrl = new URL(base);
    } catch (e) {
        console.error(`base url is invalid: ${e}`);
        return [];
    }

    const bindingSchemaUriMap = new Map();
    bindingSchemaUriMap.set("modbus", "https://w3c.github.io/wot-binding-templates/bindings/protocols/modbus/modbus.schema.json");

    let schema = parsedBaseUrl.protocol.substring(0, parsedBaseUrl.protocol.length - 1);
    console.debug(`cheking binding schema map for ${schema}...`);
    let schemaUri = bindingSchemaUriMap.get(schema);

    return !schemaUri ? [] : [schemaUri];
}

/**
 * Fetch schemas checks if a certain schema was already fetched and tries to retrieve it 
 * from an in memory cache. If the cache has no entry for a schema it will be fetched.
 * @param {Array<String>} schemaUris 
 * @returns {Map<String, Object>} A map that maps from schema URI to a JSON schema obejct or undefined 
 * if an error occured while fetching.
 */
async function fetchSchemas(schemaUris) {
    let schemaMap = new Map();

    for (let i = 0; i < schemaUris.length; i++) {
        let schemaUriStr = schemaUris[i];

        // check if schema is already in cache
        let cachedSchema = schemaCache.get(schemaUriStr);
        if (cachedSchema !== undefined) {
            console.debug(`using cached schema for ${schemaUriStr}`);
            schemaMap.set(schemaUriStr, cachedSchema);
            continue;
        }

        // fetch schema from external resource
        try {
            const schemaUri = new URL(schemaUriStr);
            const res = await fetch(schemaUri);
            const schema = await res.json();

            schemaMap.set(schemaUriStr, schema);
        } catch (e) {
            console.error(e);
            schemaMap.set(schemaUriStr, undefined);
        }
    }

    return schemaMap;
}

/**
 * Updates the schema cache with a schema map.
 * @param {Map<String, Object>} schemaMap 
 */
function updateSchemaCache(schemaMap) {
    schemaMap.forEach(function (schema, schemaUri) {
        if (schema !== undefined) {
            schemaCache.set(schemaUri, schema);
        }
    });
}