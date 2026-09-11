function credentials() {
  /* trim() guards against invisible whitespace (a trailing newline from a copy-paste into the
     Netlify UI makes the value an invalid HTTP header and fetch throws before any request). */
  const url = String(process.env.SUPABASE_URL || "").trim();
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) throw Object.assign(new Error("database_not_configured"), { statusCode: 503 });
  return { url: url.replace(/\/$/, ""), key };
}

export async function dbRequest(path, { method = "GET", body, prefer } = {}) {
  const { url, key } = credentials();
  const headers = {
    apikey: key,
    // New Supabase secret keys are not JWTs. Preserve legacy service-role keys.
    ...(key.startsWith("sb_") ? {} : { authorization: `Bearer ${key}` }),
    "content-type": "application/json",
  };
  if (prefer) headers.prefer = prefer;
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const error = new Error(data?.message || data?.hint || "database_request_failed");
    error.statusCode = 503;
    throw error;
  }
  return data;
}

export function rpc(name, args = {}) {
  return dbRequest(`rpc/${name}`, { method: "POST", body: args });
}
