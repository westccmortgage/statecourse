export const AI_PLANS = Object.freeze({
  ai_pro_monthly: Object.freeze({ key:"ai_pro_monthly", tier:"pro", name:"StateCourse AI Pro", amount:3900, interval:"month", prices:{ test:"price_1UJxHeI5Vlt1VlIgCxsqXwhX", live:"price_1UJxZlI81wKbKburfCPbSSfo" } }),
  ai_pro_annual: Object.freeze({ key:"ai_pro_annual", tier:"pro", name:"StateCourse AI Pro", amount:39000, interval:"year", prices:{ test:"price_1UJxHfI5Vlt1VlIg1ZsDVsgr", live:"price_1UJxZmI81wKbKbureVKyBZGi" } }),
  ai_provider_monthly: Object.freeze({ key:"ai_provider_monthly", tier:"provider", name:"StateCourse AI Provider", amount:49900, interval:"month", prices:{ test:"price_1UJxHfI5Vlt1VlIgP9EKAaDJ", live:"price_1UJxZmI81wKbKburSHhSkOCB" } }),
  ai_provider_annual: Object.freeze({ key:"ai_provider_annual", tier:"provider", name:"StateCourse AI Provider", amount:499000, interval:"year", prices:{ test:"price_1UJxHfI5Vlt1VlIgQ21CFzdO", live:"price_1UJxZmI81wKbKburnXusQlE9" } }),
  ai_founding_provider_monthly: Object.freeze({ key:"ai_founding_provider_monthly", tier:"founding_provider", name:"StateCourse AI Founding Provider", amount:29900, interval:"month", foundingLimit:10, prices:{ test:"price_1UJxHfI5Vlt1VlIgBXxeuqGo", live:"price_1UJxZnI81wKbKburYTsNox5J" } }),
});

export function getAiPlan(key) {
  const plan=AI_PLANS[String(key||"")];
  if(!plan) throw Object.assign(new Error("unknown_ai_plan"),{statusCode:400});
  return plan;
}
