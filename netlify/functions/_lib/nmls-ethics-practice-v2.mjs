// PRIVATE instructional source; never import from a browser or static route.
// Additive 2026.2 transfer practice. Original E01/E02 manuscripts stay pinned.
// Sources checked 2026-09-10. Human SME/item review and learner timing pending.
const cfpb = (part, section) => 'https://www.consumerfinance.gov/rules-policy/regulations/' + part + '/' + section + '/';
const sources = {
  treatment: { title: 'Regulation B §1002.4(a), comments 4(a)-1 and -2; directed first-contact statements: §1002.4(b)', url: cfpb(1002, 4) },
  signature: { title: 'Regulation B §1002.7(d)(1), (4); comments 7(d)(1)-2/-3 and 7(d)(4)-1 through -3', url: cfpb(1002, 7) },
  income: { title: 'Regulation Z §1026.43(c)(2)(i), (c)(3)–(4), including comment 43(c)(2)(i)-3', url: cfpb(1026, 43) },
  referral: { title: 'Regulation X §1024.14(b), (d)–(g): referral payments, things of value and specified exceptions', url: cfpb(1024, 14) },
  valuation: { title: 'Regulation Z §1026.42(c)(1), (c)(3), (e), and comment 42(e)-1', url: cfpb(1026, 42) },
};
const activities = {
  E01: [
    {
      id: 'E01-U05', questionId: 'E01-Q15', minutes: 3, title: 'Practice: two events, two reasons', source: 'treatment',
      provenance: 'E01 §6 matched-file investigation and changed-fact exercise; objectives 1, 6 and 7',
      content: [
        '## Practice: two events, two reasons',
        "This is a new fictional transfer case, not another reading of the earlier worked example. Cedar Point Lending applies a lawful policy requiring clarification of unusual deposits when those funds will be used at closing. At first contact, an employee withholds otherwise eligible product information from Morgan because of an explicitly recorded racial assumption. Two days later, Morgan supplies a statement showing an unexplained $28,000 deposit intended for closing. The same deposit policy applies to other applicants with comparable deposits. No loan decision has been made.",
        '### Build the decision record',
        "Make two rows in your own notes: **earlier treatment** and **present evidence request**. In each row identify the information available at that time, the reason actually used, the next investigative or corrective step, and what remains unknown. Do not move evidence received on the second day into the first day's record.",
        "Test both possible overcorrections. If the later deposit is used to justify everything, which historical fact disappears? If every present condition is waived because of the earlier conduct, which real financial issue remains unresolved? Compare your reasoning with the feedback after answering. Your notes are for reflection; this system records your selected decision, not a reviewed written finding.",
      ],
      stem: 'Which conclusion preserves the distinction between Morgan’s two events?',
      choices: [
        'The new deposit validates both the present request and the earlier decision to withhold product information.',
        'The deposit can support a proportionate present request, while the earlier race-based treatment needs separate review and correction.',
        'The lender must request identical extra records from every other applicant before asking Morgan about the deposit.',
        'The earlier improper treatment requires waiving the otherwise applicable deposit-verification condition.',
      ], correct: 'B',
      feedback: 'A new financial fact can justify a proportionate present request under the stipulated lawful policy; it cannot rewrite the recorded earlier reason. Validating both events backdates a justification; demanding identical records from everyone burdens unrelated files; waiving verification leaves a genuine issue unresolved. Keep correction of unsupported product handling separate from review of the deposit. Preserve the actual chronology and do not promise approval. Compare your two rows: each should name its own evidence and unresolved decision. The note format is a suggested control, not a prescribed federal form.',
    },
    {
      id: 'E01-U06', questionId: 'E01-Q16', minutes: 3, title: 'Practice: the document’s actual effect', source: 'signature',
      provenance: 'E01 §5 signature purpose and joint intent; objectives 5 and 7',
      content: [
        '## Practice: the document’s actual effect',
        "Avery qualifies individually for the requested loan. Spouse Cameron has an ownership interest in the collateral but did not apply jointly. A documented, applicable state-law review establishes that Cameron's signature is necessary only to make the collateral available, not to assume personal liability. The document system offers a combined note/security instrument whose current signature wording would make Cameron personally liable. A joint financial statement verifies household information but expresses no joint credit intent.",
        '### Inspect purpose and effect separately',
        "Prepare five entries in your notes: person, application role, supported legal purpose, effect of the offered document, and issue to route for correction. The case gives you the applicable legal review; do not invent another state's property rule. You are not being asked to draft or alter a legal instrument yourself.",
        "Compare the supported collateral purpose with the additional obligation created by the current wording. Then test whether a signature affirming accurate financial information answers the different question of who wanted to apply for credit. A document-system limitation is a workflow fact, not a new legal permission. After answering, use the explanation to check both parts of your proposed routing decision.",
      ],
      stem: 'What is the supported next step for Cameron’s signature?',
      choices: [
        'Use the combined instrument because a supported collateral purpose permits every obligation in its current wording.',
        'Treat the joint financial statement as conclusive joint intent and change Cameron’s application role.',
        'Remove every Cameron signature because individual qualification eliminates the need to make the collateral available.',
        'Obtain an authorized collateral-only document solution without unnecessary personal liability or invented joint intent.',
      ], correct: 'D',
      feedback: 'Match the necessary signature to its supported purpose. The stipulated collateral requirement does not justify the added note liability, and verification of a joint financial statement does not establish joint credit intent. Using the offered instrument overextends the collateral purpose; relabelling the application invents intent; removing every signature ignores a stipulated property requirement. Route the mismatch to the authorized document/legal reviewer. This exercise neither drafts a valid instrument nor decides any state’s property law. In your notes, distinguish the legal conclusion already supplied from the document correction still required.',
    },
    {
      id: 'E01-U07', questionId: 'E01-Q17', minutes: 2, title: 'Practice: challenge a false pass', source: 'treatment',
      provenance: 'E01 §6 comparison and prevention guide; objectives 1, 6 and 7',
      content: [
        '## Practice: challenge a false pass',
        "After a substantiated first-contact problem, Cedar Point changes its written script. Its proposed monthly control checks only closed loans and verifies that each has a completed reason field. Intake records also contain contacts who stopped before submitting complete applications. Several contacts never reached the loan system. The control owner asks whether a green result would reliably show that the earlier type of problem stopped.",
        '### Try to make the control fail',
        "Name the affected population, the evidence to compare, one situation the proposed control could incorrectly pass, and what would trigger further investigation. Consider a staff member who enters a plausible reason but communicates something different to the customer. Would the current test see that difference?",
        "Distinguish a completed field from an accurate record of conduct. Also distinguish a signal worth investigating from a conclusive legal finding. Select a stronger test, then compare your own proposed false-pass example with the explanation. No sample size, investigation outcome or particular software is mandated by this exercise.",
      ],
      stem: 'Which revision best addresses the control’s identified blind spot?',
      choices: [
        'Include relevant intake contacts that did not close and compare actual assistance, information and conditions with supported reasons.',
        'Keep only closed loans and add a supervisor signature confirming every reason field is complete.',
        'Compare only overall closing percentages and classify every difference as conclusive unlawful treatment.',
        'Exclude contacts outside the loan system because only a completed application can provide relevant evidence.',
      ], correct: 'A',
      feedback: 'A filled field establishes only that an entry exists. Including relevant intake contacts and their underlying evidence tests actual conduct against its stated explanation. Another signature on the same narrow test leaves the blind spot. Aggregate differences warrant investigation rather than automatic legal conclusions. Records outside the loan system may document relevant first-contact statements. This is a recommended detection method, not a compulsory sampling plan. Compare your false-pass example with the additional evidence the improved control would inspect.',
    },
  ],
  E02: [
    {
      id: 'E02-U06', questionId: 'E02-Q15', minutes: 2, title: 'Practice: preserve the income timeline', source: 'income',
      provenance: 'E02 §3 historical records and changed-fact raise; factual evidence and escalation objectives',
      content: [
        '## Practice: preserve the income timeline',
        "Marlow's employer confirms September base pay of $6,800. A separate signed employer record describes a conditional increase to $7,600 beginning November 1. An earlier upload described September pay as $7,600; its author remains unknown. The lender relies on income for a covered general ability-to-repay transaction. The authorized reviewer has not decided whether the conditional future increase may be used.",
        '### Sort the evidence before reaching a conclusion',
        "Make three entries: verified historical fact, conditional future fact, and unresolved record or decision. Identify which document supports each entry and which inference you must not make about authorship. Do not treat an amount as belonging to the same period merely because the number appears in two documents.",
        "Ask whether the employer's confirmation solves every issue or only a specific one. In particular, distinguish the amount paid in September from the underwriting decision about future income and from the origin of the inaccurate upload. Answer using only the supplied facts, then check your three entries against the explanation. This practice does not make a loan-approval decision.",
      ],
      stem: 'Which note is supported by Marlow’s record now?',
      choices: [
        'September pay is verified at $7,600 because the November increase explains the earlier upload.',
        'The applicant committed fraud because the September upload conflicts with verified historical pay.',
        'September pay is $6,800; the conditional November increase, reliance decision and inaccurate upload remain separate issues.',
        'Only September pay matters; preserving or reviewing the conflicting document is now unnecessary.',
      ], correct: 'C',
      feedback: 'Record verification within its actual period. A future increase cannot be moved backward into September. The discrepancy does not establish who produced the upload or their intent. The authorized reviewer must separately evaluate any reliance on expected income under the applicable rule and program; this exercise imposes no universal acceptance or rejection of future raises. Preserve the conflicting record for the appropriate review. Your three entries should distinguish a confirmed historical amount from a conditional expectation and an unresolved conduct question.',
    },
    {
      id: 'E02-U07', questionId: 'E02-Q16', minutes: 3, title: 'Practice: follow the benefit', source: 'referral',
      provenance: 'E02 §5 referral compensation and §8 separate issue resolution; referral/consumer-protection objectives',
      content: [
        '## Practice: follow the benefit',
        "Harbor Oak Title offers an outside mortgage originator a $900 credit toward the originator's office-software subscription after six referred federally related mortgage transactions close using Harbor Oak's settlement services. The arrangement expressly conditions the credit on those referrals. The originator is not Harbor Oak's employee and supplies it no goods or services. The parties call the credit technology support. Borrowers pay Harbor Oak's ordinary settlement price. No credit has yet been delivered.",
        '### Evaluate the proposed arrangement',
        "Build five entries: who benefits, what triggers the benefit, which business is referred, what work is actually performed for the payer, and what facts support any proposed exception. Separate an invoice label from evidence of work. The question asks whether to approve this arrangement as described, not whether every possible vendor relationship is prohibited.",
        "Test three changes that alter appearance without necessarily changing the arrangement: paying the software vendor directly, charging the normal subscription price, and informing borrowers about the credit. For each, identify which original fact still needs analysis. Then select your recommendation and review why the other recommendations fail on these stipulated facts. Your written analysis is reflection, not a submitted legal opinion.",
      ],
      stem: 'Which recommendation follows from Harbor Oak’s stipulated proposal?',
      choices: [
        'Do not approve it as described; the referral-conditioned noncash credit and its label do not establish a permitted exception.',
        'Approve it because payment goes to the software vendor instead of the originator’s bank account.',
        'Approve it at the ordinary subscription price because fair pricing alone establishes actual services.',
        'Approve it after disclosure because ordinary settlement prices and borrower notice remove the referral condition.',
      ], correct: 'A',
      feedback: 'The subscription benefit is value even without a direct cash payment. The agreement ties that benefit to covered settlement-service referrals, while the case supplies neither actual services to the payer nor an own-employee relationship. Payment channel, market price and disclosure do not remove those facts. Preserve the proposed terms and route them for authorized compliance review before proceeding. This conclusion concerns the stated proposal, not every legitimate vendor or services arrangement. In your five entries, check that the description of work is based on what occurred, rather than on the technology-support label.',
    },
    {
      id: 'E02-U08', questionId: 'E02-Q17', minutes: 2, title: 'Practice: correction and conduct are different', source: 'valuation',
      provenance: 'E02 §6 valuation independence and §8 integrated review; present reliance versus prior conduct',
      content: [
        '## Practice: correction and conduct are different',
        "In a covered consumer loan secured by the principal dwelling, an MLO threatens to withhold the appraiser's fee unless the valuation reaches the contract price. The appraiser refuses the demand. Later, the appraiser independently corrects a genuine garage-area error. Before consummation, the creditor learns of the coercion violation. Nobody has completed a documented reasonable-diligence determination about whether the valuation materially misstates or misrepresents the dwelling's value.",
        '### Keep two tracks open',
        "Write two headings: present reliance on the valuation and handling of earlier conduct. Under each, name the fact established, the decision still required, and the person or function that should receive the issue. Ask what the garage correction demonstrates and what it does not demonstrate.",
        "Test whether a borrower acknowledgment or the mere ordering of another report answers the unresolved reliance question. Do not confuse ordering a report with choosing and lawfully relying on an unaffected valuation. Your decision must address the stated plan to extend credit based on the affected valuation. Compare both tracks with the explanation after answering.",
      ],
      stem: 'Which next step respects both tracks in the valuation case?',
      choices: [
        'Treat the garage correction as automatically clearing reliance and closing the earlier coercion incident.',
        'Order a second valuation and treat its mere receipt as conclusive resolution of every remaining requirement.',
        'Use the borrower’s acknowledgment of the threat instead of a valuation-diligence determination.',
        'Address the documented-diligence condition before extending credit on this valuation, and separately preserve and review the coercion.',
      ], correct: 'D',
      feedback: 'A genuine correction does not undo coercion. With the stipulated coverage and knowledge, reliance on the affected valuation requires the applicable documented diligence before credit is extended. Comment 42(e)-1 also recognizes reliance on a different, unaffected valuation; a second valuation is not universally required. Merely ordering or receiving another report does not resolve every issue. Preserve the incident and route both reliance and conduct for their separate reviews. Do not accuse the appraiser of wrongdoing merely because the original result was below contract. Compare your two tracks without collapsing them into one cleared flag.',
    },
  ],
};

export function ethicsPracticeUnits(moduleId) {
  if (!Object.hasOwn(activities, moduleId)) throw new Error('nmls_review_content_invalid');
  return activities[moduleId].map(a => {
    const source = sources[a.source];
    return { id: a.id, title: a.title, guidedPractice: true, requiredSeconds: a.minutes * 60,
      requiredActionIds: [a.questionId],
      content: a.content.join('\n\n') + '\n\n### Source and scope\n\n[' + source.title + '](' + source.url + ')\n\nAll names, statements and case facts are fictional. The workflow and note formats are instructional suggestions. This private practice does not issue NMLS credit or establish validated learning time.',
      actionQuestion: { id: a.questionId, stem: a.stem,
        options: a.choices.map((text, i) => ({ id: 'ABCD'[i], text })),
        correctChoice: a.correct, rationale: a.feedback,
        remediation: 'Revisit ' + a.provenance + '.', sourceUrls: [source.url] },
    };
  });
}
