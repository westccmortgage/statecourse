import { timingSafeEqual } from "node:crypto";

const specs = [
  { key: "ai_pro_monthly", productKey: "ai_pro", productName: "StateCourse AI Pro", amount: 3900, interval: "month" },
  { key: "ai_pro_annual", productKey: "ai_pro", productName: "StateCourse AI Pro", amount: 39000, interval: "year" },
  { key: "ai_provider_monthly", productKey: "ai_provider", productName: "StateCourse AI Provider", amount: 49900, interval: "month" },
  { key: "ai_provider_annual", productKey: "ai_provider", productName: "StateCourse AI Provider", amount: 499000, interval: "year" },
  { key: "ai_founding_provider_monthly", productKey: "ai_founding_provider", productName: "StateCourse AI Founding Provider", amount: 29900, interval: "month", seatLimit: 10 },
];

function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json", "cache-control": "no-store" }, body: JSON.stringify(body) };
}

function authorized(event) {
  const expected = String(process.env.STATECOURSE_AI_PROVISION_KEY || "");
  const actual = String(event.headers?.["x-statecourse-provision-key"] || "");
  if (!expected || !actual) return false;
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function stripe(path, { method = "GET", params, idempotencyKey } = {}) {
  const key = String(process.env.STRIPE_SECRET_KEY_LIVE || "");
  if (!key) throw new Error("stripe_live_key_unavailable");
  const headers = { authorization: `Bearer ${key}` };
  let body;
  if (params) {
    body = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) body.append(name, String(value));
    }
    headers["content-type"] = "application/x-www-form-urlencoded";
  }
  if (idempotencyKey) headers["idempotency-key"] = idempotencyKey;
  const response = await fetch(`https://api.stripe.com/v1${path}`, { method, headers, body });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "stripe_request_failed");
  return data;
}

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return json(405, { error: "method_not_allowed" });
    if (String(event.headers?.host || "").toLowerCase() !== "statecourse.com") return json(403, { error: "production_host_only" });
    if (!authorized(event)) return json(403, { error: "forbidden" });

    const listedProducts = await stripe("/products?active=true&limit=100");
    const products = new Map();
    for (const spec of specs) {
      if (products.has(spec.productKey)) continue;
      let product = listedProducts.data.find((item) => item.metadata?.statecourse_catalog_key === spec.productKey);
      if (!product) {
        product = await stripe("/products", {
          method: "POST",
          idempotencyKey: `statecourse-${spec.productKey}-live-v1`,
          params: {
            name: spec.productName,
            description: spec.productKey === "ai_founding_provider"
              ? "StateCourse AI Founding Provider — limited to the first 10 eligible customers."
              : "StateCourse AI subscription.",
            "metadata[statecourse_catalog_key]": spec.productKey,
            "metadata[product_type]": "ai_subscription",
            "metadata[founding_seat_limit]": spec.seatLimit || "",
          },
        });
      }
      products.set(spec.productKey, product);
    }

    const inventory = [];
    for (const spec of specs) {
      const lookupKey = `statecourse_${spec.key}`;
      const existing = await stripe(`/prices?active=true&limit=10&lookup_keys[]=${encodeURIComponent(lookupKey)}`);
      let price = existing.data.find((item) =>
        item.product === products.get(spec.productKey).id &&
        item.unit_amount === spec.amount &&
        item.currency === "usd" &&
        item.recurring?.interval === spec.interval
      );
      if (!price) {
        price = await stripe("/prices", {
          method: "POST",
          idempotencyKey: `statecourse-${spec.key}-live-v1`,
          params: {
            product: products.get(spec.productKey).id,
            currency: "usd",
            unit_amount: spec.amount,
            "recurring[interval]": spec.interval,
            lookup_key: lookupKey,
            nickname: spec.key,
            "metadata[statecourse_plan_key]": spec.key,
            "metadata[founding_seat_limit]": spec.seatLimit || "",
          },
        });
      }
      inventory.push({
        plan: spec.key,
        product_id: products.get(spec.productKey).id,
        price_id: price.id,
        amount_cents: price.unit_amount,
        interval: price.recurring?.interval,
        livemode: price.livemode,
      });
    }
    if (inventory.some((item) => item.livemode !== true)) throw new Error("stripe_returned_non_live_catalog");
    return json(200, { mode: "live", inventory });
  } catch (error) {
    return json(500, { error: "catalog_provision_failed", category: error.message });
  }
};
