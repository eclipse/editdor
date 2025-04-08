interface ThingDescription {
  id: string;
  [key: string]: any;
}

/**
 *
 * @param {Object} td
 * @returns
 */
const createThing = async (
  td: ThingDescription,
  targetUrl: string
): Promise<number> => {
  const encodedId = encodeURIComponent(td.id);

  const res = await fetch(`${targetUrl}things/${encodedId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(td),
  });

  if (res.status === 400 || res.status === 500) {
    const payload = await res.json();
    throw Error(payload.error);
  }

  return res.status;
};

/**
 *
 * @param {Object} td
 * @param {string} targetUrl
 * @returns
 */
const createAnonymousThing = async (
  td: ThingDescription,
  targetUrl: string
): Promise<number> => {
  const res = await fetch(`${targetUrl}things`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(td),
  });

  if (res.status === 400 || res.status === 500) {
    const payload = await res.json();
    throw Error(payload.error);
  }

  return res.status;
};

/**
 *
 * @param {string} id
 * @param {string} targetUrl
 * @returns
 */
const retrieveThing = async (id: string, targetUrl: string): Promise<any> => {
  const encodedId = encodeURIComponent(id);

  const res = await fetch(`${targetUrl}things/${encodedId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const payload = await res.json();

  if (res.status === 404 || res.status === 500) {
    throw Error(payload.error);
  }

  return payload;
};

export { createThing, createAnonymousThing, retrieveThing };
