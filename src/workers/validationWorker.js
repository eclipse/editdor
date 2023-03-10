import { tdValidator } from "../external/TdPlayground.js";

// eslint-disable-next-line no-restricted-globals
self.onmessage = async (message) => {
    console.debug("validation worker received message...");
    let tdStr = message.data;

    try {
        let result = await tdValidator(tdStr, console.debug, {});
        postMessage(result);
    } catch (e) {
        postMessage(undefined);
        console.debug(e);
    }

    console.debug("validation worker sent response...");
};
