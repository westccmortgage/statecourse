# Federal Law Lesson F01 - The application exists before the LOS says it does

Version: draft 2026.1 | Evidence reviewed: September 10, 2026\
Audience: practicing state-licensed mortgage loan originators\
Category proposed: Federal Law | Placement: first substantive lesson in the 2026 CE core

**Draft, not an approved course.** This is original instructional content and formative practice. No credit, approved duration, student validation, or regulatory approval is claimed. The blueprint's provisional allocation is an authoring target, not a measured learner duration. Human subject-matter review, representative-learner timing, delivery testing, and course approval remain required. All names, dates, companies, and files below are fictional.

## Purpose and boundaries

Experienced originators do not usually lose a file because they cannot name Regulation B or TRID. They lose control when information arrives by one channel, the decision happens in another, and the system of record is updated last. A customer receives a personal rejection while the CRM still says inquiry. A property address arrives by message, but the disclosure clock waits for a processor to create the loan. An incomplete-file queue quietly becomes a collection of unrecorded denials.

This lesson uses ordinary consumer-purpose mortgage transactions subject to the Loan Estimate requirements in Regulation Z §1026.19(e). It does not extend TRID's six-item rule to every credit product, nor consumer-credit notice rules to all business credit. Assume the creditor received more than 150 applications during the preceding calendar year; the small-volume oral-notice exception is outside the case assumptions. Reverse mortgages, HELOCs, HMDA reporting classifications, and FCRA disclosures require their own coverage.

NMLS's 2026 required-topic list supplies the selection of subjects; the operative rules and official interpretations below supply the legal tests. This lesson addresses topic IDs 1-5: notifications, action tracking, specific reasons, records, and timely initial disclosures. See the [NMLS 2026 topic list](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/pubs/nmlsEdFuncSpec/education/funcSpec/maps/topics/approvedCourseTopics/nmlsFS_approvedCETopics2026.html).

### Learning outcomes

By the end, the learner should be able to:

1. Classify a consumer contact using the creditor's actual conduct, not the label assigned to it.
2. Apply the Regulation B and TRID application tests separately to the same facts.
3. Select an appropriate action or incompleteness notice and identify its trigger.
4. Trace adverse-action reasons to the actual decision, including decisions on incomplete files.
5. Assemble evidence that establishes what happened, when it happened, and what the consumer was told.
6. Propose a preventive control and a test capable of detecting its failure.

## 1. One customer, two application tests

Regulation B asks whether there is an oral or written request for credit made under the creditor's procedures. Those procedures include what the creditor actually does, not only its manual. A completed application exists when the creditor has the information it regularly obtains and considers for that credit decision. The creditor must act with reasonable diligence to obtain needed information. That flexibility does not permit an endless queue of unworked files. [12 CFR §1002.2(f), comments 2(f)-1, -2, and -6](https://www.consumerfinance.gov/rules-policy/regulations/1002/2/#f).

For the TRID transactions in this lesson, the application trigger uses six submitted items: name, income, Social Security number to obtain a credit report, property address, estimated property value, and mortgage loan amount sought. It is not a requirement to have a credit report, a signed purchase contract, verification documents, or a fully underwritten file. [12 CFR §1026.2(a)(3)(ii), comment 2(a)(3)-1](https://www.consumerfinance.gov/rules-policy/regulations/1026/2/#a-3-ii).

| Decision to make | Legal test | Evidence an operations reviewer needs |
| --- | --- | --- |
| Is this a Reg B application? | Request, actual procedures, and how the creditor responded | Conversation, request, decision, and communication records |
| Is it complete for the Reg B decision? | Information the creditor regularly obtains and considers | Required-item inventory, receipt dates, diligent follow-up |
| Has TRID's initial LE trigger occurred? | Receipt of the six specified items for a covered transaction | Earliest receipt time and source for each item |
| Has the company entered the file in its LOS? | Internal workflow fact, not a substitute legal trigger | System-created time separately from actual information receipt |

The table is an implementation aid, not a new legal definition.

### Worked case: the missing address

On Monday, Harbor Lending receives Maya's name, stated income, SSN, estimated price range, and requested loan amount. No property is identified. Maya asks for an explanation of possible terms. The originator describes general policies, explains that a later application and analysis will be necessary, and makes no credit decision.

On Tuesday, a different employee reviews Maya's credit information and tells her: “We reviewed your request and will not approve it because of the recent delinquent mortgage payments.”

The company calls both contacts “prequalification.” That label does not settle the result. The Tuesday evaluation, decision to decline, and communication create the application/adverse-action issue identified in the official interpretation. The missing property address means the facts still do not establish all six TRID items. An ECOA notice obligation can therefore exist even though an LE has not been triggered. [Comments 2(f)-3 and -4](https://www.consumerfinance.gov/rules-policy/regulations/1002/2/#Interp-2-f); [Reg B comment 9-5](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/#Interp-9).

Do not replace that analysis with “every credit pull is an application.” The official interpretation also describes prequalification activity that can remain an inquiry, depending on the response. A soft pull does not itself create an exemption, and a hard pull does not decide every classification. The compliance question is what the creditor did with the request and information.

**Decision pause.** What two records would distinguish Monday from Tuesday? Write your answer before reading on.

A useful answer identifies the actual communication and the decision record. A credit-bureau log proves a report was obtained, but does not prove whether the employee only explained terms, declined credit, or issued a commitment. A CRM status proves what someone labeled the interaction, not necessarily what happened.

## 2. The first LE clock cannot wait for verification

Once the six-item TRID application is received, the initial LE ordinarily must be delivered or placed in the mail by the third business day after receipt. For this deadline, a business day uses the creditor's substantially-all-business-functions test. That differs from the more precise business-day definition applicable to other TRID waiting periods. [§1026.19(e)(1)(iii)(A) and comment 19(e)(1)(iii)-1](https://www.consumerfinance.gov/rules-policy/regulations/1026/19/#e-1-iii); [§1026.2(a)(6)](https://www.consumerfinance.gov/rules-policy/regulations/1026/2/#a-6).

### Timeline exercise: late entry, not late application

Assume every Monday-Friday is a business day for Harbor, with no intervening holidays:

- Monday, September 14, 2026: an originator receives all six items by a recorded telephone application.
- Wednesday, September 16: a processor enters the information into the LOS.
- Friday, September 18: the customer uploads pay stubs and the signed purchase contract.
- The application remains pending, with no denial or withdrawal.

The LE must be delivered or mailed by Thursday, September 17. Wednesday's data entry cannot move that deadline to Monday. Friday's verification cannot start a new initial clock. The firm can request verification for underwriting, but cannot require the consumer to submit verification documents before providing the LE. [§1026.19(e)(2)(iii) and its official interpretation](https://www.consumerfinance.gov/rules-policy/regulations/1026/19/#e-2-iii).

A calendar calculation is only half the control. The record must preserve Monday's receipt event. If the LOS has only its creation timestamp, the organization has a detection blind spot: it can report every loan as timely while measuring from the wrong date.

**Operational recommendation, not a prescribed software feature:** create a six-item intake record across approved channels and an exception report comparing original receipt with LOS entry. The control should identify files where those dates differ and disclose whether the deadline was met.

### Two important limitations

First, an application denied or withdrawn within the initial three-business-day period may qualify for the LE exception described in comment 19(e)(1)(iii)-3. An internal plan to deny is not evidence that a permitted exception actually occurred. A later denial does not erase an earlier missed deadline. Regulation B duties must still be evaluated separately. [Official interpretation 19(e)(1)(iii)-3](https://www.consumerfinance.gov/rules-policy/regulations/1026/19/#Interp-19-e-1-iii).

Second, receiving an application through a mortgage broker does not allow the parties to leave the consumer without disclosures while they decide who owns the task. Either the creditor or broker may provide the LE under §1026.19(e)(1)(ii); the creditor must ensure compliance, and a broker that provides it must satisfy the relevant requirements. [§1026.19(e)(1)(ii)](https://www.consumerfinance.gov/rules-policy/regulations/1026/19/#e-1-ii).

This allocation is not identical to the Regulation B definition of creditor. A broker's actual participation in the credit decision matters under §1002.2(l). A referral-only person has specified nondiscrimination duties; do not assert that every broker has every creditor obligation in every file. [§1002.2(l) and comments 2(l)-1 and -2](https://www.consumerfinance.gov/rules-policy/regulations/1002/2/#l).

## 3. Incomplete does not mean unmanaged

For information the applicant can provide, §1002.9(c) offers a structured path: within 30 days after receipt of the incomplete application, give an action notice or a written notice of incompleteness. The latter identifies what is needed, gives a reasonable response period, and explains that no further consideration follows failure to respond. An oral request does not dispense with the written notice if the application remains incomplete. [§1002.9(c)(1)-(3)](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/#c).

Scope exception: the requirement to provide a notice of incompleteness does not apply to preapprovals constituting applications under §1002.2(f). The incomplete-application examples in this section are not those preapprovals. Do not turn this exception into an exemption from all action-notice obligations. [Official interpretation 9(c)(1)-1](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/#Interp-9-c-1).

A proper notice is not merely a generic “documents outstanding” email. Equally, the regulation does not prescribe one universal number of days the applicant must receive to respond: the period must be reasonable in the circumstances.

### Worked case: three ways a file can go wrong

Harbor receives Luis's application on September 2. It lacks a required applicant-provided explanation of a deposit. The originator telephones him on September 5. The firm has insufficient information for a credit decision.

- **Bad path A:** Leave the file pending indefinitely because a call was made.
- **Bad path B:** Mark it withdrawn on September 20 because Luis has not called back.
- **Available path:** Provide the notice required by §1002.9(c), or take and notify an appropriate action under the rule. If using a notice of incompleteness, identify the missing information, reasonable deadline, and consequence.

Change one fact: the decision-maker already has enough information to decline because of documented excessive obligations relative to income. The missing deposit explanation is not the principal reason for that decision. The notice must reflect the actual credit reason, not hide it behind “incomplete application.” [Comments 9(a)(1)-3 and -4](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/#Interp-9-a-1).

Change another fact: Luis expressly asks the creditor to withdraw the application before a decision. Reg B's action-notice requirement does not apply to that expressly withdrawn application, but retention still does. Preserve the withdrawal evidence; do not manufacture it from silence. The separate, narrow approved-application provision in §1002.9(e) is not a general permission to classify unanswered files as withdrawn. [Comment 9-2 and §1002.9(e)](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/).

### Clock reference for ordinary consumer applications

| Event | Notice timing |
| --- | --- |
| Completed application | Within 30 days: approval, counteroffer, or adverse action |
| Adverse action on an incomplete application | Within 30 days of that action, subject to the rule's incompleteness alternative; this does not extend the separate §1002.9(c)(1) deadline for applicant-provided omissions |
| Incomplete regarding applicant-provided matters | Within 30 days after receipt: act/notify or provide compliant incompleteness notice |
| Counteroffer not expressly accepted or used | Adverse-action notice within 90 days after the counteroffer notification; a compliant combined notice can avoid a second notice |

Source: [§1002.9(a)(1), (c), and comment 9(a)(1)-6](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/). The counteroffer provision does not require holding an offer open for 90 days.

## 4. A reason is a fact about the decision, not an internal slogan

A written adverse-action notice must include the required action, creditor, ECOA, enforcement-agency, and reason/right-to-reasons components. If using the right-to-reasons alternative, the consumer has 60 days to request reasons; the creditor must provide them within 30 days of the request. Use a compliance-approved notice and the correct federal enforcement-agency information rather than copying another company's form. [§1002.9(a)(2), (b)(1), and Appendix A](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/#a-2).

When reasons are supplied, they must identify the actual principal factors. “Does not meet our guidelines” does not explain the credit decision. Neither does a list of plausible factors that were not the reasons used. A credit report disclosure or a list of credit-score factors is not automatically a substitute for ECOA's actual decision reasons. [§1002.9(b)(2), comments 9(b)(2)-2 and -9](https://www.consumerfinance.gov/rules-policy/regulations/1002/9/#b-2).

### File-repair exercise

Decision record:

- Verified monthly income: $7,500.
- Obligations included in the decision: $4,200 per month.
- The particular program used in this fictional case has a documented 45% maximum ratio.
- No exception was granted.
- The underwriter's actual principal reason was excessive obligations relative to income.

The calculated ratio is 56%. A draft notice says “Investor requirements,” and the originator wants to change it to “Insufficient credit score.”

Neither proposed phrase accurately explains this record. A reason such as “Excessive obligations in relation to income” aligns with the stated decision. Do not add a credit-score reason absent evidence it was a principal factor. The 45% limit is a case assumption, not a universal legal or product limit.

**Further question:** If the lender's calculation accidentally counted the same debt twice, should the employee simply improve the notice wording?

No. A better description does not repair an incorrect underlying decision. Escalate for an authorized re-evaluation and an accurate notice/record. Keep both the original event and correction; never overwrite the audit history to imply the error did not occur. That workflow is a recommended control, not a claim that this lesson determines a particular applicant's eligibility.

## 5. Preserve the story an examiner must reconstruct

For these consumer applications, Regulation B generally requires keeping the application, evaluation information, relevant notices and reason statements, and written complaints alleging violations for 25 months after notice of action or incompleteness. Certain applications without required notification use receipt of the application as the retention anchor. Investigation, enforcement, or litigation can extend retention. [§1002.12(b)(1), (3), and (4)](https://www.consumerfinance.gov/rules-policy/regulations/1002/12/#b).

The law permits accurate electronic retrieval; it does not mandate paper or one particular LOS. But a system that cannot reproduce the pertinent historical information is not made compliant by having a document-storage feature. TRID has separate retention periods, including special requirements for LE/CD evidence; do not use the ECOA 25-month period as the universal destruction schedule. [Comment 12(b)-1](https://www.consumerfinance.gov/rules-policy/regulations/1002/12/#Interp-12-b); [§1026.25(c)(1)](https://www.consumerfinance.gov/rules-policy/regulations/1026/25/#c-1).

### Evidence packet exercise

A supervisor finds a credit-bureau invoice showing 24 inquiries, but only 19 corresponding CRM records. There is not yet enough evidence to conclude that all five unmatched inquiries violated the notice rule.

Propose a defensible investigation:

1. Reconcile identity and timestamps without exporting unnecessary personal data.
2. Retrieve approved-channel communications and actual credit decision records.
3. Classify each contact under the relevant legal test, recording why.
4. Check applicable notice type, triggering event, deadline, and delivery evidence.
5. Preserve findings and escalate missing notices/records for correction and root-cause review.
6. Test the corrected workflow against a later independent sample.

The objective is not to make counts match by inventing records. Some inquiries may have been legitimate nonapplications; others may be missing applications, duplicate reports, or system-linking failures. A documented classification explains the difference.

### Consequences and prevention

Notification and retention violations can lead to enforcement, required remediation, or civil liability; the precise consequence depends on the governing law and facts. Regulation B addresses enforcement and liability, including actual damages and possible punitive damages, and distinguishes inadvertent errors from blanket immunity. This lesson does not quote inflation-adjusted penalty figures or promise that self-correction eliminates liability. [§1002.16](https://www.consumerfinance.gov/rules-policy/regulations/1002/16/).

A credible corrective-action plan names an owner, an affected-file review, a fix, evidence of consumer remediation where warranted, and an independent re-test. “Everyone received training” is an action, not proof the control now works.

## 6. Formative knowledge checks

These original practice questions are not the approved end-of-course exam. Answers must be hidden until the learner responds in an eventual LMS. A correct model-generated answer is not learner-validation evidence. No real applicant should be evaluated using these fictional exercises.

### KC01 - Conduct versus label

An employee only explains general lending policies and says the creditor must evaluate an application before making a decision. No other facts establish a credit application. Which conclusion is supported?

A. Every conversation mentioning income is a completed application.\
B. This can remain an inquiry; classify it by the actual facts and procedures.\
C. A property address would automatically make this a completed Reg B application.\
D. The CRM label determines the legal result.

### KC02 - Personal rejection without property

After reviewing a consumer's credit, the creditor decides and communicates that it will not approve the requested loan due to delinquent mortgage payments. No property address has been supplied. Which is best?

A. No Reg B issue arises until TRID's six items exist.\
B. A soft pull exempts the file from action notices.\
C. Evaluate the Reg B adverse-action notice obligation independently of the incomplete TRID trigger.\
D. Wait for a property address before deciding whether the personalized decline requires a notice.

### KC03 - The late LOS entry

Use the September 14/16/18 timeline above. With no denial or withdrawal, what is the initial LE delivery/mailing deadline?

A. September 17.\
B. September 18.\
C. September 21.\
D. September 23, measured from the arrival of verification documents.

### KC04 - Verification condition

All six items have arrived. The originator says the LE will be provided only after bank statements arrive. Which action is appropriate?

A. Wait: the bank statements are part of the company's completed-underwriting-file checklist.\
B. Send a document-request email now and treat it as an extension of the LE deadline.\
C. Measure the deadline from the processor's acceptance of the file as ready for disclosures.\
D. Escalate and arrange timely LE delivery; do not make verification documents a precondition.

### KC05 - Incomplete but already denied

A missing document remains outstanding, but the creditor has enough information and actually denies for excessive obligations relative to income. Which reason belongs in the notice?

A. Incomplete application, because any missing document overrides the actual decision.\
B. The actual principal credit reason supported by the file.\
C. The outstanding-document reason plus every potential credit reason not yet investigated.\
D. The creditor's program name alone, because it identifies the underwriting standard used.

### KC06 - Oral follow-up

An applicant has not answered a telephone request for missing applicant-provided information; the incomplete application remains unresolved. What should operations do?

A. Restart the 30-day clock from every phone call.\
B. Treat nonresponse as an express withdrawal.\
C. Satisfy the applicable §1002.9(c) notice requirement within its original deadline.\
D. Let the internal 60-day inactive-lead policy determine when a written notice is needed.

### KC07 - Generic reason

The actual decision was based on excessive obligations in relation to income. Which repair is defensible?

A. Use that actual principal reason in an otherwise compliant notice and verify the underlying record.\
B. Replace it with “investor guidelines” so the notice does not disclose the program's ratio limit.\
C. Use the credit-score factor list because a score was present in the file.\
D. Use “insufficient documentation” because one unrelated supporting document was still missing.

### KC08 - Proper incompleteness notice expires

A compliant written notice specifies missing applicant information, a reasonable response period, and the consequence of nonresponse. The applicant supplies nothing by that deadline. Which is correct under the assumed facts?

A. A second adverse-action notice is always required, regardless of the compliant incompleteness notice.\
B. The original application must now be treated as completed for decision purposes.\
C. The creditor should record an express withdrawal even though the applicant did not request one.\
D. There is no further obligation under §1002.9 on those facts, but retention duties remain.

### KC09 - Retention

A consumer application receives an adverse-action notice. Which default Reg B retention anchor applies, absent a special rule or extended hold?

A. Twenty-five months from the initial marketing lead.\
B. Twenty-five months from the action-notice date for the required application records.\
C. Twelve months from the hard credit pull.\
D. Twenty-five months from the last marketing follow-up, even if the required action notice was earlier.

### KC10 - Counteroffer

The creditor sends a counteroffer without a compliant combined adverse-action notice. The applicant never expressly accepts or uses it. Which statement is correct?

A. The creditor must keep the offered terms open for at least 90 days.\
B. Every counteroffer eliminates a later adverse-action notice, even when no combined notice was given.\
C. The applicable adverse-action notification deadline is 90 days after counteroffer notification.\
D. The creditor may start the notice clock when its internal counteroffer queue next closes the file.

### KC11 - Same consumer, different duties

The creditor declines within the initial three-business-day LE period and the facts satisfy comment 19(e)(1)(iii)-3. Which statement is best?

A. The LE exception does not itself eliminate Regulation B notice and record duties.\
B. The missing LE means the customer never became an applicant for any federal notice rule.\
C. The creditor can discard the intake record after recording that the LE exception was used.\
D. The creditor should classify the denied application as withdrawn because no LE was sent.

### KC12 - A meaningful control

Which monthly test is most likely to detect the lesson's core failure?

A. Confirm that the training slideshow was opened.\
B. Confirm that every LOS loan has a generated file number.\
C. Ask each originator whether their files are compliant.\
D. Reconcile approved intake/credit-pull channels to outcomes and compare actual trigger timestamps with notice/disclosure evidence.

## 7. Answer key, rationale, and remediation

| ID | Answer | Explanation and controlling reference | Remediate in |
| --- | --- | --- | --- |
| KC01 | B | General discussion can remain an inquiry; actual practices and response govern. §1002.2(f), comments 2(f)-2 through -4. | Section 1 |
| KC02 | C | A personalized credit decline can trigger Reg B before the six-item TRID application exists. Comments 2(f)-3 and 9-5. | Section 1 |
| KC03 | A | Receipt was Monday; Tuesday, Wednesday, Thursday are the three business days under the assumptions. LOS creation is not receipt. §1026.19(e)(1)(iii)(A). | Section 2 |
| KC04 | D | Verification cannot be required before the LE. Requesting documents does not authorize delaying the disclosure. §1026.19(e)(2)(iii). | Section 2 |
| KC05 | B | An actual substantive denial must not be disguised as incompleteness. Comment 9(a)(1)-4. | Section 3 |
| KC06 | C | An unsuccessful oral request does not replace the written notice path or reset the trigger. §1002.9(c)(3). | Section 3 |
| KC07 | A | Reasons must match factors actually considered; improve the notice without inventing a reason. §1002.9(b)(2), comment 9(b)(2)-2. | Section 4 |
| KC08 | D | The compliant notice/nonresponse path ends the section's further-notice duty on these facts, not record retention. §§1002.9(c)(2), 1002.12(b). | Sections 3, 5 |
| KC09 | B | Consumer application records ordinarily run 25 months from action/incompleteness notification, with other anchors and holds where applicable. §1002.12(b)(1), (3), (4). | Section 5 |
| KC10 | C | Ninety days governs notification, not how long the offer must remain open; a compliant combined notice is an alternative. §1002.9(a)(1)(iv), comments 9(a)(1)-5 and -6. | Section 3 |
| KC11 | A | Separate statutes and definitions create separate obligations. Comment 19(e)(1)(iii)-3 and §1002.9. | Section 2 |
| KC12 | D | This is an original recommended detection test: independent sources and original timestamps can reveal missing files and wrong-clock reporting. It is not a regulator-prescribed software design. | Section 5 |

## 8. Transfer exercise: write the handoff, not just the rule

A colleague leaves you a file note: “Customer didn't qualify, never finished application, closed lead.” The only linked document is a credit report. Prepare a four-part internal request:

1. What facts and records are missing?
2. Which separate classifications and clocks must be tested?
3. Who should review the consumer communication and any overdue notice?
4. How will you preserve the original evidence and record any correction?

**Scoring guide for a human reviewer:** a satisfactory response asks for the request and actual response, determination basis, relevant receipt dates, notice/delivery history, missing-item follow-up, and any express withdrawal. It separately evaluates Reg B and TRID, escalates decisions outside the learner's authority, and preserves rather than rewrites history. A response that declares compliance solely because the LOS says “lead” is inadequate.

No automatic pass threshold is specified for this open response. The final approved assessment and scoring policy are separate course-design deliverables.

## Editorial and validation ledger

- NMLS 2026 topic 5 prints §1026.19(a) beside an LE finding. This lesson teaches the applicable TRID provision, §1026.19(e), and records the crosswalk difference rather than silently reproducing it.
- Consumer-credit scope and more-than-150-applications assumption avoid silently ignoring §§1002.9(a)(3) and (d).
- Do not tell learners all credit pulls require adverse-action notices; conduct and actual procedures matter.
- Independent source-and-answer review on September 10, 2026 confirmed the 12 keyed answers and resulted in three precision revisions: preceding-calendar-year scope, the preapproval incompleteness exception, and the non-extension of the applicant-omissions deadline. This is not attorney approval or representative-learner validation.
- Do not treat every silent applicant as withdrawn.
- Do not treat 25 months as the destruction period for all mortgage records.
- Do not infer state-specific notice, licensing, or retention compliance from this federal lesson.
- Before submission: human legal/SME review; independent item-quality review; verify links/current rules; learner timing and feedback; accessibility and LMS evidence; final assessment distinct from formative questions; provider and course approval.
