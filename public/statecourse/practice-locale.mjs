// Text-only presentation of explicitly public practice. Never mutates answers,
// grading, IDs, saved work, source links or authentication/enrollment state.
export function createPracticeLocale({document:doc=globalThis.document,window:win=globalThis.window,base,fetcher=globalThis.fetch}={}) {
  const key='statecourse.interface-language', query=new URL(win.location.href).searchParams.get('lang');
  let language=query==='es'?'es':query==='en'?'en':'en';
  if(!query)try{language=win.localStorage.getItem(key)==='es'?'es':'en';}catch{}
  try{win.localStorage.setItem(key,language);}catch{}
  const select=doc.getElementById('practiceLanguage'),notice=doc.getElementById('practiceTranslationNotice');
  let uiReady=false;
  let course=null, translations=new Map(), ui=new Map(), request=0, observer;
  const memory=new WeakMap(),attributes=new WeakMap(),cache=new Map();
  function translate(text){
    const value=text.trim();
    if(translations.has(value))return translations.get(value);
    if(ui.has(value))return ui.get(value);
    const patterns=[
      [/^(\d+)\. (.+)$/, (n,s)=>n+'. '+translate(s)],
      [/^(.+) — In development · Free practice$/,s=>translate(s)+' — En desarrollo · Práctica gratuita'],
      [/^(.+) · In development · Free practice$/,s=>translate(s)+' · En desarrollo · Práctica gratuita'],
      [/^(\d+) lessons · (\d+) questions$/, (a,b)=>`${a} lecciones · ${b} preguntas`],
      [/^Section (\d+) of (\d+)$/, (a,b)=>`Sección ${a} de ${b}`],
      [/^Question (\d+) of (\d+)$/, (a,b)=>`Pregunta ${a} de ${b}`],
      [/^Practice questions \((\d+)\)$/,n=>`Preguntas de práctica (${n})`],
      [/^Casework \((\d+)\)$/,n=>`Casos prácticos (${n})`],
      [/^Lesson: (\d+)\/(\d+) answered · (\d+) correct\. Course practice: (\d+)\/(\d+) answered · (\d+) correct on the first try\.$/,(a,b,c,d,e,f)=>`Lección: ${a}/${b} respondidas · ${c} correctas. Práctica del curso: ${d}/${e} respondidas · ${f} correctas al primer intento.`],
      [/^(\d+) of (\d+) correct \((\d+)%\)\. First try: (\d+) of (\d+)\.$/,(a,b,c,d,e)=>`${a} de ${b} correctas (${c}%). Primer intento: ${d} de ${e}.`],
      [/^(-?[\d,.]+) (.+)$/, (n,s)=>n+' '+translate(s)],
      [/^Expected answer: (.+)$/,s=>'Respuesta esperada: '+translate(s)],
      [/^Your answer \((.+)\)$/,s=>'Su respuesta ('+translate(s)+')'],
      [/^(\d+) of (\d+) objective checks correct\. Written responses, if present, require your own review against the criteria\. This is not course passage or an instructor assessment\.$/,(a,b)=>`${a} de ${b} comprobaciones objetivas correctas. Debe revisar sus respuestas escritas según los criterios. Esto no constituye la aprobación del curso ni una evaluación del instructor.`],
      [/^(.+) — Free Practice \| StateCourse$/,s=>translate(s)+' — Práctica gratuita | StateCourse'],
    ];
    for(const [pattern,format] of patterns){const m=value.match(pattern);if(m)return format(...m.slice(1));}
    return value;
  }
  // Repeated source labels can have different meanings in lesson tables.
  // Read original neighboring cells so repeated renders and language switches
  // retain the same context even after their visible text has been translated.
  function originalText(node){
    if(!node)return '';
    if(node.nodeType===3){const prior=memory.get(node);return prior&&prior.output===node.textContent?prior.source:node.textContent;}
    return [...node.childNodes].map(originalText).join('');
  }
  const sentenceFragments=new Map([
  [
    "The disclosure, with the date it was provided.",
    {
      "The": "La"
    }
  ],
  [
    "The listing or representation agreement, dated after the disclosure.",
    {
      "The": "El",
      ", dated": ", fechado",
      "after": "después de",
      "the disclosure.": "la divulgación."
    }
  ],
  [
    "The election of the relationship.",
    {
      "The": "La",
      "election": "elección"
    }
  ],
  [
    "The confirmation in or with the purchase agreement, consistent with the disclosure.",
    {
      "The": "La"
    }
  ],
  [
    "Solution. The contradiction is the most serious, and it is different in kind from the other. It describes the brokerage acting on both sides without either party's informed written consent — a breach of duties actually owed, not a documentation failure.",
    {
      "The": "La"
    }
  ],
  [
    "The trustee, acting within the authority the trust document grants — confirm rather than assume",
    {
      "The": "El"
    }
  ],
  [
    "Solution. The trustee's, acting within the authority the trust document grants. Not the beneficiaries', however many there are and however clearly they benefit.",
    {
      "The": "La"
    }
  ],
  [
    "Solution. The broker decides, because the listing is the brokerage's contract with the seller — not the individual licensee's, however sympathetic he is or however much he wants to accommodate her.",
    {
      "The": "El"
    }
  ],
  [
    "Solution. The protection clause may apply on its terms — typically to buyers identified to the seller in writing within a defined period after the term ends.",
    {
      "The": "La"
    }
  ],
  [
    "Solution. The flyer is the most serious in kind — fair housing copy that sorts people. The status misrepresentation misled every consumer and agent relying on that data. The identification failures are the most numerous and the easiest to fix.",
    {
      "The": "El"
    }
  ],
  [
    "The seller discloses the past leak and the repair. A repaired condition is still a fact a buyer wants, because the adequacy of the repair is precisely the question — and here there are no records.",
    {
      "The": "El"
    }
  ],
  [
    "The agent separately records and discloses the visual observation. Recorded as an observation, not a conclusion: \"brown staining approximately three feet across on the northwest bedroom ceiling; paint in that area appears newer than the surrounding ceiling.\" Not \"there was a roof leak that has been repaired,\" which is an inference the agent is not qualified to make and may be wrong in a way the buyer relies on.",
    {
      "The": "El"
    }
  ],
  [
    "The buyer is advised to have the repair evaluated by an appropriate professional before his contingency expires, and the recommendation is documented.",
    {
      "The": "Al"
    }
  ],
  [
    "Solution. The practical options are unchanged — bring funds, renegotiate, seek a negotiated resolution — and the agent should lay them out.",
    {
      "The": "Las"
    }
  ],
  [
    "The seller discloses known material facts. The licensee conducts a reasonably competent visual inspection of accessible areas and discloses what it reveals. Neither discharges the other, and a professional inspection discharges neither.",
    {
      "The": "El"
    }
  ],
  [
    "A rejection of the original offer and the substitution of a new one. The original is gone and cannot be accepted unless renewed.",
    {
      "A": "Un"
    }
  ],
  [
    "A documented gap is a compliance problem a brokerage can survive.",
    {
      "A": "Una"
    }
  ],
  [
    "A manufactured document is falsification. It converts a defensible situation into a question about integrity, and it ends careers.",
    {
      "A": "Un"
    }
  ],
  [
    "An exception is an item the policy will not insure against. That is the entire significance, and it is why exceptions must be read rather than skimmed:",
    {
      "An": "Una"
    }
  ],
  [
    "Do describe: single-level layout, step-free entry, wide doorways, roll-in shower, elevator, grab bars, accessible parking.",
    {
      "Do": "Debe"
    }
  ],
  [
    "Do not characterize: who the property is or is not suitable for.",
    {
      "Do not": "No debe"
    }
  ],
  [
    "It is not an \"acceptance with modifications\" that forms a contract on the seller's terms.",
    {
      "It is": "Esto"
    }
  ],
  [
    "It is not an inspection, and it is not a new opportunity to renegotiate condition the buyer already accepted.",
    {
      "It is": "Esto"
    }
  ],
  [
    "It is not an \"acceptance with modifications\" forming a contract on the counterofferor's terms.",
    {
      "It is": "Esto"
    }
  ],
  [
    "It does not suspend the original offer, leaving it available if the counteroffer is rejected. The original is gone.",
    {
      "It does": "Esto"
    }
  ],
  [
    "It may not act on the holdback: a change to disbursement requires mutual written instructions, and one party cannot redirect funds.",
    {
      "It": "Escrow"
    }
  ],
  [
    "It may not simply disburse in full either — that also acts on one side's position once a genuine dispute has been raised.",
    {
      "It": "Escrow"
    }
  ],
  [
    "After submitting, consider: have you ever been on the receiving end of a decision someone made for you, in good faith, that you would have made differently? What did it feel like, and did you say anything at the time?",
    {
      "for": "por"
    }
  ],
  [
    "The four components: it refuses plainly; it explains without lecturing; it offers a lawful alternative that addresses the underlying concern; and it escalates transparently rather than behind the client's back.",
    {
      "it": "la respuesta"
    }
  ],
  [
    "This is also the answer to the common overcorrection of omitting accessibility features entirely. The rule governs who the property is for, not what the property has. Describe the step-free entry, the roll-in shower, the elevator. Do not characterize who it suits.",
    {
      "This is also the answer to the common overcorrection of omitting accessibility features entirely. The rule governs who the property is": "Esto también responde a la reacción excesiva habitual de omitir por completo las características de accesibilidad. La regla se refiere a quién se considera",
      "for": "destinatario de la vivienda",
      ", not what the property": ", no a lo que la propiedad",
      "has": "tiene"
    }
  ],
  [
    "A deduction available for income-producing property, taken over a recovery period. Land is not depreciable",
    {
      "A deduction available for": "Una deducción disponible para la propiedad",
      "income-producing": "generadora de ingresos",
      "property, taken over a recovery period.": ", aplicada durante un período de recuperación."
    }
  ],
  [
    "Improvements on income-producing property",
    {
      "Improvements on": "Mejoras en la propiedad",
      "income-producing": "generadora de ingresos",
      "property": ""
    }
  ],
  [
    "A deduction for income-producing property over a recovery period. Land is not depreciable, and this is a different concept from appraisal depreciation.",
    {
      "A deduction for": "Una deducción para la propiedad",
      "income-producing": "generadora de ingresos",
      "property over a recovery period. Land is not depreciable, and this is a different concept from appraisal depreciation.": "durante un período de recuperación. El terreno no es depreciable; este concepto es distinto de la depreciación utilizada en la tasación."
    }
  ],
  [
    "On the appraisal: escalate to the broker and follow the reconsideration process available through the lender. Do not confront the appraiser, and do not advise the client they have a claim — a legal conclusion. And whatever the licensee sends must be information — relevant sales, condition, the contract — never a target.",
    {
      "On the appraisal:": "En cuanto a la tasación:",
      "escalate to the broker and": "eleve el asunto al corredor y",
      "follow the reconsideration process available through the lender.": "siga el procedimiento de reconsideración que ofrece el prestamista.",
      "Do": "Usted",
      "confront the appraiser, and do": "debe confrontar al tasador, y",
      "not": "no",
      "advise the client they have a claim — a legal conclusion. And whatever the licensee sends must be": "debe afirmar que el cliente tiene una reclamación —eso sería una conclusión jurídica—. Todo lo que envíe el licenciatario debe ser"
    }
  ],
  [
    "Periodic caps limit change at a single adjustment; a lifetime cap limits total movement",
    {
      "Periodic": "Los límites periódicos",
      "lifetime": "durante toda la vigencia",
      "caps limit change at a single adjustment; a": "restringen cada ajuste; el límite",
      "cap limits total movement": "restringe el cambio total"
    }
  ],
  [
    "Periodic caps limit a single adjustment; a lifetime cap limits total movement. Some notes add an initial cap and a floor.",
    {
      "Periodic": "Los límites periódicos",
      "lifetime": "durante toda la vigencia",
      "caps limit a single adjustment; a": "restringen cada ajuste; el límite",
      "cap limits total movement. Some notes add an initial cap and a floor.": "restringe el cambio total. Algunos pagarés añaden un límite inicial y una tasa mínima."
    }
  ],
  [
    "Periodic caps limit change at one adjustment; a lifetime cap limits total movement",
    {
      "Periodic": "Los límites periódicos",
      "lifetime": "durante toda la vigencia",
      "caps limit change at one adjustment; a": "restringen cada ajuste; el límite",
      "cap limits total movement": "restringe el cambio total"
    }
  ],
  [
    "Periodic limits at a single adjustment; a lifetime limit on total movement; sometimes an initial cap and a floor.",
    {
      "Periodic": "Los límites periódicos",
      "lifetime": "durante toda la vigencia",
      "limits at a single adjustment; a": "restringen cada ajuste; el límite",
      "limit on total movement; sometimes an initial cap and a floor.": "restringe el cambio total; a veces se añaden un límite inicial y una tasa mínima."
    }
  ],
  [
    "Total secured debt ÷ value, generally counting the full amount of a line rather than the drawn balance.",
    {
      "full": "total"
    }
  ],
  [
    "The timing failure: the preliminary report belongs at the front of the queue. Discovered with eight days left, an unreleased lien leaves a scramble where a resolution should have been.",
    {
      "The timing failure:": "El fallo de planificación temporal:",
      "front": "inicio"
    }
  ],
  [
    "Agency-insured lending with lower down payments, upfront and annual mortgage insurance, property condition requirements, and area loan limits.",
    {
      "Agency-": "Préstamos ",
      "insured": "asegurados",
      "lending with lower down payments, upfront and annual mortgage insurance, property condition requirements, and area loan limits.": "por un organismo público, con pagos iniciales menores, seguro hipotecario inicial y anual, requisitos sobre el estado de la propiedad y límites de préstamo por zona."
    }
  ],
  [
    "Agency-guaranteed lending for eligible borrowers, often with no down payment, no monthly mortgage insurance, a funding fee with exemptions, and a notice of value.",
    {
      "Agency-": "Préstamos ",
      "guaranteed": "garantizados",
      "lending for eligible borrowers, often with no down payment, no monthly mortgage insurance, a funding fee with exemptions, and a notice of value.": "por un organismo público para prestatarios elegibles, a menudo sin pago inicial ni seguro hipotecario mensual, con una comisión de financiación sujeta a exenciones y un aviso de valor."
    }
  ],
  [
    "The qualifying statement is a fourth error and the most consequential. It states a threshold as a fixed rule and makes an underwriting determination the licensee is not authorized to make. Thresholds vary by program, by compensating factors, and over time — and a borrower who hears \"qualifies easily\" writes an offer.",
    {
      "It": "Esta afirmación"
    }
  ],
  [
    "Drafting the letter of explanation is authoring a representation the borrower will sign. It is the borrower's statement, in his own words, dated. Writing what underwriting \"wants to hear\" is composing testimony.",
    {
      "It is": "Es"
    }
  ],
  [
    "Where an originator or a borrower believes an appraisal is materially wrong, lenders provide a reconsideration of value process.",
    {
      "process.": "."
    }
  ],
  [
    "Solution. The timing failure came first, and it made everything else harder. The preliminary report belongs at the front of the queue, because requirements carry the deadlines and some take weeks.",
    {
      "The timing failure came first": "Primero se produjo el fallo de planificación temporal",
      ", and it made everything else harder. The preliminary report belongs at the": ", que complicó todo lo demás. El informe preliminar debe tener prioridad desde el",
      "front": "inicio",
      "of the queue, because": "de la tramitación, porque"
    }
  ],
  [
    "What this does and does not imply for a licensee. It does not imply that a licensee should attempt to correct history through decisions about who gets which product — steering a borrower on a protected basis is prohibited regardless of the intent behind it, including a corrective intent.",
    {
      "It does": "Esto"
    }
  ],
  [
    "It does imply recognizing inherited patterns rather than reading them as natural facts about places, refusing to transmit them as market wisdom, applying uniform practices, and giving consumers objective information.",
    {
      "It": "Esto",
      "does": "sí"
    }
  ],
  [
    "Never fill in the seller's disclosure statement. It is the seller's statement of the seller's knowledge, signed on a date. A broker who completes it has made it partly their own. RCW 64.06 prescribes that form and was not read for this project, so nothing in this build states what it contains or when it must be delivered — but the principle above stands on RCW 18.86.030(1)(b) and (1)(d), which were read.",
    {
      "It is the": "Es la declaración del",
      "seller's": "vendedor",
      "statement of the": "acerca de lo que el",
      "knowledge, signed on a date. A broker who completes it has made it partly their own.": "conoce, firmada en una fecha determinada. El corredor que la completa la convierte, en parte, en una declaración propia."
    }
  ],
  [
    "A broker may conduct mortgage activity independently and may employ salespersons.",
    {
      "A": "Un"
    }
  ],
  [
    "A salesperson may conduct it only for and under a responsible broker, and may accept compensation for licensed activity only from that broker.",
    {
      "A": "Un"
    }
  ],
  [
    "Two points licensees miss. The unique identifier follows the individual, not the employer, and it must appear on communications and advertising as required. And the endorsement renews on its own cycle — a licensee whose broker license is current but whose endorsement lapsed is not authorized to originate.",
    {
      "The": "El"
    }
  ],
  [
    "The promise to repay. It creates the debt and states its terms",
    {
      "The": "La"
    }
  ],
  [
    "The APR expresses the cost of credit as a yearly rate, including certain finance charges beyond interest, and it exists to make offers comparable.",
    {
      "The": "El"
    }
  ],
  [
    "\"The cheaper loan\" is not the originator's conclusion to draw. The APR exists to make offers comparable by including certain finance charges beyond interest — but it assumes the loan runs its full term, which makes it a poor guide for a borrower who will move in five years. It is also not the note rate, does not include every cost, and behaves oddly on adjustable loans.",
    {
      "The": "El"
    }
  ],
  [
    "A mortgage involves two parties: mortgagor (borrower) and mortgagee (lender). There is no trustee and, ordinarily, no power of sale.",
    {
      "A": "Una"
    }
  ],
  [
    "A preliminary report reports record title and states the terms on which the insurer would issue a policy, including its exceptions.",
    {
      "A": "Un"
    }
  ],
  [
    "Distinguish exceptions from requirements. A requirement is something the insurer needs before issuing — a reconveyance, a resolution, evidence of trustee authority — and requirements are the items with deadlines attached.",
    {
      "A": "Un"
    }
  ],
  [
    "A subordination agreement is a lienholder's agreement to take a lower priority position than it would otherwise hold.",
    {
      "A": "Un"
    }
  ],
  [
    "A partial reconveyance effects that release. Whether a particular parcel qualifies, and on what payment, is governed by the instrument.",
    {
      "A": "Una"
    }
  ],
  [
    "A deficiency is the shortfall where sale proceeds do not satisfy the debt. California restricts deficiency judgments substantially:",
    {
      "A": "Una"
    }
  ],
  [
    "A two-party instrument — mortgagor and mortgagee — generally without a power of sale, foreclosed judicially.",
    {
      "A": "Un"
    }
  ],
  [
    "Solution. Fully indexed rate today: 4.50 + 2.75 = 7.25%. The start rate is below it, which means that even with no market movement at all the rate moves up at the first adjustment — the single most important fact in this conversation, and the one the originator did not mention.",
    {
      "The": ""
    }
  ],
  [
    "Does not decide what qualifies, compute what the underwriter will accept, tell a borrower which debts \"won't count,\" or omit something because it seems immaterial.",
    {
      "Does not": "No"
    }
  ],
  [
    "Prequalification rests on largely stated information and establishes a rough range while verifying nothing. Preapproval is a lender review of supporting information establishing a likely amount subject to conditions — not a commitment to lend. A loan commitment follows completed underwriting and provides substantially more certainty, and still not immunity from changed circumstances.",
    {
      "A": "Un"
    }
  ],
  [
    "Two of these are the ones files most often miss. A simultaneous loan — a second recorded at the same closing — must be considered, and mortgage-related obligations means taxes, insurance, assessments, and dues, which is why the housing figure is PITI rather than principal and interest.",
    {
      "A": "Un"
    }
  ],
  [
    "A qualified mortgage is a category of loan meeting defined requirements — including limits on certain features and on points and fees, and requirements about how the payment is computed — that provides the creditor a degree of protection regarding the ability-to-repay determination.",
    {
      "A": "Una"
    }
  ],
  [
    "The lender's policy insures the lender's lien and its priority. The owner's policy insures the borrower's interest.",
    {
      "The": "La"
    }
  ],
  [
    "An existing second on a refinance. A subordination agreement may be required, and it is that lienholder's decision with counsel — never \"standard.\"",
    {
      "A": "Un"
    }
  ],
  [
    "A data statute, not a lending standard. Supports community-needs assessment, public investment distribution, and identification of discriminatory patterns.",
    {
      "A": "Una"
    }
  ],
  [
    "Solution. \"The real rate\" is wrong and misleads about the payment. The finance charge is the cost of consumer credit as a dollar amount; the APR expresses that cost as a yearly rate so offers with different rate-and-fee combinations can be compared. The payment is computed from the note rate, not the APR.",
    {
      "The": "El"
    }
  ],
  [
    "Her statement to the colleague is half right and misleading. A federally registered MLO at a depository or its regulated subsidiary is registered rather than state-licensed and generally does not face the testing, pre-licensing education, and annual continuing education a state-licensed MLO faces. But he still has a unique identifier and is still within the framework — which exists so that an individual's history follows them and an action in one state is visible everywhere.",
    {
      "A": "Un"
    }
  ],
  [
    "A fee simple absolute is the largest interest a person can hold: unlimited in duration, inheritable, and freely transferable. Most Alaska residential transactions convey a fee simple.",
    {
      "A": "Un"
    }
  ],
  [
    "A defeasible fee ends if a stated event occurs. These appear in older conveyances and in charitable and governmental grants, and their effect is a legal question a licensee routes rather than answers.",
    {
      "A": "Un"
    }
  ],
  [
    "A life estate lasts for the life of a named person. The life tenant may possess and use the property, must not commit waste, and must maintain it. When the measuring life ends the property passes to a remainderman, or reverts to the grantor's estate as a reversion.",
    {
      "A": "Un"
    }
  ],
  [
    "A licence is revocable permission and is not an interest in land. An encroachment is a physical intrusion over a boundary, found by survey. Both are common, and both are facts the licensee discloses and legal questions the licensee refers.",
    {
      "A": "Una",
      "is revocable permission and is not an interest in land. An": "es un permiso revocable, no un derecho sobre el terreno. Una"
    }
  ],
  [
    "A competent grantor — of legal age and sound mind.",
    {
      "A": "Un"
    }
  ],
  [
    "A grantee named with reasonable certainty.",
    {
      "A": "Un"
    }
  ],
  [
    "A material breach goes to the heart of the bargain and excuses the other party's performance. A minor breach gives a claim for damages but not a right to walk.",
    {
      "A": "Un",
      "material breach": "incumplimiento sustancial"
    }
  ],
  [
    "A mortgage has two parties: the mortgagor (borrower, who gives the mortgage) and the mortgagee (lender, who receives it). Alaska is a lien theory jurisdiction in effect — the borrower keeps title and the lender holds a lien. A mortgage in Alaska is foreclosed judicially, through AS 09.45.170.",
    {
      "A": "Una",
      "has two parties: the": "tiene dos partes: el",
      "(lender, who receives it). Alaska is a": "(prestamista, que la recibe). Alaska aplica la",
      "jurisdiction in effect — the borrower keeps title and the lender holds a lien. A mortgage in Alaska is foreclosed": "en la práctica: el prestatario conserva la titularidad y el prestamista tiene un gravamen. En Alaska, una hipoteca se ejecuta"
    }
  ],
  [
    "A deed of trust has three parties: the trustor (borrower), the beneficiary (lender), and a trustee who holds a power of sale. If the deed of trust says the trustee may sell for condition broken, AS 34.20.070 lets the trustee execute the trust by sale without first securing a decree of foreclosure and order of sale from the court.",
    {
      "A": "Una",
      "has three parties: the": "tiene tres partes: el",
      "who holds a power of sale. If the deed of trust says the trustee may sell for condition broken,": "que dispone de facultad de venta. Si la escritura le permite vender por incumplimiento de una condición,",
      "lets the trustee execute the trust by sale": "permite al administrador fiduciario ejecutar la garantía mediante venta",
      "without first securing a decree of foreclosure and order of sale from the court": "sin obtener previamente una resolución judicial de ejecución y una orden de venta"
    }
  ],
  [
    "A public utility (electricity, natural gas, water) discontinues service for the tenant's nonpayment",
    {
      "A": "Una"
    }
  ],
  [
    "A township is six miles square and contains 36 sections.",
    {
      "A": "Una",
      "township": "cuadrícula catastral (township)"
    }
  ],
  [
    "A section is one square mile and contains 640 acres.",
    {
      "A": "Una"
    }
  ],
  [
    "A title search discloses what the record holds: deeds of trust and other liens, easements, CC&Rs, plat notes and dedications, judgments, and assessments.",
    {
      "A": "Una"
    }
  ],
  [
    "The third party is what makes the shortcut possible. A trustee holds the security for the beneficiary's benefit and can conduct a trustee's sale without a lawsuit.",
    {
      "A": "Un",
      "holds the security for the beneficiary's benefit and can conduct a": "mantiene la garantía en beneficio del beneficiario y puede realizar una",
      "trustee's sale": "venta fiduciaria"
    }
  ],
  [
    "Closed sales only. A current listing is what a seller hopes for; a property under contract has a price that has not yet survived appraisal, financing or inspection. Neither is evidence of what a buyer paid.",
    {
      "A": "Un",
      "current listing": "anuncio de venta vigente",
      "is what a seller hopes for; a": "refleja lo que espera obtener el vendedor; una",
      "property under contract": "propiedad bajo contrato",
      "has a price that has not yet survived appraisal, financing or inspection.": "tiene un precio que aún no ha superado la tasación, la financiación ni la inspección."
    }
  ],
  [
    "A debit is what a party owes; a credit is what a party has coming.",
    {
      "A": "Un",
      "; a": "; un",
      "credit": "crédito"
    }
  ],
  [
    "3. A thorough understanding of the obligations between principal and agent, the principles of real estate and business opportunity practice, the applicable canons of business ethics, this chapter and rules adopted pursuant to this chapter.",
    {
      "A": "Una",
      ", the": ", los"
    }
  ],
  [
    "A broker representative with delegated authority; and",
    {
      "A": "Un"
    }
  ],
  [
    "A drawing or game of chance may not be used to solicit or offer to sell an interest in a development, unless otherwise provided by law",
    {
      "A": "Un"
    }
  ],
  [
    "A real estate broker",
    {
      "A": "Un",
      "real estate broker": "corredor inmobiliario"
    }
  ],
  [
    "An easement appurtenant benefits a parcel — the dominant estate — and burdens another — the servient estate. It runs with the land. An easement in gross benefits a person or entity, and utility easements are the everyday example.",
    {
      "An": "Una"
    }
  ],
  [
    "An owner's policy protects the buyer, generally for the purchase price. A lender's policy protects the lender for the loan amount and protects the buyer not at all. Explaining that difference is a factual statement a licensee may make; advising whether to buy one is the client's decision with the title company available.",
    {
      "An": "Una",
      "protects the buyer, generally for the purchase price. A": "protege al comprador, generalmente por el precio de compra. Una"
    }
  ],
  [
    "An address identifies a mailbox. An assessor's parcel number identifies a tax record. Neither describes land.",
    {
      "An": "Una",
      "assessor's parcel number": "número de parcela del tasador fiscal"
    }
  ],
  [
    "An offer may be revoked at any time before acceptance, unless consideration was given to hold it open — which is what an option is.",
    {
      "An": "Una",
      "is.": "."
    }
  ],
  [
    "An agency relationship exists where one person, the agent, is authorised to act on behalf of another, the principal, in dealings with third parties.",
    {
      "An": "Una",
      "principal": "mandante"
    }
  ],
  [
    "The monthly common expense assessment and any unpaid common or special assessment due from the seller;",
    {
      "The": "La"
    }
  ],
  [
    "The current operating budget;",
    {
      "The": "El"
    }
  ],
  [
    "Answer: The alienation, or due-on-sale, clause, which makes the balance due on transfer and is generally enforceable under the Garn-St Germain Depository Institutions Act, 12 U.S.C. 1701j-3. The doctrine that would release the seller is novation — a substitution of the buyer for the seller as obligor, with the lender's agreement. Without a novation, an assumption leaves the seller liable on the note, which sellers routinely assume is not so.",
    {
      "The": "La",
      "alienation, or due-on-sale, clause": "cláusula de enajenación o vencimiento por venta",
      ", which makes the balance due on transfer and is generally enforceable under the Garn-St Germain Depository Institutions Act, 12 U.S.C. 1701j-3. The doctrine that would release the seller is": ", que hace exigible el saldo al transmitirse la propiedad y generalmente puede hacerse valer conforme a la Ley Garn-St Germain de Instituciones Depositarias, 12 U.S.C. 1701j-3. La figura que liberaría al vendedor es la"
    }
  ],
  [
    "The note rate prices the loan. The annual percentage rate expresses the cost including certain finance charges, and it is a disclosure concept under the federal Truth in Lending Act (15 U.S.C. 1601 et seq.) and Regulation Z (12 C.F.R. part 1026).",
    {
      "The": "La",
      "prices the loan. The": "determina el interés del préstamo. La",
      "annual percentage rate": "tasa porcentual anual"
    }
  ],
  [
    "The specific responsibilities of the property manager;",
    {
      "The": "Las"
    }
  ],
  [
    "The authority and powers given by the owner to the manager;",
    {
      "The": "La",
      "given by the owner to the manager;": "conferidas por el propietario al administrador;"
    }
  ],
  [
    "The period of the agreement; and",
    {
      "The": "El"
    }
  ],
  [
    "The management fee.",
    {
      "The": "La",
      "management fee": "comisión de administración"
    }
  ],
  [
    "The Real Estate Settlement Procedures Act, 12 U.S.C. 2601–2617, is implemented by Regulation X, 12 C.F.R. part 1024, administered by the Consumer Financial Protection Bureau.",
    {
      "The": "La",
      ", 12 U.S.C. 2601–2617, is implemented by": ", 12 U.S.C. 2601–2617, se desarrolla mediante el",
      ", administered by the Consumer Financial Protection Bureau.": ", administrado por la Oficina de Protección Financiera del Consumidor."
    }
  ],
  [
    "No setback, height limit, lot size, permit fee, approval deadline, title policy exception or premium is stated in this module. The 640-acre section, the 36-section township and the 43,560-square-foot acre are universal survey constants, and the last of them is also the figure R4-28-502(H) fixes.",
    {
      "The": "La",
      "No setback, height limit, lot size, permit fee, approval deadline, title policy exception or premium is stated in this module.": "Este módulo no establece distancias de retranqueo, límites de altura, superficies mínimas de parcela, tasas de permisos, plazos de aprobación, excepciones de pólizas de título ni primas.",
      "43,560-square-foot acre": "acre de 43,560 pies cuadrados",
      "fixes.": "establece.",
      "are universal survey constants, and the last of them is also the figure": "son constantes universales de agrimensura; la última también es la cifra que",
      "36-section township": "cuadrícula catastral de 36 secciones",
      ", the": ", la"
    }
  ],
  [
    "The primary market is where a loan is made; the secondary market is where a loan already made is bought — Fannie Mae, Freddie Mac and Ginnie Mae — through loan pooling and mortgage-backed securities. The link is conforming standards: a lender writes to them so the loan can be sold, and selling it returns capital to lend again.",
    {
      "The": "El",
      "is where a loan is": "es donde el préstamo se",
      "made": "origina",
      "is where a loan already made is": "es donde un préstamo ya originado se",
      "bought": "compra",
      "loan pooling": "agrupación de préstamos",
      "The link is conforming standards": "El vínculo son los criterios de conformidad",
      ": a lender writes to them so the loan can be sold, and selling it returns capital to lend again.": ": el prestamista origina conforme a esos criterios para poder vender el préstamo y recuperar capital con el que volver a prestar."
    }
  ],
  [
    "The licensee.",
    {
      "The": "El"
    }
  ],
  [
    "The dispute may not delay the transaction; compensation terms need not be altered",
    {
      "The": "La"
    }
  ],
  [
    "The designated broker is responsible for the advertising, and the broker's written policies must cover advertising and require review and inspection",
    {
      "The": "El"
    }
  ],
  [
    "The name of each employing broker who represents a party and will receive compensation from the transaction",
    {
      "The": "El"
    }
  ],
  [
    "The purchaser signs or initials the provision — the rule requires the purchaser's own mark on it,",
    {
      "The": "El"
    }
  ],
  [
    "The bold or large-print warning in the **public report, the purchase contract, and the agreement of",
    {
      "The": "La"
    }
  ],
  [
    "A conventional loan is one not insured or guaranteed by a federal agency. Conforming loans meet Fannie Mae and Freddie Mac limits and guidelines; non-conforming loans exceed them (jumbo) or fail a guideline for another reason.",
    {
      "A": "Un préstamo",
      "conventional": "convencional",
      "loan is one not insured or guaranteed by a federal agency. Conforming loans meet Fannie Mae and Freddie Mac limits and guidelines; non-conforming loans exceed them (jumbo) or fail a guideline for another reason.": "no está asegurado ni garantizado por un organismo federal. Los préstamos conformes cumplen los límites y criterios de Fannie Mae y Freddie Mac; los no conformes superan esos límites (jumbo) o incumplen algún criterio por otra razón."
    }
  ],
  [
    "Working: An affiliated business arrangement is permitted only if you give the consumer the prescribed written disclosure at or before the time of referral, describing the relationship and the estimated charge or range; the consumer is not required to use the affiliate; and the only thing of value you receive is a return on your ownership interest, not a payment tied to referrals — section 8(c)(4) and 12 C.F.R. 1024.15. Get the disclosure signed and into the file at referral, not at closing.",
    {
      ", describing the relationship and the estimated charge or range; the consumer is": ", describiendo la relación y el cargo estimado o su intervalo; el consumidor",
      "not required to use": "no está obligado a utilizar",
      "the affiliate; and the only thing of value you receive is a": "los servicios de la entidad afiliada; y lo único de valor que usted recibe es un",
      ", not a payment tied to referrals — section 8(c)(4) and 12 C.F.R. 1024.15. Get the disclosure signed and into the file at referral, not at closing.": ", no un pago vinculado a las remisiones — sección 8(c)(4) y 12 C.F.R. 1024.15. Obtenga la divulgación firmada e incorpórela al expediente al remitir al consumidor, no en el cierre."
    }
  ],
  [
    "No lease-term threshold, limitations period, trust account deadline, liquidated damages rule or form provision is stated in this module. The seven-day, six-month and ten-day periods are transcribed from R4-28-804.",
    {
      "The": "Los períodos de",
      "periods are transcribed from": "se transcriben de"
    }
  ],
  [
    "Paired sales analysis derives an adjustment honestly: two sales alike in everything but one feature, and the difference between them is what the market paid for that feature. It is contribution applied to one feature, and it yields market value, usually less than cost.",
    {
      "Paired sales analysis": "El análisis de ventas pareadas",
      "derives an adjustment honestly: two sales alike in everything but one feature, and": "obtiene un ajuste fundamentado: compara dos ventas iguales en todo salvo una característica, y",
      "It is": "Es el principio de",
      "contribution": "contribución",
      "applied to one feature, and it yields": "aplicado a una característica; determina el"
    }
  ],
  [
    "A reasonable accommodation is a change in rules, policies, practices or services. A reasonable modification is a physical change to the premises. The distinction is what is changed: a RULE or the PREMISES.",
    {
      "A": "Un",
      "reasonable accommodation": "ajuste razonable",
      ". A": ". Una",
      "is a": "supone un"
    }
  ],
  [
    "No examination item count, time limit, application fee, course fee, pre-determination procedure, ground for denial or penalty is stated in this module. The 90 hours, the six additional hours, the 27-hour Arizona-specific course, the ten-year limit, the 75 percent, the eighteen years, the four-year school approval period, the five-year school record, and the 20 percent recorded-material limit are all transcribed from A.R.S. § 32-2124, § 32-2135 and A.A.C. R4-28.",
    {
      "The": "Los siguientes datos:",
      "90 hours": "90 horas",
      ", the": ",",
      ", and the": ", y",
      "five-year school record": "conservación de registros escolares durante cinco años",
      "are all": "se",
      "transcribed from A.R.S. § 32-2124, § 32-2135 and A.A.C. R4-28.": "transcriben de A.R.S. § 32-2124, § 32-2135 y A.A.C. R4-28."
    }
  ],
  [
    "No disciplinary consequence, penalty, fine, licence sanction, damages measure, statute of limitations, disclosure exception, or definition of \"reasonable\" is stated in this module. The fiduciary duty, the four disclosure categories, the four conflict situations, the prior written consent and prior written acknowledgement requirements, the broker-to-broker carve-out, the competence routes, the possession prohibitions, the four professions in (K), and the 24 hours in R4-28-1102 are all transcribed from A.A.C. R4-28-1101 and R4-28-1102.",
    {
      "The": "Los siguientes elementos:",
      "fiduciary duty": "deber fiduciario",
      ", the": ",",
      "prior written acknowledgement": "acuse de recibo previo por escrito",
      "requirements, the": "exigidos, la",
      ", and the": ", y",
      "in R4-28-1102 are all": "de R4-28-1102 se",
      "transcribed from A.A.C. R4-28-1101 and R4-28-1102.": "transcriben de A.A.C. R4-28-1101 y R4-28-1102."
    }
  ],
  [
    "No trust account rule, records retention period, unlicensed-assistant task list, disciplinary consequence, penalty, or definition of \"progressive,\" \"reasonable supervision,\" or \"clear and prominent\" is stated in this module. The written-policy areas, the progressive disciplinary policy, the responsibility for acts of licensees and employees, the \"owner/agent\" term, the 43,560 square feet, the written owner consent, the artificial intelligence and no-scroll provisions, and the five items that must be disclosed before participation in a premium offer are all transcribed from A.A.C. R4-28-1103, R4-28-502 and R4-28-503.",
    {
      "The": "Los siguientes elementos:",
      "written-policy areas": "ámbitos de las políticas escritas",
      ", the": ",",
      "term, the": "como término,",
      "artificial intelligence": "disposiciones sobre inteligencia artificial",
      "no-scroll": "visualización sin desplazamiento",
      "provisions, and the": ", y los",
      "five items": "cinco datos",
      "that must be disclosed before participation in a premium offer are all": "que deben divulgarse antes de participar en una oferta con incentivo se",
      "transcribed from A.A.C. R4-28-1103, R4-28-502 and R4-28-503.": "transcriben de A.A.C. R4-28-1103, R4-28-502 y R4-28-503."
    }
  ],
  [
    "A fiduciary standard where neighbouring states legislated one away; disclosure of either party's inability to perform; an affirmative duty to obtain information",
    {
      "A": "Un estándar",
      "fiduciary": "fiduciario",
      "standard where neighbouring states legislated one away; disclosure of": "que los estados vecinos eliminaron por ley; divulgación de"
    }
  ],
  [
    "A progressive disciplinary policy required by rule; \"owner/agent\"; 43,560 square feet; artificial intelligence named as an advertising medium; no scrolling",
    {
      "A": "Una",
      "named as an advertising medium;": "mencionada expresamente como medio publicitario;"
    }
  ],
  [
    "A listing is not an offer to sell; it is an employment agreement between owner and broker. An advertisement is ordinarily an invitation to make an offer. The buyer's written purchase contract is usually the first offer in the transaction, and the salesperson who prepares it is preparing the offer itself — which is why drafting error at this stage is expensive.",
    {
      "A": "Un"
    }
  ],
  [
    "A promise to do or not do something",
    {
      "A": "Una"
    }
  ],
  [
    "A broker may conduct licensed activity independently and may employ salespersons. A salesperson may conduct licensed activity only for and under a responsible broker.",
    {
      "A": "Un"
    }
  ],
  [
    "A fixture is an item that was personal property and has become real property through attachment to the land or to an improvement. Having become real property, it conveys with the property unless excluded.",
    {
      "A": "Un",
      "fixture": "bien incorporado al inmueble (fixture)",
      "is an item that was personal property and has become real property through attachment to the land or to an improvement. Having become real property, it conveys with the property unless excluded.": "es un bien que era mueble y pasó a ser inmueble por su fijación al terreno o a una mejora. Una vez incorporado, se transmite con la propiedad salvo exclusión expresa."
    }
  ],
  [
    "A trade fixture is an item a tenant attaches to leased premises for the conduct of the tenant's trade or business.",
    {
      "A": "Una",
      "trade fixture": "instalación comercial del arrendatario",
      "is an item a tenant attaches to leased premises for the conduct of the tenant's trade or business.": "es un bien que el arrendatario fija al local alquilado para desarrollar su actividad comercial o profesional."
    }
  ],
  [
    "A life estate is ownership measured by a lifetime rather than by a fixed period.",
    {
      "A": "Un"
    }
  ],
  [
    "A common interest development combines individually owned interests with a shared interest in common areas, governed by a set of recorded documents and administered by an association.",
    {
      "A": "Un"
    }
  ],
  [
    "A legal description identifies the parcel itself, permanently, in a way that can be located on the ground. California uses three systems, and a single description may combine them.",
    {
      "A": "Una"
    }
  ],
  [
    "A voluntary lien is created by the owner's agreement — most commonly a deed of trust securing a loan.",
    {
      "A": "Un"
    }
  ],
  [
    "A mechanic's lien secures payment for labor or materials furnished for the improvement of real property. It is the lien licensees most often mishandle, for two reasons.",
    {
      "A": "Un"
    }
  ],
  [
    "A parcel — the dominant tenement",
    {
      "A": "Un"
    }
  ],
  [
    "A person or entity",
    {
      "A": "Una"
    }
  ],
  [
    "A license is permission to use another's land that is generally revocable and does not create an interest in the land.",
    {
      "A": "Una"
    }
  ],
  [
    "A preliminary report reports the condition of title as shown in the records and states the terms on which the title insurer would be willing to issue a policy, including the exceptions it would take.",
    {
      "A": "Un"
    }
  ],
  [
    "A legal nonconforming use is one that was lawful when established and no longer conforms because the ordinance changed. It is commonly permitted to continue — often described as being \"grandfathered.\"",
    {
      "A": "Un"
    }
  ],
  [
    "Solution. \"Grandfathered\" is being used for the wrong concept. A legal nonconforming use was lawful when established and no longer conforms because the ordinance changed. A use that was never lawful is not a nonconforming use — it is unpermitted, which is a different and worse problem, and thirty years does not convert one into the other.",
    {
      "A": "Un"
    }
  ],
  [
    "A fiduciary owes the highest duties the law imposes in a commercial relationship: to act in the principal's interest rather than the fiduciary's own.",
    {
      "A": "Un",
      "fiduciary": "fiduciario"
    }
  ],
  [
    "A contingency conditions a party's obligation on a defined event or approval, inside a contract that has already been formed.",
    {
      "A": "Una"
    }
  ],
  [
    "A breach is a failure to perform a contractual obligation without a legal excuse. A material breach goes to the essence of the bargain and may excuse the other party's further performance; a minor breach generally does not.",
    {
      "A": "Un",
      "is a failure to perform a contractual obligation without a legal excuse. A": "consiste en no cumplir una obligación contractual sin justificación legal. Un",
      "material breach": "incumplimiento sustancial"
    }
  ],
  [
    "A rejection of the original offer and the substitution of a new one. The original is gone, not suspended — including where the change is handwritten on a signed form.",
    {
      "A": "Un",
      "of the original offer and the substitution of a new one. The original is gone, not suspended — including where the change is handwritten on a signed form.": "de la oferta original y su sustitución por otra. La original queda sin efecto, no suspendida, incluso cuando el cambio se escribe a mano en un formulario firmado."
    }
  ],
  [
    "A deed is the written instrument by which an owner conveys an interest in real property to another. The parties have specific names:",
    {
      "A": "Una"
    }
  ],
  [
    "A mortgage by contrast involves two parties: mortgagor (borrower) and mortgagee (lender).",
    {
      "A": "Una",
      "by contrast involves two parties:": "en cambio, involucra a dos partes:"
    }
  ],
  [
    "A purchase money loan is one used to acquire the property. California treats certain purchase money loans differently for deficiency purposes, addressed in Section 6.",
    {
      "A": "Un",
      "is one used to acquire the property. California treats certain purchase money loans differently for deficiency purposes, addressed in Section 6.": "se utiliza para adquirir la propiedad. California da un trato distinto a ciertos préstamos de adquisición a efectos de reclamar el saldo insuficientemente cubierto por la ejecución, tema de la Sección 6."
    }
  ],
  [
    "A conventional loan is one not insured or guaranteed by a government agency. Where the down payment is below a program threshold, mortgage insurance is commonly required, adding to the monthly cost and protecting the lender rather than the borrower.",
    {
      "A": "Un",
      "is one not insured or guaranteed by a government agency. Where the down payment is below a program threshold,": "no está asegurado ni garantizado por un organismo gubernamental. Cuando el pago inicial está por debajo del umbral del programa, el",
      "mortgage insurance": "seguro hipotecario"
    }
  ],
  [
    "A deficiency is the shortfall where the sale proceeds do not satisfy the debt. California restricts deficiency judgments substantially:",
    {
      "A": "Una"
    }
  ],
  [
    "A higher cap rate signals higher perceived risk or lower expected growth; a lower rate signals the opposite.",
    {
      "A": "Una",
      "higher cap rate": "tasa de capitalización más alta",
      "signals higher perceived risk or lower expected growth; a": "indica mayor riesgo percibido o menor crecimiento esperado; una"
    }
  ],
  [
    "And the boundary a licensee must not cross. A comparative market analysis is not an appraisal, and a licensee preparing one is not appraising. The CMA supports a listing or offering decision; it does not state value for a lender, and it must not be presented as though it did. Assignment 12 Section 6.2 states the rule; the arithmetic above is what makes the temptation real, because the arithmetic is easy and the judgment is not.",
    {
      "A": "Un",
      "is not an appraisal, and a licensee preparing one is not appraising. The CMA supports a listing or offering decision; it does not state value for a lender, and it must not be presented as though it did. Assignment 12 Section 6.2 states the rule; the arithmetic above is what makes the temptation real, because": "no es una tasación; el licenciatario que lo prepara no está tasando. El CMA apoya una decisión de comercialización u oferta, no fija un valor para un prestamista ni debe presentarse como si lo hiciera. La tarea 12, sección 6.2, enuncia la regla; los cálculos anteriores explican la tentación, porque"
    }
  ],
  [
    "A deduction taken over a recovery period",
    {
      "A": "Una"
    }
  ],
  [
    "A pro forma is a projected operating statement. It is built from assumptions — rent growth, vacancy, expense inflation, and an exit value — and the assumptions carry the answer.",
    {
      "A": "Un",
      "is a projected operating statement. It is built from assumptions — rent growth, vacancy, expense inflation, and an exit value — and the assumptions carry the answer.": "es un estado de resultados operativo proyectado. Se elabora a partir de supuestos —crecimiento de rentas, desocupación, inflación de gastos y valor de salida— que determinan el resultado."
    }
  ],
  [
    "A projected operating statement. Labeled as projected, with every assumption and its source stated, and never presented as operating data.",
    {
      "A": "Un estado de resultados",
      "projected": "proyectado",
      "operating statement. Labeled as projected, with every assumption and its source stated, and never presented as operating data.": ". Debe identificarse como proyección, indicando cada supuesto y su fuente, y nunca presentarse como datos reales de explotación."
    }
  ],
  [
    "A rule, policy, practice, or service",
    {
      "A": "Una"
    }
  ],
  [
    "A prediction — that values will rise, that a permit will issue, that a variance will be granted.",
    {
      "A": "Una",
      "— that values will rise, that a permit will issue, that a variance will be granted.": "— que los valores aumentarán, que se expedirá un permiso o que se concederá una excepción de zonificación."
    }
  ],
  [
    "A legal conclusion — that a use is permitted, that an encroachment is unimportant, that a party may cancel.",
    {
      "A": "Una"
    }
  ],
  [
    "A specialist's assessment — that a crack is cosmetic, that a repair was adequate, that mold is harmless.",
    {
      "A": "Una"
    }
  ],
  [
    "A corporation may also hold a real estate license, acting through a designated officer who must be a licensed broker and who bears the supervisory responsibility for the corporation's licensed activity. The corporate form changes who signs and who is liable in contract; it does not dilute the supervisory obligation, which attaches to the designated officer personally.",
    {
      "A": "Una",
      "who must be a licensed broker and who bears the supervisory responsibility for the corporation's licensed activity. The corporate form changes who signs and who is liable in contract; it does not dilute the supervisory obligation, which attaches to the designated officer personally.": "que debe ser un corredor con licencia y asumir la supervisión de las actividades de la sociedad sujetas a licencia. La forma societaria cambia quién firma y responde contractualmente; no reduce el deber de supervisión que recae personalmente en el directivo designado."
    }
  ],
  [
    "The seller's complete and current name, address, telephone number and email address, conspicuously, on the face of the agreement, where a rescission right applies",
    {
      "The": "El"
    }
  ],
  [
    "The compensation-sharing disclosure — in writing to all parties, at least three calendar days before closing, naming each employing broker who represents a party and will receive compensation",
    {
      "The": "La"
    }
  ],
  [
    "The Davis-Stirling Common Interest Development Act, Civil Code Part 5 of Division 4 beginning at § 4000, governs residential common interest developments in California. Its existence is confirmed by a section this course has already read for another purpose: Business and Professions Code § 10153.2(a)(2)(K) lists, among the courses that qualify an applicant for the broker examination, \"California law that relates to common interest developments, including, but not limited to, topics addressed in the Davis-Stirling Common Interest Development Act (Part 5 (commencing with Section 4000) of Division 4 of the Civil Code) and in the Commercial and Industrial Common Interest Development Act (Part 5.3 (commencing with Section 6500) of Division 4 of the Civil Code).\"",
    {
      "The": "La"
    }
  ],
  [
    "The currently serving trustee — which may not be the person who created the trust",
    {
      "The": "El administrador fiduciario",
      "currently serving": "que ejerce actualmente el cargo",
      "trustee — which may not be the person who created the trust": "— que puede no ser la persona que creó el fideicomiso"
    }
  ],
  [
    "The standard is what makes this figure comparable to other appraisals",
    {
      "The": "El"
    }
  ],
  [
    "The adjusted ceiling",
    {
      "The": "El"
    }
  ],
  [
    "The adjusted floor",
    {
      "The": "El",
      "adjusted floor": "límite mínimo ajustado"
    }
  ],
  [
    "The owner's policy insures the buyer's interest. The lender's policy insures the lender's lien and its priority. They insure different interests, which is why both commonly exist, and why a buyer who declines an owner's policy because \"there's a title policy on the loan\" has misunderstood what he is not buying.",
    {
      "The": "La",
      "insures the buyer's interest. The": "asegura el derecho del comprador. La"
    }
  ],
  [
    "The Statute of Frauds requires certain contracts to be in writing and signed by the party to be charged in order to be enforceable.",
    {
      "The": "El"
    }
  ],
  [
    "The owner's policy insures the buyer's interest. The lender's policy insures the lender's lien and its priority.",
    {
      "The": "La",
      "insures the buyer's interest. The": "asegura el derecho del comprador. La",
      "insures the lender's lien and its priority.": "asegura el gravamen del prestamista y su prioridad."
    }
  ],
  [
    "Discarding the drafts was the first retention error. The sequence of versions is frequently what shows when a term changed and who agreed to it. A file of executed finals proves what was agreed but not how the parties got there, which is the question a dispute usually asks.",
    {
      "The": "La",
      "Discarding the drafts was the first retention error.": "Desechar los borradores fue el primer error de conservación.",
      "is frequently what shows when a term changed and who agreed to it. A file of executed finals proves what was agreed but not how the parties got there, which is the question a dispute usually asks.": "suele mostrar cuándo cambió una condición y quién la aceptó. Conservar solo las versiones finales firmadas demuestra qué se acordó, pero no cómo llegaron las partes a ese acuerdo, que es lo que suele investigarse en una controversia."
    }
  ],
  [
    "The nominal rate is the rate stated in the note. The effective rate reflects the actual cost including points and certain fees, which is why a loan with a lower stated rate can cost more.",
    {
      "The": "El",
      "is the rate stated in the note. The": "es la tasa indicada en el pagaré. La"
    }
  ],
  [
    "The capitalization rate expresses the relationship between a property's NOI and its value, and it is derived from the market — from sales of comparable income properties where both NOI and price are known.",
    {
      "The": "La"
    }
  ],
  [
    "The entire remaining interest",
    {
      "The": "La totalidad del",
      "entire remaining interest": "derecho restante"
    }
  ],
  [
    "An encumbrance is any right or interest in land held by someone other than the owner that affects the property's title or its use. It does not prevent ownership or transfer; it travels with the property and burdens whoever holds it.",
    {
      "An": "Una"
    }
  ],
  [
    "An easement is a non-possessory right to use another's land for a specified purpose. The holder may use; the holder may not possess or exclude.",
    {
      "An": "Una"
    }
  ],
  [
    "An encroachment is an improvement extending onto another's land — a fence, an eave, a driveway, a retaining wall, a structure.",
    {
      "An": "Una"
    }
  ],
  [
    "An option is a contract in which the optionor gives the optionee the right to buy on stated terms within a stated time, supported by consideration.",
    {
      "An": "Una"
    }
  ],
  [
    "No retention period, public report requirement, subdivision threshold, form version, fee, disclosure exception, or penalty is stated in this module. The three calendar days, the delivery and offer duties, the retention categories, the public report legend, the earnest money provisions, the seventh and tenth calendar day rescission periods, the six-month inspection right, and the notice methods are all transcribed from A.A.C. R4-28-701, R4-28-802, R4-28-803 and R4-28-804.",
    {
      "The": "Los siguientes elementos:",
      "delivery and offer duties": "deberes de entrega y de presentación de ofertas",
      ", the": ",",
      "earnest money provisions": "disposiciones sobre depósitos de buena fe",
      "seventh": "plazos de rescisión del séptimo",
      "tenth calendar day": "décimo día natural",
      "rescission periods, the": ", derecho de inspección durante",
      "inspection right, and the": ", y",
      "are all": "se",
      "transcribed from A.A.C. R4-28-701, R4-28-802, R4-28-803 and R4-28-804.": "transcriben de A.A.C. R4-28-701, R4-28-802, R4-28-803 y R4-28-804."
    }
  ],
  [
    "No form version, form name, fee, statute-of-frauds section number, time-is-of-the-essence rule, electronic-signature rule, or unauthorised-practice boundary is stated in this module. The six hours, the three document types, and the participation in drafting requirement are transcribed from A.R.S. § 32-2124(L); every Arizona checklist item in Part D is transcribed from the A.A.C. rule named beside it.",
    {
      "The": "Las",
      ", the": ", los",
      ", and the": ", y el requisito de",
      "participation in drafting": "participación en la redacción",
      "requirement are": "se",
      "transcribed from A.R.S. § 32-2124(L)": "transcriben de A.R.S. § 32-2124(L)",
      "; every Arizona checklist item in Part D is": "; cada elemento de la lista de verificación de Arizona en la Parte D se",
      "transcribed from the A.A.C. rule named beside it.": "transcribe de la norma A.A.C. identificada a su lado."
    }
  ],
  [
    "No security deposit limit, deposit return period, notice period, entry notice, habitability standard, late fee, eviction procedure, maximum listing term, form version, or fee is stated in this module. The six hours, the three document types, and the participation in drafting requirement are transcribed from A.R.S. § 32-2124(L); every Arizona rule cited in Parts B and C is transcribed from the A.A.C. rule named beside it.",
    {
      "The": "Las",
      ", the": ", los",
      ", and the": ", y el requisito de",
      "participation in drafting": "participación en la redacción",
      "requirement are": "se",
      "transcribed from A.R.S. § 32-2124(L)": "transcriben de A.R.S. § 32-2124(L)",
      "; every Arizona rule cited in Parts B and C is": "; cada norma de Arizona citada en las Partes B y C se",
      "transcribed from the A.A.C. rule named beside it.": "transcribe de la norma A.A.C. identificada a su lado."
    }
  ],
  [
    "An assessor's parcel number is an administrative identifier a county assigns for taxation. A legal description identifies the land in law.",
    {
      "is an administrative identifier a county assigns for taxation. A": "es un identificador administrativo asignado por el condado con fines fiscales. Una"
    }
  ],
  [
    "An involuntary lien arises by operation of law without the owner's consent. Taxes, judgments, and mechanic's liens are the recurring examples.",
    {
      "arises by operation of law without the owner's consent. Taxes, judgments, and mechanic's liens are the recurring examples.": "surge por aplicación de la ley sin consentimiento del propietario. Los gravámenes tributarios, los derivados de sentencias y los de construcción son ejemplos frecuentes."
    }
  ],
  [
    "The prior calendar year's countywide median sale price for a single-family home in the county. The section names no source for it",
    {
      "The": "El precio mediano de venta de viviendas unifamiliares en todo el condado correspondiente al",
      "prior calendar year's": "año natural anterior",
      "countywide median sale price for a single-family home in the county.": ".",
      "The section names no source for it": "La sección no identifica una fuente para ese dato"
    }
  ],
  [
    "Solution. The timing failure came first, and it is the one that made everything else harder. The preliminary report and its underlying documents belong at the front of the queue with the association documents and hazard-area insurance quotes. An exception discovered on day twelve — an unreleased lien needing a document from a lender that may no longer exist — leaves a formality where a review should have been.",
    {
      "The timing failure came first": "Primero se produjo el fallo de planificación temporal",
      ", and it is the one that made everything else harder. The preliminary report and its underlying documents belong at the": ", que complicó todo lo demás. El informe preliminar y los documentos en que se basa deben tener prioridad desde el",
      "front": "inicio",
      "of the queue with the association documents and hazard-area insurance quotes. An exception discovered on day twelve — an unreleased lien needing a document from a lender that may no longer exist — leaves a formality where a review should have been.": "de la tramitación, junto con los documentos de la asociación y las cotizaciones de seguros para zonas de riesgo. Una excepción descubierta el día doce —un gravamen sin cancelar que requiere un documento de un prestamista que quizá ya no exista— deja una mera formalidad donde debería haberse realizado una revisión."
    }
  ],
  [
    "The preliminary report and the underlying documents belong at the front of the transaction queue, with association documents and hazard-area insurance quotes.",
    {
      "The preliminary report and the underlying documents belong at the": "El informe preliminar y los documentos en que se basa deben tener prioridad desde el",
      "front": "inicio",
      "of the transaction queue, with association documents and hazard-area insurance quotes.": "de la operación, junto con los documentos de la asociación y las cotizaciones de seguros para zonas de riesgo."
    }
  ],
  [
    "Solution. The timing failure came first. The preliminary report and its underlying documents belong at the front of the queue, with association documents and hazard-area insurance quotes. An unreleased lien needing a document from a lender that may no longer exist, discovered on day twelve, leaves a formality where a review should have been.",
    {
      "The timing failure came first.": "Primero se produjo el fallo de planificación temporal.",
      "The preliminary report and its underlying documents belong at the": "El informe preliminar y los documentos en que se basa deben tener prioridad desde el",
      "front": "inicio",
      "of the queue, with association documents and hazard-area insurance quotes. An unreleased lien needing a document from a lender that may no longer exist, discovered on day twelve, leaves a formality where a review should have been.": "de la tramitación, junto con los documentos de la asociación y las cotizaciones de seguros para zonas de riesgo. Un gravamen sin cancelar que requiere un documento de un prestamista que quizá ya no exista, descubierto el día doce, deja una mera formalidad donde debería haberse realizado una revisión."
    }
  ],
  [
    "Six errors. He evaluated the accommodation under the ordinary pet policy — the classic mistake, producing a denial that never engaged the actual standard. An assistance animal is not a pet, so a no-pet policy does not by itself justify refusal. Certification may not be required. A pet deposit or pet rent may not be charged, because it imposes a condition on a protected group others do not bear. Treating the modification as an unauthorized alteration applies the lease framework to a fair housing question. Medical records may not be sought — a provider may seek enough to establish the disability and the disability-related need, not a diagnosis, records, or the nature or severity of the condition.",
    {
      "— the classic mistake, producing a denial that never engaged the actual standard. An": "—el error clásico: una denegación que ni siquiera aplicó el criterio pertinente. Un",
      "assistance animal is not a pet": "animal de asistencia no es una mascota",
      "A": ""
    }
  ],
  [
    "An opt-out mechanism is necessary but not sufficient. Including \"reply STOP\" does not create the consent required to send the first message.",
    {
      "An": "Un",
      "opt-out mechanism is necessary but not sufficient.": "mecanismo para dejar de recibir mensajes es necesario, pero no suficiente."
    }
  ],
  [
    "A salesperson is licensed to perform brokerage activity only while employed by or associated with a licensed broker. The salesperson's licence has no independent existence in practice: it authorises work done for the broker's account.",
    {
      "A": "Un",
      "while employed by or associated with a licensed broker. The salesperson's licence has no independent existence in practice: it authorises work done for the broker's account.": "mientras esté empleado por un corredor con licencia o asociado a él. La licencia del agente vendedor no permite ejercer de forma independiente: autoriza el trabajo por cuenta del corredor."
    }
  ],
  [
    "A court-appointed fiduciary acts under the court's authority for the estate or the receivership in question. That authority does not extend to the fiduciary's other business.",
    {
      "A": "Un",
      "court-appointed fiduciary": "fiduciario designado por el tribunal",
      "acts under the court's authority for the estate or the receivership in question. That authority does not extend to the fiduciary's other business.": "actúa bajo la autoridad judicial para la sucesión o administración judicial correspondiente. Esa autoridad no se extiende a sus demás actividades comerciales."
    }
  ],
  [
    "A power of attorney authorises acts for a particular principal, usually a particular transaction. It is not a business licence, and a person collecting powers of attorney from multiple owners in order to trade in their properties is doing precisely what the licence requirement exists to reach.",
    {
      "A": "Un",
      "authorises acts for a particular principal, usually a particular transaction. It is not a business licence, and a person collecting powers of attorney from multiple owners in order to trade in their properties is doing precisely what the licence requirement exists to reach.": "autoriza actos por cuenta de un mandante concreto, normalmente para una operación determinada. No es una licencia profesional: quien reúne poderes de varios propietarios para negociar sus inmuebles realiza precisamente la actividad que queda sujeta al requisito de licencia."
    }
  ],
  [
    "A fee simple absolute is the largest interest a person can hold: unlimited in duration, inheritable, and freely transferable. Almost every residential transaction a Michigan licensee handles conveys a fee simple.",
    {
      "A": "Un"
    }
  ],
  [
    "A defeasible fee is a fee that can end if a stated event occurs — property conveyed \"so long as it is used as a library.\" These appear in older deeds and in charitable conveyances, and their effect is a legal question the licensee must route.",
    {
      "A": "Un"
    }
  ],
  [
    "A life estate lasts for the life of a named person. The life tenant may possess and use the property, must not commit waste, and must maintain it and pay the taxes. When the measuring life ends, the property passes to the remainderman — or reverts to the grantor's estate, in which case the interest is a reversion.",
    {
      "A": "Un"
    }
  ],
  [
    "A periodic tenancy runs from period to period — month to month — and continues until one party gives notice. Michigan practice makes this the default when a tenant holds over with the landlord's consent.",
    {
      "A": "Un"
    }
  ],
  [
    "A tenancy at will exists with the owner's permission and no fixed term, terminable by either party with statutory notice.",
    {
      "A": "Un"
    }
  ],
  [
    "A tenancy at sufferance is what remains when a tenant stays after the right to possession ends. The holdover is not a trespasser — they entered lawfully — but has no estate, and the landlord's remedy is the summary proceeding in module 10.",
    {
      "A": "Una",
      "is what remains when a tenant stays after the right to possession ends. The holdover is not a trespasser — they entered lawfully — but has no estate, and the landlord's remedy is the summary proceeding in module 10.": "se produce cuando el arrendatario permanece después de extinguirse su derecho de posesión. No entró ilegalmente —su entrada fue legítima—, pero ya no tiene un derecho de arrendamiento; el remedio del arrendador es el procedimiento sumario del módulo 10."
    }
  ],
  [
    "A township is six miles square, containing 36 sections.",
    {
      "A": "Una",
      "township": "cuadrícula catastral (township)"
    }
  ],
  [
    "A section is one mile square and contains 640 acres.",
    {
      "A": "Una"
    }
  ],
  [
    "A cloud on title is any claim or apparent defect that impairs marketability. Clouds are cleared by corrective deeds, releases, affidavits, or by a quiet title action in court.",
    {
      "A": "Una"
    }
  ],
  [
    "A licence is permission to use land, revocable, and not an interest in land. The neighbour who has always cut across the corner may hold a licence rather than an easement, and the difference is the whole case.",
    {
      "A": "Una"
    }
  ],
  [
    "A nonconforming use is a use that was lawful before the ordinance changed and is allowed to continue, usually with limits on expansion and rules ending it if abandoned. This is the \"grandfathered\" situation, and whether a particular use retains protection is a legal question.",
    {
      "A": "Un"
    }
  ],
  [
    "A variance relieves an owner from a dimensional requirement where strict application would cause practical difficulty. A special land use or conditional use is a use the ordinance permits in a district subject to approval.",
    {
      "A": "Una",
      "variance": "excepción de zonificación",
      "relieves an owner from a dimensional requirement where strict application would cause practical difficulty. A": "dispensa al propietario de un requisito dimensional cuya aplicación estricta causaría dificultades prácticas. Un",
      "or conditional use is a use the ordinance permits in a district subject to approval.": "o uso condicionado es un uso que la ordenanza permite en un distrito previa aprobación."
    }
  ],
  [
    "A reasonable accommodation is a change in rules, policies, practices, or services necessary to give a person with a disability equal opportunity to use and enjoy a dwelling. The housing provider bears the cost of accommodating the policy change itself.",
    {
      "A": "Un",
      "reasonable accommodation": "ajuste razonable"
    }
  ],
  [
    "A reasonable modification is a physical change to the premises necessary for full enjoyment. In private housing the tenant ordinarily pays for it, and the provider may in appropriate cases require restoration of the interior at the end of the tenancy.",
    {
      "A": "Una",
      "is a physical change to the premises necessary for full enjoyment. In private housing the": "es un cambio físico del inmueble necesario para disfrutarlo plenamente. En la vivienda privada, el"
    }
  ],
  [
    "A short sale is a sale for less than the balance, requiring the lender's approval. Timelines are long and uncertain, approval is not guaranteed by any lender statement short of a written approval, and whether the borrower remains liable for the shortfall is a legal and tax question the licensee must not answer.",
    {
      "A": "Una"
    }
  ],
  [
    "A deed in lieu conveys the property to the lender to avoid foreclosure, and whether it extinguishes the debt is likewise a legal question.",
    {
      "A": "Una"
    }
  ],
  [
    "An easement appurtenant benefits a parcel — the dominant estate — and burdens another — the servient estate. It runs with the land, so both burden and benefit pass to new owners automatically. A driveway easement across a neighbour's land to reach a road is the standard example.",
    {
      "An": "Una",
      ". It runs with the land, so both burden and benefit pass to new owners automatically. A driveway easement across a neighbour's land to reach a road is the standard example.": ". Permanece vinculada al terreno, por lo que la carga y el beneficio pasan automáticamente a los nuevos propietarios. El ejemplo habitual es una servidumbre de acceso por el terreno vecino para llegar a una vía pública."
    }
  ],
  [
    "An easement in gross benefits a person or entity rather than a parcel. Utility easements are the everyday case.",
    {
      "An": "Una",
      "easement in gross": "servidumbre personal (easement in gross)"
    }
  ],
  [
    "An encroachment is a physical intrusion — a garage over the line, an eave, a fence. Encroachments are found by survey, and their legal consequences depend on how long they have been there and what the parties did about it.",
    {
      "An": "Una"
    }
  ],
  [
    "The promissory note is the promise to repay: amount, rate, term, payment, default terms. It is the debt.",
    {
      "The": "El"
    }
  ],
  [
    "The mortgage is the security instrument: it pledges the property as collateral and gives the lender the right to foreclose. It is recorded; the note is not.",
    {
      "The": "La",
      "is the security instrument: it pledges the property as collateral and gives the lender the right to foreclose. It is recorded; the note is not.": "es el instrumento de garantía: afecta el inmueble como garantía y otorga al prestamista el derecho de ejecutarla. Se registra; el pagaré no."
    }
  ],
  [
    "An associate broker has met the broker's qualification requirements — including the additional education and the experience — but works under another broker rather than operating a brokerage. Michigan distinguishes a principal associate broker, who holds supervisory responsibility, from a non-principal associate broker.",
    {
      "has met the broker's qualification requirements — including the additional education and the experience — but works under another broker rather than operating a brokerage. Michigan distinguishes a principal associate broker, who holds supervisory responsibility, from a non-principal associate broker.": "cumple los requisitos de cualificación del corredor —incluidas la formación adicional y la experiencia—, pero trabaja bajo otro corredor en lugar de dirigir su propia agencia. Michigan distingue entre el corredor asociado principal, con responsabilidades de supervisión, y el corredor asociado no principal."
    }
  ],
  [
    "An individual broker may operate a brokerage in their own name. A broker company licence covers a business entity, and each branch office is separately licensed.",
    {
      "individual broker": "corredor individual",
      "may operate a brokerage in their own name. A": "puede operar una agencia en su propio nombre. La licencia de",
      "licence covers a business entity, and each branch office is separately licensed.": "cubre una entidad empresarial y cada sucursal requiere una licencia separada."
    }
  ],
  [
    "An owner who begins acting for other owners has stepped outside. A developer selling its own units is a principal; the same developer marketing a neighbouring owner's units is not.",
    {
      "who begins acting for other owners has stepped outside. A developer selling its own units is a principal; the same developer marketing a neighbouring owner's units is not.": "que empieza a actuar para otros propietarios queda fuera de la exención. Un promotor que vende sus propias unidades actúa por cuenta propia; no ocurre lo mismo si comercializa las unidades de un propietario vecino."
    }
  ],
  [
    "An attorney in the ordinary practice of law is exempt. An attorney who opens a brokerage and advertises for listings is operating a real estate business and is not, in that capacity, practising law.",
    {
      "in the ordinary practice of law is exempt. An attorney who opens a brokerage and advertises for listings is operating a real estate business and is not, in that capacity, practising law.": "está exento cuando ejerce ordinariamente la abogacía. Si abre una agencia y se anuncia para captar encargos de venta, está operando un negocio inmobiliario y no ejerciendo la abogacía en esa capacidad."
    }
  ],
  [
    "The mortgage loan disclosure statement of Lesson 08 is a separate California requirement with its own timing.",
    {
      "The": "La"
    }
  ],
  [
    "A revised Loan Estimate may be provided, and the tolerance baseline reset, only where a valid reason exists. In outline:",
    {
      "A": "Una"
    }
  ],
  [
    "The mortgage loan disclosure statement has its own timing. Federal compliance does not satisfy it.",
    {
      "The": "La"
    }
  ],
  [
    "And the California layer is separate. The mortgage loan disclosure statement has its own timing, and satisfying the federal obligation does not satisfy it — treating the Loan Estimate as covering it is one of the most common findings in a DRE examination of a brokerage.",
    {
      "The": "La"
    }
  ],
  [
    "The mortgage loan disclosure statement is a California requirement with its own timing, stating the loan's costs and the broker's compensation from every source.",
    {
      "The": "La",
      "is a": "es un"
    }
  ],
  [
    "A prequalification rests on largely stated information and verifies nothing. A preapproval is a lender review of supporting information establishing a likely amount subject to conditions — not a commitment to lend. A commitment follows completed underwriting. None guarantees funding, and this letter reflects the weakest of the three while claiming the strongest.",
    {
      "A": "",
      "preapproval": "Una preaprobación",
      "commitment": "Un compromiso"
    }
  ],
  [
    "The product change is the serious item. A product change generally requires a new Closing Disclosure and a new waiting period. He must be told what it does to the closing date before he decides — never after.",
    {
      "A": "Un"
    }
  ],
  [
    "A preliminary report reports the condition of title as shown in the records and states the terms on which the title insurer would be willing to issue a policy, including its exceptions.",
    {
      "A": "Un"
    }
  ],
  [
    "A subordination agreement is generally required, because paying off and re-recording the first would otherwise move the second into first position. That is the second lienholder's decision with counsel — never \"standard\"",
    {
      "A": "Un"
    }
  ],
  [
    "Declining the owner's policy is not economizing on a duplicate. The lender's policy insures the lender's lien and its priority; the owner's policy insures his interest. They insure different interests, which is why both exist — and declining leaves his own interest uninsured.",
    {
      "The": "La",
      "; the": "; la"
    }
  ],
  [
    "The requirements are the more urgent section, not the less. An exception is a risk the policy will not insure against; an exclusion is a category outside the policy entirely; a requirement is something the insurer needs before issuing — a reconveyance, a resolution, authority evidence. Requirements carry the deadlines, and they are what delays closings.",
    {
      "An": "Una"
    }
  ],
  [
    "An escrow account — also called an impound account — is maintained by the servicer to pay property taxes and insurance, funded by an amount collected with each payment.",
    {
      "An": "Una"
    }
  ],
  [
    "The letter is a servicing transfer. The owner, the servicer, and the originator can be three different parties, and any of them can change. RESPA requires notice and provides a period in which payments sent to the prior servicer are treated as timely — the framework anticipates exactly this confusion. The note's terms do not change on a transfer.",
    {
      "The": "El",
      "and provides a": "y establece un",
      "The note's terms do not change on a transfer.": "Las condiciones del pagaré no cambian con la transferencia."
    }
  ],
  [
    "The break-even where points differ.",
    {
      "The": "El"
    }
  ],
  [
    "The APR, identified as a comparison tool with its assumptions.",
    {
      "The": "El"
    }
  ],
  [
    "A documented gap is a compliance problem a brokerage can survive. Findings are made, corrections are ordered, procedures change, and the firm continues.",
    {
      "A": "Un"
    }
  ],
  [
    "A manufactured document is falsification. It converts a defensible examination into a question about the integrity of every other file the brokerage has produced, and it ends careers.",
    {
      "A": "Un",
      "manufactured document": "documento falsificado"
    }
  ],
  [
    "The fixture tests. A fixture is an item that began as personal property and has become part of the real estate. When a sale contract is silent, fixtures pass with the deed and personalty stays with the seller — so the classification allocates real money. The common-law tests, applied by Texas courts and taught in every serious course, ask three questions:",
    {
      "A": "Un"
    }
  ],
  [
    "Money encumbrances — liens. A lien secures a debt: it gives the creditor the right, on default, to have the property sold and be paid from the proceeds. Property Code § 51.0001 gives the Texas vocabulary for the consensual kind: a security instrument is a deed of trust, mortgage, or other contract lien on an interest in real property; the mortgagor is the grantor of the security instrument (the borrower), the mortgagee its holder; a trustee or substitute trustee is the person authorised to exercise the power of sale. Liens are classified on two axes you should apply to every lien you meet:",
    {
      "A": "Un",
      "lien": "gravamen",
      "secures a debt: it gives the creditor the right, on default, to have the property sold and be paid from the proceeds. Property Code § 51.0001 gives the Texas vocabulary for the consensual kind: a": "asegura una deuda: le da al acreedor el derecho, en caso de incumplimiento, de que los bienes se vendan y se paguen con el producto. El Código de la Propiedad § 51.0001 da el vocabulario de Texas para el tipo consensual: un",
      "security instrument": "instrumento de garantía",
      "its holder; a": "su titular; un",
      "is the person authorised to exercise the power of sale. Liens are classified on two axes you should apply to every lien you meet:": "es la persona autorizada para ejercer el poder de venta. Los gravámenes se clasifican en dos ejes que debe aplicar a cada gravamen que conozca:"
    }
  ],
  [
    "A trust splits ownership into management and benefit. Property Code § 111.004(4) defines an express trust as a fiduciary relationship with respect to property which arises as a manifestation by the settlor of an intention to create the relationship and which subjects the person holding title to the property to equitable duties to deal with the property for the benefit of another person. Three roles: the settlor creates the trust and supplies the property; the trustee holds legal title, bound by fiduciary duties; the beneficiary holds the benefit. Section 111.003 trims the field: for the Texas Trust Code, \"trust\" means an express trust only — not resulting or constructive trusts (court-imposed remedies), not business trusts, and not a deed of trust, despite the name. That last exclusion untangles a Texas vocabulary knot once and for all: the deed of trust of Modules 03 and 08 is a mortgage instrument, not a trust in this sense; only the word is shared.",
    {
      "A": "Un"
    }
  ],
  [
    "A real estate investment trust (REIT) pools investor capital into a professionally managed portfolio of income properties or mortgages, with interests (shares) that — in the publicly traded form — restore the liquidity that direct ownership lacks: the investor holds real estate exposure in a brokerage account, sellable in a moment.",
    {
      "A": "Un"
    }
  ],
  [
    "A real estate mortgage investment conduit (REMIC) is the federal vehicle for mortgage securitisation: a pool of mortgages placed in a conduit entity that issues classes of interests to investors, who receive the pooled loans' cash flows. One federal section, read for this course, supplies the defining feature: under 26 U.S.C. § 860A, a REMIC is not itself subject to taxation — the entity level is transparent — and the income of the REMIC is taxable to the holders of interests in it. That single rule is why the structure exists: it lets mortgage pools pass income to investors without an entity-level tax, which made the modern secondary mortgage market's securitisation machinery possible.",
    {
      "A": "Un"
    }
  ],
  [
    "A contract is an agreement the law will enforce: a promise or exchange of promises with legal consequences for non-performance. Everything a licence holder touches runs on contracts — listing agreements, buyer representation agreements, sales contracts, leases, options — and the classifying vocabulary is the profession's grammar.",
    {
      "A": "Un"
    }
  ],
  [
    "A breach is an unexcused failure to perform a contractual duty when due. The law's responses:",
    {
      "A": "Un"
    }
  ],
  [
    "The note is the debt. A promissory note — Texas practice says real estate lien note when it is secured by realty — is the borrower's unconditional written promise to pay a sum certain, with interest, on stated terms. Its business anatomy is the licence holder's daily vocabulary: the principal; the interest rate (fixed for the term, or adjustable by index plus margin with caps); the term and maturity date; the payment schedule; late charges; the acceleration clause that makes the note's whole balance callable on default (the trigger the deed of trust's machinery waits for); and prepayment terms.",
    {
      "A": "Un",
      "late charges": "cargos por mora",
      "; the": "; la",
      "prepayment": "condiciones de pago anticipado",
      "terms.": ".",
      "interest rate": "tasa de interés"
    }
  ],
  [
    "A mortgage banker is a lender that does not take deposits. It has no reservoir of customer money. Instead it funds loans out of its own capital plus a short-term revolving line of credit — commonly called a warehouse line in the trade — and then sells the closed loans, usually within weeks, to replenish the line and fund the next batch. The distinction that matters is this: the mortgage banker is the lender. The note is made payable to the mortgage banker, the deed of trust names the mortgage banker, and the mortgage banker's money funds the closing. It then transfers that note to a purchaser.",
    {
      "A": "Un"
    }
  ],
  [
    "A mortgage broker is not a lender at all. A broker does not fund. A broker takes the borrower's application, assembles the file, and places it with a lender that will fund it, earning compensation for that intermediary service. Regulation X captures the distinction cleanly in the rule governing the settlement-cost booklet: \"If a borrower uses a mortgage broker, the mortgage broker shall distribute the special information booklet and the lender need not do so\" (12 C.F.R. § 1024.6(a)(1)). The regulation treats broker and lender as two different persons in the same transaction and assigns the disclosure duty to whichever of them is standing in front of the applicant.",
    {
      "A": "Un"
    }
  ],
  [
    "A balloon payment is a final payment substantially larger than the periodic payments preceding it, arising because the payment schedule was not designed to retire the debt over the term. A loan amortized on a thirty-year schedule but due in seven years will have twenty-three years of principal left outstanding when the note matures, and that remainder is the balloon. Balloons are not inherently abusive — they are ordinary in commercial lending — but on a home loan they place the borrower in a position of having to refinance or sell on a date fixed years in advance, regardless of what interest rates or property values are doing that month.",
    {
      "A": "Un"
    }
  ],
  [
    "A conventional loan is a mortgage loan that is not insured or guaranteed by a government agency. The lender bears the credit risk itself, subject to whatever private credit enhancement it obtains and to whatever representations it makes when it sells the loan.",
    {
      "A": "Un"
    }
  ],
  [
    "A VA-guaranteed loan is a loan made by a private lender to an eligible borrower under VA program rules, on which VA provides a guaranty: VA agrees to indemnify the lender for a portion of the loss on default. As with FHA, VA does not lend the money; a private lender does, and the government stands behind part of the lender's risk.",
    {
      "A": "Un",
      "is a loan made by a private lender to an eligible borrower under VA program rules, on which VA provides a": "es un préstamo realizado por un prestamista privado a un prestatario elegible bajo las reglas del programa de VA, en el que VA proporciona una",
      "guaranty": "garantía"
    }
  ],
  [
    "A contract for deed — in Texas statutory language, an executory contract for conveyance — is a seller-financed sale in which the buyer takes possession and pays the price in installments while the seller retains legal title until the price is paid. Texas regulates these contracts more heavily than almost any other financing device, because historically they were used to sell property to buyers who lost everything on a single missed payment.",
    {
      "A": "Un"
    }
  ],
  [
    "Comparable. A comparable — a \"comp\" — is a property similar enough to the subject in location, physical characteristics, use and conditions of sale that its transaction supplies reliable evidence of the subject's value. Three qualifiers do the real work. Similar enough is a matter of degree, and the degree is measured by how much adjustment the comparison requires: a sale needing $40,000 of gross adjustment on a $380,000 house is telling you it is not very comparable. Location in appraisal means the competing market area, which in Texas practice frequently means the same subdivision and even the same school attendance zone, since school boundaries can split a market in half across a single street. Conditions of sale means an arm's-length transaction: a foreclosure sale, a sale between family members, or a relocation-company sale is evidence of something, but not of market value, unless the market in question is itself a distressed market.",
    {
      "A": "Un"
    }
  ],
  [
    "Multiple listing services. A multiple listing service, or MLS, is a cooperative database through which participating brokerages share listing information and, historically, offers of cooperation and compensation among brokers. In Texas, MLSs are typically operated by or affiliated with local associations, and access is typically conditioned on the participant's membership in the operating organization and on payment of fees. Again: that is how the arrangement commonly works as a matter of private practice. No held source requires a license holder to participate in any MLS, and none dictates the terms on which an MLS operates.",
    {
      "A": "Un"
    }
  ],
  [
    "A property manager operates real property on behalf of someone else. The owner keeps the title, the equity and the risk; the manager supplies the time, the systems and the judgment. That sentence explains almost everything that follows, including why Texas regulates the work at all: because the manager acts for another person and does so for compensation, the manager stands in the position the Real Estate License Act was written to police. Start with the work, because the law only makes sense once you can see what a manager does in a week. The functions divide into seven streams.",
    {
      "A": "Un"
    }
  ],
  [
    "The Spanish measure survives. Texas surveying carries its civil-law history in its units: Natural Resources Code § 21.041(3) directs that field notes give the land \"by proper field notes with the necessary calls and connections for identification, observing the Spanish measurement by varas.\" A vara is the old Spanish yard used throughout Texas land records — treated in Texas practice as 33⅓ inches, so that 36 varas equal 100 feet — and old descriptions state distances in varas as a matter of course. A licence holder need not convert units professionally but must recognise them: a call of \"950 varas\" in an old deed is roughly 2,639 feet, and mistaking varas for feet misplaces a boundary by nearly two-thirds of its length.",
    {
      "A": "Una",
      "is the old Spanish yard used throughout Texas land records — treated in Texas practice as": "es la antigua unidad española de longitud usada en los registros de tierras de Texas — tratada en la práctica de Texas como",
      ", so that 36 varas equal 100 feet — and old descriptions state distances in varas as a matter of course. A licence holder need not convert units professionally but must recognise them: a call of \"950 varas\" in an old deed is roughly 2,639 feet, and mistaking varas for feet misplaces a boundary by nearly two-thirds of its length.": ", de modo que 36 varas equivalen a 100 pies — y viejas descripciones indican distancias en varas como cuestión de curso. Un titular de la licencia no necesita convertir unidades profesionalmente, pero debe reconocerlas: una distancia de \"950 varas\" en una antigua escritura es de aproximadamente 2,639 pies, y el error de varas por pies extravía un límite por casi dos tercios de su longitud."
    }
  ],
  [
    "A syndicate is any arrangement pooling multiple investors' capital into a real estate venture under central management — historically general or limited partnerships, today most often limited liability companies. The economics are straightforward: pooling buys scale (an apartment complex instead of a condo) and professional management; the investors take fractional interests and rely on the promoter.",
    {
      "A": "Una"
    }
  ],
  [
    "A deed is the instrument that conveys an interest in real property from grantor to grantee. Its statutory skeleton is short. Property Code § 5.021 — the Texas conveyancing statute you met in Module 06 — requires that a conveyance of an estate of inheritance, a freehold, or an estate for more than one year be in writing, subscribed (signed) by the conveyor or the conveyor's authorised agent, and delivered. Around that core, Texas practice expects: a competent, identifiable grantor whose name matches the record chain; an identifiable grantee; words of grant (Texas needs no magic formula — recall § 5.001's rule that a conveyance passes fee simple unless expressly limited, with no \"and his heirs\" required); an adequate legal description (Module 04); recital of consideration; and the grantor's acknowledgment before a notary — which, as the recording unit shows, is what qualifies the deed for the public records rather than what makes it valid between the parties.",
    {
      "A": "Una"
    }
  ],
  [
    "A fraction, a decimal and a percent are three notations for one quantity, and fluent movement among them is most of what real estate math asks of you. To convert a fraction to a decimal, divide the top number by the bottom: 3 ÷ 4 = 0.75. To convert a decimal to a percent, move the decimal point two places right and add the sign: 0.75 becomes 75%. To convert a percent back to a decimal, move two places left: 5.5% becomes 0.055. Committing a handful of equivalents to memory pays for itself daily — 1/2 = 0.5 = 50%, 1/4 = 0.25 = 25%, 3/4 = 0.75 = 75%, 1/3 = 0.3333 ≈ 33.33%, 2/3 = 0.6667 ≈ 66.67%, 1/5 = 0.2 = 20%, and 1/8 = 0.125 = 12.5%.",
    {
      "A": "Una",
      ", a": ", un",
      "and a": "y un"
    }
  ],
  [
    "A depository institution is one that takes deposits from the public and lends a portion of those deposits out. Commercial banks, savings institutions, and credit unions are depositories. The defining feature, for our purposes, is that a depository has its own balance sheet of customer deposits available as a funding source. It can originate a loan and fund it with money that is already sitting inside the institution, and if it chooses, it can keep that loan on its own books — hold it \"in portfolio\" — collect the payments itself, and never involve anyone else. When a depository holds a loan in portfolio it has originated, funded, and serviced the loan, and the borrower deals with one name from application through payoff.",
    {
      "A": "Una"
    }
  ],
  [
    "A wraparound is a seller-financed transaction in which the seller conveys the property and takes back a note for an amount that includes — wraps around — the balance of an existing loan that remains in place and in the seller's name. The buyer pays the seller on the wrap note; the seller continues paying the underlying lender.",
    {
      "A": "Una"
    }
  ],
  [
    "A buydown is an arrangement in which a party — most often the seller, sometimes a builder or the borrower — pays money at closing to reduce the borrower's interest rate, either for the loan's full term (a permanent buydown) or for an initial period (a temporary buydown). The funds are typically placed with the lender and applied to make up the difference between what the borrower pays and what the note requires.",
    {
      "A": "Una"
    }
  ],
  [
    "A reasonable modification, (f)(3)(A): \"a refusal to permit, at the expense of the handicapped person, reasonable modifications of existing premises occupied or to be occupied by such person if such modifications may be necessary to afford such person full enjoyment of the premises except that, in the case of a rental, the landlord may where it is reasonable to do so condition permission for a modification on the renter agreeing to restore the interior of the premises to the condition that existed before the modification, reasonable wear and tear excepted.\"",
    {
      "A": "Una"
    }
  ],
  [
    "A stigmatized property is one whose desirability is affected by something that happened in or near it rather than by anything wrong with the bricks and the plumbing: a death in the house, a prior occupant's illness, a crime, a rumour of a haunting. The physical condition is unimpaired; the market reaction is not. Texas addresses part of this territory by statute, and the statute is narrower than its reputation.",
    {
      "A": "Una"
    }
  ],
  [
    "An encumbrance is any right or interest held by someone other than the owner that burdens the property — diminishing its value or restricting its use — without preventing transfer. The owner can sell; the buyer takes subject to the encumbrance. Encumbrances divide cleanly in two.",
    {
      "An": "Una"
    }
  ],
  [
    "An adjustable-rate mortgage, or ARM, is a loan whose interest rate changes over the term according to a formula rather than remaining fixed. The formula has standard components, which are matters of loan-document drafting and market practice rather than of any statute held for this course: an index, a published rate that moves with market conditions; a margin, a fixed number of percentage points the lender adds to the index; the resulting fully indexed rate; an adjustment period stating how often the rate may change; and caps, which limit how far the rate may move at one adjustment and over the life of the loan. Many ARMs open with an initial rate lower than the fully indexed rate for a stated period.",
    {
      "An": "Una",
      ", a published rate that moves with market conditions; a": ", una tasa publicada que varía con las condiciones del mercado; un",
      ", a fixed number of percentage points the lender adds to the index; the resulting": ", un número fijo de puntos porcentuales que el prestamista añade al índice; la resultante",
      "fully indexed rate": "tasa totalmente indexada",
      "stating how often the rate may change; and": "que indica con qué frecuencia puede cambiar la tasa; y"
    }
  ],
  [
    "An assumption occurs when a buyer takes over the seller's existing loan, becoming obligated on the note and taking the property subject to the existing lien, instead of obtaining new financing. The attraction is obvious when the existing loan carries an interest rate below the current market: the buyer inherits the seller's rate and avoids the cost of originating a new loan.",
    {
      "An": "Una"
    }
  ],
  [
    "Assignment and subletting. An assignment transfers the tenant's entire remaining interest; a sublease transfers something less, leaving the original tenant as sublessor with a reversion of his own. Section 91.005 supplies a restrictive Texas default: during the term \"the tenant may not rent the leasehold to any other person without the prior consent of the landlord.\"",
    {
      "An": "Una",
      "transfers the tenant's entire remaining interest; a": "transfiere todo el interés restante del inquilino; un"
    }
  ],
  [
    "The zoning commission is the drafting body. Under § 211.007(a) the governing body of a home-rule municipality shall, and of a general-law municipality may, appoint one; it recommends the original district boundaries and the regulations for each district. Section 211.007(b) requires a preliminary report and at least one public hearing before a final report goes to the governing body, which \"may not take action on the matter until it receives the final report.\" Section 211.007(c) requires written notice, before the 10th day before the hearing, to each owner of real property within 200 feet of the property whose classification is proposed to change. Neighbors also have a formal lever: § 211.0061(b) allows a written protest signed by the owners of at least 20 percent of the area covered by the change or of the adjoining area extending 200 feet from it, and under § 211.0061(d) a validly protested change then needs the affirmative vote of at least three-fourths of all members of the governing body.",
    {
      "The": "La",
      "may": "podrá",
      ", appoint one; it recommends the original district boundaries and the regulations for each district. Section 211.007(b) requires a preliminary report and at least one public hearing before a final report goes to the governing body, which \"may not take action on the matter until it receives the final report.\" Section 211.007(c) requires written notice, before the 10th day before the hearing, to each owner of real property within 200 feet of the property whose classification is proposed to change. Neighbors also have a formal lever: § 211.0061(b) allows a written protest signed by the owners of at least 20 percent of the area covered by the change or of the adjoining area extending 200 feet from it, and under § 211.0061(d) a validly protested change then needs the affirmative vote of at least three-fourths of all members of the governing body.": ", designar una; recomienda los límites de distrito originales y las normas para cada distrito. La sección 211.007(b) requiere un informe preliminar y al menos una audiencia pública antes de que un informe final vaya al órgano de gobierno, que \"no podrá tomar medidas sobre el asunto hasta que reciba el informe final\". La sección 211.007(c) requiere un aviso por escrito, antes del 10 día antes de la audiencia, a cada propietario de bienes raíces a una distancia de hasta 200 pies de la propiedad cuya clasificación se propone cambiar. Los vecinos también tienen una palanca formal: § 211.0061(b) permite una protesta por escrito firmada por los propietarios de al menos 20 por ciento del área cubierta por el cambio o del área contigua que se extiende 200 pies de ella, y bajo § 211.0061(d) un cambio válidamente protestado entonces necesita el voto afirmativo de al menos tres cuartos de todos los miembros del cuerpo gobernante."
    }
  ],
  [
    "The Commission. The Texas Real Estate Commission is defined in § 1101.002(3) simply as \"the Texas Real Estate Commission,\" and it is built by subchapter B. Section 1101.051(a) provides that it \"consists of nine members appointed by the governor with the advice and consent of the senate,\" comprising \"six members who have been engaged in the brokerage business as licensed brokers as their major occupation for the five years preceding appointment\" and \"three members who represent the public.\" Members serve staggered six-year terms (§ 1101.055(a)) and are led by a presiding officer whom the governor designates from among the members who are licensed brokers (§ 1101.056(a)). Day-to-day operations belong to an executive director the Commission appoints, together with staff including a general counsel, attorneys and investigators (§ 1101.101), under a policy that \"clearly separate[s]\" policymaking from management (§ 1101.102).",
    {
      "The": "La"
    }
  ],
  [
    "The negotiability disclosure must be in \"conspicuous language\" and must say \"that broker compensation is not set by law and is fully negotiable.\" A comparable statement has long been required in listing contract forms the Commission adopts — § 1101.155(c)(1) — but the Commission has not adopted a buyer representation form, and § 1101.563(c)(2) reaches the agreement itself regardless of who drafted it. Put the sentence in, make it conspicuous, and do not bury it in a paragraph of recitals.",
    {
      "The": "La",
      "must be in \"conspicuous language\" and must say \"that broker compensation is not set by law and is fully negotiable.\" A comparable statement has long been required in listing contract forms the Commission adopts — § 1101.155(c)(1) — but the Commission has not adopted a buyer representation form, and § 1101.563(c)(2) reaches the agreement itself regardless of who drafted it. Put the sentence in, make it conspicuous, and do not bury it in a paragraph of recitals.": "debe estar en \"lenguaje claramente visible\" y debe decir \"que la compensación del corredor no está establecida por la ley y es totalmente negociable\".Una declaración comparable se ha requerido desde hace mucho tiempo en los formularios de contrato de representación para la venta que la Comisión adopta — § 1101.155(c)(1) — pero la Comisión no ha adoptado un formulario de representación del comprador, y § 1101.563(c)(2) llega al acuerdo en sí mismo, independientemente de quién lo redactó. Introducir la frase, hacerla visible, y no enterrarla en un párrafo de los considerandos."
    }
  ],
  [
    "The percent key. The % key is the most misleading key on the keypad because it does different things in different contexts, and often something other than what the user expects. On many calculators 200 × 6 % returns 12 — the key divided by 100 for you. On many of those same calculators, 200 − 6 % returns 188, because the key interpreted 6 as 6 percent of 200 and subtracted 12. On others, the same keystrokes return 194, because the key simply converted 6 to 0.06 and subtracted it. A common error is to assume the key behaves consistently. The safe practice is to never use it: convert the percentage to a decimal yourself by moving the decimal point two places left — 6% becomes 0.06, 5.5% becomes 0.055, 0.5% becomes 0.005 — and multiply. You lose nothing, and you always know what the machine did.",
    {
      "The": "La tecla",
      "key is the most misleading key on the keypad because it does different things in different contexts, and often something other than what the user expects. On many calculators": "es la más engañosa del teclado porque hace cosas distintas según el contexto, a menudo diferentes de lo que espera el usuario. En muchas calculadoras"
    }
  ],
  [
    "An interest-only payment plan requires the borrower to pay only the accrued interest for some period, so the principal balance does not decline at all. On the $250,000 at 6% above, the interest-only monthly payment is $250,000 × 0.005 = $1,250.00 — about $249 less than the amortizing payment — but after five years of such payments the balance is still exactly $250,000. Texas defines a product built on this structure: Finance Code § 343.001(1) defines a bridge loan as \"temporary or short-term financing requiring payment of only interest until the entire unpaid balance is due.\"",
    {
      "An": "Un plan de pago de",
      "interest-only": "solo intereses",
      "payment plan requires the borrower to pay only the accrued interest for some period, so the principal balance does not decline at all. On the $250,000 at 6% above, the interest-only monthly payment is $250,000 × 0.005 =": "requiere que el prestatario pague únicamente los intereses devengados durante un período, por lo que el saldo de capital no disminuye. En el ejemplo anterior de $250,000 al 6%, el pago mensual de solo intereses es $250,000 × 0.005 ="
    }
  ],
  [
    "A graduated payment plan starts with a payment lower than a fully amortizing payment and increases it on a predetermined schedule — typically each year for a set number of years — until it reaches a level that fully amortizes the remaining balance over the remaining term. The design serves a borrower who expects income to rise. The risk is structural: in the early years the scheduled payment may be less than the interest accruing, and when that happens the shortfall is added to the principal.",
    {
      "A": "Un plan de",
      "graduated payment": "pagos graduales",
      "plan starts with a payment lower than a fully amortizing payment and increases it on a predetermined schedule — typically each year for a set number of years — until it reaches a level that fully amortizes the remaining balance over the remaining term. The design serves a borrower who expects income to rise. The risk is structural: in the early years the scheduled payment may be less than the interest accruing, and when that happens the shortfall is added to the principal.": "comienza con un pago inferior al necesario para amortizar completamente el préstamo y lo aumenta según un calendario predeterminado —normalmente cada año durante un número fijo de años— hasta alcanzar un nivel que amortice el saldo pendiente durante el plazo restante. Este diseño sirve a un prestatario que espera mayores ingresos. El riesgo es estructural: durante los primeros años, el pago programado puede ser inferior a los intereses devengados; en ese caso, la diferencia se añade al capital."
    }
  ],
  [
    "Index lease and escalation clauses. An index lease adjusts rent periodically by reference to a published index, so rent moves with a measure of general price levels rather than by a flat negotiated step. An escalation clause more broadly is any provision raising rent on a stated trigger — a fixed annual step-up, an index adjustment, or a pass-through of increases in a defined expense. Texas law notices this last variety in one narrow place: Property Code § 92.332(a)(1) provides that a landlord is not liable for retaliation for \"increasing rent under an escalation clause in a written lease for utilities, taxes, or insurance.\" That provision does not authorize escalation clauses — the lease does — but it confirms that such a clause is a legitimate reason for a rent increase and not evidence of retaliation.",
    {
      "index lease": "arrendamiento indexado",
      "adjusts rent periodically by reference to a published index, so rent moves with a measure of general price levels rather than by a flat negotiated step. An": "ajusta periódicamente la renta según un índice publicado, de modo que varía con una medida del nivel general de precios en lugar de un aumento fijo negociado. Una",
      "escalation clause": "cláusula de aumento de renta",
      "more broadly is any provision raising rent on a stated trigger — a fixed annual step-up, an index adjustment, or a pass-through of increases in a defined expense. Texas law notices this last variety in one narrow place: Property Code § 92.332(a)(1) provides that a landlord is not liable for retaliation for \"increasing rent under an escalation clause in a written lease for utilities, taxes, or insurance.\" That provision does not authorize escalation clauses — the lease does — but it confirms that such a clause is a legitimate reason for a rent increase and not evidence of retaliation.": ", en términos más generales, es cualquier disposición que aumente el alquiler en un supuesto desencadenante: un incremento anual fijo, un ajuste del índice o una transferencia de aumentos en un gasto definido. La ley de Texas señala esta última variedad en un lugar estrecho: El Código de Propiedad § 92.332(a)(1) establece que un propietario no es responsable de represalias por \"aumentar el alquiler bajo una cláusula de aumento por servicios públicos, impuestos o seguros en un contrato de arrendamiento escrito\". Esa disposición no autoriza cláusulas de escalada —el contrato sí— pero confirma que tal cláusula es una razón legítima para un aumento de alquiler y no evidencia de represalias."
    }
  ],
  [
    "A reasonable accommodation, (f)(3)(B): \"a refusal to make reasonable accommodations in rules, policies, practices, or services, when such accommodations may be necessary to afford such person equal opportunity to use and enjoy a dwelling.\"",
    {
      "A": "Un",
      "reasonable accommodation": "ajuste razonable"
    }
  ],
  [
    "A universal agent is one authorised to do anything the principal may lawfully delegate — the broadest possible grant. A general agent is authorised to act for the principal in a continuing series of transactions of a particular kind, typically within an ongoing business or management relationship. A special agent is authorised for a single transaction or a narrow set of acts, with no power to bind the principal to anything.",
    {
      "A": "Un",
      "universal": "agente universal",
      "agent is one authorised to do anything the principal may lawfully delegate — the broadest possible grant. A": "está autorizado para hacer todo lo que el mandante puede delegar legalmente: la autorización más amplia posible. Un",
      "general": "agente general",
      "agent is authorised to act for the principal in a continuing series of transactions of a particular kind, typically within an ongoing business or management relationship. A": "está autorizado para actuar por el mandante en una serie continua de transacciones de un tipo determinado, normalmente dentro de una relación comercial o de administración vigente. Un",
      "special": "agente especial",
      "agent is authorised for a single transaction or a narrow set of acts, with no power to bind the principal to anything.": "está autorizado para una sola transacción o un conjunto limitado de actos, sin facultad para obligar al mandante."
    }
  ],
  [
    "The termination date requirement is not new in substance, and it has independent teeth. Occupations Code § 1101.652(b)(12) has long made it a disciplinary ground to fail \"to specify a definite termination date that is not subject to prior notice in a contract, other than a contract to perform property management services, in which the license holder agrees to perform services for which a license is required under this chapter\"; Module 10 teaches § 1101.652. Read the qualifier carefully, because it is the part students drop. The date must be definite, and it must be \"not subject to prior notice\" — meaning an agreement that runs until one side gives thirty days' notice does not satisfy the section. A buyer representation agreement is not a property management contract, so it needs a definite termination date, and now § 1101.563(c)(1)(B) requires the date to be stated in the writing as well.",
    {
      "The": "El requisito de una",
      "requirement is not new in substance, and it has independent teeth. Occupations Code § 1101.652(b)(12) has long made it a disciplinary ground to fail \"to specify a definite termination date that is not subject to prior notice in a contract, other than a contract to perform property management services, in which the license holder agrees to perform services for which a license is required under this chapter\"; Module 10 teaches § 1101.652. Read the qualifier carefully, because it is the part students drop. The date must be": "no es nuevo en su contenido y tiene consecuencias disciplinarias propias. El Código de Ocupaciones § 1101.652(b)(12) considera desde hace tiempo motivo de disciplina no «especificar una fecha definida de terminación que no esté sujeta a aviso previo en un contrato, salvo uno para prestar servicios de administración de propiedades, en el que el titular de licencia acuerda prestar servicios que requieren licencia conforme a este capítulo»; el Módulo 10 enseña § 1101.652. Lea cuidadosamente la condición, pues suele omitirse. La fecha debe ser"
    }
  ],
  [
    "The exclusive or non-exclusive clause tells the buyer whether they may engage another broker at the same time. Under an exclusive agreement, the buyer commits to work through your brokerage for the term; under a non-exclusive one, they do not. Neither is unlawful; the statute requires only that the agreement say which it is. There is a hard limit on exclusivity for one narrow kind of agreement, which we come to in a moment.",
    {
      "The": "La cláusula",
      "exclusive or non-exclusive": "exclusiva o no exclusiva",
      "clause tells the buyer whether they may engage another broker at the same time. Under an exclusive agreement, the buyer commits to work through your brokerage for the term; under a non-exclusive one, they do not. Neither is unlawful; the statute requires only that the agreement say which it is. There is a hard limit on exclusivity for one narrow kind of agreement, which we come to in a moment.": "indica al comprador si puede contratar simultáneamente a otro bróker. En un acuerdo exclusivo, se compromete a trabajar a través de su agencia durante el plazo; en uno no exclusivo, no. Ninguna modalidad es ilícita; la ley solo exige identificar cuál se utiliza. Existe un límite estricto a la exclusividad para un tipo específico de acuerdo que veremos enseguida."
    }
  ],
  [
    "The representation status clause is the hinge between § 1101.563 and § 1101.562. There are two boxes, and they are not both available in every case. If you are representing the buyer, the agreement says you represent the prospective buyer as the buyer's agent. The other box — \"does not represent the prospective buyer as the buyer's agent\" — is available only \"if the only act of real estate brokerage being performed is showing real property under Section 1101.562.\" That is a narrow gate. You may check the non-representation box only when showing is genuinely the only brokerage act you are performing for that person.",
    {
      "The": "La cláusula sobre la",
      "clause is the hinge between § 1101.563 and § 1101.562. There are two boxes, and they are not both available in every case. If you are representing the buyer, the agreement says you represent the prospective buyer as the buyer's agent. The other box — \"does not represent the prospective buyer as the buyer's agent\" — is available only \"if the only act of real estate brokerage being performed is showing real property under Section 1101.562.\" That is a narrow gate. You may check the non-representation box only when showing is genuinely the only brokerage act you are performing for that person.": "conecta § 1101.563 y § 1101.562. Hay dos casillas, pero no ambas están disponibles en todos los casos. Si representa al comprador, el acuerdo indica que representa al posible comprador como su agente. La otra casilla —«no representa al posible comprador como agente del comprador»— solo está disponible «si el único acto de corretaje inmobiliario realizado es mostrar el inmueble conforme al artículo 1101.562». Es una excepción limitada. Solo puede marcar esa casilla de no representación si mostrar el inmueble es realmente el único acto de corretaje que realiza para esa persona."
    }
  ],
  [
    "The compensation clause requires \"the amount or rate of compensation the broker will receive and how this amount will be determined.\" Both halves matter: the number or the rate, and the method. To be determined is not compliance. Three percent of the sales price states a rate and, read with a definition of sales price, states the method. We return to compensation at length in Unit 5.",
    {
      "The": "La cláusula de",
      "clause requires \"the amount or rate of compensation the broker will receive and how this amount will be determined.\" Both halves matter: the number or the rate, and the method.": "exige «la cantidad o tasa de remuneración que recibirá el bróker y cómo se determinará esa cantidad». Importan ambas partes: la cantidad o tasa y el método."
    }
  ],
  [
    "The seaward addendum 34-4 and coastal-area addendum 33-2 address different statutory geographic triggers and notices. Read Texas Natural Resources Code §§61.025 and 33.135 and the actual forms. One concerns property seaward of the Gulf Intracoastal Waterway and coastal/public-beach issues; the other concerns property adjoining or sharing a boundary with tidally influenced state waters. A view of the sea does not, by itself, establish either trigger.",
    {
      "The": "El",
      "seaward addendum 34-4": "anexo para propiedades del lado del mar 34-4",
      "and": "y el",
      "coastal-area addendum 33-2": "anexo de zona costera 33-2",
      "address different statutory geographic triggers and notices. Read Texas Natural Resources Code §§61.025 and 33.135 and the actual forms. One concerns property seaward of the Gulf Intracoastal Waterway and coastal/public-beach issues; the other concerns property adjoining or sharing a boundary with tidally influenced state waters. A view of the sea does not, by itself, establish either trigger.": "abordan diferentes supuestos geográficos legales y notificaciones. Lea el Código de Recursos Naturales de Texas §§61.025 y 33.135 y los formularios reales. Uno se refiere a propiedades del lado del mar de la Vía Intracostera del Golfo y a cuestiones costeras y de playas públicas; el otro, a propiedades contiguas o que comparten lindero con aguas estatales sujetas a las mareas. Una vista del mar, por sí sola, no establece ninguno de esos supuestos."
    }
  ],
  [
    "A real estate sales agent — § 13200 — is licensed to conduct brokerage activity on behalf of and under the supervision of an agency and its designated broker. A sales agent does not hold an independent licence, does not operate an agency, and does not supervise.",
    {
      "A": "Un"
    }
  ],
  [
    "A. The signature of the client to be charged. B. The terms and conditions of the brokerage services to be provided. C. The method or amount of compensation to be paid. D. The date upon which the agreement will expire. E. A statement that the agreement creates an agency-client relationship.",
    {
      "The": "",
      "signature of the client to be charged": "La firma del cliente frente al cual se pretende hacer valer el acuerdo",
      "terms and conditions": "Los términos y condiciones",
      "method or amount of compensation": "El método o importe de la remuneración",
      "date upon which the agreement will expire": "La fecha en que expirará el acuerdo"
    }
  ],
  [
    "A net listing is an arrangement under which the seller receives a fixed amount and the agency keeps everything above it. It creates a direct conflict between the agency's interest and the client's, and it is prohibited or restricted in most jurisdictions. The agency's written policy under § 13277 should address it, and the answer for a sales agent is that a net listing is never taken without the designated broker.",
    {
      "A": "Un",
      "written policy": "política escrita de la agencia"
    }
  ],
  [
    "A customer is a party to the transaction whom the agency does not represent. What is owed:",
    {
      "A": "Un"
    }
  ],
  [
    "A fixture was personal property and became real property by attachment. Once a fixture, it passes with the deed unless the contract says otherwise.",
    {
      "A": "Un"
    }
  ],
  [
    "A lot and block or recorded-plan description references a plan recorded at the Registry of Deeds: Lot 7 as shown on a plan entitled \"…\", recorded in the ___ County Registry of Deeds in Plan Book __, Page __. The plan itself carries the metes and bounds, the easements, and the surveyor's certification.",
    {
      "A": "",
      "lot and block": "Una descripción por lote y manzana"
    }
  ],
  [
    "A boundary survey is a licensed surveyor's determination of where the lines are on the ground, and it is the only thing that answers a boundary question.",
    {
      "A": "Un"
    }
  ],
  [
    "A mortgage loan inspection, sometimes called a mortgage inspection plan, is something else entirely: a limited drawing prepared for a lender to show, approximately, that the improvements sit within the apparent boundaries and outside easements. It is not a boundary survey, it is usually stamped to say so, and it does not establish a line.",
    {
      "A": "Una"
    }
  ],
  [
    "An estate is the degree, quantity, nature and extent of a person's interest in land. The primary division is freehold — of indefinite duration, involving ownership — and leasehold — of fixed or determinable duration, involving possession.",
    {
      "An": "Un"
    }
  ],
  [
    "A fee simple determinable ends automatically, and the grantor keeps a possibility of reverter. The language is durational — \"so long as\", \"while\", \"until\".",
    {
      "A": "Un"
    }
  ],
  [
    "A fee simple subject to a condition subsequent gives the grantor a right of re-entry that must be exercised. The language is conditional — \"but if\", \"provided that\", \"on condition that\".",
    {
      "A": "Un"
    }
  ],
  [
    "A life estate is measured by a life. The life tenant has full use and possession, may lease or convey what they have, and takes the income — but may not convey more than they own and may not commit waste, meaning they must not damage the property or let it deteriorate and must ordinarily pay taxes and interest on existing debt.",
    {
      "A": "Un"
    }
  ],
  [
    "A life estate pur autre vie is measured by someone else's life and is the one life estate that can be inherited — if the holder dies while the measuring life continues, the balance passes to the holder's heirs.",
    {
      "A": "Un"
    }
  ],
  [
    "An encumbrance is a claim or right held by someone other than the owner that affects title or limits use. Those affecting use are easements, restrictive covenants and encroachments; those affecting title as security for money are liens, and they belong to Hour 25.",
    {
      "An": "Una"
    }
  ],
  [
    "An easement is a non-possessory right to use another's land for a stated purpose, and it is an interest in land.",
    {
      "An": "Una"
    }
  ],
  [
    "An easement appurtenant benefits a parcel: the benefited parcel is the dominant tenement, the burdened one the servient tenement, and it runs with the land — it passes automatically to the next owner. Shared driveways, access to a back lot, and drainage are the everyday cases.",
    {
      "An": "Una"
    }
  ],
  [
    "An easement in gross benefits a person or entity rather than a parcel. Utility easements are the common example.",
    {
      "An": "Una",
      "easement in gross": "servidumbre personal"
    }
  ],
  [
    "A licence is revocable personal permission and is not an interest in land — the neighbour who has \"always\" crossed the corner usually has one, unless the use has ripened into a prescriptive easement, which is a legal determination on facts nobody in the conversation has established.",
    {
      "A": "Una"
    }
  ],
  [
    "An encroachment is an unauthorised physical intrusion across a line. It is found by survey, not by looking, and long-standing encroachments can mature into rights.",
    {
      "An": "Una"
    }
  ],
  [
    "A party wall is a shared wall on a boundary, each owner typically owning to the centre with an easement of support in the other half.",
    {
      "A": "Un"
    }
  ],
  [
    "A comprehensive plan is the municipality's long-range policy statement. Zoning is the ordinance that implements it and has legal force, dividing the municipality into districts and prescribing for each the permitted uses and the bulk controls — minimum lot size, frontage, setbacks, height, lot coverage, and often signage and parking.",
    {
      "A": "Un",
      "bulk": "parámetros dimensionales",
      "and the": "y los",
      "controls — minimum lot size, frontage, setbacks, height, lot coverage, and often signage and parking.": ": superficie mínima de parcela, longitud del frente, retiros, altura, ocupación del terreno y, a menudo, letreros y estacionamiento."
    }
  ],
  [
    "A variance relieves a dimensional requirement where strict application causes an undue hardship arising from the property itself — shape, topography, soils. It is granted by the board of appeals. A variance does not authorise a use the district forbids, and self-created hardship and mere financial disadvantage are not grounds. Maine's undue-hardship standard is set by statute and is applied strictly; it is a legal question and this course states no element of it.",
    {
      "A": "Una",
      "variance": "excepción de zonificación"
    }
  ],
  [
    "A conditional use permit or special exception authorises a use the ordinance lists as permissible subject to review and conditions. It is the ordinance operating as written, not an exception to it.",
    {
      "A": "Un"
    }
  ],
  [
    "A nonconforming use or nonconforming structure was lawful when established and became non-compliant on a later ordinance change. It may generally continue, typically may not be expanded, and may be lost on abandonment or destruction.",
    {
      "A": "Un"
    }
  ],
  [
    "A rezoning is an amendment to the ordinance itself and is a legislative act of the municipal legislative body.",
    {
      "A": "Una"
    }
  ],
  [
    "The certificate of occupancy, where the municipality issues one, is the document saying the building may lawfully be occupied.",
    {
      "The": "El"
    }
  ],
  [
    "A dimensional requirement",
    {
      "A": "Un",
      "dimensional": "requisito",
      "requirement": "dimensional"
    }
  ],
  [
    "The Land Use Planning Commission is the planning and zoning authority for Maine's unorganised and deorganised areas, plantations, and townships — roughly half the state's land area. Where the LUPC has jurisdiction, it performs the functions a municipality would.",
    {
      "The": "La"
    }
  ],
  [
    "The Department of Environmental Protection administers the state environmental permitting regimes that sit above municipal control.",
    {
      "The": "El"
    }
  ],
  [
    "A chain of title is the succession of recorded owners. A searcher works backward from the current owner and then forward again, checking each ownership period for liens and adverse instruments.",
    {
      "A": "Una"
    }
  ],
  [
    "A gap is a break — a conveyance out from someone who never appears as a grantee, often an unrecorded deed, an unrecorded probate, or a name change. A cloud is a recorded instrument or claim casting doubt without necessarily defeating title.",
    {
      "A": "Una"
    }
  ],
  [
    "An owner's policy insures the buyer for the purchase price; a lender's policy insures the lender for the loan amount, declining as it is repaid. A lender's policy does not protect the buyer, and a buyer who pays for one and declines the other has bought protection for someone else.",
    {
      "An": "Una"
    }
  ],
  [
    "A commitment carries Schedule A facts, Schedule B-I requirements — actions that must be completed before the policy issues — and Schedule B-II exceptions — risks the insurer declines, commonly including rights of parties in possession and matters an accurate survey would show. Exclusions are printed categories, including zoning and eminent domain.",
    {
      "A": "Un",
      "carries": "incluye los datos del",
      "Schedule A": "Anexo A",
      "facts,": ","
    }
  ],
  [
    "The § 173 disclosure statement as furnished, with every blank identified. The investigation prompt list, with an office named against every line. Written communication to the buyer of each item, with the contingency deadline stated. The licensee's own disclosures, and the section they were made under — § 13273 1 B (3) to a client, or § 13283 2 B to a buyer as a transaction broker. The referrals, with the person or office and the date. And the absence of any characterisation by the licensee of the condition, the legality, or the outcome of any of it.",
    {
      "The": "La",
      "Written": "Una comunicación escrita",
      "communication to the buyer of each item, with the contingency deadline stated. The": "al comprador de cada asunto, con el plazo de la condición contractual. Las"
    }
  ],
  [
    "The primary mortgage market is where loans are originated: banks, savings institutions, credit unions, mortgage bankers, and mortgage brokers. In Maine, credit unions and community banks originate a substantial share of residential lending, and small local institutions are more likely to hold loans in portfolio rather than sell them.",
    {
      "The": "El"
    }
  ],
  [
    "The secondary mortgage market is where originated loans are sold. Fannie Mae and Freddie Mac purchase conforming conventional loans; Ginnie Mae guarantees securities backed by government loans. Selling loans returns capital to the originator so it can lend again, and it is why underwriting guidelines exist at all: a loan that does not meet the purchaser's criteria cannot be sold.",
    {
      "The": "El"
    }
  ],
  [
    "A mortgage has two parties: the mortgagor, who is the borrower and who gives the mortgage, and the mortgagee, who is the lender.",
    {
      "A": "Una"
    }
  ],
  [
    "A deed of trust has three — borrower, trustee, and lender — and the trustee conducts a sale on default under a power of sale.",
    {
      "A": "Una"
    }
  ],
  [
    "A contract for deed — also called an installment land contract or bond for a deed — leaves legal title with the seller until payment is complete while the buyer takes possession and equitable title. Maine regulates these arrangements, and this course states no requirement from that regime because it has not been read from primary text for this project. A licensee who meets one routes it to counsel before anything is signed.",
    {
      "A": "Un"
    }
  ],
  [
    "The Federal Housing Administration insures loans made by approved lenders; it does not lend. Characteristic features: a low minimum down payment; more flexible credit and ratio criteria; mortgage insurance premiums, upfront and annual; maximum loan amounts that vary by county; and a requirement that the property meet minimum property standards and be appraised by an FHA-approved appraiser. FHA loans are for owner-occupants.",
    {
      "The": "La"
    }
  ],
  [
    "The Department of Veterans Affairs guarantees a portion of a loan made by an approved lender to an eligible veteran, service member, or surviving spouse. No down payment in many cases; no monthly mortgage insurance; a funding fee that varies and is waived in defined circumstances; entitlement established by a certificate of eligibility; a VA appraisal producing a notice of value; and occupancy requirements.",
    {
      "The": "El"
    }
  ],
  [
    "The US Department of Agriculture operates rural housing programmes, guaranteeing loans made by approved lenders and, in some programmes, lending directly. No down payment; geographic eligibility limited to designated rural areas defined by USDA maps that change; household income limits by area and household size; owner-occupancy; and guarantee and annual fees.",
    {
      "The": "El"
    }
  ],
  [
    "A payment factor is the monthly payment per $1,000 of loan at a given rate and term.",
    {
      "A": "Un"
    }
  ],
  [
    "A contract is a legally enforceable agreement. The vocabulary below is examined heavily and is worth learning precisely rather than approximately.",
    {
      "A": "Un"
    }
  ],
  [
    "An offer and an acceptance producing agreement on the essential terms. Assent must be genuine, and it is undermined by fraud, misrepresentation, mutual mistake, duress and undue influence — each of which makes the contract voidable at the injured party's option.",
    {
      "An": "Una",
      "and an": "y una"
    }
  ],
  [
    "A power of attorney must be in the correct form and must be recorded where the transaction requires it — again a matter for the attorney, and one that must be raised early, because a power of attorney discovered at the closing table is a delayed closing.",
    {
      "A": "Un"
    }
  ],
  [
    "An offer shows present intent to be bound, is communicated to the offeree, and states the essential terms definitely enough that a court could enforce them — parties, property, price, and the material terms.",
    {
      "An": "Una"
    }
  ],
  [
    "A contingency makes a duty conditional on a stated event. Three things can happen to it:",
    {
      "A": "Una"
    }
  ],
  [
    "A material breach defeats the purpose of the contract; a trivial failure is not one, and calling it a breach is itself a breach.",
    {
      "A": "Un"
    }
  ],
  [
    "A seller brokerage agreement — a listing — engages the agency to market and to seek a sale on the seller's terms, and triggers the § 13273 duties. It should record the property's inclusions and exclusions, the price and terms, the marketing authorised, whether the property is occupied by a tenant, and the seller's authority to sell.",
    {
      "A": "Un"
    }
  ],
  [
    "A buyer brokerage agreement engages the agency to seek property and triggers the § 13274 duties. Its recurring negotiating points are the geographic and property scope, the term, the compensation and how it is sourced, and whether it is exclusive.",
    {
      "A": "Un"
    }
  ],
  [
    "A lease is a conveyance and a contract, covered in Module 03.",
    {
      "A": "Un"
    }
  ],
  [
    "An option is a contract in which the optionor holds an offer open for a stated period in exchange for consideration. It is unilateral until exercised: the optionee may buy but is not obliged to. Consideration must actually pass, and the option should be recorded to bind successors.",
    {
      "An": "Una"
    }
  ],
  [
    "A right of first refusal is different and is frequently confused with an option. It gives the holder the right to match a bona fide offer the owner receives, and it is triggered by that offer rather than exercisable at will. Rights of first refusal appear in Maine condominium documents, in family land arrangements, and in shorefront covenants, and a listing licensee who discovers one must route it to counsel immediately — because marketing a property subject to an unexercised right of first refusal without addressing it produces a contract that may not be performable.",
    {
      "A": "Un"
    }
  ],
  [
    "A lease with option to purchase combines the two; lease-purchase obliges the tenant to buy. The difference is whether the tenant may or must, and it changes everything about the arrangement.",
    {
      "A": "Un"
    }
  ],
  [
    "An addendum is attached at the time of contracting and forms part of the original agreement. An amendment changes an existing contract and needs the assent of all parties. A contingency is neither; it is a condition.",
    {
      "An": "Una"
    }
  ],
  [
    "The § 13279 relationship disclosure form, delivered and recorded, for every buyer and seller of one-to-four-unit residential property. The appointed agent policy consent, in writing and in advance, where the agency practises appointed agency. The § 13177-A brokerage agreement, signed by the client to be charged, with the expiration date and the statement that it creates an agency-client relationship. The § 13275 disclosed dual agency consent, or the § 13278 written appointments, where the agency is on both sides. The 33 M.R.S. § 173 property disclosure statement. The federal lead-based paint package for pre-1978 target housing, with the signed acknowledgment. Every written offer and counteroffer, with date and time and evidence of presentation. The ratified agreement with every addendum referenced and attached, initialled where changed. The deposit receipt and evidence of delivery to the holder the agreement names. The deadline map, from the effective date.",
    {
      "The": "El",
      ". The": ". El"
    }
  ],
  [
    "The § 13279 relationship disclosure form to each of Buyer A and Buyer B, delivered and recorded. Evidence that every written offer and counteroffer was presented promptly, with date and time — § 13273 1 B (2). The § 13177-A brokerage agreement with the seller, in date and satisfying all five components. The federal lead-based paint package for the 1971 house, with the signed acknowledgment. The § 173 property disclosure statement, with its blanks identified. The deposit receipt and evidence of delivery. A record showing that the effective-date question was referred to counsel rather than decided by the licensee. And no record of the licensee characterising the consequences of Buyer B's waiver of the inspection contingency to Buyer B — because § 13283 3 B and 3 C prohibit exactly that.",
    {
      "The": "El"
    }
  ],
  [
    "A debit is a charge against a party; a credit is an amount in their favour. Each side's statement balances, and any prorated amount appears on both statements in opposite directions and to the penny.",
    {
      "A": "Un"
    }
  ],
  [
    "The deed is prepared by the attorney, executed by the seller, acknowledged before a notary, and delivered at closing. Title passes on delivery and acceptance; recording gives notice.",
    {
      "The": "La"
    }
  ],
  [
    "An owner's policy insures the buyer for the purchase price; a lender's policy insures the lender for the loan amount and declines as it is repaid. The lender's policy does not protect the buyer.",
    {
      "An": "Una"
    }
  ],
  [
    "The Loan Estimate is delivered shortly after application and sets out the loan terms, projected payments, costs at closing, and cash to close, with the sections a consumer can compare between lenders.",
    {
      "The": "La"
    }
  ],
  [
    "The Closing Disclosure must be received by the borrower a defined period before consummation, and it states the final terms and costs. Certain changes — including a change in loan product — re- start that period.",
    {
      "The": "La"
    }
  ],
  [
    "The sale price on the disclosure against the ratified agreement and every amendment. The seller credit actually appearing, in the agreed amount. Prorations matching the convention the contract specified, including the municipal fiscal year. The deposit credited. Repairs agreed by amendment reflected where the parties agreed they would be. The loan type and amount matching the financing contingency the buyer's protection rests on. The payoff and its good-through date on the seller's side.",
    {
      "The": "El"
    }
  ],
  [
    "The federal Fair Housing Act — Title VIII of the Civil Rights Act of 1968, amended in 1974 and 1988 — prohibits discrimination in the sale, rental and financing of dwellings on the basis of race, colour, religion, national origin, sex, familial status, and disability. Seven classes.",
    {
      "The": "La"
    }
  ],
  [
    "The Civil Rights Act of 1866 is older, narrower and in one respect stronger: it prohibits racial discrimination in the sale or lease of all property and, as the Supreme Court held in Jones v. Alfred H. Mayer Co. (1968), carries no exemptions. A transaction exempt from the Fair Housing Act is not exempt from the 1866 Act where the discrimination is racial.",
    {
      "The": "La",
      "is older, narrower and in one respect stronger: it prohibits": "es más antigua, tiene un alcance más limitado y en un aspecto es más fuerte: prohíbe la discriminación",
      "racial": "racial",
      "discrimination in the sale or lease of all property and, as the Supreme Court held in": "en la venta o arrendamiento de cualquier propiedad y, como sostuvo el Tribunal Supremo en"
    }
  ],
  [
    "The ADA governs places of public accommodation and commercial facilities. A real estate office open to the public is one; so is a leasing office. Employment provisions apply to employers of the covered size.",
    {
      "The": "La"
    }
  ],
  [
    "The Sherman Act prohibits agreements in restraint of trade, and four patterns reach real estate licensees directly:",
    {
      "The": "La"
    }
  ],
  [
    "The Foreign Investment in Real Property Tax Act requires a buyer to withhold a percentage of the amount realised on the purchase of a US real property interest from a foreign person, and to remit it. The buyer — not the seller — is the withholding agent, which is why the buyer's side must know about it.",
    {
      "The": "La"
    }
  ],
  [
    "The final examination is eighty questions, delivered across Hours 53, 54 and 55, after all instruction and both case studies are complete. The passing grade is 75 percent, and that figure is the Commission's. Assessment minutes are recorded separately and count toward no topic allocation.",
    {
      "The": "El"
    }
  ],
  [
    "Maine's protected-class list is deliberately not printed. The Maine Human Rights Act, 5 M.R.S. ch. 337, has not been read from primary text for this project, and Hour 51.5 states that Maine's list is broader than the federal seven, names the Act and the enforcing commission, and instructs the licensee to read the current list directly. A protected-class list is the single worst thing for a course to approximate: legislatures amend them, and a licensee relying on a remembered version is relying on a list that may have changed. Any instructor supplementing this hour with the list must read 5 M.R.S. ch. 337 first, and must date the reading.",
    {
      "The": "La"
    }
  ],
  [
    "A conveyance of a possessory interest for a term, and a contract of covenants. That dual nature is why a lease dispute can be framed as a breach of contract or as an interference with possession, and why the covenant of quiet enjoyment matters as much as any written clause.",
    {
      "A": "Un"
    }
  ],
  [
    "The third party is what makes the shortcut possible. A trustee holds the security for the beneficiary's benefit and can conduct a sale without a lawsuit.",
    {
      "A": "Un"
    }
  ],
  [
    "A licensed or certified appraiser",
    {
      "A": "Un"
    }
  ],
  [
    "A broker",
    {
      "A": "Un"
    }
  ],
  [
    "A debit is an amount a party owes. A credit is an amount a party has coming.",
    {
      "A": "Un",
      ". A": ". Un",
      "credit": "crédito"
    }
  ],
  [
    "A fixture is an item that was personal property and became real property by attachment. Once a fixture, it passes with the deed unless the contract says otherwise.",
    {
      "A": "Un"
    }
  ],
  [
    "A salesperson is licensed to provide brokerage services associated with a firm. The salesperson's authority is derived from the firm's licence, and the firm's duties are what the salesperson's conduct satisfies or breaches.",
    {
      "A": "Un"
    }
  ],
  [
    "(2) Misrepresentation. A client is not liable for a misrepresentation made in connection with the provision of brokerage services by the firm or a licensee associated with it — unless the client knows or should have known of it, or the firm or licensee is repeating a misrepresentation made by the client. And a firm that retains another firm as a subagent is not liable for the subagent's misrepresentation unless it knew or should have known, or the subagent is repeating a misrepresentation the firm made. Nothing in the subsection limits a firm's responsibility under s. 452.12(3) for misrepresentations by its own associated licensees, nor a client's liability for their own misrepresentation.",
    {
      "A": "Un",
      "(2) Misrepresentation.": "(2) Tergiversación."
    }
  ],
  [
    "A subagent owes all parties to whom it provides brokerage services the sub. (1) duties — the seven — but does not owe the principal firm's clients the sub. (2) duties.",
    {
      "A": "Un"
    }
  ],
  [
    "A listing contract is the agency agreement between a seller and a firm. It is what makes the seller a client rather than a party, and it is therefore what triggers the additional duties in § 452.133(2) on top of the seven owed to everyone.",
    {
      "A": "Un",
      "is the agency agreement between a seller and a": "es el acuerdo de agencia entre un vendedor y una",
      ". It is what makes the seller a": ". Es lo que convierte al vendedor en un"
    }
  ],
  [
    "A fee simple determinable ends automatically when the event occurs, and the grantor retains a possibility of reverter. The language is durational — \"so long as\", \"while\", \"until\".",
    {
      "A": "Un",
      "when the event occurs, and the grantor retains a": "cuando ocurre el hecho y el otorgante conserva una"
    }
  ],
  [
    "A life estate is a freehold measured by a life. The life tenant has full use and possession, takes the income, and may convey what they hold — but may not convey more than they own and may not commit waste: they must not damage the property or let it deteriorate, and ordinarily must pay taxes and interest on existing debt.",
    {
      "A": "Un",
      "life estate": "derecho vitalicio",
      "is a freehold measured by a life. The": "es un derecho de dominio cuya duración se mide por una vida. El"
    }
  ],
  [
    "A life estate pur autre vie is measured by another's life and is the one life estate that can be inherited while the measuring life continues.",
    {
      "A": "Un",
      "life estate pur autre vie": "derecho vitalicio pur autre vie"
    }
  ],
  [
    "In a trust, the trustee holds legal title and manages; the beneficiary takes the benefit. The trustee signs. A revocable living trust is a common way to hold a residence.",
    {
      "A": "Un",
      "In a": "En un"
    }
  ],
  [
    "A township is the six-mile square where a tier and a range intersect — 36 square miles.",
    {
      "A": "Un",
      "township": "township (cuadrícula de levantamiento)",
      "is the six-mile square where a tier and a range intersect —": "es el cuadrado de seis millas de lado en el que se cruzan una fila y una columna del sistema de levantamiento: "
    }
  ],
  [
    "A lien is a charge against property securing payment of a debt or performance of an obligation. It is an encumbrance on title, and it gives the holder the right to force a sale if the obligation is not met.",
    {
      "A": "Un"
    }
  ],
  [
    "Voluntary or involuntary. A voluntary lien is created deliberately by the owner — in Wisconsin, most commonly a mortgage. An involuntary lien arises by operation of law: tax liens, judgment liens, construction liens.",
    {
      "A": "Un",
      "voluntary": "gravamen voluntario",
      "lien is created deliberately by the owner — in Wisconsin, most commonly a": "es creado deliberadamente por el propietario; en Wisconsin, suele ser una",
      ". An": ". Un",
      "involuntary": "gravamen involuntario",
      "lien arises by operation of law: tax liens, judgment liens, construction liens.": "surge por disposición de la ley: gravámenes fiscales, judiciales y por obras."
    }
  ],
  [
    "General or specific. A general lien attaches to all of the debtor's property within the jurisdiction — judgment liens, federal and state tax liens, estate tax liens. A specific lien attaches to one identified parcel — the mortgage, the property tax lien, the construction lien, the special assessment.",
    {
      "A": "Un",
      "general": "gravamen general",
      "lien attaches to": "recae sobre",
      "specific": "gravamen específico",
      "of the debtor's property within the jurisdiction — judgment liens, federal and state tax liens, estate tax liens. A": "los bienes del deudor dentro de la jurisdicción: gravámenes judiciales, fiscales federales y estatales y del impuesto sucesorio. Un"
    }
  ],
  [
    "Relation back. A construction lien's priority is measured from a date tied to the commencement of the work rather than from filing, so a lien filed after closing can outrank a mortgage recorded before it. Hour 26.",
    {
      "A": "La prioridad de un",
      "'s priority is measured from a date tied to the commencement of the work rather than from filing, so a lien filed after closing can outrank a mortgage recorded before it. Hour 26.": " se determina desde una fecha vinculada al comienzo de los trabajos, y no desde su presentación; por ello, un gravamen presentado después del cierre puede tener prioridad sobre una hipoteca inscrita antes. Hora 26.",
      "Relation back.": "Retroacción de la prioridad."
    }
  ],
  [
    "A judgment lien arises when a court judgment is docketed and attaches to the debtor's real property in that county. It is general and involuntary, and — importantly — it attaches to property the debtor acquires later as well as property owned at the time.",
    {
      "A": "Un"
    }
  ],
  [
    "A contract is a legally enforceable agreement. Four elements are required, and a fifth practical requirement attaches to contracts concerning land.",
    {
      "A": "Un"
    }
  ],
  [
    "A material breach defeats the purpose of the contract. A trivial failure is not one, and calling a trivial failure a breach is itself a breach.",
    {
      "A": "Un"
    }
  ],
  [
    "A buyer agency agreement is the agency agreement that makes a buyer a client rather than a party. Without it, the buyer is a customer owed the seven duties in § 452.133(1) — which is a substantial list, but not representation.",
    {
      "A": "Un",
      "is the agency agreement that makes a buyer a": "es el acuerdo de agencia que convierte al comprador en un"
    }
  ],
  [
    "A right of first refusal is a different instrument frequently confused with an option: it gives the holder the right to match a bona fide offer the owner receives, and it is triggered by that offer rather than exercisable at will. Rights of first refusal appear in Wisconsin condominium documents, family land arrangements and lake association covenants, and a listing licensee who discovers one routes it to counsel immediately.",
    {
      "A": "Un"
    }
  ],
  [
    "A debit is a charge against a party; a credit is an amount in their favour. Each side's statement balances, and any prorated amount appears on both statements, in opposite directions, to the penny.",
    {
      "A": "Un",
      "credit": "crédito",
      "is an amount in their favour. Each side's statement balances, and any": "es una cantidad a su favor. El estado de cuenta de cada parte debe cuadrar, y todo",
      "prorated amount appears on both statements, in opposite directions, to the penny.": "importe prorrateado aparece en ambos estados de cuenta, con efectos opuestos y exactitud al centavo."
    }
  ],
  [
    "A testator disposes of real property by devise to a devisee. A will is effective only on death and only if admitted to probate, and until then the intended devisee owns nothing.",
    {
      "A": "Un",
      "to a": "a un"
    }
  ],
  [
    "A land contract — the rule gives it its own paragraph, and Wisconsin uses them substantially more than most states — is a financing structure in which the seller finances the purchase directly.",
    {
      "A": "Un",
      "— the rule gives it its own paragraph, and Wisconsin uses them substantially more than most states — is a financing structure in which the": "—la norma le dedica un párrafo propio y Wisconsin los utiliza mucho más que la mayoría de los estados— es una estructura de financiación en la que el"
    }
  ],
  [
    "A net listing is an arrangement in which the seller receives a fixed sum and the firm keeps the excess as its compensation. REEB 24.10 strictly prohibits net listings. It is not merely a matter to take to the supervising broker for consent, and the seller's proposal or informed agreement does not remove the prohibition. Use a lawful negotiated compensation arrangement instead.",
    {
      "A": "Un"
    }
  ],
  [
    "A conditional use permit authorises a use the ordinance lists as permissible subject to review and conditions. It is the ordinance operating as written, not an exception to it.",
    {
      "A": "Un"
    }
  ],
  [
    "A nonconforming use or structure was lawful when established and became non-compliant on a later ordinance change. It may generally continue, typically may not be expanded, and may be lost on abandonment or destruction.",
    {
      "A": "Un",
      "was lawful when established and became non-compliant on a later ordinance change. It may generally continue, typically may not be": "era legal cuando se estableció y dejó de ajustarse a la normativa tras una modificación posterior de la ordenanza. Generalmente puede continuar, pero normalmente no puede ser"
    }
  ],
  [
    "A title search discloses what the public record holds against the parcel: deeds of trust and other liens, easements, restrictive covenants, plat notes and dedications, judgments, and assessments.",
    {
      "A": "Una"
    }
  ],
  [
    "Students merge the first three constantly. A variance asks for an exception; a conditional use asks for something the rule already allows on conditions; a nonconforming use asks for nothing, because it was there first.",
    {
      "A": "Una",
      "asks for an exception; a": "solicita una excepción; un",
      "asks for something the rule already allows on conditions; a": "solicita algo que la norma ya permite bajo condiciones; un"
    }
  ],
  [
    "Fee applies; the defining feature is the possibility of no down payment. A VA release of liability does not by itself release the original borrower from liability to the lender** — that takes the lender's own release.",
    {
      "A": "Una",
      "VA release of liability does not by itself release the original borrower from liability to the lender** — that takes the lender's own release.": "exoneración de responsabilidad de VA no libera por sí sola al prestatario original de su responsabilidad ante el prestamista**; para ello se requiere la liberación otorgada por el propio prestamista."
    }
  ],
  [
    "Closed sales only. A current listing is what a seller hopes for; a pending sale has not yet survived appraisal, financing or inspection. Neither is evidence of what a buyer paid.",
    {
      "A": "Una",
      "; a": "; una",
      "pending sale has not yet survived appraisal, financing or inspection.": "venta pendiente aún no ha superado la tasación, la financiación o la inspección."
    }
  ],
  [
    "A home warranty or residential service contract is a contract, not insurance. It covers repair or replacement of specified systems and appliances, subject to exclusions, coverage caps, service fees, and pre-existing condition provisions.",
    {
      "A": "Una"
    }
  ],
  [
    "A licence is revocable personal permission and is not an interest in land. The neighbour who has \"always\" crossed the corner usually holds one — unless the use has ripened into a prescriptive easement, which is a legal determination on facts nobody in the conversation has established.",
    {
      "A": "Una",
      "is revocable personal permission and is": "es un permiso personal revocable y",
      "not": "no constituye"
    }
  ],
  [
    "A survey is a licensed surveyor's determination of where the boundaries are on the ground, and it is the only thing that answers a boundary question. It finds what a title search cannot: encroachments, structures over setback lines, fences that do not follow the line, and a septic field on the wrong parcel.",
    {
      "A": "Una"
    }
  ],
  [
    "A counter-offer rejects the offer and makes a new one, incorporating the original by reference and changing stated terms. It has its own binding acceptance deadline, and — this is the point students miss — the original offer is dead the moment the counter is delivered.",
    {
      "A": "Una",
      "rejects the offer and makes a new one, incorporating the original by reference and changing stated terms. It has its own": "rechaza la oferta y formula una nueva, incorporando la original por referencia y modificando los términos indicados. Tiene su propio plazo de",
      "deadline, and — this is the point students miss —": "y —este es el punto que suele pasarse por alto—"
    }
  ],
  [
    "A notice is a one-sided communication the contract authorises a party to give — typically to exercise, satisfy or waive a contingency, or to trigger a right.",
    {
      "A": "Una"
    }
  ],
  [
    "A chain of title is the succession of recorded owners. A searcher works backward from the current owner and forward again, checking each ownership period for liens and adverse instruments.",
    {
      "A": "Una"
    }
  ],
  [
    "A gap is a break — a conveyance out from someone who never appears as a grantee. In Wisconsin the usual causes are an unprobated estate, an unrecorded deed, or a name change.",
    {
      "A": "Una"
    }
  ],
  [
    "A cloud is a recorded instrument or claim casting doubt on title without necessarily defeating it — an unreleased mortgage, an old judgment, an ambiguous easement, a defective acknowledgment, a deed from one of several heirs.",
    {
      "A": "Una"
    }
  ],
  [
    "A pre-qualification is an informal estimate from unverified information. A pre-approval rests on a submitted application, verified documentation, and usually a conditional underwriting decision. A seller evaluating offers is entitled to know which is in front of them, and a licensee who lets one be presented as the other has misrepresented their buyer's position — a § 452.133(1)(a) honesty problem before it is anything else.",
    {
      "A": "Una",
      "is an informal estimate from unverified information. A": "es una estimación informal basada en información no verificada. Una"
    }
  ],
  [
    "A mortgage has two parties: the mortgagor, the borrower who gives the mortgage, and the mortgagee, the lender.",
    {
      "A": "Una",
      "parties: the": "partes: el"
    }
  ],
  [
    "A deed of trust has three — borrower, trustee and lender — and the trustee conducts a sale under a power of sale. Wisconsin does not use it. A student who learned \"grantor, trustee, beneficiary\" from a national text, or from this project's Virginia course, must translate.",
    {
      "A": "Una"
    }
  ],
  [
    "A variance relieves a dimensional requirement where strict application causes unnecessary hardship arising from the property itself — shape, topography, soils. It is granted by the board of adjustment or appeals. A variance does not authorise a use the district forbids, and self-created hardship and mere financial disadvantage are not grounds. Wisconsin's unnecessary-hardship standard is applied strictly, and this course states no element of it.",
    {
      "A": "Una",
      "arising from the property itself — shape, topography, soils. It is granted by the": "que surgen de la propia propiedad: forma, topografía o suelos. La concede la"
    }
  ],
  [
    "A rezoning amends the ordinance itself and is a legislative act of the governing body.",
    {
      "A": "Una",
      "amends the ordinance itself and is a": "modifica la propia ordenanza y constituye un acto",
      "legislative": "legislativo",
      "act of the governing body.": "del órgano de gobierno."
    }
  ],
  [
    "A trust account is an account maintained by a firm at a financial institution, separate from the firm's own operating funds, into which money belonging to others and received in connection with real estate transactions is deposited.",
    {
      "A": "Una"
    }
  ],
  [
    "An address identifies a mailbox. A tax parcel number identifies an assessment record. Neither describes land.",
    {
      "An": "Una",
      "identifies a mailbox. A": "identifica un buzón. Un"
    }
  ],
  [
    "An offer is a manifestation of willingness to be bound on stated terms. It may be revoked at any time before acceptance, unless consideration was given to hold it open — which is what an option is.",
    {
      "An": "Una",
      "is a manifestation of willingness to be bound on stated terms. It may be": "es una manifestación de voluntad de quedar obligado según condiciones establecidas. Puede ser"
    }
  ],
  [
    "An encumbrance is a claim, right or interest held by someone other than the owner that affects title or limits use. Encumbrances travel with the land and do not prevent transfer.",
    {
      "An": "Una"
    }
  ],
  [
    "An easement appurtenant benefits a parcel: the benefited parcel is the dominant tenement, the burdened one the servient tenement, and it runs with the land, passing automatically to the next owner whether or not anyone mentions it. Shared driveways, access to a back lot, and drainage are the everyday cases.",
    {
      "An": "Una",
      "benefits a parcel: the benefited parcel is the": "beneficia a una parcela: la parcela beneficiada es el"
    }
  ],
  [
    "An easement in gross benefits a person or entity rather than a parcel — utility easements being the common example, and commercial easements in gross being assignable.",
    {
      "An": "Una",
      "benefits a person or entity rather than a parcel — utility easements being the common example, and commercial easements in gross being assignable.": "beneficia a una persona o entidad en lugar de a una parcela; las servidumbres para servicios públicos son el ejemplo habitual y las servidumbres personales comerciales pueden cederse."
    }
  ],
  [
    "An encroachment is an unauthorised physical intrusion across a boundary. It is found by survey, not by looking, and long-standing encroachments can mature into rights.",
    {
      "An": "Una"
    }
  ],
  [
    "An offer shows present intent to be bound, is communicated to the offeree, and states the essential terms definitely enough that a court could enforce them.",
    {
      "An": "Una"
    }
  ],
  [
    "An amendment changes an existing contract and requires the assent of all parties. It is not created by the other agent saying \"that's fine\", and it is not created by conduct.",
    {
      "An": "Una"
    }
  ],
  [
    "An option is a contract in which the optionor holds an offer open for a stated period in exchange for consideration. It is unilateral until exercised: the optionee may buy but is not obliged to.",
    {
      "An": "Una",
      ". It is": ". Es"
    }
  ],
  [
    "An owner's policy insures the buyer's interest for the purchase price, for as long as the insured or their heirs hold an interest. A loan policy insures the lender's security interest for the loan amount, declining as it is repaid.",
    {
      "An": "Una",
      "insures the buyer's interest for the purchase price, for as long as the insured or their heirs hold an interest. A": "asegura el interés del comprador por el precio de compra mientras el asegurado o sus herederos conserven un interés. Una"
    }
  ],
  [
    "An adjustable rate moves with an index plus a fixed margin, bounded by an initial cap, a periodic cap, and a lifetime cap. The question that matters is not the start rate but the payment at the caps.",
    {
      "An": "Una",
      "moves with an": "varía según un",
      "plus a fixed": "más un",
      "margin": "margen fijo",
      ", bounded by an": ", limitada por un",
      ", a": ", un",
      ", and a": ", y un"
    }
  ],
  [
    "The primary market is where a loan is made — banks, credit unions, savings institutions, mortgage banking companies and mortgage brokers. The secondary market is where a loan already made is bought — Fannie Mae, Freddie Mac and Ginnie Mae — through loan pooling and mortgage-backed securities.",
    {
      "The": "El",
      "made": "originado",
      "— banks, credit unions, savings institutions, mortgage banking companies and mortgage brokers. The": "—bancos, cooperativas de crédito, entidades de ahorro, compañías de banca hipotecaria y brókeres hipotecarios—. El",
      "is where a loan is": "es donde un préstamo es",
      "is where a loan already made is": "es donde un préstamo ya originado es"
    }
  ],
  [
    "Eleven items, delivered as in Module WA-F-01. Every rate, factor and payment used in any item is supplied inside the item as a given. The 80 percent engagement threshold and the 100 percent applied threshold are StateCourse standards.",
    {
      "The": "El umbral de",
      "engagement threshold and the": "de participación y el umbral de",
      "applied threshold are": "de aplicación práctica son"
    }
  ],
  [
    "No form provision, pamphlet wording, or agreement clause is stated in this module. The 60-day buyer default term, the checkbox requirement, the separately-initialed consent, the \"Agency Disclosure\" heading, both pamphlet timing rules and the subpoena-or-court-order confidentiality exception are all transcribed from RCW 18.86.",
    {
      "The": "El",
      ", the": ",",
      "60-day buyer default term": "plazo predeterminado de 60 días para el comprador",
      "checkbox requirement": "el requisito de marcar la casilla",
      "separately-initialed consent": "el consentimiento rubricado por separado",
      "\"Agency Disclosure\" heading": "el encabezado \"Agency Disclosure\"",
      ", both": ", ambas",
      "and the": "y la"
    }
  ],
  [
    "The water softener and iron filter and the propane tank raise a different question: ownership. Each is frequently leased or rented rather than owned, and a leased item is not the seller's to convey. The lease must be produced and the arrangement — assignment, termination, or exclusion — written into the offer.",
    {
      "The": "El",
      "and the": "y el",
      "raise a different question:": "plantean una cuestión diferente:",
      ". Each is frequently": ". Cada uno suele estar",
      "leased or rented": "arrendado o alquilado"
    }
  ],
  [
    "The Real Estate Condition Report under ch. 709 is the seller's statement about the property. It is a Board-recognised disclosure form and it is completed by the seller.",
    {
      "The": "El"
    }
  ],
  [
    "The Disclosure to Customers under § 452.135(1)(a) and the Disclosure to Clients under § 452.135(2)(a), whose timing Module WI-02 Hour 10 set out. The statute prints the customer disclosure text; Hour 10.1 quotes its substance.",
    {
      "The": "La",
      "Disclosure to Customers": "Disclosure to Customers (divulgación a personas no representadas)",
      "under § 452.135(1)(a) and the": "conforme a § 452.135(1)(a) y la"
    }
  ],
  [
    "Credits matter too. The lottery and gaming credit applies only where claimed by an owner using the property as a primary residence, so a buyer of a non-owner-occupied property may not have it in the first year.",
    {
      "The": "El"
    }
  ],
  [
    "The purchase price against the offer and every amendment. Any seller credit actually appearing, in the agreed amount. Prorations on the basis the offer specified. The earnest money credited. Agreed repairs reflected where the parties agreed they would be. The loan type and amount matching the financing contingency. The payoff and its good-through date on the seller's side. And the firm's fee stated correctly.",
    {
      "The": "El",
      "against the offer and every amendment. Any": "comparado con la oferta y todas las enmiendas. Todo",
      "actually appearing, in the agreed amount.": "debe aparecer efectivamente por el importe acordado.",
      "on the basis the offer specified. The": "según la base especificada en la oferta. El",
      "reflected where the parties agreed they would be. The": "reflejadas donde las partes acordaron. El",
      "matching the financing contingency. The": "acordes con la condición de financiación. El",
      "and its good-through date on the seller's side. And the": "y la fecha hasta la que es válido en el lado del vendedor. Y los",
      "firm's fee": "honorarios de la firma",
      "stated correctly.": "indicados correctamente.",
      "seller credit": "crédito del vendedor",
      "credited.": "acreditado."
    }
  ],
  [
    "Who may sign. The personal representative appointed by the court, acting under letters whose scope must be checked. A listing signed by a family member who has not been appointed is a listing that cannot close.",
    {
      "The": "El"
    }
  ],
  [
    "The primary market is where loans are originated: banks, savings institutions, credit unions, mortgage bankers, and mortgage brokers.",
    {
      "The": "El"
    }
  ],
  [
    "The secondary market is where originated loans are sold. Fannie Mae and Freddie Mac purchase conforming conventional loans; Ginnie Mae guarantees securities backed by government loans.",
    {
      "The": "El",
      "purchase conforming conventional loans;": "compran préstamos convencionales conformes;"
    }
  ],
  [
    "No setback, height limit, lot size, buffer width, slope threshold, shoreline designation, permit fee, approval deadline, title policy exception or premium is stated in this module. The 640-acre section, the 36-section township and the 43,560-square-foot acre are universal survey constants.",
    {
      "The": "La",
      ", the": ", el",
      "and the": "y el",
      "No setback, height limit, lot size, buffer width, slope threshold, shoreline designation, permit fee, approval deadline, title policy exception or premium is stated in this module.": "En este módulo no se especifican distancias mínimas a linderos, límites de altura, tamaños de lote, anchuras de franjas de protección, umbrales de pendiente, designaciones de ribera, tasas de permiso, plazos de aprobación, excepciones de pólizas de título ni primas."
    }
  ],
  [
    "The TILA-RESPA Integrated Disclosure rule consolidated the duplicate disclosures the two statutes required into two forms: the Loan Estimate, issued early in the process, and the Closing Disclosure, issued before consummation.",
    {
      "The": "La norma de",
      "TILA-RESPA Integrated Disclosure": "divulgación integrada de TILA-RESPA",
      "rule consolidated the duplicate disclosures the two statutes required into two forms: the": "consolidó las divulgaciones duplicadas exigidas por ambas leyes en dos formularios: el"
    }
  ],
  [
    "The Equal Credit Opportunity Act prohibits discrimination in credit transactions on prohibited bases. ECOA and its implementing regulation were not read for this project, and this course states no prohibited basis list from them.",
    {
      "The": "La"
    }
  ],
  [
    "Read who does what. The firm enters the agreement. The firm appoints a broker as agent. The individual broker is the agent by appointment.",
    {
      "The": "La",
      "enters the agreement. The": "celebra el acuerdo. La"
    }
  ],
  [
    "\"(A) The showing of properties not owned by the seller ... or the listing of competing properties ... does not in and of itself breach the duty of loyalty ... or create a conflict of interest.\" \"(b) The representation of more than one seller by different brokers affiliated with the same firm in competing transactions involving the same buyer does not in and of itself breach the duty of loyalty ... or create a conflict of interest.\"",
    {
      "The": "La"
    }
  ],
  [
    "The public trust doctrine in Wisconsin holds navigable waters in trust for the public, and it is the constitutional foundation of the state's shoreland and navigable-waters regulation. What a riparian owner may do at the water's edge — a pier, a dredging, a bank alteration, a boathouse — is regulated, and it is regulated by the Department of Natural Resources and the county rather than answered by a licensee.",
    {
      "The": "La"
    }
  ],
  [
    "The chandelier is a fixture on the ordinary test — attached, adapted, and objectively intended to be permanent — so the seller's wish is not the test and it will convey unless it is expressly excluded. The professional answer is to have it removed and replaced before marketing, not after a buyer has seen it.",
    {
      "The": "La",
      "is a fixture on the ordinary test — attached, adapted, and objectively intended to be permanent — so the seller's wish is not the test and it will convey unless it is expressly excluded. The professional answer is to have it removed and replaced": "es un elemento fijo según los criterios habituales: está unida al inmueble, adaptada a él y destinada objetivamente a permanecer. El deseo del vendedor no determina su clasificación y se transmitirá salvo exclusión expresa. La respuesta profesional es retirarla y reemplazarla"
    }
  ],
  [
    "All three requirements are action items with owners and deadlines, and I escalate them the day the commitment arrives. The 1998 mortgage needs a recorded satisfaction, and locating a lender acquired twice since takes time. The 2019 death means an unprobated estate in the chain — title cannot be conveyed until it is administered, that takes months, and the closing date in the contract almost certainly needs amending.",
    {
      "The": "La",
      ", and locating a lender acquired twice since takes time. The": ", y localizar a un prestamista adquirido dos veces desde entonces lleva tiempo. El",
      "needs a recorded": "necesita una",
      "satisfaction": "cancelación inscrita"
    }
  ],
  [
    "No licensing examination item count, passing score, time limit, application fee, course fee or penalty is stated in this module. The 90 hours, the three-hour fair housing and consumer protection block, the two-year window, the 50-minute clock hour, the three-questions-per-clock-hour examination rule, the 90-question floor, the 70 percent passing grade and the nine certificate items are all transcribed from RCW 18.85.101 and WAC 308-124H.",
    {
      "The": "Las",
      ", the": ",",
      "90 hours": "90 horas",
      "three-hour fair housing and consumer protection block": "el bloque de tres horas de vivienda justa y protección del consumidor",
      "two-year window": "el plazo de dos años",
      "50-minute clock hour": "la hora lectiva de 50 minutos",
      "three-questions-per-clock-hour": "la regla de tres preguntas por hora lectiva",
      "examination rule, the": "en el examen, el",
      "90-question floor": "mínimo de 90 preguntas",
      "70 percent": "70 por ciento",
      "passing grade and the": "como nota mínima de aprobación y los",
      "nine certificate items": "nueve elementos del certificado",
      "are all": "están todos",
      "transcribed from RCW 18.85.101 and WAC 308-124H.": "transcritos de RCW 18.85.101 y WAC 308-124H."
    }
  ],
  [
    "A spouse may hold an interest, and a spouse's signature may be required to convey or to encumber, even where that spouse does not appear on the deed. The homestead provisions make this particularly acute for the residence.",
    {
      "The": "Las disposiciones de",
      "provisions make this particularly acute for the residence.": "hacen que esto sea especialmente importante para la vivienda."
    }
  ],
  [
    "A spouse may hold an interest in property, and a spouse's signature may be required to convey or to encumber it, even where that spouse does not appear on the deed. The homestead provisions make this particularly acute for a residence, and § 706.02 requires the signature of each grantor.",
    {
      "The": "Las disposiciones de",
      "provisions make this particularly acute for a residence, and": "hacen que esto sea especialmente importante para una vivienda, y"
    }
  ],
  [
    "Disclose known lead-based paint and hazards",
    {
      "Disclose": "Divulgar la información",
      "known": "conocida",
      "lead-based paint and hazards": "sobre pintura a base de plomo y sus peligros"
    }
  ],
  [
    "Compensation is negotiable between the seller and the brokerage. Not standard, not set by any association or listing service.",
    {
      "Compensation": "La remuneración"
    }
  ],
  [
    "A provisional broker does not practise on their own account. They practise under the supervision of a broker-in-charge, and the supervision is a real, ongoing obligation on the supervising broker rather than a formality of registration.",
    {
      "A": "Un",
      "provisional broker": "corredor provisional",
      "does not practise on their own account. They practise": "no ejerce por cuenta propia. Trabaja"
    }
  ],
  [
    "A broker-in-charge (BIC) is the broker designated as responsible for a real estate office. The BIC carries the supervisory duties for the provisional brokers and other licensees affiliated with that office.",
    {
      "A": "Un",
      "broker-in-charge (BIC)": "corredor encargado (BIC)"
    }
  ],
  [
    "A retainer fee and a success fee; and",
    {
      "A": "Un",
      "and a": "y un",
      "success fee": "honorario por éxito"
    }
  ],
  [
    "A fiduciary arrangement: a third party trustee holds assets on behalf of a beneficiary; the trust agreement sets the parameters of the trustee's authority; it may allow assets to pass outside of probate.",
    {
      "A": "Un",
      "fiduciary arrangement": "acuerdo fiduciario",
      ": a": ": un",
      "third party trustee holds assets on behalf of a beneficiary": "administrador fiduciario tercero mantiene bienes en beneficio de un beneficiario",
      "trust agreement sets the parameters of the trustee's authority": "acuerdo del fideicomiso establece los límites de sus facultades"
    }
  ],
  [
    "A Provisional Broker delivers it upon receipt to the affiliated broker;",
    {
      "A": "Un",
      "Provisional Broker delivers it upon receipt to the affiliated broker": "corredor provisional lo entrega al corredor al que está afiliado en cuanto lo recibe"
    }
  ],
  [
    "A Limited Nonresident Commercial Broker delivers it to the affiliated resident NC broker under",
    {
      "A": "Un",
      "Limited Nonresident Commercial Broker delivers it to the affiliated resident NC broker": "corredor comercial no residente con licencia limitada lo entrega al corredor residente de NC al que está afiliado"
    }
  ],
  [
    "A vacation rental is residential property rented for vacation, leisure, or recreation for fewer than 90 days by a person who has a permanent residence to which the person intends to return. Chapter 42A does not apply to hotels and similar Chapter 72 lodging, business or employment travel, renters with no other primary residence, or nominal-consideration rentals.",
    {
      "A": "Un",
      "by a person who has a permanent residence to which the person intends to return. Chapter 42A does not apply to hotels and similar Chapter 72 lodging, business or employment travel, renters with no other primary residence, or nominal-consideration rentals.": "por una persona que tiene una residencia permanente a la que pretende regresar. El Capítulo 42A no se aplica a hoteles ni alojamientos similares del Capítulo 72, viajes por negocios o trabajo, personas sin otra residencia principal ni alquileres a cambio de una contraprestación nominal."
    }
  ],
  [
    "A fixture is an item that was personal property and has become real property by being attached to the land or to an improvement. Once it is a fixture it passes with the deed automatically.",
    {
      "A": "Un",
      "is an item that was personal property and has become real property by being attached to the land or to an improvement. Once it is a fixture it passes with the deed automatically.": "es un bien que era mueble y se convirtió en inmueble al fijarse al terreno o a una mejora. Una vez incorporado, se transmite automáticamente con la escritura."
    }
  ],
  [
    "A fee simple determinable ends automatically when the stated event occurs. The classic language is durational — \"so long as\", \"while\", \"during\", \"until\". The grantor keeps a possibility of reverter, and title returns without any action being taken.",
    {
      "A": "Un",
      "ends automatically when the stated event occurs. The classic language is durational — \"so long as\", \"while\", \"during\", \"until\". The grantor keeps a": "termina automáticamente cuando ocurre el hecho indicado. Su lenguaje característico expresa duración: «siempre que», «mientras», «durante», «hasta». El otorgante conserva una"
    }
  ],
  [
    "A fee simple subject to a condition subsequent does not end automatically; it gives the grantor the right of re-entry, which must be exercised. The classic language is conditional — \"but if\", \"provided that\", \"on condition that\".",
    {
      "A": "Un"
    }
  ],
  [
    "A life estate is a freehold measured by someone's life. The holder — the life tenant — has full use and possession, may lease or sell what they have, and takes the income. What they cannot do is convey more than they own, and they may not commit waste: they must not damage the property or allow it to deteriorate, and they must ordinarily pay the taxes and the interest on existing debt.",
    {
      "A": "Un",
      "— has full use and possession, may lease or sell what they have, and takes the income. What they cannot do is convey more than they own, and they may not commit": "—dispone de pleno uso y posesión, puede arrendar o vender el derecho que tiene y percibe los ingresos. No puede transmitir más derechos de los que posee ni causar"
    }
  ],
  [
    "A life estate pur autre vie is measured by the life of someone other than the holder. It is the one life estate that can be inherited — if the holder dies while the measuring life continues, the remaining estate passes to the holder's heirs until the measuring life ends.",
    {
      "A": "Un",
      "life estate pur autre vie": "derecho vitalicio medido por la vida de otra persona (life estate pur autre vie)"
    }
  ],
  [
    "A condominium divides a project into individually owned units and common elements owned in undivided shares by all unit owners. Limited common elements — a balcony, an assigned parking space — serve fewer than all units.",
    {
      "A": "Un",
      "divides a project into individually owned": "divide un proyecto en",
      "units": "unidades de propiedad individual",
      "owned in undivided shares by all unit owners.": "que pertenecen en cuotas indivisas a todos los propietarios.",
      "— a balcony, an assigned parking space — serve fewer than all units.": "—un balcón o una plaza de estacionamiento asignada— sirven solo a algunas unidades."
    }
  ],
  [
    "A comprehensive plan is a locality's long-range statement of intended growth, land use, transportation, and public facilities. It is a policy document. Zoning is the ordinance that implements it and has legal force.",
    {
      "A": "Un"
    }
  ],
  [
    "A special use permit — also called a conditional use permit — authorises a use the ordinance lists as permissible in the district subject to review and conditions. It is not an exception to the ordinance; it is the ordinance operating as written.",
    {
      "A": "Un"
    }
  ],
  [
    "A nonconforming use is a use that was lawful when established and has since been made non-compliant by a change in the ordinance. It is generally allowed to continue — \"grandfathered\" — but typically may not be expanded, and may be lost if abandoned or destroyed. A licensee marketing such a property should never assume the right survives a change of ownership or a period of vacancy; that is a question for the zoning administrator in writing.",
    {
      "A": "Un",
      "is a use that was lawful when established and has since been made non-compliant by a change in the ordinance. It is generally allowed to continue — \"grandfathered\" — but typically may not be expanded, and may be lost if abandoned or destroyed. A licensee marketing such a property should never assume the right survives a change of ownership or a period of vacancy; that is a question for the zoning administrator in writing.": "es un uso lícito al establecerse que dejó de ajustarse a la ordenanza tras una modificación. Generalmente puede continuar como uso preexistente protegido, pero no ampliarse, y puede perderse la protección por abandono o destrucción. Quien comercialice esa propiedad no debe dar por hecho que el derecho sobrevive a un cambio de titular o a un período de desocupación: debe consultarlo por escrito al administrador de zonificación."
    }
  ],
  [
    "A lien is a charge against property that secures payment of a debt or performance of an obligation. It is an encumbrance on title, and it gives the lienholder the right to force a sale of the property if the obligation is not met.",
    {
      "A": "Un"
    }
  ],
  [
    "A contract is a legally enforceable agreement. Four elements are required:",
    {
      "A": "Un"
    }
  ],
  [
    "A material breach is a failure that defeats the purpose of the contract. A trivial failure is not a breach that permits termination, and calling one a breach is itself a breach.",
    {
      "A": "Un",
      "material breach": "incumplimiento sustancial",
      "is a failure that defeats the purpose of the contract. A trivial failure is not a breach that permits termination, and calling one a breach is itself a breach.": "frustra la finalidad del contrato. Una falta trivial no permite resolverlo; tratarla como un incumplimiento que lo permita constituye, según el ejemplo, un incumplimiento propio."
    }
  ],
  [
    "A real estate team must be supervised by a supervising broker (§ 54.1-2110.1 A), and the supervising broker must have written policies covering the advertising and marketing of the firm and any affiliated teams or business entities (B 2 c) and must ensure teams operate per the chapter and regulations (B 5). Combined with 18VAC135-20-190 A's requirement that all advertising be in the name of the firm with the firm's licensed name clearly and legibly displayed, the rule for team branding is: the team name may appear, but it may not displace or obscure the firm.",
    {
      "A": "Un",
      "must be supervised by a supervising broker (§ 54.1-2110.1 A), and the supervising broker must have written policies covering the advertising and marketing of the firm and any affiliated teams or business entities (B 2 c) and must ensure teams operate per the chapter and regulations (B 5). Combined with 18VAC135-20-190 A's requirement that all advertising be": "debe estar supervisado por un corredor supervisor (§ 54.1-2110.1 A), que debe tener políticas escritas sobre la publicidad y comercialización de la firma y de sus equipos o entidades afiliados (B 2 c), y garantizar que cumplan el capítulo y los reglamentos (B 5). Junto con 18VAC135-20-190 A, que exige que toda la publicidad figure"
    }
  ],
  [
    "A lease is simultaneously a conveyance — it transfers a leasehold estate and the right of exclusive possession — and a contract — it creates mutual promises. Both characters matter: the conveyance explains why a tenant may exclude even the landlord except as the lease and the law allow; the contract explains why breach analysis works as it does.",
    {
      "A": "Un",
      "— it creates mutual promises. Both characters matter: the conveyance explains why a tenant may exclude even the landlord except as the lease and the law allow; the contract explains why breach analysis works as it does.": "—crea promesas mutuas—. Ambas naturalezas importan: la transmisión explica por qué el arrendatario puede excluir incluso al arrendador, salvo cuando la ley o el contrato permitan la entrada; el contrato explica cómo se analiza el incumplimiento."
    }
  ],
  [
    "A debit is a charge against a party. A credit is an amount in that party's favour.",
    {
      "A": "Un"
    }
  ],
  [
    "A gross rent multiplier (GRM) relates sale price to monthly gross rent; a gross income multiplier (GIM) relates it to annual gross income.",
    {
      "A": "Un",
      "relates sale price to": "relaciona el precio de venta con el",
      "; a": "; un"
    }
  ],
  [
    "A feasibility study asks whether a specific project, in a specific market, at a specific time, can meet the investor's objectives. It differs from an appraisal: an appraisal asks what a property is worth, feasibility asks whether a proposed course of action works.",
    {
      "A": "Un"
    }
  ],
  [
    "Disclose. A material adverse fact pertaining to the physical condition of the property that the licensee actually knows must be disclosed in writing under § 54.1-2131 B by a listing licensee to a prospective buyer, and a material fact related to the property or the transaction of which the licensee has actual knowledge must be disclosed to the client under § 54.1-2131 A 6 or § 54.1-2132 A 7. Actual knowledge of defective drywall as defined in § 36-156.1 must be disclosed under both § 54.1-2131 B and § 54.1-2132 B.",
    {
      "A": "Un",
      "§ 54.1-2131 A 6": "§ 54.1-2131 A 6",
      "under": "conforme a"
    }
  ],
  [
    "A trade fixture is an article installed by a tenant for use in the tenant's trade or business. Trade fixtures remain the tenant's personal property and may be removed before the lease ends, with the tenant responsible for repairing damage caused by removal. A restaurant tenant's walk-in cooler, a salon's stations, a shop's display cases: attached, sometimes heavily, and still the tenant's.",
    {
      "A": "Una",
      "trade fixture": "instalación comercial del arrendatario"
    }
  ],
  [
    "A cooperative is a corporation that owns the building; the resident owns shares in the corporation and holds a proprietary lease of an apartment. The resident owns personal property, not real property, which changes financing and title work entirely.",
    {
      "A": "Una",
      "is a corporation that owns the building; the resident owns shares in the corporation and holds a proprietary lease of an apartment. The resident owns personal property, not real property, which changes financing and title work entirely.": "es una sociedad propietaria del edificio; el residente posee acciones y un arrendamiento vinculado a ellas (proprietary lease) sobre un apartamento. Tiene bienes muebles —las acciones—, no propiedad inmobiliaria, lo que cambia por completo la financiación y el análisis de titularidad."
    }
  ],
  [
    "A licence is permission to do something on another's land that would otherwise be a trespass. It is personal, revocable, and not an interest in land. Permission to park in a neighbour's drive is a licence; if it were written, permanent, and running with the land it would be an easement. The distinction decides whether the right survives a sale.",
    {
      "A": "Una",
      "is permission to do something on another's land that would otherwise be a trespass. It is": "es un permiso para realizar en terreno ajeno una actividad que, sin él, constituiría una entrada no autorizada. Es",
      ". Permission to park in a neighbour's drive is a licence; if it were written, permanent, and running with the land it would be an easement. The distinction decides whether the right survives a sale.": ". El permiso para estacionar en el acceso de un vecino es una licencia; si constara por escrito, fuera permanente y estuviera vinculado al terreno, sería una servidumbre. La diferencia determina si el derecho subsiste tras una venta."
    }
  ],
  [
    "A party wall is a shared wall on a boundary, with each owner typically owning to the centre and holding an easement of support in the other half.",
    {
      "A": "Una",
      "is a shared wall on a boundary, with each owner typically owning to the centre and holding an easement of support in the other half.": "es un muro compartido sobre un lindero; normalmente cada propietario es dueño hasta el centro y tiene una servidumbre de apoyo sobre la otra mitad."
    }
  ],
  [
    "A variance relieves a property owner from a bulk or dimensional requirement where strict application would cause an unnecessary hardship arising from the property itself — an unusual shape, topography, or size. A variance is granted by a board of zoning appeals. A variance does not authorise a use the district forbids, and self-created hardship and mere financial disadvantage are not grounds.",
    {
      "A": "Una",
      "variance": "excepción de zonificación",
      "relieves a property owner from a": "dispensa al propietario de un requisito de",
      "bulk or dimensional": "volumen o dimensiones",
      "requirement where strict application would cause an unnecessary hardship arising from the property itself — an unusual shape, topography, or size. A variance is granted by a board of zoning appeals.": "cuya aplicación estricta causaría una dificultad innecesaria derivada de la propia parcela —su forma, topografía o tamaño inusuales—. La concede la junta de apelaciones de zonificación.",
      "A variance does not authorise a use the district forbids": "No autoriza un uso prohibido en el distrito"
    }
  ],
  [
    "A rezoning is an amendment of the ordinance itself, granted by the governing body, and is a legislative act.",
    {
      "A": "Una"
    }
  ],
  [
    "A survey is a licensed surveyor's determination of where the boundaries are on the ground. A plat of survey shows the parcel, the improvements, and anything crossing a line.",
    {
      "A": "Una",
      "is a licensed surveyor's determination of where the boundaries are on the ground. A": "es la determinación de los linderos sobre el terreno realizada por un agrimensor autorizado. Un"
    }
  ],
  [
    "A deed is the written instrument by which an interest in real property is voluntarily transferred from a grantor to a grantee. The deed is the operative act of transfer. It is not the contract — the contract creates the obligation to convey, and the deed performs it.",
    {
      "A": "Una",
      "to a": "a un"
    }
  ],
  [
    "A chain of title is the succession of recorded owners of a parcel over time, each conveyance linking to the next. A searcher builds it by working backward from the current owner — finding the deed by which the current owner took title, then the deed by which that grantor took title, and so on — and then forward again, checking each owner's period for liens, judgments and other adverse instruments.",
    {
      "A": "Una",
      "from the current owner — finding the deed by which the current owner took title, then the deed by which that grantor took title, and so on — and then forward again, checking each owner's period for liens, judgments and other adverse instruments.": "desde el propietario actual —buscando la escritura por la que adquirió la titularidad, después la de su otorgante, y así sucesivamente— y luego avanza otra vez para comprobar gravámenes, sentencias y otros instrumentos adversos durante el período de cada propietario."
    }
  ],
  [
    "A gap is a break in the chain — a conveyance out from someone who never appears as a grantee, or a period with no recorded transfer where one must have occurred. Gaps are often the result of an unrecorded deed, a probate that was never recorded, or a name change.",
    {
      "A": "Una",
      "is a break in the chain — a conveyance out from someone who never appears as a grantee, or a period with no recorded transfer where one must have occurred. Gaps are often the result of an unrecorded deed, a probate that was never recorded, or a name change.": "es una interrupción en la cadena de titularidad: transmite alguien que nunca figura como adquirente, o falta una transmisión registrada que necesariamente debió ocurrir. Puede deberse a una escritura o un procedimiento sucesorio no inscritos, o a un cambio de nombre."
    }
  ],
  [
    "A cloud is any recorded instrument or claim that casts doubt on the title without necessarily defeating it: an unreleased deed of trust from 1988, an old judgment, an ambiguous easement, a defective acknowledgment, or a deed from one of several heirs.",
    {
      "A": "Una",
      "cloud": "duda sobre el título",
      "is any recorded instrument or claim that casts doubt on the title without necessarily defeating it: an unreleased deed of trust from 1988, an old judgment, an ambiguous easement, a defective acknowledgment, or a deed from one of several heirs.": "es un instrumento registrado o una reclamación que pone en cuestión la titularidad sin necesariamente invalidarla: una escritura de fideicomiso de 1988 sin cancelar, una sentencia antigua, una servidumbre ambigua, un reconocimiento notarial defectuoso o una escritura otorgada por solo uno de varios herederos."
    }
  ],
  [
    "A quiet title action is the judicial proceeding used to resolve a cloud that cannot be cleared by curative instrument.",
    {
      "A": "Una"
    }
  ],
  [
    "A one-time premium is paid at closing. There are no renewals.",
    {
      "A": "Una"
    }
  ],
  [
    "A lender's policy, also called a loan policy or mortgagee policy, insures the lender's security interest in the amount of the loan, and its coverage declines as the loan is paid down. Lenders require it, and the buyer usually pays for it.",
    {
      "A": "Una",
      ", also called a loan policy or mortgagee policy, insures the lender's security interest in the amount of the loan, and its coverage declines as the loan is paid down. Lenders require it, and the buyer usually pays for it.": ", también llamada póliza del préstamo o del acreedor hipotecario, asegura el derecho de garantía del prestamista por el importe del préstamo. Su cobertura disminuye al amortizarse este. Los prestamistas la exigen y normalmente la paga el comprador."
    }
  ],
  [
    "A standard owner's policy carries the general exceptions. Extended coverage removes some of them, typically requiring a survey and an affidavit, and costs more. Recommending that a buyer ask the settlement agent about extended coverage is proper; telling a buyer they do not need it is not.",
    {
      "A": "Una",
      "Extended coverage": "La cobertura ampliada",
      "removes some of them, typically requiring a survey and an affidavit, and costs more. Recommending that a buyer": "elimina algunas excepciones, suele requerir una mensura y una declaración jurada, y cuesta más. Es apropiado recomendar que el comprador",
      "ask the settlement agent about": "consulte al agente de cierre sobre",
      "extended coverage is proper; telling a buyer they do not need it is not.": "la cobertura ampliada; no lo es decirle que no la necesita."
    }
  ],
  [
    "A contingency makes a party's duty to perform conditional on a stated event. Until the condition is resolved, the contract exists and binds — but the conditioned duty is not yet absolute.",
    {
      "A": "Una"
    }
  ],
  [
    "A no-pets policy does not defeat the request.",
    {
      "A": "Una",
      "no-pets policy does not defeat the request.": "política de prohibición de mascotas no basta para rechazar la solicitud."
    }
  ],
  [
    "A common interest community is a development in which ownership of a unit or lot carries with it mandatory membership in an association and an obligation to pay assessments for commonly held or commonly maintained property. The obligation runs with the land: it is not a club a buyer joins, and it cannot be resigned from.",
    {
      "A": "Una"
    }
  ],
  [
    "A mortgage has two parties: the mortgagor (borrower, who gives the mortgage) and the mortgagee (lender, who receives it). Enforcement is typically judicial.",
    {
      "A": "Una"
    }
  ],
  [
    "A deed of trust has three parties: the grantor or trustor (borrower), the trustee (a neutral third party who holds legal or bare title for the purpose of the security), and the beneficiary (lender). On default the trustee, rather than a court, conducts the sale under the power of sale in the instrument.",
    {
      "A": "Una"
    }
  ],
  [
    "Send the buyer to a lender before the search, not after. A pre-qualification is an informal estimate from unverified information. A pre-approval rests on a submitted application, verified documentation, and usually an underwriting decision subject to a property. They are not the same thing, and a seller evaluating offers is entitled to know which one is in front of them.",
    {
      "A": "Una",
      "Send the buyer to a lender before the search, not after.": "Remita al comprador a un prestamista antes de comenzar la búsqueda, no después.",
      "is an informal estimate from unverified information. A": "es una estimación informal basada en información no verificada. Una",
      "rests on a submitted application, verified documentation, and usually an underwriting decision subject to a property. They are not the same thing, and a seller evaluating offers is entitled to know which one is in front of them.": "se basa en una solicitud presentada, documentos verificados y, normalmente, una decisión de evaluación crediticia pendiente de aprobar una propiedad concreta. Son cosas distintas y el vendedor que compara ofertas tiene derecho a saber cuál se le presenta."
    }
  ],
  [
    "An offer is different because no contract yet exists. A rejection or counteroffer can terminate the offer; a revocation ordinarily must reach the offeree; an offer may lapse at its stated time; and the Syllabus's Mailbox Rule concerns a qualifying mailed acceptance, not termination of an offer or contract. Students must not use a contract remedy label to explain why an unaccepted offer ended.",
    {
      "An": "Una",
      "is different because no contract yet exists. A rejection or counteroffer can terminate the offer; a revocation ordinarily must reach the offeree; an offer may lapse at its stated time; and the Syllabus's Mailbox Rule concerns a qualifying mailed": "es distinta porque aún no existe un contrato. Un rechazo o una contraoferta pueden extinguir la oferta; normalmente la revocación debe llegar a su destinatario y la oferta puede caducar en el momento previsto. La regla del buzón del programa se refiere a una",
      "acceptance": "aceptación",
      ", not termination of an offer or contract. Students must not use a contract remedy label to explain why an unaccepted offer ended.": " enviada por correo que reúna los requisitos, no a la terminación de una oferta o contrato. No deben usarse conceptos de remedios contractuales para explicar por qué terminó una oferta no aceptada."
    }
  ],
  [
    "An encumbrance is any claim, right, or interest held by someone other than the owner that affects title or limits use. Encumbrances do not prevent transfer; they travel with the land. They fall into two families: those that affect use — easements, restrictive covenants, encroachments — and those that affect title as security for money, which are liens and are Hour 13.",
    {
      "An": "Una"
    }
  ],
  [
    "An easement is a non-possessory right to use another's land for a stated purpose. It is an interest in land, and it is created and transferred by written instrument or by operation of law.",
    {
      "An": "Una"
    }
  ],
  [
    "An easement appurtenant benefits a parcel. The benefited parcel is the dominant tenement and the burdened parcel is the servient tenement. It runs with the land: it passes to the next owner automatically, whether or not anyone mentions it. This is the easement in most residential transactions — shared driveways, access to a back lot, drainage.",
    {
      "An": "Una",
      "benefits a parcel. The benefited parcel is the": "beneficia a una parcela. La beneficiada es el",
      ". It runs with the land: it passes to the next owner automatically, whether or not anyone mentions it. This is the easement in most residential transactions — shared driveways, access to a back lot, drainage.": ". Permanece vinculada al terreno y pasa automáticamente al siguiente propietario aunque nadie la mencione. Es la servidumbre habitual en operaciones residenciales: accesos compartidos, paso a una parcela posterior o drenaje."
    }
  ],
  [
    "An easement in gross benefits a person or entity rather than a parcel. Utility easements are the everyday case, and commercial easements in gross are assignable.",
    {
      "An": "Una",
      "easement in gross": "servidumbre personal (easement in gross)",
      "rather than a parcel. Utility easements are the everyday case, and commercial easements in gross are assignable.": "en lugar de una parcela. Las de servicios públicos son el ejemplo cotidiano; las servidumbres personales comerciales pueden cederse."
    }
  ],
  [
    "An encroachment is an unauthorised physical intrusion — a fence, a roof overhang, a driveway — onto adjoining land. It is discovered by a survey, not by looking. It is both a title problem and a potential dispute, and long-standing encroachments can mature into prescriptive rights. When one is suspected, the professional answer is a survey and, if it exists, legal advice — not a licensee's opinion about where the line is.",
    {
      "An": "Una"
    }
  ],
  [
    "An owner's policy insures the buyer's interest, in the amount of the purchase price, for as long as the insured or the insured's heirs hold an interest.",
    {
      "An": "Una"
    }
  ],
  [
    "An offer is a proposal that, if accepted, forms a contract. It must show present intent to be bound, be communicated to the offeree, and state the essential terms with enough definiteness that a court could enforce them — parties, property, price, and the material terms of the transaction.",
    {
      "An": "Una"
    }
  ],
  [
    "An appraisal is an opinion of value developed by an appraiser for an intended user and an intended use, as of an effective date, with a scope of work the appraiser must document. Every one of those elements changes the answer, which is why an appraisal produced for one purpose cannot simply be reused for another.",
    {
      "An": "Una",
      ", as of an": ", con referencia a una",
      ", with a": ", con un",
      "the appraiser must document. Every one of those elements changes the answer, which is why an appraisal produced for one purpose cannot simply be reused for another.": "que el tasador debe documentar. Cada elemento influye en la conclusión; por eso, una tasación preparada para una finalidad no puede reutilizarse sin más para otra."
    }
  ],
  [
    "The life tenant — their rights and restrictions, and estovers, the life tenant's right",
    {
      "The": "El",
      ", the life tenant's right": ", el derecho del titular vitalicio"
    }
  ],
  [
    "The remainderman.",
    {
      "The": "El"
    }
  ],
  [
    "The grantor conveys; the grantee receives.",
    {
      "The": "El",
      "conveys; the": "transmite; el"
    }
  ],
  [
    "The subsequent modifying agreement controls the changed obligation.",
    {
      "The": "El"
    }
  ],
  [
    "Closing Disclosure (CD). The creditor is responsible for ensuring the consumer receives the CD",
    {
      "The": "El",
      "Closing Disclosure (CD).": "Declaración de cierre (CD).",
      "for ensuring the consumer receives the CD": "de garantizar que el consumidor reciba la CD"
    }
  ],
  [
    "Report form. The Uniform Residential Appraisal Report (URAR) is the appraisal reporting product used in the form activity below. It is separate from USPAP. During the current GSE transition, a legacy Fannie Mae Form 1004/Freddie Mac Form 70 and the new data-driven UAD 3.6 URAR may both be encountered.",
    {
      "The": "El",
      "Uniform Residential Appraisal Report (URAR)": "Informe Uniforme de Tasación Residencial (URAR)",
      "is the appraisal reporting product used in the form activity below. It is separate from USPAP. During the current GSE transition, a legacy Fannie Mae Form 1004/Freddie Mac Form 70 and the new data-driven UAD 3.6 URAR may both be encountered.": "es el informe de tasación utilizado en la actividad con formularios que sigue. Es distinto de USPAP. Durante la transición actual de las GSE pueden encontrarse tanto el formulario anterior Fannie Mae Form 1004/Freddie Mac Form 70 como el nuevo URAR basado en datos UAD 3.6."
    }
  ],
  [
    "The lot and block system — also called the recorded plat or subdivision system — describes a parcel by reference to a recorded plat: Lot 14, Block C, Fairview Estates, as recorded in Plat Book 22, page 118, among the land records of the Circuit Court of ___ County, Virginia.",
    {
      "The": "El sistema de",
      "system — also called the recorded plat or subdivision system — describes a parcel by reference to a": "—también llamado sistema de plano inscrito o de subdivisión— describe una parcela por referencia a un"
    }
  ],
  [
    "The rectangular or government survey system — principal meridians, base lines, townships six miles square, thirty-six sections of one square mile each, sections of 640 acres divided by quarters — governs most land west and north of the original colonies. Virginia is not a public land survey state. A student who has studied a national text will meet township-and-range questions on a national examination and should understand the arithmetic — a quarter of a quarter section is 40 acres, a half of a quarter is 80 — but should not expect to see it in a Virginia deed.",
    {
      "The": "El sistema",
      "government survey system": "de mensura gubernamental"
    }
  ],
  [
    "Expected answer. The monument — the oak at the edge of the branch — controls over the stated distance, under the ordinary rule that monuments prevail over courses and distances. The distance is treated as an approximation of a boundary the parties fixed by reference to a physical object. The practical answer is nevertheless that the discrepancy is a title and survey matter, and the licensee's job is to get it in front of the surveyor and the title examiner, not to resolve it.",
    {
      "The": "El"
    }
  ],
  [
    "Expected answer. The real property tax lien is paid first by statutory priority regardless of date. Then the 2019 first deed of trust, the foreclosing lien. Then, from any surplus, the 2021 judgment, then the 2022 second deed of trust, in recording order. The 2021 judgment and the 2022 deed of trust are junior to the foreclosing lien and are extinguished as to the property, whether or not they are paid; the debts themselves may survive against the debtor personally. Nothing here is advice a licensee gives — this is why a buyer at a foreclosure sale needs counsel.",
    {
      "The": "El",
      "is paid first by statutory priority regardless of date. Then the": "se paga primero por prioridad legal, con independencia de la fecha. Después, la",
      "2019 first deed of trust": "primera escritura de fideicomiso de 2019",
      ", then the": ", después la",
      "2022 second deed of trust": "segunda escritura de fideicomiso de 2022",
      "to the foreclosing lien and are extinguished as to the property, whether or not they are paid; the debts themselves may survive against the debtor personally. Nothing here is advice a licensee gives — this is why a buyer at a foreclosure sale needs counsel.": "al gravamen que se ejecuta y se extinguen respecto del inmueble, cobren o no; las deudas pueden subsistir como obligaciones personales del deudor. Esto no es asesoramiento que deba dar un licenciatario: explica por qué el comprador en una subasta de ejecución necesita asesoría jurídica."
    }
  ],
  [
    "§ 55.1-2309 — Delivery. The seller or the seller's agent shall obtain the resale certificate from the association and provide it to the purchaser or the purchaser's agent, and — the words matter — this requirement shall not be waived or changed by agreement.",
    {
      "The": "El"
    }
  ],
  [
    "C. The preparer is liable to the seller for actual damages not exceeding $1,000.",
    {
      "The": "El"
    }
  ],
  [
    "The statute of frauds reaches leases: a lease for a term longer than the statutory period must be in writing. The Virginia period is a matter of Title 55.1 that this course has not read from primary text and therefore does not state; write every lease down regardless, which is the answer in practice.",
    {
      "The": "El"
    }
  ],
  [
    "The Department of Veterans Affairs guarantees a portion of a loan made by an approved lender to an eligible veteran, service member, or surviving spouse.",
    {
      "The": "El"
    }
  ],
  [
    "The US Department of Agriculture operates rural housing programmes, guaranteeing loans made by approved lenders and, in some programmes, lending directly.",
    {
      "The": "El"
    }
  ],
  [
    "The Due Diligence Fee and the Earnest Money Deposit are separately defined and handled differently. The DDF is paid for the due diligence right; the EMD is a deposit held in escrow.",
    {
      "The": "La"
    }
  ],
  [
    "The 3-year lease rule is measured \"from the making/signing of the lease agreement\" — not from the commencement of the term. A one-year lease signed today to begin in three years exceeds three years from signing.",
    {
      "The": "La",
      "3-year lease rule": "regla de los arrendamientos de 3 años",
      "\"from the making/signing of the lease agreement\"": "«desde la celebración/firma del contrato de arrendamiento»",
      "— not from the commencement of the term. A one-year lease signed today to begin in three years exceeds three years from signing.": "—no desde el inicio del plazo. Un arrendamiento de un año firmado hoy que comienza dentro de tres años supera los tres años contados desde la firma."
    }
  ],
  [
    "Expected answer. The water staining is a material adverse fact pertaining to the physical condition of the property, actually known, and must be disclosed in writing under § 54.1-2131 B. The road widening is a matter relating to highways or public streets, which the statute expressly places outside the definition of \"physical condition of the property\", so the § 54.1-2131 B physical-condition duty does not reach it. That is not permission to mislead: the licensee must still treat the buyer honestly and must not knowingly give false information, and the professional course is to state what is known and direct the buyer to the locality and to VDOT. Toward the seller, who is the client, the road plan is a material fact concerning the property or the transaction of which the licensee has actual knowledge, and § 54.1-2131 A 6 requires it be disclosed to the seller.",
    {
      "The": "La",
      "water staining": "mancha de humedad",
      "under § 54.1-2131 B. The": "conforme a § 54.1-2131 B. La",
      "is a matter relating to highways or public streets, which the statute expressly places outside the definition of \"physical condition of the property\", so the § 54.1-2131 B physical-condition duty does not reach it. That is not permission to mislead: the licensee must still treat the buyer honestly and must not knowingly give false information, and the professional course is to state what is known and direct the buyer to the locality and to VDOT. Toward the": "es una cuestión relativa a carreteras o calles públicas, expresamente excluida de la definición legal de «estado físico de la propiedad»; por ello, § 54.1-2131 B no la alcanza mediante ese deber. Esto no autoriza a engañar: el licenciatario debe tratar al comprador honestamente y no proporcionar información falsa a sabiendas. La actuación profesional consiste en exponer lo conocido y remitir al comprador a la autoridad local y a VDOT. Frente al"
    }
  ],
  [
    "The Real Estate Board is established under § 54.1-2104 and its general powers are at § 54.1-2105, which includes the power to promulgate regulations and to set educational and experience requirements for licensure. § 54.1-2105.1 carries other powers and duties, and § 54.1-2105.2 authorises cease and desist orders and civil penalties for unlicensed activity.",
    {
      "The": "La"
    }
  ],
  [
    "The federal Fair Housing Act — Title VIII of the Civil Rights Act of 1968, as amended in 1974 and 1988 — prohibits discrimination in the sale, rental, and financing of dwellings on the basis of race, colour, religion, national origin, sex, familial status, and disability (handicap). Seven classes. The 1974 amendment added sex; the 1988 amendment added familial status and disability.",
    {
      "The": "La"
    }
  ],
  [
    "The Virginia Fair Housing Law, Chapter 5.1 of Title 36, is broader. Reading § 36-96.3 A 1, the protected bases are:",
    {
      "The": "La",
      ", Chapter 5.1 of Title 36, is broader. Reading § 36-96.3 A 1, the protected bases are:": ", Capítulo 5.1 del Título 36, es más amplia. Según § 36-96.3 A 1, las bases protegidas son:"
    }
  ],
  [
    "D. The Common Interest Community Board may assess a monetary penalty against an association under § 54.1-2351 or a common interest community manager under § 54.1-2349, and may issue a cease and desist order under § 54.1-2349 or § 54.1-2352.",
    {
      "The": "La"
    }
  ],
  [
    "The Federal Housing Administration, part of HUD, insures loans made by approved lenders. It does not lend.",
    {
      "The": "La"
    }
  ],
  [
    "The Closing Disclosure is the borrower's statement in a federally related mortgage loan; the settlement agent produces a settlement statement covering both sides.",
    {
      "The": "La"
    }
  ],
  [
    "The Level 3 subtopics — land-use verification, delivery of instruments, material facts, and improper brokerage commissions — separately carry Level 3's requirement that students complete practical work assignments applying the material to common fact situations.",
    {
      "The": "Los subtemas de",
      "subtopics — land-use verification, delivery of instruments, material facts, and improper brokerage commissions — separately carry Level 3's requirement that students": "—verificación del uso del suelo, entrega de instrumentos, hechos materiales y comisiones de corretaje indebidas— conllevan, por separado, el requisito del Nivel 3 de que los estudiantes",
      "applying the material to common fact situations.": "aplicando lo aprendido a situaciones habituales."
    }
  ],
  [
    "\"NCREC does not create the standardized sales contract forms used by the majority of NC licensees. The only standardized forms authored by the Commission are:",
    {
      "The": "Los",
      "only": "únicos",
      "standardized forms authored by the Commission are:": "formularios normalizados elaborados por la Comisión son:"
    }
  ],
  [
    "The Title II, Section 203(b) Program is \"the most widely used FHA program.\" It applies to residential 1–4 unit property loans, including manufactured housing. Its general characteristics, as listed:",
    {
      "The": "El",
      "Title II, Section 203(b) Program": "programa del Título II, Sección 203(b)",
      "It applies to": "Se aplica a"
    }
  ],
  [
    "\"Written detailed statement of final loan terms, prorations, and closing costs that borrower should compare to information on the sales contract and the LE.\" It includes tolerance limits and the four chief disclosures required by TILA. The Commission asks for delivery requirements and for \"changes that require a new BCD and a new 3 business day waiting period before settlement.\"",
    {
      "The Commission asks for": "La Comisión solicita conocer los",
      "delivery requirements": "requisitos de entrega",
      "and for": "y los",
      "\"changes that require a new BCD and a new 3 business day waiting period before settlement.\"": "«cambios que exigen una nueva BCD y un nuevo período de espera de 3 días hábiles antes del cierre»."
    }
  ],
  [
    "It is not an appraisal. An appraisal is an opinion of value developed by a licensed or certified appraiser under a professional standard, for an intended user and an intended use, with a scope of work the appraiser must document. Virginia regulates appraisers under a separate board. A licensee who presents a CMA as an appraisal, or who prepares something styled as an appraisal for a lender, is on the wrong side of a line that exists for good reasons.",
    {
      "It is": "Esto",
      "not an appraisal": "no es una tasación"
    }
  ],
  [
    "An abstract of title is a condensed history of everything recorded affecting the parcel. An attorney's title opinion is a legal opinion on the state of title based on the abstract. Together they were the traditional method, and title insurance largely supplanted them because an opinion compensates only if the attorney was negligent, whereas a policy pays on the risk.",
    {
      "is a condensed history of everything recorded affecting the parcel. An attorney's": "es una historia resumida de los instrumentos registrados que afectan a la parcela. El",
      "title opinion": "dictamen de titularidad de un abogado"
    }
  ],
  [
    "Voluntary or involuntary. A voluntary lien is one the owner creates deliberately — in Virginia, most commonly a deed of trust given to secure a loan. An involuntary lien arises by operation of law without the owner's agreement: tax liens, judgment liens, mechanics' liens.",
    {
      "Voluntary or involuntary.": "Voluntario o involuntario.",
      "A": "Un gravamen",
      "lien is one the owner creates deliberately — in Virginia, most commonly a": "lo constituye deliberadamente el propietario; en Virginia, lo más habitual es una",
      "given to secure a loan. An": "constituida para garantizar un préstamo. Un gravamen",
      "involuntary": "involuntario",
      "lien arises by operation of law without the owner's agreement: tax liens, judgment liens, mechanics' liens.": "surge por aplicación de la ley sin acuerdo del propietario: gravámenes tributarios, derivados de sentencias o de construcción."
    }
  ],
  [
    "Statutory or equitable. A statutory lien is created by statute — the tax lien, the mechanic's lien. An equitable lien arises from a court's application of fairness or from the conduct of the parties.",
    {
      "A": "Un gravamen",
      "statutory": "legal",
      "lien is created by statute — the tax lien, the mechanic's lien. An": "lo establece la ley, como los tributarios o de construcción. Un gravamen",
      "equitable": "de equidad",
      "lien arises from a court's application of fairness or from the conduct of the parties.": "surge de la aplicación judicial de la equidad o de la conducta de las partes."
    }
  ],
  [
    "General or specific. A general lien attaches to all of the debtor's property, real and personal, within the jurisdiction: judgment liens, federal and state tax liens, estate liens for death taxes. A specific lien attaches to one identified parcel: the deed of trust, the real property tax lien, the mechanic's lien, the special assessment.",
    {
      "A": "Un gravamen",
      "lien attaches to": "recae sobre",
      "all": "todos",
      "of the debtor's property, real and personal, within the jurisdiction: judgment liens, federal and state tax liens, estate liens for death taxes. A": "los bienes del deudor, muebles e inmuebles, dentro de la jurisdicción: gravámenes judiciales, tributarios federales y estatales, y sucesorios por impuestos al fallecimiento. Un gravamen"
    }
  ],
  [
    "An addendum is attached at the time of contracting and forms part of the original agreement. An amendment changes an existing contract and requires the assent of all parties. A contingency is a condition that must be satisfied or waived for a duty to become absolute, and Hour 18 covers their operation.",
    {
      "An": "Un",
      "addendum": "anexo (addendum)",
      "is attached at the time of contracting and forms part of the original agreement. An": "se adjunta al celebrar el contrato y forma parte del acuerdo original. Una",
      "changes an existing contract and requires the assent of all parties. A": "modifica un contrato existente y requiere el consentimiento de todas las partes. Una"
    }
  ],
  [
    "A. The account must be in the name by which the firm or sole proprietorship is licensed. b. The principal broker will be held responsible for these accounts, including having signatory authority on them. c. The supervising broker and any other licensee with signatory authority may be held responsible. d. All such accounts, checks and bank statements must be labelled \"escrow\", and the accounts must be designated as escrow accounts with the financial institution. e. The balance must be sufficient at all times to account for all funds designated to be held by the firm.",
    {
      "The": "",
      "principal broker will be held responsible": "El corredor principal responde",
      "for these accounts,": "por estas cuentas,",
      "on them.": "sobre ellas.",
      "supervising broker and any other licensee with signatory authority may be held responsible.": "El corredor supervisor y cualquier otro licenciatario con facultad de firma pueden ser considerados responsables.",
      "All such": "Todas esas",
      "designated as escrow accounts with the financial institution": "designadas como cuentas de escrow ante la entidad financiera",
      "balance must be sufficient at all times": "El saldo debe ser suficiente en todo momento",
      "to account for all funds designated to be held by the firm.": "para cubrir todos los fondos que la firma debe custodiar."
    }
  ],
  [
    "A conventional loan is one not insured or guaranteed by a government agency.",
    {
      "A": "Un préstamo",
      "loan is one not insured or guaranteed by a government agency.": "no está asegurado ni garantizado por un organismo gubernamental."
    }
  ],
  [
    "The Colorado Real Estate Commission approved a course outline for it on April 1, 1998, and that outline — obtained from dre.colorado.gov and read in full on 2026-08-20 — states the course objective, the five major topics, and the hours allocated to each. This course delivers those five topics as five modules at exactly the Commission's hours:",
    {
      "The": "La",
      ", the": ", los"
    }
  ],
  [
    "How co-owners describe themselves to each other creates nothing. The recorded instrument determines the form, and whether survivorship exists is a question of what the deed says and of the law that governs it.",
    {
      "The": "El"
    }
  ],
  [
    "The police power is the government's power to regulate for public health, safety, morals and general welfare — without compensating the owner. Eminent domain is the power to take private property for public use on payment of just compensation. The absence or presence of compensation is what distinguishes them.",
    {
      "The": "El"
    }
  ],
  [
    "The landlord, out of the rent",
    {
      "The": "El"
    }
  ],
  [
    "The tenant pays some or all of them in addition to base rent",
    {
      "The": "El"
    }
  ],
  [
    "Two different things, and a student who merges them misstates both. The relationship does not extend to the firm. Supervision and vicarious liability are untouched — and Rule 6.3.A.1 confirms it from the rule side: \"whenever a complaint is filed with the Commission against an Associate Broker, the Commission may investigate whether there have been violations ... by the Employing Broker.\"",
    {
      "The": "La"
    }
  ],
  [
    "(A) That a buyer or tenant will pay more; (b) That a seller or landlord will accept less; (c) The motivating factors for any party; (d) That any party will agree to financing terms other than those offered; (e) § 38-35.5-101 facts or suspicions; or (f) Any material information about the OTHER PARTY unless disclosure is required by law or failure to disclose would constitute fraud or dishonest dealing.",
    {
      "The": "Los"
    }
  ],
  [
    "The consumer as they hold title; the brokerage firm, with the designated broker identified",
    {
      "The": "El",
      "as they hold title; the": "según figure como titular; la",
      ", with the": ", con el",
      "identified": "identificado"
    }
  ],
  [
    "The Uniform Consumer Credit Code, which in states that adopted it governs consumer credit transactions — disclosure, rates, charges, and remedies.",
    {
      "The": "El"
    }
  ],
  [
    "The CMA/BPO notice, verbatim, and the prohibition on those used to obtain financing",
    {
      "The": "El aviso",
      "CMA/BPO notice": "CMA/BPO"
    }
  ],
  [
    "The Colorado Fair Housing Act",
    {
      "The": "La"
    }
  ],
  [
    "The journal, the ledger with no negative balance ever, and monthly three-way reconciliation",
    {
      "The": "El",
      "with": ",",
      "no negative balance ever": "que nunca debe tener saldo negativo"
    }
  ],
  [
    "The identity of anyone paying compensation disclosed before the brokerage agreement or the contract is entered into",
    {
      "The": "La",
      "disclosed": "divulgada",
      "before": "antes de",
      "the brokerage agreement or the contract is entered into": "celebrar el acuerdo de corretaje o el contrato"
    }
  ],
  [
    "The six-column worksheet is the instrument on which every closing problem in Module 05 is worked, and the Commission names it twice across its six outlines:",
    {
      "The": "La"
    }
  ],
  [
    "It does not decide who pays what. The contract does. The worksheet records the contract's allocation; it does not create one.",
    {
      "The": "El",
      "does. The worksheet records the contract's allocation; it does not create one.": "sí lo determina. La hoja de trabajo registra la distribución acordada; no la crea."
    }
  ],
  [
    "The commitment date; the policy or policies to be issued and the amounts; the estate covered; who currently holds title; and the legal description",
    {
      "The": "Los siguientes datos:",
      "commitment date": "fecha del compromiso",
      "; the": ";",
      "to be issued and the": "que se emitirán y sus",
      "covered;": "cubierto;",
      "who currently holds title": "quién ostenta actualmente la titularidad",
      "; and the": "; y la"
    }
  ],
  [
    "And § 12-10-403(6)(b) with its savings clause. The relationship does not extend to the employing broker or the firm — but § 12-10-408(2)(e)(II): \"Nothing ... shall be construed to limit the employing broker's or firm's responsibility to supervise licensees ... nor to shield the broker or firm from vicarious liability.\"",
    {
      "The": "La"
    }
  ],
  [
    "Second, there are two customers. The owner is the client. The tenant is not — but the tenant's deposit is the tenant's money, and Rule 5.8 protects it specifically.",
    {
      "The": "El",
      "is the client. The": "es el cliente representado. El",
      "is not — but the tenant's deposit is the tenant's money, and": "no lo es; sin embargo, su depósito le pertenece, y la"
    }
  ],
  [
    "The seven protected classes and the prohibited practices, in Real Estate Law and Practice Module 03 Part F.1 — no exemption, threshold, remedy or procedure",
    {
      "The": "Las"
    }
  ],
  [
    "The duty to disclose actually known adverse material facts including environmental hazards — and no duty to investigate is not a reason for a buyer to skip diligence",
    {
      "The": "El"
    }
  ],
  [
    "The Commission's Transaction File Checklist, which Rule 6.20 says designates the required documents, was NOT obtained by this project — a submission gate.",
    {
      "The": "La",
      ", which Rule 6.20 says designates the required documents,": ", que según la Regla 6.20 identifica los documentos exigidos,",
      "was NOT obtained by this project": "NO fue obtenida por este proyecto"
    }
  ],
  [
    "A dominant parcel, burdening a servient parcel",
    {
      "A": "Un",
      ", burdening a": ", gravando un"
    }
  ],
  [
    "A person or entity, as a utility easement does",
    {
      "A": "Una"
    }
  ],
  [
    "A listing agreement is a contract of employment: an owner employs a broker. It conveys nothing and it is not an offer to sell. A buyer agency agreement is the same instrument facing the other way.",
    {
      "A": "Un",
      "buyer agency agreement": "acuerdo de representación del comprador",
      "is the same instrument facing the other way.": "es el instrumento equivalente desde la posición del comprador."
    }
  ],
  [
    "A trustee holds title or a power of sale for the lender's benefit until the debt is satisfied",
    {
      "A": "Un"
    }
  ],
  [
    "The convention is stated in the contract, and this course prescribes none. A 360-day year with 30-day months (\"statutory\" or \"banker's\" year) and a 365-day year with actual days are both in use, and which party is charged for the day of closing is likewise a matter of the contract.",
    {
      "A": "Un",
      "360-day year with 30-day months": "año de 360 días con meses de 30 días",
      "365-day year with actual days": "año de 365 días con días reales",
      "are both in use, and": "se utilizan en la práctica;",
      "which party is charged for the day of closing": "a qué parte se carga el día de cierre"
    }
  ],
  [
    "A fixed term with a stated beginning and end",
    {
      "A": "Un"
    }
  ],
  [
    "A holdover after a lawful tenancy has ended",
    {
      "A": "Una"
    }
  ],
  [
    "A broker's property for both rules includes properties held in partnership, joint venture or syndication where the broker's interest exceeds 20 percent.",
    {
      "A": "La",
      "broker's property": "propiedad del corredor",
      "for both rules includes properties held in": "a efectos de ambas reglas incluye bienes mantenidos en",
      "where the broker's interest exceeds": "cuando su participación supera el"
    }
  ],
  [
    "A letter of intent created by the broker, employing broker or firm, so long as it states on its face that it is nonbinding and creates no legal rights or obligations",
    {
      "A": "Una",
      "so long as it states on its face that it is nonbinding and creates no legal rights or obligations": "siempre que indique expresamente que no es vinculante ni crea derechos u obligaciones jurídicas"
    }
  ],
  [
    "A definite beginning and end — and never left blank",
    {
      "A": "Un"
    }
  ],
  [
    "A Trust or Escrow Account at a Recognized Depository, separate from the firm's own money",
    {
      "A": "Una",
      "at a": "en un",
      ", separate from the firm's own money": ", separada del dinero propio de la firma"
    }
  ],
  [
    "D. A reference to vendor documentation or other physical records verifying purpose for payment",
    {
      "A": "Una"
    }
  ],
  [
    "A six-column worksheet for the transaction — the instrument taught in the Closings course,",
    {
      "A": "Una",
      "for the transaction — the instrument taught in the": "para la operación —el instrumento enseñado en el curso de",
      "course,": ","
    }
  ],
  [
    "A ledger for the beneficiary, segregated, with the same transactional information.",
    {
      "A": "Un"
    }
  ],
  [
    "A reconciliation of the ledger total to the journal balance and to a sample bank statement.",
    {
      "A": "Una"
    }
  ],
  [
    "Chapters 8 and 9 were read but are not taught in this build. A declaratory order proceeding and the Commission's review of initial decisions and exceptions are procedural matters that arise after something has gone wrong, and no procedure, deadline, filing requirement or standard of review from either chapter is stated anywhere in this build.",
    {
      "A": "Un procedimiento de",
      "proceeding and the": "y la"
    }
  ],
  [
    "A six-unit building at $1,375 per unit per month. Price $1,240,000. Earnest money $25,000. New loan $930,000; buyer's loan costs $11,800. Compensation 5 percent, seller. Seller's payoff $486,200. Title insurance $3,100, seller. Recording: buyer $180, seller $40. June rents collected in full by the seller; security deposits of $1,375 per unit are held by the seller's managing brokerage. Closing 20 June; 30-day month; buyer charged for the day of closing.",
    {
      "A": "Un edificio de",
      "building at": "con una renta de",
      ". Compensation": ". Remuneración",
      ", seller. Seller's payoff": ", a cargo del vendedor. Cancelación del préstamo del vendedor",
      "June rents collected in full by the seller": "Rentas de junio cobradas íntegramente por el vendedor",
      "buyer charged for the day of closing": "el día de cierre se carga al comprador"
    }
  ],
  [
    "A written agency agreement disclosing the § 12-10-404 or § 12-10-405 duties",
    {
      "A": "Un",
      "written agency agreement": "acuerdo escrito de representación",
      "disclosing the § 12-10-404 or § 12-10-405 duties": "que divulga los deberes de § 12-10-404 o § 12-10-405"
    }
  ],
  [
    "Rule 1.2: \"Advertise or Advertising: The promotion, solicitation, or representation of Real Estate Brokerage Services requiring a License. Advertising may include, but is not limited to, business cards, brochures, websites, signage, property flyers, mailings (paper or electronic), SOCIAL MEDIA, letterhead, EMAIL SIGNATURES, and contract documents. A uniform resource locator (URL) and an email address are NOT considered Advertising for purposes of Rule 6.10 so long as they are not directly used to promote or solicit Real Estate Brokerage Services.\"",
    {
      "A": "Un",
      "business cards, brochures, websites, signage, property flyers, mailings (paper or electronic), SOCIAL MEDIA, letterhead, EMAIL SIGNATURES, and contract documents.": "tarjetas de visita, folletos, sitios web, letreros, anuncios de propiedades, envíos postales o electrónicos, REDES SOCIALES, membretes, FIRMAS DE CORREO ELECTRÓNICO y documentos contractuales.",
      "uniform resource locator (URL) and an email address are NOT considered Advertising": "localizador uniforme de recursos (URL) y una dirección de correo electrónico NO se consideran publicidad"
    }
  ],
  [
    "Colorado's own brokerage relationship law is a different course. The Contracts and Regulations course carries Topic II, Colorado Statutory Relationships, allocated four hours, and it delivers §§ 12-10-402 through 12-10-411 section by section. This module supplies the general framework that Colorado's statute then displaces in specific and important ways, and it says so at each point rather than letting a student carry a general rule into a Colorado transaction.",
    {
      "The": "El programa de",
      "course carries": "incluye el",
      ", allocated four hours, and it delivers": ", con cuatro horas asignadas, y desarrolla"
    }
  ],
  [
    "Colorado's own statute of frauds was NOT read by this project, and no Colorado section number, wording or exception is stated in this course. The Contracts and Regulations outline names the Statute of Frauds under its Topic I.B.4, and that is where a Colorado answer belongs.",
    {
      "The": "El programa de",
      "outline names the Statute of Frauds under its Topic I.B.4, and that is where a Colorado answer belongs.": "menciona el Statute of Frauds en el Tema I.B.4; allí corresponde buscar la respuesta específica para Colorado."
    }
  ],
  [
    "The Practical Applications course develops this from the new broker's side under its Topic I, Entering the Field, and the Record Keeping and Trust Accounts course develops the employing broker's accounting responsibilities under Rule 5.22, which holds the employing broker jointly responsible with the firm for Chapter 5.",
    {
      "The": "El programa de",
      "course develops this from the new broker's side under its Topic I,": "lo desarrolla desde la perspectiva del corredor que inicia su carrera, en el Tema I,",
      ", and the": ", y el programa de",
      "course develops the employing broker's accounting responsibilities under": "desarrolla las responsabilidades contables del corredor empleador según la"
    }
  ],
  [
    "This is the national finance module. The Closings course — 24 hours, of which the Commission allocates 16 to the preparation of a minimum of eight closing problems — is where Colorado practice is taught, and this module points forward to it rather than duplicating it.",
    {
      "The": "El programa de",
      "course — 24 hours, of which the Commission allocates": "—24 horas, de las que la Comisión asigna"
    }
  ],
  [
    "The Contracts and Regulations outline names deeds of trust and foreclosure under its Topic V.B, and the Current Legal Issues outline names financing, liens and foreclosures among its representative areas. Those are the Colorado courses.",
    {
      "The": "El programa de",
      "outline names": "menciona",
      "under its Topic V.B, and the": "en el Tema V.B; el programa de"
    }
  ],
  [
    "What is NOT here is Colorado's landlord-tenant law. The Contracts and Regulations outline names the Landlord Tenant Act, § 38-12-101 et seq. at its Topic V.G. That statute was NOT read by this project, and no deposit limit, return period, notice period, entry requirement, habitability standard or eviction procedure is stated anywhere in this build.",
    {
      "The": "El programa de",
      "outline names the": "menciona la",
      "Landlord Tenant Act, § 38-12-101 et seq.": "Ley de arrendadores y arrendatarios, § 38-12-101 et seq.",
      "at its Topic V.G.": "en el Tema V.G.",
      "That statute was NOT read by this project": "Este proyecto NO consultó esa ley",
      "no deposit limit, return period, notice period, entry requirement, habitability standard or eviction procedure is stated anywhere in this build.": "en esta versión no se enuncian límites de depósitos, plazos de devolución o aviso, requisitos de entrada, normas de habitabilidad ni procedimientos de desalojo."
    }
  ],
  [
    "The Commission issues position statements. The Practical Applications outline names one by number — CP 41, on gaining competency — and the Record Keeping and Trust Accounts outline names \"Position Statements\" among the Commission rules and regulations a student must meet.",
    {
      "The": "El programa de",
      "outline names": "menciona",
      "outline names one by number —": "menciona una por su número:",
      ", on gaining competency — and the": ", sobre adquisición de competencia; el programa de"
    }
  ],
  [
    "§§ 12-10-217 And 12-10-219 were NOT read by this project. No ground, sanction, penalty, fine, suspension, revocation, hearing procedure or appeal right is stated anywhere in this build. The Current Legal Issues outline names \"instructive Disciplinary Proceedings\" as the first of its three major topic areas, and the Commission supplies that material to authorized providers.",
    {
      "The": "El programa de",
      "outline names": "menciona",
      "\"instructive": "«procedimientos",
      "Disciplinary Proceedings": "disciplinarios ilustrativos",
      "\"": "»"
    }
  ],
  [
    "Possession — when, and by whom. The Practical Applications outline names **early",
    {
      "The": "El programa de",
      "outline names **early": "menciona la **ocupación anticipada"
    }
  ],
  [
    "Where the answer lives. The Current Legal Issues outline names \"financing, liens, foreclosures\" among its representative areas at Topic 3.3, and the Commission staff supplies that course's mandatory content to authorized providers. This build is not on those records and has not received that material — a submission gate recorded in the readings file.",
    {
      "The": "El programa de",
      "outline names": "menciona",
      "Where the answer lives.": "Dónde se encuentra la respuesta.",
      "This build is not on those records and has not received that material": "Este proyecto no figura en esos registros ni ha recibido ese material",
      "— a submission gate recorded in the readings file.": "—un requisito pendiente para la presentación, consignado en el archivo de lecturas."
    }
  ],
  [
    "No Colorado property tax statute, assessment ratio, mill levy, rate, exemption, due date, delinquency consequence or tax sale procedure was read by this project, and none is stated anywhere in this build. The Closings course prorates taxes on the convention the contract states, using figures the transaction supplies.",
    {
      "The": "El programa de",
      "course prorates taxes on": "prorratea los impuestos según",
      ", using figures the transaction supplies.": ", utilizando los datos de la operación."
    }
  ],
  [
    "And the underlying discipline: everything the parties agreed goes into the contract or an amendment, and what goes into the contract appears on the closing statement. The Closings outline puts it in six words at its Topic III.A.1 — \"Close to contract or amend contract in writing.\"",
    {
      "The": "El programa de",
      "outline puts it in six words at its Topic III.A.1 —": "lo resume en seis palabras en el Tema III.A.1:"
    }
  ],
  [
    "No Colorado interpleader statute or rule of civil procedure was read by this project, and no procedure, deadline, filing requirement, fee or cost rule is stated anywhere in this build. The Contracts and Regulations outline names \"remedies including damages and specific performance\" among the Current Legal Issues representative areas, and the Commission supplies that course's mandatory material to authorized providers.",
    {
      "The": "El programa de",
      "outline names": "menciona",
      "among the": "entre los ámbitos representativos de",
      "representative areas, and the Commission supplies that course's mandatory material to authorized providers.": ", y la Comisión suministra el material obligatorio de ese curso a los proveedores autorizados."
    }
  ],
  [
    "The Record Keeping and Trust Accounts outline names \"Position Statements\" at its Topic I.D.2,",
    {
      "The": "El programa de",
      "outline names": "menciona"
    }
  ],
  [
    "The Practical Applications outline names one by number at its Topic I.D — *\"Gaining competency",
    {
      "The": "El programa de",
      "outline names one": "menciona una"
    }
  ],
  [
    "The Contracts and Regulations outline names \"*Commission interpretations and positions on the",
    {
      "The": "El programa de",
      "outline names": "menciona"
    }
  ],
  [
    "The Current Legal Issues outline names \"Unauthorized Practice of Law concerns\" at its topic area 3.11, and the Contracts and Regulations outline names the two decisions that settle the question in Colorado at its Topic I.B.1 and I.B.2.",
    {
      "The": "El programa de",
      "outline names": "menciona",
      "at its topic area 3.11, and the": "en el área temática 3.11; el programa de",
      "outline names the two decisions that settle the question in Colorado at its Topic I.B.1 and I.B.2.": "menciona las dos decisiones que resuelven la cuestión en Colorado en los Temas I.B.1 e I.B.2."
    }
  ],
  [
    "And the Commission's own form structure recognises the difference. The Contracts and Regulations outline's Topic IV.A names a distinct family — Contract to Buy and Sell Real Estate (Vacant Land/Farm & Ranch) — and its Topic III requires the student to \"include by comparison the differences between residential, commercial and farm and ranch/vacant land form.\"",
    {
      "The": "El programa de",
      "outline's Topic IV.A names a distinct family —": "identifica una familia distinta en el Tema IV.A:",
      "— and its Topic III requires the student to": "—y el Tema III exige al estudiante",
      "\"include": "«incluir",
      "by comparison the differences between residential, commercial and farm and ranch/vacant land": "mediante comparación las diferencias entre los formularios residenciales, comerciales y de granjas, ranchos y terrenos sin edificar",
      "form.\"": "»."
    }
  ],
  [
    "No Colorado period, element, deadline, notice requirement, redemption right, priority rule, tax rate, exemption or procedure is stated in this module. The four-year transaction file retention period, the 20 percent entity ownership threshold, the four routes in Rule 6.2.B, and the 48 hours are transcribed from the rules and statutes named above.",
    {
      "The": "El plazo de conservación del expediente de",
      "transaction file retention period, the": ", el umbral de participación en entidades del",
      "entity ownership threshold, the four routes in": ", las cuatro vías de la",
      ", and the": ", y las",
      "are transcribed from the rules and statutes named above.": "se transcriben de las reglas y leyes antes identificadas."
    }
  ],
  [
    "No disciplinary ground, penalty, fine, sanction, subdivision threshold, public report requirement, protected class beyond the seven federal classes, appraiser requirement, CCIOA requirement, form version, continuing education figure, or unauthorized-practice holding is stated in this module. The 168 hours, the six course names and their hour figures, the eight kinds of standard form, the advise-versus- insert split, the attorney form language, and the four-year transaction file period are all transcribed from the statute and rules named beside them.",
    {
      "The": "Los siguientes datos:",
      ", the": ",",
      ", and the": ", y el plazo de",
      "transaction file period are all transcribed from the statute and rules named beside them.": "para el expediente de la operación se transcriben de la ley y las reglas identificadas junto a cada uno."
    }
  ],
  [
    "No disciplinary ground, sanction, penalty, hearing procedure, referral fee threshold, psychologically- impacted-property rule, time period for presenting an offer, or form provision is stated in this module. The one year in § 12-10-409(1)(b)(III) is the statute's own, and every quoted passage is transcribed from the section or rule named beside it.",
    {
      "The": "El plazo de"
    }
  ],
  [
    "No form contents, version, date, paragraph number, holdover period, compensation rate, listing term or programme requirement is stated in this module. The one year in § 12-10-409(1)(b)(III), the Change of Status timing in Rule 6.9, and the six families and related form names are transcribed from the statute, rule and Commission outline named beside them.",
    {
      "The": "El plazo de",
      "in § 12-10-409(1)(b)(III), the": "de § 12-10-409(1)(b)(III), el plazo del",
      "timing in Rule 6.9, and the": "en la Regla 6.9, y las"
    }
  ],
  [
    "No dormancy period, unclaimed property deadline, remittance requirement, deposit limit, tenant remedy, disciplinary sanction or penalty is stated in this module. The one year in § 12-10-409(1)(b)(III), the 30 days and 60 days in Rule 5.8.B, and the four years in Rule 6.20 are transcribed from the statute and rules named beside them.",
    {
      "The": "El plazo de"
    }
  ],
  [
    "The landlord side of a lease transaction — the letting equivalent of the right-to-sell",
    {
      "The": "La parte del",
      "side of a lease transaction — the letting equivalent of the right-to-sell": "en el arrendamiento: el equivalente del derecho exclusivo de venta aplicado al alquiler"
    }
  ],
  [
    "The tenant side — engages the broker to find premises for a tenant",
    {
      "The": "La parte del",
      "side — engages the broker to find premises for a tenant": ": contrata al corredor para buscarle un inmueble"
    }
  ],
  [
    "An ad valorem lien on the parcel, ordinarily taking priority over other liens, and one of the items prorated at closing.",
    {
      "An": "Un gravamen",
      "lien on the parcel, ordinarily taking priority over other liens, and one of the items": "sobre la parcela, normalmente prioritario frente a otros gravámenes, y uno de los conceptos",
      "prorated": "prorrateados"
    }
  ],
  [
    "The connection this exercise exists to make. The closing statement says what the parties owe each other. The journal and ledger say what the brokerage received and disbursed. They are two views of the same money, and a student who can produce both from one contract understands trust accounting.",
    {
      "The connection this exercise exists to make.": "La conexión que pretende mostrar este ejercicio.",
      "says what the parties owe each other. The": "indica lo que las partes se deben entre sí. El",
      "journal and ledger": "diario y el libro mayor",
      "say what the brokerage received and disbursed.": "indican lo que la agencia recibió y desembolsó."
    }
  ],
  [
    "The accounting to the beneficiary is still owed",
    {
      "The": "La",
      "accounting": "rendición de cuentas",
      "to the beneficiary is still owed": "al beneficiario sigue siendo obligatoria"
    }
  ],
  [
    "No RESPA requirement, withholding rate or threshold, good funds definition or clearing period, referral fee threshold, disciplinary consequence, penalty or form provision is stated in this module. The four years in Rule 6.20, the three business days in Rule 5.7.B, and every requirement in Rule 6.19 are transcribed from 4 CCR 725-1.",
    {
      "in Rule 6.20, the": "de la Regla 6.20, los",
      "in Rule 5.7.B, and every requirement in": "de la Regla 5.7.B y cada requisito de la",
      "The": "Los siguientes datos:"
    }
  ],
  [
    "No form provision, checklist item, deed form requirement, recording requirement, authority rule, good funds definition, clearing period, disclosure requirement or penalty is stated in this module. The four years and the two start dates in Rule 6.20, and every requirement in Rule 6.19, are transcribed from 4 CCR 725-1.",
    {
      "and the": "y las",
      "in Rule 6.20, and every requirement in": "de la Regla 6.20, y cada requisito de la",
      "The": "Los siguientes datos:"
    }
  ],
  [
    "No form provision, position statement, referral fee threshold, affiliated business requirement, appraisal standard, copyright rule, foreclosure procedure or penalty is stated in this module. The three days in Rule 6.10.D, the prohibited team-name terms, the two independently-owned-and-operated statements, and Rule 6.12's notice are quoted verbatim from 4 CCR 725-1.",
    {
      "in Rule 6.10.D, the": "de la Regla 6.10.D, los",
      "prohibited team-name terms": "términos prohibidos para nombres de equipos",
      ", the": ", las",
      "The": "Los siguientes datos:"
    }
  ],
  [
    "The actually known disclosure duty and where a reservation appears",
    {
      "The": "El deber de divulgar hechos",
      "actually known": "efectivamente conocidos",
      "disclosure duty and where a reservation appears": "y el lugar donde aparece una reserva de derechos"
    }
  ],
  [
    "The actually known disclosure duty and that water may not pass",
    {
      "The": "El deber de divulgar hechos",
      "actually known": "efectivamente conocidos",
      "disclosure duty and that water may not pass": "y la posibilidad de que los derechos de agua no se transmitan"
    }
  ],
  [
    "No deposit limit, return period, notice period, entry requirement, habitability standard, late fee, eviction timeline, occupancy standard or tenant remedy is stated in this module. The five business days, three business days, 30 days, 60 days, monthly withdrawal, 30 days after month end, and 20 percent are all transcribed from 4 CCR 725-1 and C.R.S. § 12-10-201(6)(b)(VII), and every figure in a worked calculation is supplied inside that calculation as a given.",
    {
      "The": "Los siguientes datos:",
      "monthly": "retiro mensual",
      "withdrawal,": ",",
      "are all": "se",
      "transcribed from 4 CCR 725-1 and C.R.S. § 12-10-201(6)(b)(VII)": "transcriben de 4 CCR 725-1 y C.R.S. § 12-10-201(6)(b)(VII)"
    }
  ],
  [
    "No foreclosure period, redemption right, tax rate, assessment ratio, special district levy, insurance coverage amount, water right rule, rate ceiling, servicing standard, fraud element, deposit limit, notice period or eviction timeline is stated in this module. The five business days, three business days, 30 days and 60 days are transcribed from 4 CCR 725-1, and every other requirement stated is transcribed from the section or rule named beside it.",
    {
      "The": "Los siguientes datos:"
    }
  ],
  [
    "No checklist item, form provision, FDIC coverage amount, disciplinary sanction, penalty, deposit limit or software requirement is stated in this module. The three business days, five business days, 30 days, monthly withdrawal and reconciliation, and four years are transcribed from 4 CCR 725-1, and every figure in every worked reconciliation is supplied inside the problem as a given.",
    {
      "The": "Los siguientes datos:",
      "monthly": "retiro mensual",
      "withdrawal and reconciliation, and": "y conciliación mensual, y",
      "are transcribed from": "se transcriben de"
    }
  ],
  [
    "No practitioner aid content, good funds definition, clearing period, dormancy period, unclaimed property deadline, interpleader procedure, disciplinary sanction, penalty, deposit limit or signature requirement is stated in this module. The 30 days, 60 days, monthly withdrawal, and 20 percent threshold are transcribed from 4 CCR 725-1 and C.R.S. § 12-10-201(6)(b)(VII).",
    {
      "The": "Los siguientes datos:",
      "monthly": "retiro mensual",
      "withdrawal, and": ", y el umbral del",
      "threshold are transcribed from": "se transcriben de"
    }
  ],
  [
    "No position statement content, checklist item, insurance coverage amount, licence fee, membership due, commission split, disciplinary ground or penalty is stated in this module. The two years and 24 hours in § 12-10-203(5)(c), and the four routes in Rule 6.2.B, are transcribed from the statute and rule named beside them.",
    {
      "The": "Los siguientes datos:"
    }
  ],
  [
    "No deposit limit, return period, notice period, entry requirement, habitability standard, late fee, eviction timeline, occupancy standard, tenant remedy, protected class beyond the seven federal classes, accessibility standard or lead-based paint requirement is stated in this module. The five business days, three business days, 30 days, 60 days, monthly withdrawal and reconciliation, three days in Rule 6.10.D, and 20 percent threshold are transcribed from 4 CCR 725-1 and C.R.S. § 12-10-201(6)(b)(VII).",
    {
      "The": "Los siguientes datos:",
      "monthly": "retiro mensual",
      "withdrawal and reconciliation,": "y conciliación mensual,",
      "threshold are transcribed from": "se transcriben de",
      "in Rule 6.10.D, and": "en la Regla 6.10.D, y el umbral del"
    }
  ],
  [
    "A broker whose licence is suspended shall return the licence to the Commission and post a notice of the Commission's action, provided by the Commission, prominently on or near the public entrance to each office, main and branch. \"Failure to post the notice constitutes grounds for further disciplinary action.\"",
    {
      "A": "Un",
      "and": "y deberá",
      ", main and branch.": ", tanto la principal como las sucursales.",
      ", provided by the Commission,": ", proporcionado por la Comisión,"
    }
  ],
  [
    "A fixture is personal property that has become real property by being attached. The tests, in the order they are usually applied:",
    {
      "A": "Un",
      "fixture": "elemento fijo",
      "is personal property that has become real property by being attached. The tests, in the order they are usually applied:": "es un bien mueble que se ha convertido en inmueble por su incorporación. Los criterios, en el orden en que suelen aplicarse, son:"
    }
  ],
  [
    "A life estate pur autre vie is measured by the life of someone other than the holder.",
    {
      "A": "Un",
      "life estate pur autre vie": "derecho vitalicio pur autre vie"
    }
  ],
  [
    "A licensee",
    {
      "A": "Un"
    }
  ],
  [
    "A broker, associate broker or qualified salesperson",
    {
      "A": "Un"
    }
  ],
  [
    "Initial education before preparing one. A Commission-approved initial education course in the",
    {
      "A": "Un"
    }
  ],
  [
    "A broker whose licence is suspended returns the licence and posts the Commission's notice prominently on or near the public entrance of the main office and every branch. \"Failure to post the notice constitutes grounds for further disciplinary action.\"",
    {
      "A": "Un"
    }
  ],
  [
    "An encumbrance is any claim, right or interest held by someone other than the owner that burdens the title or limits the use.",
    {
      "An": "Una"
    }
  ],
  [
    "An address identifies a mailbox. A tax parcel number identifies an assessment record. Neither describes land, and neither belongs in a deed as the description.",
    {
      "An": "Una",
      "identifies a mailbox. A": "identifica un buzón. Un",
      "tax parcel number": "número de parcela fiscal",
      ", and neither belongs in a deed as the description.": ", y ninguno sirve como descripción del terreno en una escritura."
    }
  ],
  [
    "An offer is a manifestation of willingness to be bound on stated terms. It may be revoked by the offeror at any time before acceptance, unless consideration was given to hold it open — which is what an option is.",
    {
      "An": "Una",
      "is a manifestation of willingness to be bound on stated terms. It may be": "es una manifestación de voluntad de quedar obligado según condiciones establecidas. Puede ser",
      ", unless consideration was given to hold it open — which is what an": ", salvo que se haya dado una contraprestación para mantenerla abierta; esto es lo que constituye una",
      "is.": "."
    }
  ],
  [
    "The primary market is where a loan is made — banks, savings institutions, credit unions, mortgage banking companies and mortgage brokers. The secondary market is where a loan already made is bought — Fannie Mae, Freddie Mac and Ginnie Mae — through loan pooling and mortgage-backed securities.",
    {
      "The": "El",
      "is where a loan is": "es donde un préstamo es",
      "made": "originado",
      "— banks, savings institutions, credit unions, mortgage banking companies and mortgage brokers. The": "—bancos, entidades de ahorro, cooperativas de crédito, compañías de banca hipotecaria y brókeres hipotecarios—. El",
      "is where a loan already made is": "es donde un préstamo ya originado es"
    }
  ],
  [
    "The seller's written agreement.",
    {
      "The": "El"
    }
  ],
  [
    "No Recovery Fund payment limit, commission rate, or Statute of Frauds provision is stated in this module. The one-year maximum listing period, the six prohibited provisions, the bold-face requirement and the Commission telephone number are transcribed from § 35.331 and § 35.332.",
    {
      "The": "El",
      ", the": ",",
      "one-year maximum listing period": "período máximo de un año para el contrato de representación para la venta",
      "six prohibited provisions": "las seis cláusulas prohibidas",
      "bold-face requirement": "el requisito de letra en negrita",
      "and the": "y el"
    }
  ],
  [
    "No transfer tax rate, Recovery Fund limit, zoning classification, permit requirement, interest rate or lender requirement is stated in this module. The five-day cancellation period, the 10 point bold face requirement and the Commission telephone number are transcribed from § 35.333.",
    {
      "The": "El"
    }
  ],
  [
    "The listing broker",
    {
      "The": "El"
    }
  ],
  [
    "The selling broker, buyer having prior notice it goes to the listing broker",
    {
      "The": "El",
      ", buyer having": ", cuando el comprador ha recibido",
      "prior notice": "aviso previo de que",
      "it goes to the listing broker": "se entregará al bróker del vendedor"
    }
  ],
  [
    "The selling broker, without that prior notice",
    {
      "The": "El",
      "that prior notice": "ese aviso previo"
    }
  ],
  [
    "And note whose obligation is whose. The seller discloses. The licensee provides the seller with a conforming statement. Those are two different acts by two different people, and confusing them is the source of the most serious error in this area — a licensee filling in the seller's form.",
    {
      "The": "El",
      "discloses. The": "divulga. El"
    }
  ],
  [
    "A transaction licensee provides services without being anyone's agent. § 35.292's twelve duties still apply in full — honesty, good faith, presentation of all offers, routing, competence, all of it. What is absent is loyalty, advocacy, and general confidentiality.",
    {
      "A": "Un",
      "transaction licensee provides services without being anyone's agent.": "licenciatario de transacción presta servicios sin actuar como agente de ninguna de las partes.",
      ", and general": ", y la",
      "confidentiality": "confidencialidad general"
    }
  ],
  [
    "No wording from any consumer notice, and no § 35.284(a)(2) outer-limit event, is stated in this module. The 3-year and 6-month retention periods and the refusal-noting rule are transcribed from §§ 35.286 and 35.284(d).",
    {
      "The": "Los períodos de conservación de",
      "retention periods and the": "y la regla de",
      "rule are transcribed from §§ 35.286 and 35.284(d).": "están transcritos de §§ 35.286 y 35.284(d)."
    }
  ],
  [
    "Two things are declared negotiated, not one. The commission and the duration.",
    {
      "The": "La",
      "and the": "y la"
    }
  ],
  [
    "(1) \"The date of the agreement.\" (2) \"The names of the buyer and seller.\" (3) \"A description of the property and the interest to be conveyed.\" (4) \"The sale price.\" (5) \"The dates for payment and conveyance.\" (6) The zoning classification — see Part B. (7) \"A statement identifying the capacity in which the broker, or a licensee employed by the broker is involved in the transaction and whether services have been provided to another party in the transaction.\" (8) The escrow provision — \"payments of money received by the broker on account of the sale — regardless of the form of payment and the person designated as payee — shall be held by the broker in an escrow account pending consummation of the sale or a prior termination thereof.\" (9) The Real Estate Recovery Fund statement, in the words the rule prints — see Part C. (10) \"A statement that access to a public road may require issuance of a highway occupancy permit from the Department of Transportation.\" (11) For a time share or campground membership, the cancellation statement — see Part E.",
    {
      "\"The": "\"",
      "date of the agreement": "La fecha del acuerdo",
      "names of the buyer and seller": "Los nombres del comprador y del vendedor",
      "\"A": "\"Una",
      "sale price": "El precio de venta",
      "dates for payment and conveyance": "Las fechas de pago y transmisión",
      "The": "La",
      "zoning classification": "clasificación de zonificación",
      "\"A statement": "\"Una declaración",
      "identifying the capacity in which the broker, or a licensee employed by the broker is involved in the transaction and whether services have been provided to another party in the transaction": "que identifique en qué calidad participa el bróker o un licenciatario empleado por él en la transacción y si se han prestado servicios a otra parte de ella",
      "escrow provision": "cláusula de depósito en garantía",
      "For a": "Para una",
      "time share or campground membership": "participación de tiempo compartido o membresía de camping",
      ", the": ", la"
    }
  ],
  [
    "No statutory penalty, security deposit limit, lessor interest entitlement or Landlord and Tenant Act provision is stated in this module. The next-business-day deadline, the 1 business day post-acceptance deadline, the 6-month interest recommendation and the 30 days' notice before interpleader are all transcribed from Chapter 35.",
    {
      "The": "El plazo del",
      "next-business-day": "siguiente día hábil",
      "deadline, the": ", el plazo de",
      "post-acceptance deadline, the": "después de la aceptación, la recomendación de intereses a los",
      "interest recommendation and the": "y el aviso con",
      "before interpleader are all transcribed from Chapter 35.": "antes de la consignación judicial por reclamaciones contrapuestas están todos transcritos del Capítulo 35."
    }
  ],
  [
    "Not read, and therefore the source of nothing here: the sources listed in Part G. No appraiser licensing requirement, USPAP standard, security deposit limit, landlord-tenant deadline, statutory penalty or continuing-education fee is stated in this module. The 3-year active licence requirement, the 3 hours of BPO continuing education, the 2-year licence period, the 14 hours of continuing education, the 2-hour minimum increment, the 30-day reporting deadlines and every retention period are transcribed from Chapter 35.",
    {
      "The": "El",
      "3-year active licence requirement": "requisito de 3 años de licencia activa",
      ", the": ",",
      "3 hours": "las 3 horas",
      "of BPO continuing education, the": "de educación continua de BPO, el",
      "2-year licence period": "período de licencia de 2 años",
      "14 hours": "las 14 horas",
      "of continuing education, the": "de educación continua, el incremento mínimo de",
      "2-hour": "2 horas",
      "minimum increment, the": ", los plazos de notificación de",
      "30-day": "30 días",
      "reporting deadlines and every retention period are": "y todos los períodos de conservación están",
      "transcribed from Chapter 35.": "transcritos del Capítulo 35.",
      "Not read, and therefore the source of nothing here:": "No se consultaron y, por tanto, no respaldan nada de lo expuesto aquí:"
    }
  ],
  [
    "A fixture is personal property attached to real estate so as to have become part of it. Once it is a fixture it conveys unless expressly excluded, and the buyer is entitled to find it there at closing.",
    {
      "A": "Un",
      "fixture": "elemento incorporado permanentemente al inmueble",
      "is personal property attached to real estate so as to have become part of it. Once it is a fixture it conveys unless expressly excluded, and the buyer is entitled to find it there at closing.": "es un bien mueble adherido al inmueble de tal forma que ha pasado a ser parte de él. Una vez incorporado de ese modo, se transmite con el inmueble salvo exclusión expresa, y el comprador tiene derecho a que esté allí en el cierre."
    }
  ],
  [
    "A trade fixture is an item a tenant attaches for the conduct of their business — a walk-in cooler, a hydraulic lift, shelving fitted to a shop floor. 60 O.S. 334 allows a tenant, during the term, to remove qualifying items affixed for trade, manufacture, ornament or domestic use if removal can occur without injury to the premises and the item has not become an integral part of them. An agreement permitting removal or an owner's permission can also matter. Do not assume every attached business item is removable or that leaving it behind automatically proves a gift. Review the lease, attachment, damage and timing; refer disputed ownership or removal rights to counsel.",
    {
      "A": "Una",
      "trade fixture": "instalación comercial del arrendatario",
      "is an item a tenant attaches for the conduct of their business — a walk-in cooler, a hydraulic lift, shelving fitted to a shop floor.": "es un elemento que el arrendatario instala para desarrollar su negocio: una cámara frigorífica, un elevador hidráulico o estanterías fijadas en una tienda."
    }
  ],
  [
    "The state licensing examination, provisional sales associate / sales associate",
    {
      "The": "El examen",
      "state licensing": "de licencia estatal",
      "examination, provisional sales associate / sales associate": "para asociado de ventas provisional / asociado de ventas"
    }
  ],
  [
    "An instructor applicant's qualifying examination",
    {
      "An": "El examen de aptitud de un solicitante a",
      "instructor": "instructor",
      "applicant's qualifying examination": ""
    }
  ],
  [
    "An estate is the degree, quantity, nature and extent of a person's interest in land. Freehold estates are of indefinite duration and involve ownership; leasehold estates are of determinable duration and involve possession without ownership — Module OK-16's business.",
    {
      "Freehold": "Los derechos de propiedad (freehold)",
      "estates are of indefinite duration and involve ownership;": "tienen duración indefinida e implican titularidad;",
      "leasehold": "los derechos de arrendamiento (leasehold)",
      "estates are of determinable duration and involve possession without ownership — Module OK-16's business.": "tienen duración determinable e implican posesión sin titularidad: el tema del Módulo OK-16."
    }
  ],
  [
    "An easement is a right to use another's land for a particular purpose.",
    {
      "An": "Una"
    }
  ],
  [
    "A licence is mere permission to enter for a purpose. It is personal, revocable at will, and does not run with the land. Permission to hunt on a section is a licence; a recorded right of access is an easement. They look identical on the ground and are entirely different in law, which is why the question is answered from the records.",
    {
      "A": "Una",
      ", and does not run with the land. Permission to hunt on a section is a licence; a recorded right of access is an easement. They look identical on the ground and are entirely different in law, which is why the question is answered from the records.": ", y no se transmite con el inmueble. El permiso para cazar en una sección de terreno es una licencia; un derecho de acceso inscrito es una servidumbre. Pueden parecer idénticos sobre el terreno, pero son totalmente distintos jurídicamente; por eso la respuesta se obtiene de los registros."
    }
  ],
  [
    "An encroachment is an unauthorised physical intrusion of an improvement onto adjoining land — a fence, a shed, an eave, a drive. It is not permission of any kind; it is a trespass that has been built.",
    {
      "An": "Una",
      "is an unauthorised physical intrusion of an improvement onto adjoining land — a fence, a shed, an eave, a drive. It is not permission of any kind; it is a trespass that has been built.": "es una invasión física no autorizada del terreno colindante por una construcción: una cerca, un cobertizo, un alero o un acceso vehicular. No supone permiso alguno; es una ocupación no autorizada materializada en una construcción."
    }
  ],
  [
    "A lien is a charge against property securing a debt or obligation. It affects title; it does not by itself dispossess. Every lien is classified twice:",
    {
      "A": "Un"
    }
  ],
  [
    "A title search is an examination of the public records to determine the condition of title: who owns the property, what interests burden it, and whether anything in the record casts doubt on the owner's ability to convey what the contract says they will convey.",
    {
      "A": "Una"
    }
  ],
  [
    "The chain of title is the successive record of conveyances from an accepted starting point to the present owner. Each link should connect: the grantee of one deed is the grantor of the next.",
    {
      "The": "La"
    }
  ],
  [
    "A gap in the chain — a missing conveyance, an estate that never went through probate, a name that does not match, a signature that is absent — is a cloud, and clouds are resolved before closing rather than explained away at it.",
    {
      "A": "Una",
      "in the chain — a missing conveyance, an estate that never went through probate, a name that does not match, a signature that is absent — is a": "en la cadena —una transmisión faltante, una herencia que nunca pasó por el procedimiento sucesorio, un nombre que no coincide o una firma ausente— constituye un",
      "cloud": "defecto que pone en duda el título",
      ", and clouds are resolved before closing rather than explained away at it.": ", y estos defectos se resuelven antes del cierre, en vez de intentar justificarlos durante él."
    }
  ],
  [
    "An abstract of title is a compiled history of the recorded instruments affecting a parcel. Oklahoma practice retains a real role for abstracts, and an abstract that is brought current and examined by an attorney produces an attorney's title opinion. Title insurance is the other route, and the two coexist. Which form of title evidence a transaction uses is settled in the contract, which is one more reason the contract is read before it is signed.",
    {
      "is a compiled history of the recorded instruments affecting a parcel. Oklahoma practice retains a real role for abstracts, and an abstract that is brought current and examined by an attorney produces an": "es un historial recopilado de los instrumentos inscritos que afectan a una parcela. Los resúmenes del título siguen teniendo una función importante en la práctica de Oklahoma. Cuando se actualizan y un abogado los examina, dan lugar a una",
      "attorney's title opinion": "opinión jurídica sobre el título",
      "Which form of title evidence a transaction uses is settled in the contract": "La forma de acreditar el título que se utilizará en la transacción se determina en el contrato"
    }
  ],
  [
    "A title commitment is the title company's conditional promise to insure. It is not a title opinion, not a coverage summary, and not a guarantee that anything is clear. It says: on these facts, if these requirements are satisfied, we will issue a policy subject to these exceptions.",
    {
      "A": "Un",
      "title commitment": "compromiso de seguro de título",
      "is the title company's": "es la",
      "conditional promise to insure": "promesa condicional de una compañía de títulos de emitir un seguro"
    }
  ],
  [
    "An owner's policy insures the owner against loss from covered title defects existing at the date of policy — forged instruments, undisclosed heirs, incompetent grantors, recording errors, defective deeds, undisclosed liens. Coverage is retrospective: it insures the past, not future events.",
    {
      "An": "Una",
      "insures the owner against loss from covered title defects": "asegura al propietario frente a pérdidas por defectos del título cubiertos",
      "existing at the date of policy": "existentes en la fecha de la póliza",
      "— forged instruments, undisclosed heirs, incompetent grantors, recording errors, defective deeds, undisclosed liens. Coverage is": "—instrumentos falsificados, herederos no revelados, otorgantes sin capacidad jurídica, errores de inscripción, escrituras defectuosas o gravámenes no revelados—. La cobertura es"
    }
  ],
  [
    "A lender's policy insures the lender's lien position in the amount of the loan and decreases as the loan is repaid. A lender's policy does not protect the buyer, and buyers regularly believe that it does. Say so, plainly, every time.",
    {
      "A": "Una",
      "in the amount of the loan and decreases as the loan is repaid.": "por el importe del préstamo, y la cobertura disminuye a medida que se amortiza.",
      "A lender's policy does not protect the buyer": "La póliza del prestamista no protege al comprador"
    }
  ],
  [
    "An unreleased mortgage long since paid. Payment alone does not clear the record.",
    {
      "An": "Una",
      "unreleased mortgage": "hipoteca sin cancelación inscrita"
    }
  ],
  [
    "A missing signature — a spouse, a co-owner, a person whose interest nobody noticed.",
    {
      "A": "Una",
      "missing signature": "firma faltante"
    }
  ],
  [
    "A name discrepancy — the grantee took as one name and conveyed as another.",
    {
      "A": "Una",
      "— the grantee took as one name and conveyed as another.": "—el adquirente recibió la propiedad con un nombre y la transmitió con otro."
    }
  ],
  [
    "An estate that never went through probate, so the heirs' interests were never established.",
    {
      "An": "Una"
    }
  ],
  [
    "A judgment against someone with the seller's name.",
    {
      "A": "Una"
    }
  ],
  [
    "A defective legal description in an earlier deed.",
    {
      "A": "Una",
      "in an earlier deed.": "en una escritura anterior."
    }
  ],
  [
    "An unreleased oil and gas lease or a severed mineral interest whose owner cannot be located.",
    {
      "An": "Un",
      "unreleased oil and gas lease": "arrendamiento de derechos de petróleo y gas sin cancelación inscrita",
      "or a": "o un",
      "severed mineral interest": "derecho minero separado de la propiedad superficial"
    }
  ],
  [
    "A release or satisfaction, recorded.",
    {
      "A": "Una",
      "release": "cancelación del gravamen",
      "satisfaction": "constancia de pago de la deuda",
      ", recorded.": ", inscrita."
    }
  ],
  [
    "A corrective deed, to fix a description or a name.",
    {
      "A": "Una",
      ", to fix a description or a name.": ", para corregir una descripción o un nombre."
    }
  ],
  [
    "A quit claim deed, to convey away a possible interest.",
    {
      "A": "Una"
    }
  ],
  [
    "An affidavit — of identity, of heirship, of scrivener's error — where the title company will",
    {
      "An": "Una",
      "affidavit": "declaración jurada"
    }
  ],
  [
    "A probate proceeding, where an estate must be administered.",
    {
      "A": "Un"
    }
  ],
  [
    "A suit to quiet title, where nothing else will do. It is a lawsuit, it takes months, and a closing",
    {
      "A": "Una",
      ", where nothing else will do. It is a lawsuit, it takes months, and a closing": ", cuando no hay otra solución. Es un proceso judicial, tarda meses, y un cierre"
    }
  ],
  [
    "The comprehensive plan is a municipality's long-range policy document. Zoning is meant to implement it, dividing a jurisdiction into districts and regulating use and dimension — setbacks, height, lot coverage, density, parking.",
    {
      "The": "El",
      "Zoning": "La zonificación",
      "is meant to implement it, dividing a jurisdiction into districts and regulating": "busca aplicarlo dividiendo una jurisdicción en distritos y regulando el",
      "use": "uso",
      "and": "y las",
      "dimension": "dimensiones"
    }
  ],
  [
    "A deed is the instrument that conveys an interest in real estate. To be valid it needs:",
    {
      "A": "Una",
      "is the instrument that conveys an interest in real estate. To be valid it needs:": "es el instrumento que transmite un derecho sobre un inmueble. Para ser válida necesita:"
    }
  ],
  [
    "A grantor with legal capacity;",
    {
      "A": "Un"
    }
  ],
  [
    "A grantee identified with certainty;",
    {
      "A": "Un"
    }
  ],
  [
    "An adequate legal description;",
    {
      "An": "Una"
    }
  ],
  [
    "The grantor's signature, and in practice acknowledgement before a notary so the instrument may",
    {
      "The": "La",
      ", and in practice": ", y en la práctica"
    }
  ],
  [
    "A net arrangement is one in which the owner receives a fixed net amount and the broker keeps whatever is above it.",
    {
      "A": "Un acuerdo de remuneración",
      "net": "neta",
      "arrangement is one in which the owner receives a fixed net amount and the broker keeps whatever is above it.": "es aquel en que el propietario recibe una suma neta fija y el corredor conserva lo que exceda de esa suma."
    }
  ],
  [
    "A credit to a party is money in their favour. A debit is money against them.",
    {
      "A": "Un",
      "credit": "crédito",
      "to a party is money in their favour. A": "a una parte es dinero a su favor. Un",
      "is money against them.": "es dinero a su cargo."
    }
  ],
  [
    "The mutual promises: the buyer promises to pay, the seller promises to convey. Earnest money is not the consideration.",
    {
      "The": "Las",
      "Earnest money is not the consideration.": "El depósito de buena fe no es la contraprestación."
    }
  ],
  [
    "A definite proposal, communicated to the offeree, showing an intention to be bound on acceptance.",
    {
      "A": "Una",
      "definite proposal, communicated to the offeree, showing an intention to be bound on acceptance.": "propuesta concreta, comunicada a su destinatario, que muestra la intención de quedar obligado si se acepta."
    }
  ],
  [
    "An offer or counter-offer proposes terms before there is a contract.",
    {
      "An": "Una",
      "proposes terms": "propone términos",
      "before": "antes de que",
      "there is a contract.": "exista un contrato."
    }
  ],
  [
    "An amendment changes a contract that already exists and requires the agreement of all parties.",
    {
      "An": "Una"
    }
  ],
  [
    "A notice exercises a right the contract already gives — removing a contingency, giving notice of",
    {
      "A": "Una",
      "exercises a right the contract": "permite ejercer un derecho que el contrato",
      "already gives": "ya concede",
      "— removing a contingency, giving notice of": "—eliminar una condición contractual, notificar"
    }
  ],
  [
    "A contingency is a condition that must be satisfied or waived before a party is obliged to perform. It is not a general right to change one's mind.",
    {
      "A": "Una",
      "contingency": "contingencia contractual",
      "is a condition that must be satisfied or waived before a party is obliged to perform.": "es una condición que debe cumplirse o a la que debe renunciarse antes de que una parte quede obligada a cumplir.",
      "It is not a general right to change one's mind.": "No es un derecho general a cambiar de opinión."
    }
  ],
  [
    "§ 858-353(A)(4) is the controlling provision, and it is a closed list. The only confidential information in an Oklahoma transaction is:",
    {
      "The": "La",
      "only": "única",
      "confidential information in an Oklahoma transaction is:": "información confidencial en una transacción de Oklahoma es:"
    }
  ],
  [
    "The promissory note is the borrower's promise to repay — the debt. Amount, rate, term, payment, consequences of default.",
    {
      "The": "El"
    }
  ],
  [
    "The security instrument pledges the property as security — the lien. Without it the lender has a promise and no property; without the note, a lien securing nothing.",
    {
      "The": "El",
      "pledges the property as security —": "afecta la propiedad como garantía —"
    }
  ],
  [
    "Adjustable rate. An index plus a margin, adjusting on a schedule, with caps on the periodic adjustment and on the lifetime rate.",
    {
      ", adjusting on a schedule, with": ", con ajustes según un calendario y",
      "on the periodic adjustment and on the": "para cada ajuste periódico y para la tasa durante toda la",
      "lifetime": "vigencia del préstamo",
      "rate.": "."
    }
  ],
  [
    "The primary market is where loans are made. The secondary market is where they are bought and sold after origination.",
    {
      "The": "El",
      "is where loans are made. The": "es donde se conceden los préstamos. El"
    }
  ],
  [
    "The Real Estate Settlement Procedures Act governs settlement services on most federally related residential mortgage loans. Two prohibitions matter directly:",
    {
      "The": "La"
    }
  ],
  [
    "The TILA-RESPA Integrated Disclosure rule requires:",
    {
      "The": "La regla de",
      "TILA-RESPA Integrated Disclosure": "divulgación integrada TILA-RESPA",
      "rule requires:": "exige:"
    }
  ],
  [
    "The Loan Estimate, delivered within three business days of application; and",
    {
      "The": "La",
      "Loan Estimate": "Estimación del Préstamo",
      ", delivered within": ", entregada dentro de los"
    }
  ],
  [
    "The Closing Disclosure, which the consumer must receive **at least three business days before",
    {
      "The": "La"
    }
  ],
  [
    "A complaint may be filed with HUD, generally within one year of the alleged act, or a civil action brought in federal court within two years. Remedies include actual and punitive damages, injunctive relief, civil penalties and attorney's fees. The Department of Justice may bring a pattern-or-practice action.",
    {
      "of the alleged act, or a": "desde el acto denunciado, o interponer una",
      "brought in federal court within": "ante un tribunal federal dentro de",
      "actual and punitive damages, injunctive relief, civil penalties and attorney's fees.": "indemnizaciones compensatorias y punitivas, órdenes judiciales, sanciones civiles y honorarios de abogados.",
      "The": "El",
      "may bring a pattern-or-practice action.": "puede presentar una demanda por un patrón o una práctica de discriminación."
    }
  ],
  [
    "The Equal Credit Opportunity Act prohibits discrimination in credit on the basis of race, colour, religion, national origin, sex, marital status, age (provided the applicant can contract), because income derives from a public assistance programme, or because the applicant exercised a right under the Consumer Credit Protection Act.",
    {
      "The": "La",
      "prohibits discrimination in": "prohíbe la discriminación en el",
      "credit": "crédito",
      "public assistance programme": "programa de asistencia pública"
    }
  ],
  [
    "The Americans with Disabilities Act governs places of public accommodation and commercial facilities — Title III — and employment — Title I. In a real estate context it reaches offices, retail, restaurants and other commercial premises, requiring removal of architectural barriers where readily achievable.",
    {
      "The": "La",
      "governs": "regula los",
      "and commercial facilities — Title III — and employment — Title I. In a real estate context it reaches offices, retail, restaurants and other commercial premises, requiring removal of architectural barriers": "y las instalaciones comerciales —Título III—, así como el empleo —Título I—. En el ámbito inmobiliario abarca oficinas, tiendas, restaurantes y otros locales comerciales, y exige eliminar las barreras arquitectónicas",
      "where readily achievable.": "cuando sea fácilmente realizable."
    }
  ],
  [
    "The Oklahoma Real Estate Commission consists of seven members. It is, by statute, the sole governmental entity — state, county or municipal — with authority to regulate and issue real estate licences in Oklahoma.",
    {
      "The": "La",
      "consists of": "se compone de"
    }
  ],
  [
    "The state licensing examination for provisional sales associate / sales associate",
    {
      "The": "El examen",
      "state licensing": "de licencia estatal",
      "examination for provisional sales associate / sales associate": "para asociado de ventas provisional / asociado de ventas"
    }
  ],
  [
    "The Telephone Consumer Protection Act and the National Do Not Call Registry govern telemarketing calls, and the rules on autodialled calls and text messages are stricter than most licensees assume. Firms must maintain an internal do-not-call list and honour requests.",
    {
      "The": "La",
      "govern telemarketing calls, and the rules on": "regulan las llamadas de telemercadeo, y las reglas sobre",
      "Firms must maintain an": "Las empresas deben mantener una"
    }
  ],
  [
    "A ten-day opportunity for the purchaser to conduct a risk assessment or inspection, which the parties",
    {
      "A": "Una"
    }
  ],
  [
    "A disclosure form signed by the parties AND by the agent; and",
    {
      "A": "Un"
    }
  ],
  [
    "Tenancy at sufferance. A holdover — the tenant remains after the right to possess has ended. Not a tenancy the landlord agreed to.",
    {
      "A": "Un"
    }
  ],
  [
    "A conveyance of a possessory interest for a term, and a contract of covenants between the parties.",
    {
      "A": "Un",
      "of a possessory interest for a term, and a": "de un derecho de posesión por un plazo, y un"
    }
  ],
  [
    "A fixture is personal property that has been attached to real estate in such a way that it has become part of it. Once an item is a fixture it conveys with the real estate unless it is expressly excluded, and the buyer is entitled to find it there at closing.",
    {
      "A": "Un",
      "is personal property that has been attached to real estate in such a way that it has become part of it. Once an item is a fixture it conveys with the real estate unless it is expressly excluded, and the buyer is entitled to find it there at closing.": "es propiedad personal que ha sido adherida a bienes raíces de tal manera que se ha convertido en parte de ella. Una vez que un artículo es un elemento incorporado, se transmite con los bienes raíces a menos que esté expresamente excluido, y el comprador tiene derecho a encontrarlo allí en el cierre."
    }
  ],
  [
    "A trade fixture is an item a tenant attaches to leased premises for the conduct of their business: a walk-in cooler in a restaurant, a hydraulic lift in a garage, shelving fitted to a shop floor.",
    {
      "A": "Una"
    }
  ],
  [
    "A designated broker is, under § 339.710(12), RSMo, an individual licensed as a broker operating under the definition of real estate broker in § 339.010, or an individual licensed as a broker who is appointed by a partnership, association, limited liability company, professional corporation or corporation to be responsible for the acts of that entity. Every brokerage entity must appoint one.",
    {
      "A": "Un"
    }
  ],
  [
    "A defeasible fee is a fee that may end on the happening of a stated event. Two forms, and the difference is in what happens when the event occurs:",
    {
      "A": "Un"
    }
  ],
  [
    "A life estate is a freehold estate measured by a lifetime. Its holder — the life tenant — has the right to possess, use and take the profits of the property for the duration of the measuring life, and no right at all after it.",
    {
      "A": "Un",
      "— has the right to possess, use and take the profits of the property for the duration of the measuring life, and no right at all after it.": "— tiene derecho a poseer, utilizar y obtener los beneficios de la propiedad durante la vida que determina su duración, y no tiene ningún derecho después de ella."
    }
  ],
  [
    "An encumbrance is any claim, right or interest held by someone other than the owner that diminishes the value or restricts the use of the property, without preventing the owner from transferring it. Encumbrances divide into those that affect use — easements, deed restrictions, encroachments — and those that affect title as security for a debt — liens, which are Hour 9.",
    {
      "An": "Una",
      "affect use": "afectan al uso",
      "affect title as security for a debt": "afectan al título como garantía de una deuda"
    }
  ],
  [
    "An easement is a right to use another's land for a particular purpose. Two kinds, and the difference decides whether the right survives a sale:",
    {
      "An": "Una"
    }
  ],
  [
    "A licence is mere permission to enter land for a particular purpose. It is personal, revocable at will, and does not run with the land. Permission to fish in a pond is a licence; a recorded right of access is an easement. The two look identical on the ground and are entirely different in law, which is why the question is answered from the records rather than from what the neighbours say.",
    {
      "A": "Una"
    }
  ],
  [
    "An encroachment is an unauthorised physical intrusion of an improvement onto adjoining land — a fence, a shed, an eave, a driveway. It is not a permission of any kind; it is a trespass that has been built.",
    {
      "An": "Una"
    }
  ],
  [
    "A lien is a charge against property that secures a debt or obligation. It affects title; it does not by itself dispossess the owner. Every lien is classified twice:",
    {
      "A": "Un"
    }
  ],
  [
    "A seller's or landlord's agent may show alternative properties not owned by the client to",
    {
      "A": "Un agente del",
      "seller's or landlord's agent may show alternative properties": "vendedor o del arrendador puede mostrar propiedades alternativas"
    }
  ],
  [
    "A limited agent under §§ 339.730.1(3)(c), 339.730.3, 339.740 discloses adverse material facts",
    {
      "A": "Un"
    }
  ],
  [
    "A transaction broker under § 339.755(2)(d) discloses adverse material facts **of which the",
    {
      "A": "Un",
      "transaction broker": "corredor de transacciones"
    }
  ],
  [
    "A dual agent represents both sides of the same transaction. Section 339.750.1: a licensee may act as a dual agent only with the consent of all parties, and consent is presumed by a written agreement pursuant to § 339.780.",
    {
      "A": "Un"
    }
  ],
  [
    "A subagent is a designated broker working for the client through the client's designated broker. Section 339.730.5 permits a seller or landlord to agree in writing that other designated brokers may be retained and compensated as subagents, and any such subagent is a limited agent with the same obligations under §§ 339.730.1 to .4. Section 339.740.5 mirrors it for the buyer side.",
    {
      "A": "Un"
    }
  ],
  [
    "An offer is a definite proposal, communicated to the offeree, showing an intention to be bound on acceptance. An advertisement is generally not an offer; it is an invitation to make one — which is why a listing at a price is not a promise to sell at that price.",
    {
      "An": "Una"
    }
  ],
  [
    "A counter-offer rejects the original offer and substitutes a new one. The original is dead and can no longer simply be accepted.",
    {
      "A": "Una",
      "counter-offer rejects the original offer and substitutes a new one.": "contraoferta rechaza la oferta original y la sustituye por una nueva.",
      "The original is dead and can no longer simply be accepted.": "La oferta original queda extinguida y ya no puede ser simplemente aceptada."
    }
  ],
  [
    "An amendment changes a contract that already exists, and requires the agreement of all parties.",
    {
      "An": "Una"
    }
  ],
  [
    "A contingency is a condition that must be satisfied or waived before a party is obliged to perform. It is not a general right to change one's mind. A buyer who has found a house they like better has not triggered the inspection contingency.",
    {
      "A": "Una"
    }
  ],
  [
    "A breach is a failure to perform without legal excuse. The remedies:",
    {
      "A": "Un"
    }
  ],
  [
    "The promissory note is the borrower's promise to repay. It is the debt. It states the amount, the rate, the term, the payment and the consequences of default.",
    {
      "The": "El"
    }
  ],
  [
    "The security instrument pledges the property as security for that promise. It creates the lien. Without it the lender has a promise and no property; without the note the lender has a lien securing nothing.",
    {
      "The": "El"
    }
  ],
  [
    "The primary market is where loans are made — the lender and the borrower. The secondary market is where loans are bought and sold after origination.",
    {
      "The": "El",
      "is where loans are made — the lender and the borrower. The": "es donde se hacen los préstamos: el prestamista y el prestatario. El"
    }
  ],
  [
    "A conveyance of a possessory interest for a term, and a contract of covenants between the parties. That is why a lease dispute can be framed either as a breach of contract or as an interference with possession, and why the covenant of quiet enjoyment matters as much as any written clause.",
    {
      "A": "Un"
    }
  ],
  [
    "A deed is the instrument that conveys an interest in real estate. To be valid it requires:",
    {
      "A": "Una",
      "is the instrument that conveys an interest in real estate. To be valid it requires:": "es el instrumento que transmite un interés en bienes raíces. Para ser válida requiere:"
    }
  ],
  [
    "The grantor's signature, and in practice acknowledgement before a notary so that it may be",
    {
      "The": "La"
    }
  ],
  [
    "The chain of title is the successive record of conveyances from an accepted starting point to the present owner. A cloud is anything in it — a gap, an unreleased mortgage, a missing signature, a name discrepancy, an estate that never went through probate — that raises a doubt about the title.",
    {
      "The": "La",
      "is the successive record of conveyances from an accepted starting point to the present owner. A": "es el registro sucesivo de los traspasos desde un punto de partida aceptado hasta el propietario actual. Una",
      "cloud": "duda o defecto aparente",
      "is anything in it — a gap, an unreleased mortgage, a missing signature, a name discrepancy, an estate that never went through probate — that raises a doubt about the title.": "(cloud) es cualquier elemento en ella —una brecha, una hipoteca no liberada, una firma que falta, una discrepancia de nombre, un patrimonio que nunca pasó por el proceso sucesorio— que suscita dudas sobre el título."
    }
  ],
  [
    "A title commitment is the title company's conditional promise to insure. Read its structure:",
    {
      "A": "Un",
      "title commitment": "compromiso de seguro de título"
    }
  ],
  [
    "An owner's policy insures against loss from covered title defects existing at the date of policy — forged instruments, undisclosed heirs, incompetent grantors, recording errors, defective deeds, undisclosed liens. Coverage is retrospective: it insures the past, not future events.",
    {
      "An": "Una",
      "at the date of policy": "en la fecha de la póliza"
    }
  ],
  [
    "A lender's policy insures the lender's lien position in the amount of the loan and decreases as the loan is repaid. A lender's policy does not protect the buyer, and buyers regularly believe that it does. Say so.",
    {
      "A": "Una",
      "A lender's policy does not protect the buyer": "La póliza de un prestamista no protege al comprador"
    }
  ],
  [
    "A credit to a party is money in their favour; a debit is money against them. Items customarily prorated include real estate taxes, association dues, rents and security deposits on a leased property, and fuel on a tank.",
    {
      "A": "Un",
      "credit": "crédito",
      "to a party is money in their favour; a": "a una parte es dinero a su favor; un"
    }
  ],
  [
    "The contract decides the basis and the closing-day convention, and Module MO-05 Hour 29 supplies the arithmetic. What matters here is the check: does the settlement statement do what the contract said?",
    {
      "The": "El",
      "decides the basis and the closing-day convention, and Module MO-05 Hour 29 supplies the arithmetic. What matters here is the check: does the settlement statement do what the contract said?": "decide la base y la convención del día de cierre, y el módulo MO-05 Hour 29 suministra la aritmética. Lo que importa aquí es la comprobación: ¿hace la declaración de liquidación lo que dice el contrato?"
    }
  ],
  [
    "The Equal Credit Opportunity Act prohibits discrimination in credit on the basis of race, colour, religion, national origin, sex, marital status, age (provided the applicant can contract), or because income derives from a public assistance programme, or because the applicant has exercised a right under the Consumer Credit Protection Act.",
    {
      "The": "La",
      "prohibits discrimination in": "prohíbe la discriminación en"
    }
  ],
  [
    "The Americans with Disabilities Act governs places of public accommodation and commercial facilities — Title III — and employment — Title I. In a real estate context this reaches offices, retail, restaurants and other commercial premises, requiring the removal of architectural barriers where readily achievable.",
    {
      "The": "La",
      "and commercial facilities — Title III — and employment — Title I. In a real estate context this reaches offices, retail, restaurants and other commercial premises, requiring the removal of architectural barriers where readily achievable.": "e instalaciones comerciales — Título III — y empleo — Título I. En un contexto inmobiliario, se trata de oficinas, comercio minorista, restaurantes y otros locales comerciales, que requieren la eliminación de barreras arquitectónicas cuando sea fácilmente posible."
    }
  ],
  [
    "The Telephone Consumer Protection Act and the National Do Not Call Registry govern telemarketing calls, and the rules on autodialled calls and text messages are stricter than most licensees assume. Firms must maintain an internal do-not-call list and honour requests. CAN-SPAM governs commercial email, requiring accurate headers and subject lines, a physical postal address and a working opt-out that is honoured promptly.",
    {
      "The": "La",
      "governs commercial email, requiring accurate headers and subject lines, a physical postal address and a working opt-out that is honoured promptly.": "gobierna el correo electrónico comercial, requiriendo encabezados precisos y líneas de asunto, una dirección postal física y un mecanismo funcional de exclusión que se honra rápidamente."
    }
  ],
  [
    "A ten-day opportunity for the purchaser to conduct a risk assessment or inspection, which the",
    {
      "A": "Una"
    }
  ],
  [
    "A limited agent — §§ 339.730.1(3)(c), 339.730.3, 339.740 — discloses adverse material facts",
    {
      "A": "Un"
    }
  ],
  [
    "A transaction broker — § 339.755(2)(d) — discloses those **of which the licensee has actual notice",
    {
      "A": "Un",
      "transaction broker": "corredor de transacciones"
    }
  ],
  [
    "Open listing. A non-exclusive authorisation. The seller may give it to any number of firms and only the firm that procures the buyer is paid. The seller may also sell themselves and owe nothing. It is a unilateral contract: the seller promises to pay whoever performs, and nobody is obliged to try.",
    {
      "A": "Una autorización",
      "non-exclusive": "no exclusiva",
      "authorisation. The seller may give it to any number of firms and": ". El vendedor puede darla a cualquier número de empresas y"
    }
  ],
  [
    "A net listing is an arrangement in which the seller receives a fixed net amount and the firm keeps everything above it.",
    {
      "A": "Un",
      "net listing": "encargo de venta neto"
    }
  ],
  [
    "A subagent is a designated broker working for the client through the client's designated broker.",
    {
      "A": "Un"
    }
  ],
  [
    "A comparative market analysis is the licensee's presentation of market evidence supporting a pricing decision. It is not an opinion of value produced under an appraiser's licence and it must never be labelled, described or presented as one.",
    {
      "A": "Un"
    }
  ],
  [
    "The promissory note is the borrower's promise to repay — the debt. The security instrument pledges the property as security for it — the lien.",
    {
      "The": "El",
      "is the borrower's promise to repay — the debt. The": "es la promesa del prestatario de pagar la deuda. El"
    }
  ],
  [
    "An offer is a definite proposal, communicated to the offeree, showing an intention to be bound on acceptance. It ends by acceptance, rejection, counter-offer, revocation before acceptance is communicated, or lapse.",
    {
      "An": "Una"
    }
  ],
  [
    "A notice exercises a right the contract already gives — removing a contingency, giving notice",
    {
      "A": "Una"
    }
  ],
  [
    "A limited agent discloses adverse material facts actually known or that should have been known",
    {
      "A": "Un",
      "actually known or that should have been known": "realmente conocidos o que deberían haberse conocido"
    }
  ],
  [
    "A transaction broker discloses those of which the licensee has actual notice or knowledge —",
    {
      "A": "Un",
      "transaction broker": "corredor de transacciones",
      "discloses those": "revela aquellos"
    }
  ],
  [
    "The TREC contract library is the source for current published forms; 22 TAC § 537.11(a), (g), and (h) controls authorized use and reproduction. Keep the published file’s identity with the executed document. Broker software may help complete a form, but the final copy must satisfy the rule’s text-and-format requirements. A reader should be able to compare the executed copy with the Commission’s published version and see every conspicuous party-directed change.",
    {
      "The": "La",
      "TREC contract library": "biblioteca de contratos TREC",
      "controls authorized use and reproduction. Keep the published file’s identity with the executed document. Broker software may help complete a form, but the final copy must satisfy the rule’s text-and-format requirements. A reader should be able to compare the executed copy with the Commission’s published version and see every conspicuous party-directed change.": "regula el uso y reproducción autorizados. Mantener la identidad del archivo publicado con el documento ejecutado. El software de broker puede ayudar a completar un formulario, pero la copia final debe satisfacer los requisitos de texto y formato de la regla. Un lector debe poder comparar la copia ejecutada con la versión publicada por la Comisión y ver cada cambio visible dirigido por una parte."
    }
  ],
  [
    "A trust splits ownership into management and benefit. Property Code § 111.004(4) defines an express trust as a fiduciary relationship with respect to property which arises as a manifestation by the settlor of an intention to create the relationship and which subjects the person holding title to the property to equitable duties to deal with the property for the benefit of another person. Three roles: the settlor creates the trust and supplies the property; the trustee holds legal title, bound by fiduciary duties; the beneficiary holds the benefit. Section 111.003 trims the field: for the Texas Trust Code, \"trust\" means an express trust only — not resulting or constructive trusts (court-imposed remedies), not business trusts, and not a deed of trust, despite the name. That last exclusion untangles a Texas vocabulary knot once and for all: the deed of trust of Principles I Modules 03 and 08 is a mortgage instrument, not a trust in this sense; only the word is shared.",
    {
      "A": "Un",
      "express": "expreso",
      "trust only — not resulting or constructive trusts (court-imposed remedies), not business trusts, and": "únicamente — no los fideicomisos resultantes o constructivos (los remedios impuestos por el tribunal), no los fideicomisos comerciales, y",
      "holds the benefit. Section 111.003 trims the field: for the Texas Trust Code, \"trust\" means an": "tiene el beneficio. Sección 111.003 recorta el campo: para el Código Fiduciario de Texas, \"fideicomiso\" significa un fideicomiso"
    }
  ],
  [
    "An estate is an interest in real property that is or may become possessory, measured by duration. Interests that never carry possession — easements, liens — are not estates; they are the subject of the encumbrance units that follow.",
    {
      "is an interest in real property that is or may become possessory, measured by duration. Interests that never carry possession — easements, liens — are not estates; they are the subject of the encumbrance units that follow.": "es un interés en bienes inmuebles que es o puede llegar a ser posesorio, medido por duración. Los intereses que nunca llevan la posesión — las servidumbres, los embargos — no son derechos posesorios (estates); son objeto de las unidades de carga que siguen."
    }
  ],
  [
    "The termination date requirement is not new in substance, and it has independent teeth. Occupations Code § 1101.652(b)(12) has long made it a disciplinary ground to fail \"to specify a definite termination date that is not subject to prior notice in a contract, other than a contract to perform property management services, in which the license holder agrees to perform services for which a license is required under this chapter\"; Law of Agency Module 10 teaches § 1101.652. Read the qualifier carefully, because it is the part students drop. The date must be definite, and it must be \"not subject to prior notice\" — meaning an agreement that runs until one side gives thirty days' notice does not satisfy the section. A buyer representation agreement is not a property management contract, so it needs a definite termination date, and now § 1101.563(c)(1)(B) requires the date to be stated in the writing as well.",
    {
      "The": "El requisito de la",
      "requirement is not new in substance, and it has independent teeth. Occupations Code § 1101.652(b)(12) has long made it a disciplinary ground to fail \"to specify a definite termination date that is not subject to prior notice in a contract, other than a contract to perform property management services, in which the license holder agrees to perform services for which a license is required under this chapter\"; Law of Agency Module 10 teaches § 1101.652. Read the qualifier carefully, because it is the part students drop. The date must be": "no es nuevo en sustancia, y tiene dientes independientes. El Código de Ocupaciones § 1101.652(b)(12) hace mucho tiempo que es un motivo disciplinario para no \"especificar una fecha de terminación definida que no está sujeta a previo aviso en un contrato, aparte de un contrato para realizar servicios de administración de propiedades, en el que el titular de la licencia acepta realizar servicios para los cuales se requiere una licencia bajo este capítulo\"; el Módulo 10 de la Ley de Agencia enseña § 1101.652. Lea el calificador cuidadosamente, porque es la parte que dejan los estudiantes. La fecha debe ser",
      "definite": "definida",
      ", and it must be \"not subject to prior notice\" — meaning an agreement that runs until one side gives thirty days' notice does not satisfy the section. A buyer representation agreement is not a property management contract, so it needs a definite termination date, and now § 1101.563(c)(1)(B) requires the date to be stated in the writing as well.": ", y debe ser \"no sujeta a previo aviso\", es decir, un acuerdo que se extiende hasta que una de las partes da aviso de treinta días no satisface la sección. Un acuerdo de representación del comprador no es un contrato de administración de bienes, por lo que necesita una fecha definitiva de terminación, y ahora § 1101.563(c)(1)(B) requiere que la fecha se indique también en el escrito."
    }
  ],
  [
    "The compensation clause requires \"the amount or rate of compensation the broker will receive and how this amount will be determined.\" Both halves matter: the number or the rate, and the method. To be determined is not compliance. Three percent of the sales price states a rate and, read with a definition of sales price, states the method. We return to compensation at length in Law of Agency source unit 5.",
    {
      "The": "La cláusula de",
      "clause requires \"the amount or rate of compensation the broker will receive and how this amount will be determined.\" Both halves matter: the number or the rate, and the method.": "requiere \"la cantidad o la tasa de compensación que el bróker recibirá y cómo se determinará esta cantidad.\" Ambas mitades importan: el número o la tasa, y el método."
    }
  ],
  [
    "The TREC Third Party Financing Addendum, Form 40-11, effective January 3, 2025, should be read for its actual financing terms, buyer-approval provisions, property-approval provisions, diligence obligations, and notice requirements. The lender’s approval of the borrower is not the same as approval of the property. An appraisal, insurance issue, required repair, or other underwriting matter may affect property approval under the stated terms.",
    {
      "The": "El anexo",
      "TREC Third Party Financing Addendum, Form 40-11": "TREC de financiación de terceros, formulario 40-11"
    }
  ],
  [
    "The primary mortgage market is where loans are made. It is the market in which a borrower and an originator meet, an application is taken, and a note and lien are created. Everything in the preceding unit — the depository, the mortgage banker, the broker, the seller, the private lender — is a primary-market actor. The primary market is retail: one borrower, one property, one loan at a time.",
    {
      "The": "El"
    }
  ],
  [
    "The secondary mortgage market is where loans that already exist are bought and sold. No borrower participates in it. Its participants are the institutions that originated loans and want to sell them, and the investors who want to own the income stream those loans produce. A loan that is sold in the secondary market does not change: the borrower still owes the same principal at the same rate on the same schedule, secured by the same lien on the same Texas property. What changes is who owns the right to be paid.",
    {
      "The": "El"
    }
  ],
  [
    "The affiliated business arrangement exception in § 2607(c)(4) requires three things: a written disclosure to the person being referred of the existence of the arrangement, with a written estimate of the charge or range of charges, delivered at or before the time of the referral (with special timing rules for telephone referrals and lender referrals); that \"such person is not required to use any particular provider of settlement services\"; and that \"the only thing of value that is received from the arrangement, other than the payments permitted under this subsection, is a return on the ownership interest or franchise relationship\" (§ 2607(c)(4)(C)). Regulation X implements those conditions in 12 C.F.R. § 1024.15(b)(1)–(3) and requires the disclosure to be \"provided on a separate piece of paper.\"",
    {
      "The": "El",
      "affiliated business arrangement": "acuerdo comercial afiliado"
    }
  ],
  [
    "A deed is the instrument that conveys an interest in real property from grantor to grantee. Its statutory skeleton is short. Property Code § 5.021 — the Texas conveyancing statute you met in Principles I Module 06 — requires that a conveyance of an estate of inheritance, a freehold, or an estate for more than one year be in writing, subscribed (signed) by the conveyor or the conveyor's authorised agent, and delivered. Around that core, Texas practice expects: a competent, identifiable grantor whose name matches the record chain; an identifiable grantee; words of grant (Texas needs no magic formula — recall § 5.001's rule that a conveyance passes fee simple unless expressly limited, with no \"and his heirs\" required); an adequate legal description (Module 04); recital of consideration; and the grantor's acknowledgment before a notary — which, as the recording unit shows, is what qualifies the deed for the public records rather than what makes it valid between the parties.",
    {
      "A": "Una",
      "(signed) by the conveyor or the conveyor's authorised agent, and": "(firmada) por el transmitente o el agente autorizado del transmitente, y",
      "delivered": "entregada"
    }
  ],
  [
    "Houston is the well-known example of a very large Texas city that has not adopted conventional use-district zoning; that is common knowledge about how Texas cities have chosen to govern themselves, not a statutory rule, and no source read for this course states it. What the statutes do establish is the structure that makes it possible. Two consequences follow. First, land in the unincorporated portion of a Texas county is not zoned the way land inside a city is, because chapter 211 does not reach it. Second, in a municipality without zoning, recorded private restrictions do far more of the work of separating uses — which is exactly why § 212.151 exists.",
    {
      "do": "sí",
      "establish is the structure that makes it possible. Two consequences follow. First, land in the unincorporated portion of a Texas county is not zoned the way land inside a city is, because chapter 211 does not reach it. Second, in a municipality without zoning, recorded private restrictions do far more of the work of separating uses — which is exactly why § 212.151 exists.": "establecen es la estructura que lo hace posible. Dos consecuencias siguen. En primer lugar, la tierra en la porción no incorporada de un condado de Texas no está en zona como la tierra dentro de una ciudad está, porque el capítulo 211 no llega a ella. En segundo lugar, en un municipio sin zonificación, las restricciones privadas registradas hacen mucho más del trabajo de separar los usos, que es exactamente por lo que § 212.151 existe."
    }
  ],
  [
    "Reading an estate. Every question about an estate is answered by three smaller questions: How long does it last? What can end it early? Who takes when it ends? Run those three against any granting language — \"to A for life, then to B\"; \"to the church while used for worship\"; \"to T for five years\" — and the estate names fall out mechanically. The licence holder's discipline is humbler and harder: notice when granting language is anything other than a plain fee, and route it to counsel instead of improvising.",
    {
      "Reading an estate.": "Lectura de un derecho inmobiliario.",
      "notice": "advertir"
    }
  ],
  [
    "Lien on the debtor's non-exempt real property in that county — a general lien, reaching whatever non-exempt land the debtor owns or acquires there. Two Texas limits tame it: the homestead is not \"non-exempt\" property (this module's final unit), and enforcement is subject to the limitation periods of the Civil Practice & Remedies Code you will meet in Principles I Modules 06 and 07. For practice: a judgment against a seller found in the title search must be released, paid or negotiated before closing; a judgment against a similar name is resolved by the title company's identity procedures, not by the licence holder's guess.",
    {
      "general": "general"
    }
  ],
  [
    "Doctrine one: protection from forced sale. Property Code § 41.001 exempts a homestead from seizure for the claims of creditors — with a closed list of exceptions, the encumbrances that can be properly fixed on homestead property. The read text names, among them: purchase-money liens (the loan that bought the home); taxes on the property; and work and material liens for improvements, when contracted for in the manner the law requires. The pattern to internalise: the homestead is armoured against general creditors — credit cards, most judgments, business debts — but not against the debts that created or preserved or improved the property itself. A judgment creditor of an ordinary kind cannot force the sale of a Texas homestead; the judgment simply waits, unable to touch the exempt home.",
    {
      "be properly fixed on homestead property. The read text names, among them:": "constituirse válidamente en la propiedad homestead. El texto leído enumera, entre ellos:",
      "purchase-money": "gravámenes por el precio de compra",
      "liens (the loan that bought the home);": "(el préstamo que compró la casa);",
      "general": "acreedores generales",
      "creditors — credit cards, most judgments, business debts — but not against the debts that created or preserved or improved the property itself. A judgment creditor of an ordinary kind cannot force the sale of a Texas homestead; the judgment simply waits, unable to touch the exempt home.": "—tarjetas de crédito, la mayoría de las sentencias, deudas comerciales— pero no frente a las deudas que crearon o conservaron o mejoraron la propiedad en sí. Un acreedor de un juicio de tipo ordinario no puede forzar la venta de una casa de Texas; el juicio simplemente espera, incapaz de tocar la casa exenta.",
      "can": "pueden"
    }
  ],
  [
    "The complete list of liens that can bind a homestead. Because \"which debts can reach the home\" is the whole doctrine, the closed list of § 41.001(b) deserves to be read in full. Encumbrances may be properly fixed on homestead property for: (1) purchase money; (2) taxes on the property; (3) work and material used in constructing improvements, if contracted for in writing as provided by §§ 53.254(a)–(c); (4) an owelty of partition imposed against the entirety of the property by court order or by the parties' written partition agreement — including a debt of one spouse to the other resulting from the award of a family homestead in a divorce; (5) the refinance of a lien against a homestead, including a federal tax lien resulting from the tax debt of both spouses (for a family homestead) or of the owner; (6) an extension of credit meeting the requirements of Article XVI, § 50(a)(6) of the Texas Constitution — the constitutionally regulated home-equity loan; and (7) a reverse mortgage meeting the requirements of § 50(k)–(p) of that article. The structure teaches the policy: every valid homestead lien either created the property interest (purchase money), preserves it against the sovereign (taxes, tax-lien refinance), improved it under written formalities, adjusts ownership itself (owelty), or is a constitutionally supervised borrowing the owner chose. Everything else — however large the debt, however solemn the judgment — stays outside.",
    {
      "Because \"which debts can reach the home\" is the whole doctrine, the closed list of § 41.001(b) deserves to be read in full. Encumbrances may be properly fixed on homestead property for:": ". Debido a que \"qué deudas pueden llegar al hogar\" es toda la doctrina, la lista cerrada de § 41.001(b) merece ser leída en su totalidad. Las cargas se pueden fijar correctamente en la propiedad de homestead para:",
      "an": "una",
      "the": "la",
      "of a lien against a homestead, including a federal tax lien resulting from the tax debt of both spouses (for a family homestead) or of the owner;": "de un gravamen contra una vivienda familiar protegida, incluido un gravamen fiscal federal resultante de la deuda fiscal de ambos cónyuges (para una vivienda familiar protegida) o del propietario;",
      "a": "una",
      "meeting the requirements of § 50(k)–(p) of that article. The structure teaches the policy: every valid homestead lien either created the property interest (purchase money), preserves it against the sovereign (taxes, tax-lien refinance), improved it under written formalities, adjusts ownership itself (owelty), or is a constitutionally supervised borrowing the owner chose. Everything else — however large the debt, however solemn the judgment — stays outside.": "que cumpla los requisitos de § 50(k)–(p) de ese artículo. La estructura enseña la política: cada gravamen válido sobre la vivienda familiar o bien creó el interés de la propiedad (dinero de compra), lo preserva contra el soberano (impuestos, refinanciamiento de gravámenes fiscales), mejoró bajo formalidades escritas, ajusta la propiedad misma (owelty), o es un préstamo supervisado constitucionalmente que el propietario eligió. Todo lo demás, por grande que sea la deuda, por solemne que sea el juicio, permanece fuera."
    }
  ],
  [
    "Finance Code § 343.105 requires a written notice at closing, on a separate document, in at least 14-point type, warning that \"[i]ntentionally or knowingly making a materially false or misleading written statement to obtain property or credit, including a mortgage loan, is a violation of Section 32.32, Texas Penal Code,\" and that the offense is, \"depending on the amount of the loan or value of the property,\" one \"punishable by imprisonment for a term of 2 years to 99 years and a fine not to exceed $10,000\" (§ 343.105(b)(3)). Read those punishment words for what they are: the Finance Code's prescribed notice language, not the grading provision of the Penal Code. Penal Code § 32.32(b) creates the offense, and § 32.32(c) grades it by \"the value of the property or the amount of credit\" — a Class C misdemeanor below $100, rising through the misdemeanor and felony grades to \"a felony of the first degree if the value of the property or the amount of credit is $300,000 or more.\" The notice's \"2 years to 99 years\" describes the top of that ladder, so a license holder should never tell a client that every misstatement on an application carries a 99-year exposure. The same prescribed notice (§ 343.105(b)(3)) includes the applicant's representation \"that all statements and representations contained in my/our written home loan application, including statements or representations regarding my/our identity, employment, annual income, and intent to occupy the residential real property secured by the home loan, are true and correct as of the date of loan closing,\" and § 343.105(c) requires the applicant to verify the information and execute the notice. Section 343.105(d) adds that a lender's failure to give a complying notice \"does not affect the validity or enforceability of the home loan by any holder of the loan.\"",
    {
      "Finance Code § 343.105 requires a written notice at closing, on a separate document, in at least 14-point type, warning that \"[i]ntentionally or knowingly making a materially false or misleading written statement to obtain property or credit, including a mortgage loan, is a violation of Section 32.32, Texas Penal Code,\" and that the offense is, \"depending on the amount of the loan or value of the property,\" one \"punishable by imprisonment for a term of 2 years to 99 years and a fine not to exceed $10,000\" (§ 343.105(b)(3)). Read those punishment words for what they are: the Finance Code's prescribed": "Código Financiero § 343.105 requiere un aviso por escrito al cerrar, en un documento separado, con letra de al menos 14 puntos, advirtiendo que \"Hacer intencionalmente o a sabiendas una declaración escrita materialmente falsa o engañosa para obtener propiedad o crédito, incluyendo un préstamo hipotecario, es una violación de la Sección 32.32, Código Penal de Texas,\" y que el delito es, \"dependiendo de la cantidad del préstamo o valor de la propiedad,\" uno \"castigable por prisión por un período de 2 años a 99 años y una multa para no exceder $10,000\" (§ 343.105(b)(3)). Lea esas palabras de castigo por lo que son: el texto prescrito por el Código de Finanzas para la",
      "notice": "notificación",
      "language, not the grading provision of the Penal Code. Penal Code § 32.32(b) creates the offense, and § 32.32(c) grades it by \"the value of the property or the amount of credit\" — a Class C misdemeanor below $100, rising through the misdemeanor and felony grades to \"a felony of the first degree if the value of the property or the amount of credit is $300,000 or more.\" The notice's \"2 years to 99 years\" describes the top of that ladder, so a license holder should never tell a client that every misstatement on an application carries a 99-year exposure. The same prescribed notice (§ 343.105(b)(3)) includes the applicant's representation \"that all statements and representations contained in my/our written home loan application, including statements or representations regarding my/our identity, employment, annual income, and intent to occupy the residential real property secured by the home loan, are true and correct as of the date of loan closing,\" and § 343.105(c) requires the applicant to verify the information and execute the notice. Section 343.105(d) adds that a lender's failure to give a complying notice \"does not affect the validity or enforceability of the home loan by any holder of the loan.\"": ", y no la disposición de clasificación del Código Penal. El Código Penal § 32.32(b) crea el delito, y § 32.32(c) lo clasifica por \"el valor de la propiedad o la cantidad de crédito\" — un delito menor de clase C por debajo de $100, aumentando a través de los grados de delito menor y delito grave a \"un delito grave de primer grado si el valor de la propiedad o la cantidad de crédito es de $300,000 o más.\" El aviso de \"2 años a 99 años\" describe la parte superior de esa escala, por lo que el titular de la licencia nunca debe decirle a un cliente que cada error en una solicitud lleva una exposición de 99 años. La misma notificación prescrita (§ 343.105(b)(3)) incluye la declaración del solicitante \"de que todas las declaraciones y representaciones contenidas en mi/nuestra solicitud escrita de préstamo sobre vivienda, incluyendo declaraciones o representaciones sobre mi/nuestra identidad, empleo, ingresos anuales e intención de ocupar la propiedad inmobiliaria residencial garantizada por el préstamo hipotecario, son verdaderas y correctas a partir de la fecha de cierre del préstamo\", y § 343.105(c) requiere que el solicitante verifique la información y firme la notificación. La sección 343.105(d) añade que el hecho de que un prestamista no haya dado una notificación de cumplimiento \"no afecta a la validez o ejecutabilidad del préstamo hipotecario por parte de ningún titular del préstamo\"."
    }
  ],
  [
    "The third is that once you do know, the duty is immediate and does not depend on being asked. Subdivision (b)(4) is a failure-to-disclose ground. Nobody has to ask you a question first.",
    {
      "do": "sí lo"
    }
  ],
  [
    "Second: puffing versus a statement of fact. Every student arrives with a half-remembered idea that agents are allowed to \"puff.\" The common-law doctrine of puffery, as such, was not held for this course, and this module does not state its elements. What Texas does hold, in statute, is a line between opinion and fact that does the same work more precisely.",
    {
      "does": "sí",
      "hold, in statute, is a line between opinion and fact that does the same work more precisely.": "establece por ley es una distinción entre la opinión y el hecho que hace el mismo trabajo más precisamente."
    }
  ],
  [
    "Texas maintains its land records county by county, and the system's logic is notice.",
    {
      "notice": "la notificación"
    }
  ]
]);
  function contextualTranslation(source,node){
    const label=source.trim(),cell=node.parentElement?.closest('td,th');
    const paragraph=node.parentElement?.closest('p');
    const semanticParent=node.parentElement?.closest('p,li,td,th');
    const fragments=semanticParent&&sentenceFragments.get(originalText(semanticParent).replace(/\s+/g,' ').trim());
    if(fragments&&Object.hasOwn(fragments,label))return fragments[label];
    if(paragraph && originalText(paragraph).replace(/\s+/g,' ').trim().replace(/^\*+|\*+$/g,'').replace(/ So:$/,'')==='The rule is about who the property is for, not about what the property has.'){
      const fragments={'The rule is about who the property is':'La regla se refiere a quién se considera','for':'destinatario de la vivienda',', not about what the property':', no a lo que la propiedad','has':'tiene'};
      if(Object.hasOwn(fragments,label))return fragments[label];
    }
    if(paragraph && originalText(paragraph).replace(/\s+/g,' ').trim()==='It does imply that a licensee should recognize inherited patterns rather than reading them as natural facts about places, refuse to transmit them as market wisdom, apply uniform practices, and give consumers objective information so they can apply their own criteria.'){
      if(label==='It')return 'Esto';
      if(label==='does')return 'sí';
    }
    if(paragraph && originalText(paragraph).replace(/\s+/g,' ').trim()==='An agency may end by completion of its purpose, expiration of its term, mutual agreement, revocation by the principal, or renunciation by the agent. The power to end the relationship is not the same as the right to end it without consequence: an early termination may still breach the underlying contract, and the compensation terms of that contract govern what is owed.'){
      const fragments={'An agency may end by completion of its purpose, expiration of its term, mutual agreement, revocation by the principal, or renunciation by the agent. The':'Una relación de agencia puede terminar por cumplimiento de su finalidad, vencimiento del plazo, mutuo acuerdo, revocación por el mandante o renuncia del agente. La','power':'facultad','to end the relationship is not the same as the':'de terminar la relación no equivale al','right':'derecho','to end it without consequence: an early termination may still breach the underlying contract, and the compensation terms of that contract govern what is owed.':'de terminarla sin consecuencias: una terminación anticipada puede incumplir el contrato subyacente, cuyas condiciones de remuneración determinan lo que se adeuda.'};
      if(Object.hasOwn(fragments,label))return fragments[label];
    }
    if(label==='Attachment'){
      const paragraph=node.parentElement?.closest('p');
      if(paragraph && originalText(paragraph).trim()==='Attachment, a pre-judgment remedy securing a claim against property pending the outcome.')return 'Embargo preventivo';
    }
    if(cell && originalText(cell).replace(/\s+/g,' ').trim()==='Belongs in the copy. The rule governs who the property is for, not what it has.'){
      const fragments={'Belongs in the copy. The rule governs who the property is':'Debe incluirse en el anuncio. La regla se refiere a quién se considera','for':'destinatario de la vivienda',', not what it':', no a lo que esta','has':'tiene'};
      if(Object.hasOwn(fragments,label))return fragments[label];
    }
    if(!cell || !cell.closest('table'))return null;
    const cells=[...cell.parentElement.children].filter(n=>['TD','TH'].includes(n.tagName));
    if(label==='Attachment' && cells[1]===cell && cells.length===3 && originalText(cells[0]).trim()==='Item' && originalText(cells[2]).trim()==='Typical analysis')return 'Fijación';
    if(label==='Right' && cells[2]===cell && cells.length===3 && originalText(cells[0]).trim()==='Situation' && originalText(cells[1]).trim()==='Wrong')return 'Correcto';
    if(label==='Assignment' && cells.includes(cell) && cells.some(n=>originalText(n).trim()==='Sublease'))return 'Cesión';
    if(label==='Assignment' && cells[0]===cell && originalText(cells[1]).trim()==='Transfer of the entire remaining leasehold interest. The original tenant generally remains liable.')return 'Cesión';
    if(label==='Compensation' && cells[0]===cell && ['Management, leasing, renewal, and any other fees','Amount and when it is earned and payable',"A term the brokerage is party to.",'Amount, who pays, and when it is earned','Management fee, leasing fee, renewal fee, and any other charges'].includes(originalText(cells[1]).trim()))return 'Remuneración';
    if(label==='Owner' && cells[1]===cell && originalText(cells[0]).trim()==='Track' && originalText(cells[2]).trim()==='Typical failure')return 'Responsable';
    if(cells[0]!==cell || cells.length<2 || originalText(cell).trim()!==label)return null;
    const next=originalText(cells[1]).trim();
    if(label==='Term' && (next==='Definition' || next==='What It Does' || next==='What To Explain To Buyer' || next==='Why' || next==='What It Governs' || (next==='What It Is' && cells.length===3 && originalText(cells[2]).trim()==='Who Determines It')))return 'Término';
    if(label==='Course' && next==='One leg of a perimeter, stated as a direction and a distance.')return 'Tramo';
    if(label==='Consideration' && next==='Why it matters')return 'Aspecto';
    if(label==='Agency' && next==='The relationship in which one person is authorized to act on behalf of another in dealings with third parties.')return 'Relación de agencia';
    if(label==='Principal' && next==='The party the agent represents. Also called the client.')return 'Mandante';
    if(label==='Balance' && next==='Value is maximized where the factors of production are in equilibrium')return 'Equilibrio';
    if(label==='Minutes' && [
      'What the board has been discussing, which is frequently where a future special assessment first appears',
      'What the board is actually worried about',
    ].includes(next))return 'Actas';
    return null;
  }
  function render(){
    observer?.disconnect();
    doc.documentElement.lang=language;
    function visit(node){
      if(node.nodeType===1 && (['SCRIPT','STYLE','CODE'].includes(node.tagName)||node.getAttribute('translate')==='no'||node.id==='practiceTranslationNotice'||node.id==='practiceLanguage'))return;
      if(node.nodeType===3){
        const prior=memory.get(node),current=node.textContent,source=prior&&prior.output===current?prior.source:current;
        const output=language==='es'?source.replace(/\S[\s\S]*\S|\S/,s=>contextualTranslation(s,node)??translate(s)):source;
        if(current!==output)node.textContent=output;memory.set(node,{source,output});
      }
      if(node.nodeType===1){
        const cached=attributes.get(node)||{};
        for(const name of ['aria-label','placeholder','title'])if(node.hasAttribute(name)){
          const current=node.getAttribute(name),prior=cached[name],source=prior&&prior.output===current?prior.source:current;
          const output=language==='es'?translate(source):source;
          if(current!==output)node.setAttribute(name,output);cached[name]={source,output};
        }
        attributes.set(node,cached);
      }
      if(node.nodeType===1 && ['TEXTAREA','INPUT'].includes(node.tagName))return;
      for(const child of [...node.childNodes])visit(child);
    }
    visit(doc.documentElement);
    for(const option of select.options)option.selected=option.value===language;
    notice.hidden=language!=='es';
    observer?.observe(doc.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title']});
  }
  function state(value){doc.documentElement.dataset.practiceTranslation=value;notice.textContent=value==='loading'?'Cargando la traducción al español…':value==='unavailable'?'La traducción completa de este curso aún no está disponible. Seleccione English para continuar.':'Traducción al español en revisión. Las fuentes oficiales conservan su idioma original. Se conserva el formato numérico del original en inglés. Práctica gratuita, sin créditos para licencias ni certificado. La revisión humana lingüística y por un especialista sigue pendiente.';}
  async function loadCourse(sample){
    course=sample;const token=++request;translations=new Map();
    if(language!=='es'){state('ready');render();return;}
    if(!uiReady){state('unavailable');render();return;}
    const cacheKey=sample.course_id+':'+sample.revision;
    if(cache.has(cacheKey)){translations=cache.get(cacheKey);state('ready');render();return;}
    state('loading');render();
    try{
      const response=await fetcher(new URL(`free-practice/locales/es/${sample.course_id}.json`,base),{cache:'no-store'});
      if(!response.ok)throw Error('unavailable');
      const data=await response.json();
      if(token!==request)return;
      if(data.course_id!==sample.course_id||data.source_revision!==sample.revision||data.status!=='draft-complete'||data.segmentation_version!==2||!Array.isArray(data.translations))throw Error('stale');
      translations=new Map(data.translations);cache.set(cacheKey,translations);state('ready');render();
    }catch{if(token===request){state('unavailable');render();}}
  }
  const ready=fetcher(new URL('free-practice/locales/es/interface.json',base),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('interface unavailable');return r.json();}).then(data=>{ui=new Map(data.translations);uiReady=true;render();}).catch(()=>{if(language==='es')state('unavailable');});
  select.addEventListener('change',async()=>{
    language=select.value==='es'?'es':'en';try{win.localStorage.setItem(key,language);}catch{}
    const url=new URL(win.location.href);url.searchParams.set('lang',language);win.history.replaceState({},'',url);
    await ready;if(course)await loadCourse(course);else{state('ready');render();}
  });
  if(win.MutationObserver)observer=new win.MutationObserver(render);
  state('ready');render();
  return {ready,loadCourse,render,get language(){return language;},destroy(){observer?.disconnect();}};
}
