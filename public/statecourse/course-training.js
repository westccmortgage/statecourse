// Public availability comes from the same recorded decisions as enrollment.
const sections=[...document.querySelectorAll('[data-training-offering]')];
if(sections.length){
  try{
    const response=await fetch('/api/payments/config',{cache:'no-store',credentials:'omit'});
    if(!response.ok)throw new Error('availability_unavailable');
    const {training}=await response.json();
    const enabled=new Set(training?.available===true?training.courses.map(c=>c.id):[]);
    for(const section of sections){
      if(!enabled.has(section.dataset.trainingOffering))continue;
      const heading=document.createElement('h2');heading.textContent='Study this course for training purposes';
      const copy=document.createElement('p');copy.textContent='Full course access with saved progress, without payment. This enrollment does not earn licensing or continuing education credit.';
      const link=document.createElement('a');link.href='/student/sign-in/';link.className='cta-button';link.textContent='Open free training →';
      const account=document.createElement('a');account.href='/student/register/';account.textContent='Create an account';account.className='cta-secondary';
      section.replaceChildren(heading,copy,link,document.createTextNode(' '),account);section.hidden=false;
    }
  }catch{/* An unreadable or closed decision never becomes an offer of free enrollment. */}
}
