/** Public PE05/PE06 formative activities adapted only from the six allowlisted
 * members of the verified public source bundle dated 2026-09-30.
 * The learner cases use public process self-review criteria, not private case keys.
 * Automatic numerical checks use only explicit public worked examples; their
 * arithmetic is independently verified. No learner-case answer key is imported.
 * Not NMLS approved; no credit. Proposed minutes are unvalidated design estimates.
 * This module performs no file reads, network requests, or state changes. Importing
 * or projecting it does not publish it or supply an instructor or peer exchange.
 */

export const PE_LAW_ETHICS_PROVENANCE = {
  version: '2026-09-30',
  publicFormative: true,
  creditBearing: false,
  durationValidated: false,
  bundle: 'StateCourse_PE05_PE06_Public_Lessons_Practice_Source_2026-09-30.zip',
  bundleSha256: '171100979bc98f0f2aff3b4983c6a7e67578d9e010a5791aad211cb72da13e75',
  publicBundleMembersVerified: 6,
  sourceFiles: [
    {name: 'PE05_student.md', bytes: 41377, sha256: '9e05581cca1e424d3cde4b7a02c2228ac70259e181bf0e8d1a8182eaf49d9de0'},
    {name: 'PE06_student.md', bytes: 43390, sha256: 'c768bc895f8be1793bae9ee8e91e27cc3def54d7da0e171d29a9880b1361ca13'},
    {name: 'PE05_practice.json', bytes: 29010, sha256: 'b92c7b23ee969136990d8f92028970fd76a9083ffe47b17625afc8a1b9d1457d'},
    {name: 'PE06_practice.json', bytes: 27856, sha256: '59c88676d61eeaaed0bc702c9c688b68a54cd8287585edaffef2dcf243fcf464'},
    {name: 'README_PUBLIC_SOURCE.md', bytes: 1523, sha256: '4c25e341096e714df35f09a0a7b3d5809605450f496097c6a78d38ee2f9f941f'},
    {name: 'public_manifest.json', bytes: 1048, sha256: '26aff28e2f150d6c32402afa156e1d507fb7e7528b8e0c47541e2f4cd01421e8'},
  ],
  modules: [
    {id: 'PE05', module: 'module-05', category: 'federal_law', proposedMinutes: 150, publicQuestionCount: 20, scenarioCount: 4, scenarioTaskCount: 14},
    {id: 'PE06', module: 'module-06', category: 'ethics', proposedMinutes: 150, publicQuestionCount: 16, scenarioCount: 5, scenarioTaskCount: 15},
  ],
  interaction: 'Current self-guided practice uses optional self-review. Genuine peer interaction, substantive instructor feedback, and revision remain a proposed future scheduled OIL requirement.',
  privacy: 'Only the six allowlisted public source bundle members were read for this adaptation. No private instructor source or protected final content was read or imported. Use fictional facts only; do not enter real borrower data.',
};

export const PE_LAW_ETHICS_SCENARIOS = [
  {
    id: 'PELA-A-05A-timeline',
    title: 'Build the disclosure event record',
    module: 'module-05',
    context: 'Use PE05 Unit 5A, Your timeline case. This fictional case is for optional self-review. Show the source, event, business-day definition, and count for each conclusion; these criteria do not automatically grade a legal deadline or authorize closing.',
    facts: [
      'Assume an ordinary consumer-purpose, closed-end real-property loan subject to the integrated disclosure rules. No relevant legal public holiday, exception, emergency waiver, or restart event applies.',
      'All six application items arrive Monday, September 21, 2026. The lender is open to the public for substantially all business functions Monday through Friday.',
      'The Loan Estimate is delivered in person Thursday, September 24. The Closing Disclosure is received in person Monday, September 28.',
      'For the separate receipt variation only, replace in-person CD receipt with mailing Monday, September 28, and assume no evidence of earlier actual receipt.',
      'For the separate office-schedule variation only, consider the lender also opening Saturday for substantially all business functions. Keep the other original facts unchanged.',
    ],
    sources: [
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/2/', reference: 'PE05 P5-06: application, business-day definitions, and consummation; fictional dates come from Your timeline case'},
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/19/', reference: 'PE05 P5-02: integrated disclosure delivery, receipt, and waiting periods'},
    ],
    tasks: [
      {
        id: 'PELA-T-05A-record', type: 'short-answer',
        prompt: 'Record the application event, initial LE deadline, earliest consummation under the LE wait, and earliest consummation under the CD wait. Show each count and identify the later controlling date.',
        rubric: [
          'Anchor the application row to receipt of the supplied six items, not software entry, verification, or a later signature',
          'Identify the business-day definition that governs each obligation before counting',
          'Keep LE delivery and CD receipt distinct, and show each included or excluded day',
          'Compare the independent waiting-period results without treating a scheduled appointment as legal clearance',
        ],
        rationale: 'Check your method against Unit 5A and the cited provisions. A date alone hides the trigger and counting assumptions. Satisfying one waiting period does not establish satisfaction of every other requirement.',
      },
      {
        id: 'PELA-T-05A-receipt', type: 'short-answer',
        prompt: 'Apply the mailing variation. Write separate rows for mailing, presumed receipt, and the resulting CD wait. Identify what changes and what stays supported by the original record.',
        rubric: [
          'Distinguish the sending event from evidence or presumption of receipt',
          'Use the stated absence of earlier-receipt evidence rather than inventing an acknowledgment',
          'Recompute only the affected part, then compare all applicable waits again',
          'Explain why the result is an exercise calculation rather than permission to fund',
        ],
        rationale: 'A delivery-method change affects the receipt analysis. Preserve the independent LE analysis and make the dependency visible; do not assume an email or mailing timestamp proves same-day receipt.',
      },
      {
        id: 'PELA-T-05A-schedule', type: 'short-answer',
        prompt: 'Apply the office-schedule variation to the original in-person case. Explain which definition depends on the lender opening Saturday and whether that change affects any count on these dates.',
        rubric: [
          'Separate the creditor-office definition from the definition excluding Sundays and specified legal public holidays',
          'Inspect the actual days within the relevant count before claiming the result changes',
          'Support the conclusion with one case fact and the applicable source rather than a universal Saturday slogan',
        ],
        rationale: 'Changing a schedule can matter to one definition without changing every deadline. Test the facts of this count and revise any claim that treats all business days as interchangeable.',
      },
    ],
  },
  {
    id: 'PELA-A-05B-charges',
    title: 'Separate the settlement charge tests',
    module: 'module-05',
    context: 'Begin with the explicit public Worked charge ledger, then apply process self-review to the separate Your settlement case. The two files have different figures. Automatic checks cover only the worked example; they do not approve a charge, prescribe a remedy, or supply a private case key.',
    facts: [
      'Worked ledger only: recording fees are estimated at $250 and charged at $265; required unaffiliated title service chosen from the list is estimated at $800 and charged at $920; the required unaffiliated survey chosen from the list is estimated at $250 and charged at $245.',
      'For that ledger, all three services are correctly in the ten-percent aggregate, all are performed, dollar amounts are exact, no valid revised baseline exists, and all other requirements are satisfied.',
      'Worked-ledger variation only: change title to $960. A separate worked zero-tolerance origination fee rises from $1,200 to $1,260 with no permissible revised baseline; an unrelated zero-tolerance fee decreases $60.',
      'Separate learner settlement case: the valid ten-percent aggregate estimate is $900 and final qualifying charges are $1,015. All services were performed and no permitted revision exists.',
      'In that learner case, the lender’s own zero-tolerance fee rises from $800 to $845. An appraisal remains $610 on the disclosure, but the provider receives $585; no lawful averaging program or other service exists. Nothing has yet been collected.',
    ],
    sources: [
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/19/', reference: 'PE05 P5-02: good-faith comparison, revisions, actual charges, and corrections; all numeric inputs come from the public student worked ledger or the separately labeled learner case'},
    ],
    tasks: [
      {
        id: 'PELA-T-05B-worked-ceiling', type: 'computation',
        prompt: 'For the worked ledger only, what is the permitted ten-percent aggregate ceiling in dollars?',
        expected: 1430, tolerance: 0.005, unit: 'dollars',
        rationale: '($250 + $800 + $250) × 1.10 = $1,430. The original final charges total $265 + $920 + $245 = $1,430. This uses the expressly stipulated category and valid baseline, not a rule that every fee receives ten-percent tolerance.',
      },
      {
        id: 'PELA-T-05B-worked-excess', type: 'computation',
        prompt: 'For the worked-ledger variation with a $960 title charge, how much does the final aggregate exceed its ceiling?',
        expected: 40, tolerance: 0.005, unit: 'dollars',
        rationale: '$265 + $960 + $245 = $1,470. $1,470 − $1,430 = $40. The aggregate comparison does not apply a separate ten-percent cap to each line.',
      },
      {
        id: 'PELA-T-05B-worked-own-fee', type: 'computation',
        prompt: 'For the separate worked origination fee, what increase must remain visible instead of being netted against the unrelated $60 decrease?',
        expected: 60, tolerance: 0.005, unit: 'dollars',
        rationale: '$1,260 − $1,200 = $60. Under the supplied zero-tolerance and no-revision facts, a decrease in a different fee does not erase this increase. Keep it separate from the aggregate calculation.',
      },
      {
        id: 'PELA-T-05B-case-record', type: 'short-answer',
        prompt: 'Switch to the learner settlement case. Show the aggregate ceiling and excess, the separate lender-fee increase, and the separate appraisal issue in three rows. Explain why total cash to close cannot answer all three.',
        rubric: [
          'Use only the learner-case figures, keeping them separate from the worked ledger',
          'Show the valid baseline and aggregate method for the stipulated aggregate category',
          'Keep the lender’s own fee comparison independent of unrelated increases or decreases',
          'Identify why unchanged disclosed appraisal cost does not settle the actual-charge question',
          'Do not invent a remedy or treat a calculated total as legal clearance',
        ],
        rationale: 'Self-review the path from each fact to its own test. Fee classification, permissible revisions, and amounts paid for a service answer distinct questions even when the overall closing total appears plausible.',
      },
      {
        id: 'PELA-T-05B-release', type: 'short-answer',
        prompt: 'Before release, name the records and authorized review needed for each unresolved charge issue, and state the present collection status accurately.',
        rubric: [
          'Connect each request to a specific missing record or decision rather than asking for a generic complete file',
          'Identify the estimate history, charge/service evidence, and relevant review function',
          'Preserve the fact that nothing has been collected instead of describing an already completed refund',
          'Avoid promising release or importing a universal correction deadline',
        ],
        rationale: 'A useful handoff identifies what a reviewer must establish and what has actually occurred. A calculation can identify an issue without itself deciding the authorized correction.',
      },
      {
        id: 'PELA-T-05B-change', type: 'short-answer',
        prompt: 'Consider a separate hypothetical borrower-requested change affecting one charge. What facts and timing evidence would you need before revising the comparison, and what would you leave unchanged?',
        rubric: [
          'Identify the actual request, affected charge and amount, and when sufficient information became available',
          'Distinguish a permitted revision reason from an existing error or unsupported label',
          'Check the appropriate disclosure route and timing instead of assuming every new form resets the baseline',
          'Keep unrelated analyses intact and mark the hypothetical as unverified rather than adding it to the original file',
        ],
        rationale: 'A revision needs a supported reason, limited scope, and applicable timing. Use this prompt to name evidence you would seek; it supplies no new amount or event that clears the original charge issues.',
      },
    ],
  },
  {
    id: 'PELA-A-05C-notices',
    title: 'Route the correct notice review',
    module: 'module-05',
    context: 'Use PE05 Unit 5C, Your notice selector. Assume ordinary consumer-credit applications, a creditor receiving more than 150 applications in the preceding calendar year, and no special exception. This activity selects a review process; it does not compose or send a legally sufficient consumer notice.',
    facts: [
      'File A: a consumer requests financing without identifying a property. The creditor evaluates the submitted information, decides not to lend because of documented recent serious delinquency, and communicates the decision.',
      'The File A decision relied in part on a consumer report.',
      'File B: an ordinary application lacks an applicant-provided asset explanation and there is insufficient information for a credit decision.',
      'A colleague proposes marking File B withdrawn because the consumer did not answer one call. No express withdrawal is supplied.',
    ],
    sources: [
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1002/2/', reference: 'PE05 P5-12: Regulation B application and completed-application definitions'},
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1002/9/', reference: 'PE05 P5-13: action and incompleteness notices and commentary'},
      {url: 'https://www.ftc.gov/system/files/ftc_gov/pdf/fcra-march-2026.pdf', reference: 'PE05 P5-16: FCRA, including consumer-report adverse-action duties; public manuscript source edition March 2026'},
    ],
    tasks: [
      {
        id: 'PELA-T-05C-file-a', type: 'short-answer',
        prompt: 'For File A, identify the rules and event evidence to route for notice review. Distinguish the creditor’s actual decision reason from information about the reporting agency.',
        rubric: [
          'Apply the relevant law’s definition rather than treating the missing address as exemption from every application rule',
          'Use the evaluation, decision, communication, and consumer-report reliance supplied in the case',
          'Keep the actual credit decision reason distinct from reporting-agency information and score factors',
          'Name the authorized notice-review step without inventing dates or drafting a complete legal form',
        ],
        rationale: 'Different laws ask different questions about the same file. Explain the event and source behind the review you request, and do not assume one disclosure automatically satisfies every notice duty.',
      },
      {
        id: 'PELA-T-05C-file-b', type: 'short-answer',
        prompt: 'For File B, write a three-line handoff naming the information gap, the notice path to check, and the unsupported status change to correct.',
        rubric: [
          'Identify the specific applicant-provided information still needed and the stated inability to make a credit decision',
          'Route the applicable timely incompleteness/action process through the authorized workflow',
          'Distinguish nonresponse from evidence of an express withdrawal',
          'Keep the record factual and avoid substituting a false denial reason or a fabricated deadline',
        ],
        rationale: 'Review the notice process that fits the actual record. An unanswered call supplies neither a missing explanation nor an express withdrawal, and a status label should not erase unresolved obligations.',
      },
      {
        id: 'PELA-T-05C-inquiry', type: 'short-answer',
        prompt: 'Explain how your analysis might differ if the employee only gave general information about possible terms and the application process. Identify what you would verify before changing File A’s status.',
        rubric: [
          'Compare an actual evaluation and communicated decision with a general inquiry response',
          'Identify the communication and creditor practice evidence needed to support the distinction',
          'Treat the variation as a separate hypothetical rather than rewriting the supplied decision history',
        ],
        rationale: 'The substance of the interaction matters. A familiar label such as prequalification cannot replace evidence of what the creditor actually evaluated and communicated.',
      },
    ],
  },
  {
    id: 'PELA-A-05D-rule-routing',
    title: 'Separate three compliance concerns',
    module: 'module-05',
    context: 'Use PE05 Unit 5D, Your rule-navigation case. Prepare a factual internal review plan with only the fictional facts. No data or message is sent, and this exercise makes no finding of criminal conduct.',
    facts: [
      'The proposed originator payment increases with the interest rate.',
      'A salesperson advertises a temporary payment as the permanent payment.',
      'A bank-statement account number differs from the previously verified record.',
      'The consumer has not been accused of wrongdoing. The case provides no verified explanation resolving any issue.',
    ],
    sources: [
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/36/', reference: 'PE05 P5-27: covered loan-originator compensation and steering'},
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/24/', reference: 'PE05 P5-28: covered advertising terms and required disclosures'},
      {url: 'https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know', reference: 'PE05 P5-30: applicable safeguards and incident response'},
      {url: 'https://www.ecfr.gov/current/title-31/subtitle-B/chapter-X/part-1029', reference: 'PE05 P5-32: covered AML/SAR obligations and confidentiality; a discrepancy is not automatically reportable crime'},
    ],
    tasks: [
      {
        id: 'PELA-T-05D-route', type: 'short-answer',
        prompt: 'Create three rows. For each concern, identify the rule family, evidence still needed, and responsible review function. Explain why a general disclosure does not resolve the whole file.',
        rubric: [
          'Keep compensation, advertising, and account/identity-security concerns distinct',
          'Link each proposed review to the actual fact and relevant scope instead of declaring every rule applies identically',
          'Name evidence that can test the concern and the function authorized to evaluate it',
          'Preserve each unresolved status without treating disclosure as universal permission',
        ],
        rationale: 'A useful escalation connects a concrete observation to a decision and the evidence needed for it. Solving one concern does not automatically settle the other two.',
      },
      {
        id: 'PELA-T-05D-safe-handoff', type: 'short-answer',
        prompt: 'Write a two-sentence internal handoff for the account-number mismatch. Then identify one detail you would exclude from an open discussion and one claim the current evidence does not support.',
        rubric: [
          'State the discrepancy neutrally without accusing the consumer or identifying an unproved cause',
          'Use the approved restricted review process and avoid exposing real account identifiers or documents',
          'Leave SAR determinations to the designated compliance function and do not announce a SAR’s existence',
          'Do not invent a breach deadline or wait for proven loss before routing a concern',
        ],
        rationale: 'Facts can be escalated promptly without turning uncertainty into an accusation or privacy exposure. This is process self-review, not a reportability decision or an instruction to disclose confidential reporting.',
      },
    ],
  },
  {
    id: 'PELA-A-06A-juniper',
    title: 'Review the Juniper treatment differences',
    module: 'module-06',
    context: 'Use public learner case C6A. Apply the current scope described in PE06, including its September 2026 Regulation B source boundary. Compare the supplied individual facts; this exercise does not infer a completed ECOA violation solely from a statistical difference.',
    facts: [
      'Lina and Owen seek the same fixed-rate purchase product. Pricing day, credit score, supported $7,200 monthly income, debts, LTV, property type, eligible options, and complete documentation status are stipulated the same.',
      'Lina is a woman and Owen is a man. No other relevant difference or special purpose program is supplied.',
      'Owen receives explanations of two eligible options and the standard checklist. Lina receives only the higher upfront cost option and a request for two extra months of bank statements.',
      'The originator writes, “Women with young families will probably stop working; give her the safer choice.” Lina has reported no planned income change. Both files remain under review.',
      'Separate second-round variation only: Lina’s statement, unlike Owen’s, contains an unexplained transfer whose source is required under the same lawful funds policy.',
    ],
    sources: [
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1002/4/', reference: 'PE06 P6-02: discrimination and current discouragement provisions and interpretations'},
      {url: 'https://www.federalregister.gov/documents/2026/04/22/2026-07804/equal-credit-opportunity-act-regulation-b', reference: 'PE06 P6-04: April 22, 2026 final rule, effective July 21, 2026; preserve the public manuscript’s current scope boundary'},
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1002/6/', reference: 'PE06 P6-05: current evaluation standards and individual income treatment'},
    ],
    tasks: [
      {
        id: 'PELA-T-06A-record', type: 'short-answer',
        prompt: 'Write a five-line decision record: treatment differences, evidence of their basis, unsupported assumption, immediate corrective review, and a sentence to Lina that acknowledges the issue without promising approval.',
        rubric: [
          'Compare both the options explained and the documentation requested against the stipulated comparable facts',
          'Identify the recorded explanation without inferring children, future plans, or other facts not supplied',
          'Separate the employee’s assumption from an actual reported change or verified requirement',
          'Name a concrete correction and authorized review rather than imposing the unsupported restriction on everyone',
          'Keep the applicant update accurate about the issue and remaining review',
        ],
        rationale: 'Use the specific treatment and recorded reason to explain your concern. A courteous message or eventual approval would not answer whether the earlier process used a prohibited assumption.',
      },
      {
        id: 'PELA-T-06A-transfer', type: 'short-answer',
        prompt: 'Apply the supplied second-round transfer variation. Explain what proportionate inquiry it could support and which earlier conduct it does not justify.',
        rubric: [
          'Identify the new transfer fact and the same lawful policy that makes it relevant',
          'Limit the evidence request to resolving that fact instead of assuming unlimited additional scrutiny',
          'Evaluate the earlier options explanation and recorded assumption separately',
          'Keep the changed hypothetical distinct from the original comparison',
        ],
        rationale: 'A relevant new fact can support a focused request without retroactively validating every other difference. Check the reason, scope, and consistency of each action.',
      },
      {
        id: 'PELA-T-06A-revise', type: 'short-answer',
        prompt: 'Choose the condition you would address first. Identify one fact that could strengthen or weaken your conclusion, then revise one line or defend it with the supplied evidence.',
        rubric: [
          'Connect the priority to a concrete consumer effect or unresolved decision',
          'Label additional evidence as information to seek, not as a discovered case fact',
          'Explain how the evidence would affect a particular conclusion',
          'Make a reasoned revision or defense without claiming instructor acceptance',
        ],
        rationale: 'Optional self-review is an opportunity to test your comparison and correction. Another priority can be reasoned, but it should not make an unresolved issue disappear.',
      },
    ],
  },
  {
    id: 'PELA-A-06B-worked-pay',
    title: 'Check the worked pay-period arithmetic',
    module: 'module-06',
    context: 'Use explicit public worked example W6B, A raise in the wrong period. These calculations describe what the records would annualize to; they do not select qualifying income, verify either document, or establish a fraud threshold.',
    facts: [
      'An employer record shows $3,100 gross per semimonthly pay period for August. A replacement shows $3,600 for the same period.',
      'Semimonthly means 24 pay periods annually in this worked example. The application uses $7,200 monthly income.',
      'The consumer reports a promotion beginning in October. A manager says to use the replacement as August proof. Assume reliance on salary under the general ATR rule.',
      'The public worked example later supposes authorized verification of $6,200 monthly for August and $7,200 for October. Historical earnings and prospective usability remain different questions.',
    ],
    sources: [
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/43/', reference: 'PE06 P6-08: general ATR verification and expected income; amounts and period assumptions come from public worked example W6B'},
    ],
    tasks: [
      {
        id: 'PELA-T-06B-worked-first', type: 'computation',
        prompt: 'What monthly amount does the first semimonthly figure annualize to?',
        expected: 6200, tolerance: 0.005, unit: 'dollars',
        rationale: '$3,100 × 24 ÷ 12 = $6,200 monthly. The calculation preserves the stipulated semimonthly frequency and does not establish that the document has been verified.',
      },
      {
        id: 'PELA-T-06B-worked-replacement', type: 'computation',
        prompt: 'What monthly amount does the replacement figure annualize to?',
        expected: 7200, tolerance: 0.005, unit: 'dollars',
        rationale: '$3,600 × 24 ÷ 12 = $7,200 monthly. Matching the application figure does not explain a same-period conflict or turn an October change into August earnings.',
      },
      {
        id: 'PELA-T-06B-worked-difference', type: 'computation',
        prompt: 'What is the monthly difference between those annualized figures?',
        expected: 1000, tolerance: 0.005, unit: 'dollars',
        rationale: '$7,200 − $6,200 = $1,000 monthly. This quantifies the inconsistency for review; it supplies neither a federal fraud threshold nor authority to use the higher amount.',
      },
    ],
  },
  {
    id: 'PELA-A-06B-willow',
    title: 'Preserve the Willow investigation record',
    module: 'module-06',
    context: 'Use public learner case C6B. This is a different file from worked example W6B. Create a factual review plan without deciding who lied, choosing a final occupancy classification, or demanding a target appraisal value.',
    facts: [
      'The purchase concerns a two-unit property. The application states planned borrower occupancy of Unit A and a lease gives a tenant occupancy of Unit B.',
      'A separate sales-partner email says, “The tenant wants the whole property for another year.”',
      'An employer’s September record shows $6,800 monthly salary. A replacement labeled September shows $8,100, with no reason supplied.',
      'The credit report has the applicant’s name but a different birth date. The appraisal describes one unit.',
      'A supervisor asks you to copy the preferred facts into a clean summary and discard the conflicting versions. No discrepancy has been resolved.',
    ],
    sources: [
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/43/', reference: 'PE06 P6-08: relied-on evidence under the assumed general ATR rule'},
      {url: 'https://selling-guide.fanniemae.com/sel/b2-1.1-01/occupancy-types', reference: 'PE06 P6-09: an example of program-specific occupancy guidance, not a universal rule for every loan'},
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/42/', reference: 'PE06 P6-10: valuation independence and permissible factual review within the provision’s scope'},
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1002/12/', reference: 'PE06 P6-23: applicable record retention and extended preservation; no universal deletion date'},
    ],
    tasks: [
      {
        id: 'PELA-T-06B-four-issues', type: 'short-answer',
        prompt: 'Prepare four short entries for income, occupancy, identity, and appraisal. In each, name the conflict or ambiguity, affected decision, evidence needed, and responsible review function.',
        rubric: [
          'Compare the two income records for their stated period without treating a preferred amount as verification',
          'Read the unit-specific lease and separate whole-property statement without assuming either resolves future occupancy',
          'Resolve the specific identifier mismatch without attributing accounts or wrongdoing from a name alone',
          'Route the unit-count concern for independent factual review without demanding a value increase',
          'Give each issue its own evidence request and responsible function while preserving all open statuses',
        ],
        rationale: 'The case requires several distinct investigations. A discrepancy warrants reliable review; it neither proves fraud nor permits copying a convenient fact into a supposedly verified summary.',
      },
      {
        id: 'PELA-T-06B-preserve', type: 'short-answer',
        prompt: 'Write one sentence declining the supervisor’s record-handling instruction, then a two-sentence borrower update naming the next information needed and the actual review status.',
        rubric: [
          'Keep original records and attributable corrections within the authorized process and applicable preservation requirements',
          'Use the designated alternative escalation route when the supervisor is implicated',
          'Request specific information neutrally without accusing the borrower or exposing restricted records',
          'Preserve ordinary notice and disclosure review instead of treating an investigation as suspension of all deadlines',
        ],
        rationale: 'A clean-looking summary is not reliable if it hides conflicting evidence. The draft update should help the consumer understand the next task while accurately showing what remains unresolved.',
      },
      {
        id: 'PELA-T-06B-one-resolution', type: 'short-answer',
        prompt: 'Choose a first priority and consider a different one. Name the risk of waiting, the verified clarification needed for one issue, and which statuses would remain open even if that clarification arrived.',
        rubric: [
          'Explain the consequence of a chosen priority rather than asserting a universal ordering',
          'Describe the necessary clarification as evidence to obtain, not an invented finding',
          'Update only the conclusion that the hypothetical verified information could support',
          'Identify why other unresolved issues still need their own review',
        ],
        rationale: 'One reliable clarification can advance a file without clearing the whole file. Keep the conditional reasoning explicit and review the remaining dependencies.',
      },
    ],
  },
  {
    id: 'PELA-A-06C-worked-payment',
    title: 'Reconcile the worked monthly outlay',
    module: 'module-06',
    context: 'Use explicit public worked example W6C, The incomplete payment. This is separate from learner case C6C. The arithmetic counts stipulated monthly components; it is not preapproved advertising copy, an actual quote, or a promise that estimates stay fixed.',
    facts: [
      'A draft calls $1,640 the full monthly home cost. That figure is principal and interest only.',
      'The worked example supplies $325 estimated monthly taxes, $105 estimated homeowners insurance, $80 mortgage insurance, and a $65 association charge paid separately.',
      'All figures are monthly and no other charges are included in this exercise. Assume the first four components are collected together.',
    ],
    sources: [
      {url: 'https://www.consumerfinance.gov/owning-a-home/closing-disclosure/', reference: 'PE06 P6-22: projected payment components and nonescrow charges; fictional figures and arithmetic are explicit in worked example W6C'},
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/24/', reference: 'PE06 P6-20: advertising disclosure and placement review is separate from correct arithmetic'},
    ],
    tasks: [
      {
        id: 'PELA-T-06C-worked-outlay', type: 'computation',
        prompt: 'What is the total stated monthly outlay, including the association charge?',
        expected: 2215, tolerance: 0.005, unit: 'dollars',
        rationale: '$1,640 + $325 + $105 + $80 + $65 = $2,215. Paying a charge separately does not remove it from the stated monthly outlay.',
      },
      {
        id: 'PELA-T-06C-worked-collection', type: 'computation',
        prompt: 'What is the stipulated combined monthly collection before the separately paid association charge?',
        expected: 2150, tolerance: 0.005, unit: 'dollars',
        rationale: '$1,640 + $325 + $105 + $80 = $2,150. The separate $65 association charge brings the total stated outlay to $2,215; the collection alone is not that full outlay.',
      },
      {
        id: 'PELA-T-06C-worked-gap', type: 'computation',
        prompt: 'How much does the total stated monthly outlay exceed the $1,640 headline?',
        expected: 575, tolerance: 0.005, unit: 'dollars',
        rationale: '$2,215 − $1,640 = $575 monthly. Correct this difference without promising that estimates or other payment components can never change.',
      },
    ],
  },
  {
    id: 'PELA-A-06C-message',
    title: 'Review the payment message and referral offer',
    module: 'module-06',
    context: 'Use public learner case C6C. Prepare an educational draft and internal review note only. Nothing is sent or published. A corrected calculation or short rewrite does not establish a fully compliant advertisement.',
    facts: [
      'The draft is an ordinary webpage advertisement for a closed-end first-lien dwelling mortgage, not radio/TV, an envelope, a linked banner, or a pop-up.',
      'The proposed message says: “Only $1,820 a month, your all in payment, fixed forever. No need to compare. Sign today and we guarantee a lower rate refinance next year.”',
      'The illustration states $1,820 monthly principal and interest for the full loan term, $390 estimated taxes, $120 estimated homeowners insurance, $95 mortgage insurance, and a $75 association charge paid separately.',
      'There is no supporting evidence for the refinance guarantee or the claimed signing deadline.',
      'A settlement provider offers the outside mortgage broker a $100 gift card for each consumer referred to its covered settlement service. The broker is not the provider’s employee, performs no work for it, and has no applicable exception stipulated. The agreement is expressly conditioned on referrals in covered federally related mortgage transactions.',
    ],
    sources: [
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/24/', reference: 'PE06 P6-20: payment advertising disclosures and format-specific placement requirements'},
      {url: 'https://www.ecfr.gov/current/title-12/chapter-X/part-1014/section-1014.3', reference: 'PE06 P6-21: covered mortgage commercial communications and material misrepresentations'},
      {url: 'https://www.consumerfinance.gov/rules-policy/regulations/1024/14/', reference: 'PE06 P6-18: covered referral agreements, things of value, and permissible-payment conditions'},
      {url: 'https://www.consumerfinance.gov/owning-a-home/closing-disclosure/', reference: 'PE06 P6-22: projected payment components and charges outside escrow'},
    ],
    tasks: [
      {
        id: 'PELA-T-06C-rewrite', type: 'short-answer',
        prompt: 'Calculate the total stated monthly outlay and its difference from the headline, then write a four-sentence consumer explanation identifying the components, estimates, separate charge, and a useful next step.',
        rubric: [
          'Use the C6C figures rather than the separate worked-example figures, showing each component once',
          'Distinguish principal and interest from total outlay and identify the separately paid charge',
          'Keep taxes and insurance identified as estimates and avoid an unsupported permanent total',
          'Remove the unsupported refinance guarantee and signing deadline without replacing them with new promises',
          'Name a useful consumer next step and route the full advertisement for disclosure and placement review',
        ],
        rationale: 'Self-review both the math and what a reader could misunderstand. A sound educational explanation makes the stated costs usable while leaving full advertising compliance to the applicable review.',
      },
      {
        id: 'PELA-T-06C-conflicts', type: 'short-answer',
        prompt: 'Write a separate two-line internal decision addressing the gift-card proposal and the unsupported deadline. State the evidence and review needed before either is used.',
        rubric: [
          'Analyze the stipulated referral-conditioned benefit and absence of performed service or applicable exception',
          'Do not treat a gift label, unchanged consumer price, or borrower signature as permission',
          'Ask for the actual source and consequences of a claimed deadline instead of creating pressure from an unsupported date',
          'Keep the recommendation tied to the consumer’s interests and the authorized review process',
        ],
        rationale: 'Treat the compensation arrangement and pressure claim as their own decisions. A corrected payment explanation does not resolve either one.',
      },
      {
        id: 'PELA-T-06C-comprehension', type: 'short-answer',
        prompt: 'Identify the most likely misunderstanding remaining in your rewrite. Test one phrase against the figures or a missing qualification, then revise it and write a focused comprehension question.',
        rubric: [
          'Select a concrete phrase about a cost, estimate, separate payment, future event, or next step',
          'Use the supplied facts to explain the misunderstanding rather than inventing a consumer preference',
          'Ask about a material distinction the consumer could explain in their own words',
          'Keep the draft pending required advertising review; a comprehension check does not replace disclosures',
        ],
        rationale: 'A focused question can reveal what needs another explanation. This is optional self-review of a draft, not peer participation, instructor acceptance, or permission to publish.',
      },
    ],
  },
];
