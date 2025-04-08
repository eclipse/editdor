const TARGET_URL_KEY: string = "target-url";

/**

 * Returns the target url stored in local storage or an empty string if nothing
 * is stored.
 * @returns string
 */
const getTargetUrl = (): string => {
  const targetUrl = localStorage.getItem(TARGET_URL_KEY);
  if (targetUrl === null) {
    return "";
  }

  return targetUrl;
};

/**
 * Sets a new target url by persisting it via the local storage API.
 * @param {string} targetUrl
 * @returns
 */
const setTargetUrl = (targetUrl: string): void => {
  if (targetUrl != "" && !targetUrl.endsWith("/")) {
    targetUrl = targetUrl + "/";
  }
  localStorage.setItem(TARGET_URL_KEY, targetUrl);
};

/**
 * @description
 * Initializes the target url if not already done.
 *
 * If a REACT_APP_TARGET_URL is provided through an ENV variable, it is assumed
 * that the UI is hosted as a standalone application. If not, it is assumed
 * that it runs as part of another application, e.g. an intermediary or thing
 * directory. In this case, the target url is initialized according to the host
 * address the UI is running on.
 *
 * To start the UI without a target url and configure it to simply use file
 * handles for persisting, provide an empty "REACT_APP_TARGET_URL=" environment
 * variable.
 *
 * @returns void
 */
const initializeTargetUrl = (): void => {
  let targetUrl: string | null = localStorage.getItem(TARGET_URL_KEY);
  if (targetUrl !== null) {
    console.debug(
      `didn't initialize target url - already initialized as '${targetUrl}'`
    );
    return;
  }

  if (
    process.env.REACT_APP_TARGET_URL !== undefined ||
    process.env.REACT_APP_TARGET_URL !== null
  ) {
    targetUrl = process.env.REACT_APP_TARGET_URL ?? null;
    if (!targetUrl?.endsWith("/")) {
      targetUrl = targetUrl + "/";
    }

    localStorage.setItem(TARGET_URL_KEY, targetUrl);
    console.debug(
      `initialized target url from environment variable as '${targetUrl}'`
    );
    return;
  }
  const windowURL = new URL(window.location.href);
  const path = windowURL.pathname;
  windowURL.pathname = path.slice(0, path.indexOf("/."));
  windowURL.pathname =
    windowURL.pathname === "/" ? windowURL.pathname : windowURL.pathname + "/";
  targetUrl = `${windowURL.protocol}//${windowURL.host}${windowURL.pathname}`;

  localStorage.setItem(TARGET_URL_KEY, targetUrl);
  console.debug(
    `initialized target url from production host as '${targetUrl}'`
  );
};

export { getTargetUrl, setTargetUrl, initializeTargetUrl };
