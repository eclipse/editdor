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

export { getTargetUrl, setTargetUrl };
