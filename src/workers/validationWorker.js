import { tdValidator, tmValidator } from "../external/TdPlayground";
import { isThingModel } from "../util";

// eslint-disable-next-line no-restricted-globals
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
