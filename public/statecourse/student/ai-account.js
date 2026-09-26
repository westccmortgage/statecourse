(async()=>{
  const section=document.querySelector("#aiAccountGroup");
  const plan=document.querySelector("#aiPlanStatus");
  const detail=document.querySelector("#aiSubscriptionDetail");
  const billing=document.querySelector("#aiBilling");
  try{
    const response=await fetch("/api/ai/account",{credentials:"same-origin",headers:{accept:"application/json"}});
    if(!response.ok)throw new Error("unavailable");
    const data=await response.json();
    const entitlement=data.entitlement||{tier:"free",active:false,status:"free"};
    const labels={free:"Free",pro:"Pro",provider:"Provider",founding_provider:"Founding Provider"};
    plan.textContent=labels[entitlement.tier]||"Free";
    detail.textContent=data.subscription
      ? `Subscription: ${data.subscription.status}${data.subscription.current_period_end?" · Current period through "+new Date(data.subscription.current_period_end).toLocaleDateString():""}`
      : "No paid subscription.";
    billing.hidden=!data.subscription;
    section.hidden=false;
  }catch{section.hidden=false;plan.textContent="Temporarily unavailable";detail.textContent="Reload to check your StateCourse AI access."}

  billing?.addEventListener("click",async()=>{
    billing.disabled=true;
    try{
      const response=await fetch("/api/ai/billing-portal",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"}});
      const body=await response.json();
      if(!response.ok)throw new Error();
      location.assign(body.url);
    }catch{detail.textContent="Billing controls are temporarily unavailable.";billing.disabled=false;}
  });
})();