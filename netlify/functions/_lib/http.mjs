const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

export function response(statusCode, body, headers = {}) {
  return { statusCode, headers: { ...jsonHeaders, ...headers }, body: JSON.stringify(body) };
}

export function method(event, expected) {
  if (event.httpMethod !== expected) throw Object.assign(new Error("method_not_allowed"), { statusCode: 405 });
}

export function parseJson(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    throw Object.assign(new Error("invalid_json"), { statusCode: 400 });
  }
}

export function requireSameOrigin(event) {
  const origin = event.headers?.origin;
  const configured = process.env.STATECOURSE_BASE_URL;
  if (!configured) throw Object.assign(new Error("base_url_not_configured"), { statusCode: 503 });
  if (!origin || new URL(origin).origin !== new URL(configured).origin) {
    throw Object.assign(new Error("origin_not_allowed"), { statusCode: 403 });
  }
}

export function handleError(error) {
  const status = Number(error?.statusCode) || 500;
  const publicMessage = status >= 500 ? "payment_service_unavailable" : error.message;
  if (status >= 500) console.error("Payment endpoint error", error?.message);
  return response(status, { error: publicMessage });
}
