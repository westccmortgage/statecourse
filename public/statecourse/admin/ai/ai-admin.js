let token="";
const money=(cents)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(cents||0)/100);
const date=(value)=>value?new Date(value).toLocaleString():"—";
const safe=(value)=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
async function load(){
  const response=await fetch("/api/admin/ai-revenue",{headers:{authorization:`Bearer ${token}`,accept:"application/json"}});
  if(!response.ok)throw new Error(response.status===401?"unauthorized":"unavailable");
  const data=await response.json();
  document.querySelectorAll("[data-metric]").forEach(el=>{const v=data.metrics[el.dataset.metric];el.textContent=v==null?"Not connected":v;});
  document.querySelectorAll("[data-money]").forEach(el=>el.textContent=money(data.metrics[el.dataset.money]));
  document.querySelector("#aiCustomerRows").innerHTML=data.customers.length?data.customers.map(c=>`<tr><td>${safe([c.student.first_name,c.student.last_name].filter(Boolean).join(" ")||c.student.email||c.student.id)}<br><small>${safe(c.student.email||"")}</small></td><td>${safe(c.source)}</td><td>${safe(c.subscription?.plan_key||"Free")}</td><td>${safe(c.subscription?.status||"free")}</td><td>${c.entitlement?.active?"Active":"Not active"}</td><td>${money(c.recognized_revenue_cents)}</td><td>${date(c.student.created_at)}</td><td>${date(c.student.last_sign_in_at)}</td></tr>`).join(""):'<tr><td colspan="8">No AI customers yet.</td></tr>';
}
document.querySelector("#aiAdminLogin").addEventListener("submit",async e=>{e.preventDefault();token=document.querySelector("#aiAdminToken").value;try{await load();document.querySelector("#aiAdminMessage").textContent="Dashboard loaded.";}catch(err){document.querySelector("#aiAdminMessage").textContent=err.message==="unauthorized"?"The owner token was not accepted.":"Dashboard is temporarily unavailable.";}});