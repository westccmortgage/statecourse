const message=document.querySelector("#planMessage");
document.addEventListener("click",async(event)=>{
  const button=event.target.closest("[data-plan]");
  if(!button||button.disabled)return;
  button.disabled=true;message.textContent="Preparing secure checkout…";
  try{
    const response=await fetch("/api/ai/checkout",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json","accept":"application/json"},body:JSON.stringify({planKey:button.dataset.plan})});
    const body=await response.json().catch(()=>({}));
    if(response.status===401){location.assign("/student/sign-in/?return_to="+encodeURIComponent(location.pathname));return;}
    if(!response.ok)throw new Error(body.diagnostic||body.error||"checkout_unavailable");
    const url=new URL(body.checkoutUrl);
    if(url.protocol!=="https:"||!url.hostname.endsWith("stripe.com"))throw new Error("checkout_unavailable");
    location.assign(url.href);
  }catch(error){
    const messages={founding_provider_capacity_reached:"Founding Provider has reached its ten-customer limit.",ai_subscription_already_active:"Your account already has an active StateCourse AI subscription. Manage it in My StateCourse.",ai_live_sales_not_enabled:"StateCourse AI checkout is not open yet."};
    message.textContent=messages[error.message]||(error.message.startsWith("smoke:")?error.message:"Checkout is temporarily unavailable. No access or charge was created.");
    button.disabled=false;
  }
});