/**
 * California Real Estate Practice (45 hours) — lesson question bank.
 *
 * One entry per lesson assignment. Each entry carries:
 *   applied      one scenario decision on a transaction file, scored whole
 *   engagement   five scored items, graded against the 80% lesson mastery threshold
 *   remediation  five alternate items covering the same five concepts a second way,
 *                so a student who fails the check is retested rather than re-shown
 *                the question they already saw
 *
 * Items test reasoning, roles, sequence, and professional boundaries. They deliberately
 * do not turn on a specific fee, filing deadline, or code section number: those must be
 * verified against current DRE and California statutory sources before submission, and
 * an item that hard-codes an unverified figure would teach a rule the course cannot yet
 * support. Where a figure is intrinsic to the concept it is used descriptively in the
 * scenario, never as the fact being tested.
 *
 * Course version 1.0 — not approved; no California credit is available.
 */

const assignments = {
  "assignment-01": {
    subject: "California practice standards and the regulated professional",
    applied: {
      prompt: "A salesperson has been working with a buyer for three weeks. The buyer asks her to review the neighbor's boundary-line dispute, explain whether an old fence gives the neighbor a legal claim to part of the yard, and put that opinion in writing so the buyer can decide whether to proceed. What is the correct professional response?",
      choices: [
        "Explain that a boundary claim of that kind is a legal question outside a licensee's scope, refer the buyer to a real estate attorney and a licensed surveyor, and document the referral and the unresolved issue in the file.",
        "Provide the written opinion, since the licensee has seen similar fence situations before and the buyer needs an answer before the inspection period closes.",
        "Decline to discuss the issue at all and say nothing further, because any mention of the fence could create liability for the brokerage.",
        "Ask the listing agent to state in writing whether the neighbor has a claim, and give that statement to the buyer as the answer."
      ],
      correctChoice: 0,
      rationale: "Determining whether long-standing use ripens into a legal claim is the practice of law and requires a survey of the actual boundary. The licensee's duty is to recognize the limit of the license, refer to the right professionals, and preserve a record that the issue was identified and remains open. Saying nothing is also wrong: the licensee has a duty to disclose the material fact and direct the buyer to competent help."
    },
    engagement: [
      {
        prompt: "A salesperson licensee wants to open her own storefront office, advertise under her own trade name, and hold buyer deposits in an account she controls. Which statement correctly describes her authority?",
        choices: [
          "A salesperson may perform licensed activity only for and under the supervision of her employing broker, so she may not operate independently or control trust funds in her own right.",
          "A salesperson may operate independently after accumulating enough transaction experience, provided she notifies her former broker in writing.",
          "A salesperson may control trust funds in her own account as long as she reconciles it and reports the balance to her broker each month.",
          "A salesperson may open the office and advertise independently, and only needs her broker's involvement when a dispute arises."
        ],
        correctChoice: 0,
        rationale: "The salesperson license is derivative: it authorizes licensed activity only on behalf of the employing broker, who remains responsible for supervision, advertising identification, and trust funds. Experience, notice, or careful bookkeeping does not convert a salesperson into an independent operator."
      },
      {
        prompt: "A broker manages a large office and delegates day-to-day file review to an experienced office manager. A transaction later shows a missed disclosure. What is the correct analysis of the broker's position?",
        choices: [
          "The broker may delegate the task but not the responsibility; supervision remains the broker's obligation and the delegation must itself be documented and monitored.",
          "The broker is relieved of responsibility because the task was properly delegated to a competent person.",
          "Responsibility shifts to the office manager only if the manager holds a broker license.",
          "The broker is responsible only if the broker personally reviewed the file and missed the item."
        ],
        correctChoice: 0,
        rationale: "Supervision is a non-delegable duty of the responsible broker. Assigning review work is normal and appropriate, but the broker must maintain policies, training, and monitoring, and remains accountable for the office's compliance regardless of who performed the task."
      },
      {
        prompt: "A licensee is asked to handle a commercial ground-lease assignment, a transaction type she has never worked on. Which response best reflects professional competence?",
        choices: [
          "Accept the engagement only if she obtains supervision or co-representation from someone experienced in that transaction type, and tell the client plainly what she is and is not able to do.",
          "Accept the engagement, since a real estate license covers all real property transactions and competence develops through practice.",
          "Accept the engagement and rely on the other side's broker to identify anything she misses.",
          "Decline all unfamiliar transaction types permanently, because working outside a familiar property type is prohibited."
        ],
        correctChoice: 0,
        rationale: "Competence is a professional obligation, not a licensing category. A licensee may take unfamiliar work, but only with honest disclosure to the client and real supervision or partnering. Relying on the opposing broker is not a competence plan, and a blanket refusal misstates the rule."
      },
      {
        prompt: "An office written policy says all advertising must be approved by the broker before publication. A salesperson posts a property video to social media without approval. The post is accurate and identifies the brokerage. What is the correct characterization?",
        choices: [
          "The post still violates office policy, and the policy exists because the broker is accountable for advertising compliance across the office even when a particular post happens to be accurate.",
          "There is no issue, because the controlling question is only whether the advertisement was accurate and identified the brokerage.",
          "The post is acceptable because social media is personal expression rather than advertising.",
          "The post is a violation only if a consumer is actually misled by it."
        ],
        correctChoice: 0,
        rationale: "The accuracy of one post does not answer the supervision question. The broker cannot demonstrate control over the office's advertising if approval is optional, and a policy that is enforced only after harm occurs is not a supervision system. Social media used to promote listings is advertising."
      },
      {
        prompt: "A consumer calls about a listing and asks a direct question the licensee cannot answer without checking. Which response is consistent with consumer-first communication?",
        choices: [
          "Say plainly that he does not know, state when he will confirm it and from what source, and follow up in writing with the answer or with a note that it remains unverified.",
          "Give his best estimate so the consumer is not left without an answer, and correct it later if the estimate turns out to be wrong.",
          "Redirect the consumer to a different property where he knows the answer with confidence.",
          "Answer with what the seller told him, without noting that the information is unverified."
        ],
        correctChoice: 0,
        rationale: "Consumer-first communication means the consumer can tell the difference between a verified fact, an unverified report, and an open question. An estimate offered as an answer, a redirect, or an unattributed repetition of the seller's statement all blur that line."
      }
    ],
    remediation: [
      {
        prompt: "Two salespersons at different brokerages want to form a partnership to represent clients jointly and split fees directly between themselves. What is the governing principle?",
        choices: [
          "Licensed activity and compensation flow through the employing brokers, so any joint arrangement and any fee split must be handled broker to broker rather than salesperson to salesperson.",
          "The arrangement is permitted if both salespersons disclose it to their clients in writing.",
          "The arrangement is permitted because commission splitting is a private contractual matter between licensees.",
          "The arrangement is permitted if the two brokerages are not competing for the same listings."
        ],
        correctChoice: 0,
        rationale: "This is the same principle as the salesperson's derivative authority, seen from the compensation side. A salesperson is paid by and acts for her employing broker; a direct cross-brokerage arrangement between salespersons bypasses both brokers' supervision and accountability."
      },
      {
        prompt: "A responsible broker discovers that one team within the office has been using its own intake checklist that omits a step required by the office manual. What does adequate supervision require?",
        choices: [
          "Correcting the process, reviewing the files already handled under the deviating checklist, and documenting both the correction and the review.",
          "Instructing the team to use the office checklist going forward, since prospective compliance is what supervision addresses.",
          "Treating the deviation as acceptable if the team's transactions have not produced a complaint.",
          "Delegating the entire question to the team leader, who is closest to the files."
        ],
        correctChoice: 0,
        rationale: "Supervision includes remediating what already happened, not just fixing the process going forward. Absence of complaints is not evidence of compliance, and handing the review back to the team that deviated defeats the purpose."
      },
      {
        prompt: "A client asks a licensee to interpret an ambiguous clause in a contract the client signed before hiring her, and to advise whether the client can now cancel. What is the correct boundary?",
        choices: [
          "Interpreting the legal effect of a signed contract and advising on cancellation rights is legal advice; the licensee should identify the issue, refer the client to an attorney, and record the referral.",
          "The licensee may interpret the clause because she is licensed to prepare and explain real estate contracts.",
          "The licensee may advise on cancellation as long as she recommends the client also consult an attorney afterward.",
          "The licensee should tell the client the clause means whatever is customary in the local market."
        ],
        correctChoice: 0,
        rationale: "Explaining standard contract provisions in the course of a transaction is different from opining on the legal effect of an existing agreement and on a client's right to cancel. The second is legal advice, and appending a suggestion to see an attorney afterward does not cure it."
      },
      {
        prompt: "An office manual sets a document-retention rule stricter than what the brokerage believes the law requires. A licensee proposes discarding files at the earlier legal minimum to save storage. What is the sound analysis?",
        choices: [
          "The office policy governs the licensee's conduct, and any change should be made deliberately at the policy level after confirming the current legal requirement, not by individual licensees deciding case by case.",
          "The licensee may follow the legal minimum, since office policy cannot impose obligations beyond the law.",
          "The licensee may discard the files if no transaction in them produced a dispute.",
          "The licensee should keep everything indefinitely, since retention rules only set a floor."
        ],
        correctChoice: 0,
        rationale: "A brokerage may hold itself to a stricter standard than the legal floor, and consistency is what makes a retention policy defensible. Individual licensees departing from the policy is what creates gaps; changing it is a policy decision that starts with confirming the current requirement."
      },
      {
        prompt: "During a transaction a licensee gives a client an answer that later turns out to be wrong. The error has not yet caused harm. What should she do?",
        choices: [
          "Correct it promptly and in writing, note the correction in the file, and tell her broker so the office can assess whether anything else in the file relies on the wrong information.",
          "Wait to see whether the error affects the outcome, and correct it only if it does.",
          "Correct it verbally at the next meeting, since no harm has occurred and a written correction would alarm the client.",
          "Ask the client whether he would like the correction documented."
        ],
        correctChoice: 0,
        rationale: "A correction is only useful if it reaches the client in time to change a decision and if the file shows what was corrected and when. Waiting for harm, keeping the correction verbal, or making documentation optional all leave the client acting on bad information."
      }
    ]
  },
  "assignment-02": {
    subject: "Building a lawful real estate practice",
    applied: {
      prompt: "Three brokers who compete in the same city meet for lunch. One says he is tired of a new discount brokerage undercutting everyone, and proposes that all three stop showing that brokerage's listings and agree to hold their own commission rates at the same level. A licensee at the table says nothing and later tells her broker she was not involved because she did not speak. How should the situation be analyzed?",
      choices: [
        "Both proposals describe agreements among competitors on price and on refusing to deal, which are among the most serious antitrust violations; the licensee should have removed herself from the conversation immediately and reported it, and silence is not a defense.",
        "The conversation is lawful because no agreement was written and no rates actually changed as a result of the lunch.",
        "The commission proposal is a problem, but agreeing among competitors about which brokerages to show is an ordinary business decision.",
        "The licensee's silence is sufficient, since antitrust liability requires an affirmative statement of agreement."
      ],
      correctChoice: 0,
      rationale: "Price fixing and group boycotts are agreements among competitors, and they can be inferred from conduct rather than requiring a signed document. Commission rates must be set independently by each brokerage and are negotiable with the client. Remaining at the table can itself be treated as participation, which is why the correct response is to leave and report."
    },
    engagement: [
      {
        prompt: "A licensee builds a prospecting plan around calling homeowners whose listings recently expired. What is the most important compliance consideration before the calls begin?",
        choices: [
          "Confirming that the calling practice respects do-not-call and solicitation restrictions and that the licensee identifies himself and his brokerage on each call.",
          "Confirming that no other licensee in the office is calling the same homeowners, to avoid duplicated effort.",
          "Confirming that the expired listings were priced above market, since those owners are the best prospects.",
          "Confirming that the calls are made outside normal business hours so the homeowner is more likely to answer."
        ],
        correctChoice: 0,
        rationale: "Prospecting is lawful, but solicitation is regulated: the licensee must respect do-not-call obligations and must identify who he is and whom he works for. Internal coordination, pricing theories, and call timing are business questions, not the compliance question."
      },
      {
        prompt: "A salesperson runs an advertisement using only her personal brand name and mobile number, with no mention of the brokerage. The advertisement is otherwise accurate. What is the defect?",
        choices: [
          "Advertising by a licensee must identify the brokerage under which she is licensed, so that the public can tell she is acting as an agent rather than as an independent principal.",
          "There is no defect, because the advertisement is accurate and includes a working contact number.",
          "The defect is only that the mobile number was used instead of the office number.",
          "The defect arises only if a consumer contacts her and is confused about who employs her."
        ],
        correctChoice: 0,
        rationale: "Identification exists so a consumer knows there is a supervising brokerage standing behind the advertisement. Accuracy about the property does not cure the omission, and the violation is complete when the advertisement runs, not when confusion is proven."
      },
      {
        prompt: "A brokerage stores client files containing Social Security numbers, bank statements, and identification documents. Which practice best reflects an appropriate information-security posture?",
        choices: [
          "Limiting access to the people who need it, protecting stored and transmitted files, and disposing of documents so the data cannot be reconstructed.",
          "Keeping every document indefinitely in the original form received, since destroying client records could destroy evidence.",
          "Emailing documents in their original form but asking recipients to delete them after use.",
          "Allowing all office licensees full access to all files, since any of them may need to cover a transaction."
        ],
        correctChoice: 0,
        rationale: "The three controls that matter are access, protection in transit and at rest, and secure disposal. Blanket office-wide access, unprotected email, and indefinite retention of everything each increase exposure without improving the brokerage's ability to defend a transaction."
      },
      {
        prompt: "A new licensee asks who is responsible for retaining the transaction documents she generates. What is the correct answer?",
        choices: [
          "The broker is responsible for the brokerage's transaction records, so the licensee's obligation is to route complete documentation into the brokerage's system rather than keep a personal file as the record.",
          "Each licensee retains her own transactions, since she is the one who knows the file.",
          "Retention is the escrow holder's responsibility once the transaction closes.",
          "Retention is required only for transactions that actually closed."
        ],
        correctChoice: 0,
        rationale: "Records belong to the brokerage and the broker answers for them, including for files created by licensees who later leave. Personal copies are not the record, escrow's file is not the brokerage's file, and failed or cancelled transactions are exactly the ones a later dispute tends to concern."
      },
      {
        prompt: "A licensee's business plan sets a target of a fixed number of listings per quarter. What makes the plan a professional plan rather than only a sales goal?",
        choices: [
          "It ties the target to the activities and compliance steps needed to reach it, so growth does not depend on skipping disclosure, verification, or supervision steps under time pressure.",
          "It sets a number high enough to be motivating, since ambitious targets drive performance.",
          "It compares the target to what other licensees in the office achieved last year.",
          "It focuses on listings rather than buyer representation, since listings are more predictable."
        ],
        correctChoice: 0,
        rationale: "A volume number by itself creates pressure without capacity. What makes a plan defensible is that it accounts for the work each transaction actually requires, so the licensee does not meet the target by cutting the steps that protect consumers."
      }
    ],
    remediation: [
      {
        prompt: "At a regional industry meeting, a broker asks another broker what she plans to charge sellers next year so that they can 'stay aligned.' What is the correct response?",
        choices: [
          "Decline to discuss it, state that her firm sets its rates independently, and end the conversation, because rate discussions among competitors risk being treated as an agreement.",
          "Share the planned rates, since publicly advertised commission rates are not confidential information.",
          "Share the rates only if both agree not to act on the information.",
          "Share the range rather than the specific figures, since a range is not a fixed price."
        ],
        correctChoice: 0,
        rationale: "This is the same rule as the lunch-table scenario, approached through information exchange rather than open agreement. Rates must be set independently, and sharing future pricing intentions with a competitor is the classic evidence of coordination — whether framed as a range, a plan, or a courtesy."
      },
      {
        prompt: "A licensee wants to send marketing text messages to numbers collected from open-house sign-in sheets. What is the sound approach?",
        choices: [
          "Confirm what the visitors were told and consented to when they signed in, and send only what that consent and the applicable solicitation rules support.",
          "Send the messages, since providing a phone number at an open house is itself consent to any future marketing.",
          "Send the messages but include instructions to reply STOP, which satisfies any consent requirement.",
          "Send the messages only to visitors who did not buy a home, since active clients would find them intrusive."
        ],
        correctChoice: 0,
        rationale: "Consent is defined by what the consumer was actually told at collection, not by the fact that a number was written down. An opt-out mechanism is necessary but does not manufacture the consent that was needed to send the first message."
      },
      {
        prompt: "A team within a brokerage advertises under a team name that appears more prominently than the brokerage name and suggests the team is a separate company. What is the concern?",
        choices: [
          "The advertising may mislead consumers about who the responsible brokerage is, which is precisely what licensee identification requirements exist to prevent.",
          "There is no concern, because the team is part of the brokerage and the relationship is a matter of internal structure.",
          "The concern is only about the visual design, which is a marketing preference rather than a compliance issue.",
          "The concern arises only if the team advertises properties outside its usual market area."
        ],
        correctChoice: 0,
        rationale: "The test is the impression the advertisement creates for a consumer, not the internal org chart. A team identity presented as a separate firm obscures which licensed brokerage is accountable, which is the same defect as omitting the brokerage entirely."
      },
      {
        prompt: "A licensee leaves a brokerage and wants to take copies of her transaction files to her new firm. What is the correct analysis?",
        choices: [
          "The transaction records belong to the former brokerage, so what she may take is governed by that brokerage's policy and by client direction, not by her own preference.",
          "She may take copies of any file she personally worked on, since she created the documents.",
          "She may take the files if she removes the clients' personal information first.",
          "She may take the files if her new broker agrees to store them securely."
        ],
        correctChoice: 0,
        rationale: "This is the retention question seen from the departure side. Because the broker is accountable for the records, the departing licensee cannot unilaterally decide what leaves. Redaction and a secure destination address different risks and do not change who owns the record."
      },
      {
        prompt: "A brokerage discovers that a laptop containing client documents was lost. What is the first thing that determines how serious the exposure is?",
        choices: [
          "Whether the data on the device was protected and what categories of personal information it actually held.",
          "Whether the laptop was insured and can be replaced quickly.",
          "Whether the licensee who lost it followed the office's check-out procedure.",
          "Whether any client has yet reported a problem."
        ],
        correctChoice: 0,
        rationale: "Exposure is measured by what an unauthorized person could read and how sensitive it is. Insurance addresses the hardware, procedure addresses fault, and waiting for a client complaint measures nothing — none of them tells the brokerage what was actually at risk."
      }
    ]
  },
  "assignment-03": {
    subject: "Agency disclosure and fiduciary performance",
    applied: {
      prompt: "A broker lists a seller's home. A buyer the same broker has been working with wants to make an offer on it. The broker asks both parties to sign a dual agency consent, and both do. During negotiation the seller privately tells the broker the lowest number he would accept. The buyer then asks the broker directly what the seller will take. What may the broker do?",
      choices: [
        "The broker may not reveal the seller's lowest acceptable price to the buyer without the seller's permission, because consent to dual agency does not authorize disclosure of either party's confidential negotiating position.",
        "The broker must reveal it, because a dual agent owes both parties equal treatment and withholding it would favor the seller.",
        "The broker may reveal it because the seller volunteered the information rather than marking it confidential.",
        "The broker may reveal it if he also tells the seller the highest price the buyer would pay, keeping the disclosure balanced."
      ],
      correctChoice: 0,
      rationale: "Dual agency consent permits the broker to represent both sides; it does not convert confidential price information into shared information. Neither party's negotiating limit may be disclosed to the other without that party's permission, and disclosing both does not cure the breach — it commits it twice."
    },
    engagement: [
      {
        prompt: "When must a seller's agent deliver the agency relationship disclosure in a California residential transaction?",
        choices: [
          "Before the listing agreement is signed, so the seller understands the relationship before committing to it.",
          "At the same time the first offer is presented, so the seller can consider the relationship and the offer together.",
          "Any time before the close of escrow, since the disclosure is confirmed in the closing documents.",
          "Only if the seller asks about the nature of the relationship."
        ],
        correctChoice: 0,
        rationale: "The disclosure is designed to inform the decision to engage the agent, which means it must come before the seller is bound. Presenting it with an offer or at closing gives the seller the information after the choice has already been made."
      },
      {
        prompt: "A buyer's agent is preparing an offer. When should the agency disclosure be provided to the seller's side?",
        choices: [
          "Before or at the time the offer is presented, so the seller knows whom the offering agent represents when evaluating the offer.",
          "After the seller accepts, since the relationship only matters once a contract exists.",
          "Only if the buyer's agent expects to be paid from the listing side.",
          "Only if the buyer's agent has not previously worked with that listing office."
        ],
        correctChoice: 0,
        rationale: "The seller is evaluating an offer and needs to know whose interests the presenting agent serves. Delaying until acceptance, or conditioning the disclosure on compensation or familiarity, defeats the purpose."
      },
      {
        prompt: "Which of the following best describes the fiduciary duty of loyalty in practice?",
        choices: [
          "The agent puts the principal's interests ahead of the agent's own, and discloses any personal interest that could conflict rather than resolving it silently.",
          "The agent treats both parties in the transaction equally and does not advocate for either.",
          "The agent follows every instruction the principal gives, including instructions the agent believes are unlawful.",
          "The agent obtains the highest price possible regardless of the principal's stated priorities."
        ],
        correctChoice: 0,
        rationale: "Loyalty is about whose interest comes first and about surfacing conflicts. Equal treatment describes duties owed to a non-client, blind obedience ignores the limit that instructions must be lawful, and price is only one of the priorities a principal may set."
      },
      {
        prompt: "A listing agent learns that the seller's roof has a persistent leak the seller wants kept quiet. The seller instructs the agent to say nothing. What controls?",
        choices: [
          "The duty of honesty and disclosure to the buyer overrides the client's instruction to conceal a material fact, and the agent should tell the seller so and involve the broker.",
          "The duty of confidentiality to the client controls, so the agent must follow the instruction.",
          "The agent may stay silent as long as she does not make an affirmative statement that the roof is sound.",
          "The agent may follow the instruction if the buyer is represented by his own agent who could discover the leak."
        ],
        correctChoice: 0,
        rationale: "Confidentiality protects the client's negotiating position, not concealment of material physical facts. Careful silence is still concealment, and the presence of a buyer's agent does not transfer the duty."
      },
      {
        prompt: "A licensee is offered a referral fee by a home-warranty company for each client he sends. What is the correct handling?",
        choices: [
          "Disclose the compensation arrangement to the client so the client can weigh the recommendation knowing the licensee has a financial interest in it.",
          "Accept the fee without disclosure, since the client is free to choose a different provider.",
          "Accept the fee and decline to recommend the company, which removes the conflict.",
          "Accept the fee and disclose it only if the client asks whether the licensee is paid for referrals."
        ],
        correctChoice: 0,
        rationale: "A conflict is managed by disclosure, not by the client's theoretical freedom to choose or by waiting to be asked. The client cannot evaluate a recommendation without knowing what the recommender receives."
      }
    ],
    remediation: [
      {
        prompt: "A broker representing both buyer and seller with written consent is asked by the seller whether the buyer would go higher. What is the correct response?",
        choices: [
          "Decline to disclose the buyer's position without the buyer's permission, and remind both parties of the limits that were explained when they consented to dual agency.",
          "Answer honestly, since the seller is also his client and is entitled to what the broker knows.",
          "Answer in general terms without specific figures, which avoids disclosing confidential information.",
          "Answer only if the buyer has already made his final offer."
        ],
        correctChoice: 0,
        rationale: "The confidentiality limit runs in both directions — this is the mirror image of the buyer asking about the seller's floor. Being someone's client does not entitle them to the other client's confidential position, and a vague answer that conveys the same information is still a disclosure."
      },
      {
        prompt: "A licensee has been showing homes to a buyer for a month without any written representation agreement or agency disclosure. What is the problem?",
        choices: [
          "The buyer may not understand whom the licensee represents, and the disclosure that would resolve that has not been made at the point it was needed.",
          "There is no problem until the buyer decides to make an offer on a specific property.",
          "There is no problem because agency can be created by conduct, so the relationship exists regardless.",
          "The problem is only that the licensee cannot be paid without a written agreement."
        ],
        correctChoice: 0,
        rationale: "The fact that agency can arise from conduct is exactly why disclosure matters early: the relationship may already exist while the consumer is unaware of it. Deferring to the offer stage and framing the issue as a compensation problem both miss the consumer-protection purpose."
      },
      {
        prompt: "A seller's agent receives an offer and, before presenting it, tells the buyer's agent what a competing offer contains so the buyer can improve his terms. The seller did not authorize this. What duty was breached?",
        choices: [
          "Confidentiality and loyalty to the seller, because the agent used the seller's confidential information in a way the seller did not authorize.",
          "No duty, because sharing offer terms increases competition and benefits the seller.",
          "Only the duty of care, because the agent acted carelessly rather than deliberately.",
          "No duty, provided the agent shared the same information with every competing buyer."
        ],
        correctChoice: 0,
        rationale: "Whether to disclose competing offer terms is the seller's decision, not the agent's, however the disclosure might affect price. Sharing it evenly is a fairness argument that does not answer the authorization question."
      },
      {
        prompt: "An agent's principal instructs her to refuse showings to a category of buyers. What must the agent do?",
        choices: [
          "Refuse the instruction, explain that it would be unlawful discrimination, and escalate to her broker.",
          "Follow the instruction, because the duty of obedience requires carrying out the principal's directions.",
          "Follow the instruction but document that it came from the principal, which transfers responsibility.",
          "Withdraw quietly from the listing without explaining why, to avoid embarrassing the client."
        ],
        correctChoice: 0,
        rationale: "Obedience extends only to lawful instructions, and documenting an unlawful instruction does not transfer responsibility for carrying it out. Silent withdrawal leaves the client free to repeat the instruction with someone else."
      },
      {
        prompt: "A licensee will receive a bonus from the seller if a particular property sells above a set price. His buyer client is considering that property. What is required?",
        choices: [
          "Disclose the bonus arrangement to the buyer before the buyer relies on the licensee's advice about that property.",
          "Nothing, because the bonus is paid by the seller and does not come out of the buyer's funds.",
          "Nothing, provided the licensee does not steer the buyer toward that property.",
          "Disclose the bonus only after the buyer's offer is accepted, so it does not distort negotiations."
        ],
        correctChoice: 0,
        rationale: "The buyer needs the information while he can still act on it. Who pays the bonus does not change that the licensee's advice now carries a financial interest, and a private intention not to steer is not something the client can evaluate."
      }
    ]
  },
  "assignment-04": {
    subject: "Seller counseling and listing agreements",
    applied: {
      prompt: "At a listing appointment the seller says he wants the highest possible price, does not want to complete any disclosure paperwork until an offer arrives, wants showings only on weekends, and wants a listing he can cancel at any time. How should the licensee handle the appointment?",
      choices: [
        "Explain which of the seller's preferences are negotiable business terms and which are legal obligations that cannot be deferred, then write the listing to reflect the negotiable choices and set the disclosure work on its required schedule.",
        "Accept all four terms as written, since listing terms are negotiable and the client sets them.",
        "Decline the listing, because a seller who resists disclosure paperwork presents unacceptable risk.",
        "Accept all four terms and address the disclosure timing later, once trust has been established with the seller."
      ],
      correctChoice: 0,
      rationale: "Price expectations, showing windows, and cancellation rights are genuinely negotiable. Disclosure obligations are not, and deferring them until an offer arrives compresses the buyer's review and creates avoidable risk. The professional move is to separate the two categories openly at the outset rather than defer the conversation."
    },
    engagement: [
      {
        prompt: "What is the primary purpose of a thorough property and client intake before taking a listing?",
        choices: [
          "To establish who has authority to sell, what is actually being sold, and what conditions or encumbrances will affect the transaction.",
          "To determine how quickly the property is likely to sell so the listing period can be set.",
          "To identify whether the seller has interviewed other brokerages.",
          "To estimate the marketing budget the property will require."
        ],
        correctChoice: 0,
        rationale: "Intake exists to establish authority, subject matter, and known constraints. A listing signed by someone without authority to sell, or covering property whose boundaries or encumbrances were never checked, fails regardless of how well it is marketed."
      },
      {
        prompt: "A property is held in a trust. Who must sign the listing agreement?",
        choices: [
          "The trustee acting within the authority the trust document grants, which the licensee should confirm rather than assume.",
          "Any beneficiary of the trust, since the beneficiaries hold the economic interest.",
          "The person who has been living in the property and paying its expenses.",
          "The person named on the most recent property tax bill."
        ],
        correctChoice: 0,
        rationale: "Authority to convey comes from the trust instrument and rests with the trustee. Beneficial interest, occupancy, and the tax roll are all evidence of connection to the property, and none of them establishes authority to sell it."
      },
      {
        prompt: "A seller asks the licensee to list at a price well above the supported range. What is the professional response?",
        choices: [
          "Present the market evidence and the likely consequences of overpricing in writing, and let the seller make an informed decision the file can show was informed.",
          "Refuse to take the listing at any price the licensee did not recommend.",
          "Take the listing at the seller's price without comment, since pricing is the seller's decision.",
          "Take the listing at the seller's price and plan to request a reduction after the first month."
        ],
        correctChoice: 0,
        rationale: "Price is the seller's decision and advice is the licensee's obligation. Silence abandons the advisory duty, refusing overstates the licensee's role, and privately planning a later reduction substitutes strategy for candor now."
      },
      {
        prompt: "Why does a listing agreement specify a definite termination date?",
        choices: [
          "So the seller's obligation has a defined end and neither party is bound indefinitely by an open-ended engagement.",
          "So the licensee can calculate the marketing budget accurately.",
          "So the multiple listing service can categorize the property correctly.",
          "So the seller cannot cancel before the listing expires."
        ],
        correctChoice: 0,
        rationale: "A definite end date protects the seller from being tied to a brokerage indefinitely. Budgeting and listing-service classification are conveniences, and the date does not exist to eliminate the seller's cancellation rights."
      },
      {
        prompt: "What is the purpose of a safety or protection clause in a listing agreement?",
        choices: [
          "It addresses compensation when a buyer the brokerage introduced during the listing purchases shortly after the listing ends, and it typically depends on the buyer having been identified to the seller.",
          "It allows the brokerage to extend the listing automatically if the property has not sold.",
          "It protects the seller from liability for undisclosed defects after closing.",
          "It guarantees the brokerage's commission on any sale during the following year."
        ],
        correctChoice: 0,
        rationale: "The clause exists so a seller cannot wait out the listing to avoid compensation on a buyer the brokerage produced, which is why identification of those buyers matters. It is not an automatic extension, not a disclosure protection, and not an unconditional claim on any later sale."
      }
    ],
    remediation: [
      {
        prompt: "A licensee is listing a property owned by two people who are divorcing and disagree about the sale. What is the correct step?",
        choices: [
          "Confirm that both owners with an interest have authorized the listing and sign it, and involve counsel or the broker where the authority is unclear.",
          "Take the listing from whichever owner contacted the brokerage first, since either co-owner may act for the property.",
          "Take the listing from the owner currently occupying the property.",
          "Take the listing and resolve the disagreement between the owners during escrow."
        ],
        correctChoice: 0,
        rationale: "This is the same authority question as the trust scenario. A listing signed by fewer than the owners who must convey cannot deliver what it promises, and postponing the conflict to escrow guarantees the dispute surfaces at the worst possible moment."
      },
      {
        prompt: "A seller insists that a known drainage problem is 'not worth mentioning' because it only appears in heavy rain. How should the licensee counsel him?",
        choices: [
          "Explain that a condition affecting the property is disclosed based on whether a buyer would consider it important, not on how often it appears, and that disclosure protects the seller as well.",
          "Agree, since a condition that appears only occasionally is not a defect.",
          "Suggest the seller repair it quietly before listing so the question does not arise.",
          "Leave the decision to the seller, since it is his property and his disclosure."
        ],
        correctChoice: 0,
        rationale: "Materiality turns on the effect on a buyer's decision, not on frequency. Repairing without disclosing conceals rather than resolves, and treating the disclosure as purely the seller's decision abandons the advisory duty at the point it matters most."
      },
      {
        prompt: "A seller wants a lockbox so any licensee can show the property while he is at work, but he keeps valuables and firearms in the home. What should the licensee address?",
        choices: [
          "Access control and security arrangements, including securing valuables and firearms and agreeing how showings are logged and supervised.",
          "Only whether the lockbox model is compatible with the local listing service.",
          "Only whether the seller's insurance covers theft during showings.",
          "Nothing, since the seller has chosen the access method and access is the seller's decision."
        ],
        correctChoice: 0,
        rationale: "Convenient access and secure access are different problems, and the licensee's role is to raise the conflict before it produces a loss. Equipment compatibility and insurance address consequences rather than prevention."
      },
      {
        prompt: "Two weeks into a listing the seller says he wants to cancel. What determines what happens next?",
        choices: [
          "The cancellation and compensation terms of the listing agreement itself, which the licensee should review with the seller and escalate to the broker, since the listing belongs to the brokerage.",
          "The licensee's own judgment about whether the seller has a good reason.",
          "Whether the property has had any showings yet.",
          "Whether the licensee has already spent money on marketing."
        ],
        correctChoice: 0,
        rationale: "The agreement governs, and because the listing is the brokerage's contract, the decision to release it belongs to the broker rather than the individual licensee. Showings and marketing spend may inform a negotiation but do not decide the question."
      },
      {
        prompt: "A seller asks why the listing agreement states the compensation as a negotiated figure rather than a standard rate. What is the correct explanation?",
        choices: [
          "Compensation is negotiable between the seller and the brokerage and is not set by any standard rate or industry schedule.",
          "The rate is standard, and the wording is a formality required in written agreements.",
          "The rate is set by the local multiple listing service and cannot be varied.",
          "The rate varies by property type and is fixed once the property type is identified."
        ],
        correctChoice: 0,
        rationale: "This is the antitrust principle expressed in the listing document: rates are set independently by each brokerage and negotiated with the client. Describing a rate as standard, or as set by a listing service or property type, misstates the law."
      }
    ]
  },
  "assignment-05": {
    subject: "Market analysis and pricing strategy",
    applied: {
      prompt: "A seller shows the licensee a competing brokerage's estimate that is far above the licensee's supported range. The competing estimate relies on three active listings that have sat unsold for months, uses no closed sales, and makes no adjustments for the subject property's smaller lot and dated systems. The seller asks the licensee to match the number. What is the correct professional response?",
      choices: [
        "Explain in writing what the two analyses rely on, show why unsold asking prices are evidence of seller expectation rather than of value, present the closed-sale evidence and the adjustments, and let the seller decide with the reasoning documented.",
        "Match the number to win the listing, since the seller sets the price and a higher list price can always be reduced later.",
        "Tell the seller the competing estimate is dishonest and that the other brokerage is inflating values to obtain listings.",
        "Decline to give any opinion of value and refer the seller to a licensed appraiser before discussing price further."
      ],
      correctChoice: 0,
      rationale: "The defensible response is to make both analyses legible rather than to compete on the number or attack the competitor. Active listings show what sellers hope to get; closed sales show what buyers paid. A licensee may give an opinion of value in a comparative market analysis, so refusing entirely overstates the limit on her role."
    },
    engagement: [
      {
        prompt: "Why are closed sales weighted more heavily than active listings in a comparative market analysis?",
        choices: [
          "A closed sale is evidence of a price a buyer actually paid, while an active listing shows only what a seller is asking.",
          "Closed sales are more recent than active listings and therefore better reflect current conditions.",
          "Active listings are unreliable because listing agents frequently misreport property features.",
          "Closed sales require no adjustments, while active listings always do."
        ],
        correctChoice: 0,
        rationale: "The distinction is evidentiary: a closed sale reflects a completed exchange, an asking price reflects hope. Active listings are typically more recent, not less, and closed sales still require adjustment for differences."
      },
      {
        prompt: "What do pending sales contribute to a market analysis that neither active nor closed sales provide?",
        choices: [
          "They indicate where the market is moving now, because a price has been agreed but is not yet reflected in closed data.",
          "They establish the final sale price, since pending transactions rarely change terms before closing.",
          "They demonstrate how long properties take to sell in the current market.",
          "They replace the need for closed sales when the market is changing quickly."
        ],
        correctChoice: 0,
        rationale: "Pendings are the leading indicator: agreement has been reached but the price is not yet public or final. They do not establish the final price, and they supplement closed evidence rather than replacing it."
      },
      {
        prompt: "A comparable sold for more than the subject property is worth because it had a finished basement the subject lacks. How is the adjustment made?",
        choices: [
          "The comparable's price is adjusted downward, because the analysis asks what that comparable would have sold for if it were like the subject.",
          "The subject's estimated value is adjusted upward to account for the difference in features.",
          "The comparable is discarded, because a property with a materially different feature cannot be used.",
          "No adjustment is made, because the market has already priced the difference into the sale."
        ],
        correctChoice: 0,
        rationale: "Adjustments are made to the comparable, not to the subject, and they run in the direction that makes the comparable resemble the subject. Discarding every comparable with a difference would leave nothing to analyze."
      },
      {
        prompt: "What is the essential difference between a comparative market analysis prepared by a licensee and an appraisal?",
        choices: [
          "An appraisal is an independent valuation prepared by a licensed or certified appraiser under professional standards; a comparative market analysis is a licensee's opinion of value prepared to advise a client on pricing.",
          "An appraisal uses closed sales while a comparative market analysis uses active listings.",
          "An appraisal is required for every sale, while a comparative market analysis is optional.",
          "A comparative market analysis may be given to a lender, while an appraisal may not be given to a consumer."
        ],
        correctChoice: 0,
        rationale: "The difference is who prepares it, under what standards, and for what purpose — not which data it uses. A licensee may not hold out a comparative market analysis as an appraisal."
      },
      {
        prompt: "A seller asks what he will actually receive at closing. What should the licensee provide?",
        choices: [
          "An estimated seller net sheet that shows the anticipated costs and payoffs against the sale price, identified as an estimate that will change with the final terms.",
          "The sale price minus the brokerage compensation, since the remaining costs are handled by escrow.",
          "A firm figure, since a seller cannot make a decision on an estimate.",
          "A range, without itemizing costs, since itemizing invites the seller to negotiate each one."
        ],
        correctChoice: 0,
        rationale: "A net sheet answers the seller's real question, which is about proceeds rather than price. It must itemize so the seller can see what drives the number, and it must be labeled an estimate because the final figures are set at closing."
      }
    ],
    remediation: [
      {
        prompt: "A licensee's analysis relies on a sale from a neighborhood two miles away because no recent sales occurred nearby. What must she do?",
        choices: [
          "Explain why the comparable was used, what differences it required adjusting for, and how much confidence the resulting estimate carries.",
          "Use it without comment, since the analysis is her professional opinion.",
          "Avoid it entirely and use older sales from the immediate neighborhood instead, regardless of age.",
          "Use it and adjust only for size, since location differences cannot be quantified."
        ],
        correctChoice: 0,
        rationale: "Thin data is a normal condition, and the professional response is transparency about what was used and how confident the result is. Silent substitution, rigid preference for stale local data, and refusing to adjust for location all hide the weakness rather than disclosing it."
      },
      {
        prompt: "A seller wants to list at a price the evidence does not support and says he will 'test the market' for a month. What should the licensee document?",
        choices: [
          "The supported range, the advice given about overpricing, and the seller's decision, so the file shows the seller chose the price knowing the analysis.",
          "Only the final list price, since that is the operative term of the listing.",
          "The seller's reasons for the higher price, which become the brokerage's justification if the price is questioned.",
          "Nothing beyond the listing agreement, since documenting disagreement with a client is not advisable."
        ],
        correctChoice: 0,
        rationale: "The record needs to show that advice was given and that the decision was the client's informed one. Recording only the price loses the advice, adopting the seller's reasoning as the brokerage's own misrepresents whose opinion it is, and documenting nothing leaves the licensee unable to show she advised at all."
      },
      {
        prompt: "An appraisal for the buyer's lender comes in below the agreed price. What does this tell the parties?",
        choices: [
          "The lender's valuation does not support the price for loan purposes, which affects financing and may prompt renegotiation, but it does not by itself establish that the price was wrong.",
          "The property was overpriced and the seller must reduce the price to the appraised value.",
          "The buyer must cancel, since a loan cannot be made above appraised value.",
          "The appraisal is a second opinion of market value with the same standing as the licensee's analysis."
        ],
        correctChoice: 0,
        rationale: "A low appraisal is a financing event before it is a value verdict: it constrains what the lender will lend against. The parties may renegotiate, the buyer may bring additional funds, or the contract terms may allow other responses."
      },
      {
        prompt: "A seller asks the licensee to remove two low comparable sales from the analysis because they were distressed transactions. What is the correct handling?",
        choices: [
          "Evaluate whether those sales reflect market conditions for this property type and either adjust for the circumstances or explain why they are excluded, documenting the reasoning either way.",
          "Remove them, since the seller has directed the content of his own analysis.",
          "Keep them without adjustment, since all closed sales are equally probative.",
          "Remove them and add two higher sales so the count of comparables stays the same."
        ],
        correctChoice: 0,
        rationale: "Distressed sales may or may not be representative, which is an analytical question, not a client-preference question. Letting the seller edit the evidence, treating all sales as equivalent, or backfilling with favorable sales each corrupt the analysis."
      },
      {
        prompt: "What makes a pricing presentation defensible if it is later questioned?",
        choices: [
          "The data relied on, the adjustments made, the reasoning, and the date are preserved in the file, so the opinion can be reconstructed as of the time it was given.",
          "The final list price matched the eventual sale price.",
          "The seller signed the presentation acknowledging he received it.",
          "The presentation was prepared using the brokerage's standard template."
        ],
        correctChoice: 0,
        rationale: "Defensibility comes from being able to show how the opinion was formed and when. A lucky outcome, an acknowledgment of receipt, and a standard template each say nothing about whether the reasoning was sound."
      }
    ]
  },
  "assignment-06": {
    subject: "Marketing, advertising, and fair access",
    applied: {
      prompt: "A licensee drafts listing copy that reads: 'Charming starter home in a quiet, family-friendly neighborhood near St. Anne's parish. Walk-up unit, not suitable for anyone with mobility issues. Perfect for a young couple.' The seller loves it. What should the licensee do?",
      choices: [
        "Rewrite the copy to describe the property rather than the people who might live in it, removing the references to family status, religion, disability, and age, and explain to the seller why the change is required.",
        "Publish it as written, since the seller approved the copy and it accurately describes the property and the neighborhood.",
        "Publish it after removing only the parish reference, since religious references are the clearest problem.",
        "Publish it with a disclaimer stating that the brokerage welcomes all buyers regardless of protected characteristics."
      ],
      correctChoice: 0,
      rationale: "Advertising may not state a preference, limitation, or discrimination based on protected characteristics. 'Family-friendly' and 'perfect for a young couple' speak to familial status and age, the parish reference signals religion, and 'not suitable for anyone with mobility issues' addresses disability — the accessibility fact can be stated by describing the stairs. Seller approval does not authorize unlawful copy, and a disclaimer does not cure discriminatory content."
    },
    engagement: [
      {
        prompt: "Which principle governs how a property's accessibility characteristics should appear in an advertisement?",
        choices: [
          "Describe the physical features factually, such as stairs or a single-level layout, rather than stating who the property is or is not suitable for.",
          "Omit accessibility information entirely, since any mention of disability in advertising is prohibited.",
          "State plainly which buyers the property would and would not work for, so no one wastes a trip.",
          "Include accessibility information only if the seller instructs that it be included."
        ],
        correctChoice: 0,
        rationale: "Describing the property is informative; characterizing who belongs in it is a statement about people. Omitting the feature entirely denies buyers useful information, and the seller's preference does not control what the law permits."
      },
      {
        prompt: "A licensee posts listing photographs that were taken before a fire damaged part of the home, without noting the change. What is the defect?",
        choices: [
          "The advertisement presents the property in a condition it is no longer in, which is misleading regardless of whether the photographs were accurate when taken.",
          "There is no defect, since the photographs were truthful at the time they were taken.",
          "The defect is only that the photographs are outdated and should be refreshed periodically.",
          "The defect arises only if a buyer travels to see the property in reliance on the photographs."
        ],
        correctChoice: 0,
        rationale: "Truthfulness is measured against the property's current condition. Historic accuracy does not save an advertisement that now misleads, and the violation does not depend on a particular buyer's reliance."
      },
      {
        prompt: "A buyer asks a licensee, 'What kind of people live in this neighborhood?' What is the appropriate response?",
        choices: [
          "Decline to characterize the residents, explain why, and point the buyer to objective sources so he can evaluate the area against his own criteria.",
          "Answer honestly based on the licensee's own observations, since the buyer asked directly.",
          "Answer in general terms that avoid naming any specific protected characteristic.",
          "Redirect the buyer to neighborhoods the licensee believes he would prefer."
        ],
        correctChoice: 0,
        rationale: "Characterizing residents is steering whether the description is accurate, general, or well-intended, and acting on an assumption about where the buyer would be comfortable is the clearest form of it. The buyer sets his own criteria from objective information."
      },
      {
        prompt: "What is the significance of the licensee retaining copies of advertisements and marketing materials?",
        choices: [
          "The archive lets the brokerage show what was actually published, when, and with what approval if the advertising is later questioned.",
          "The archive is used mainly to reuse successful copy on future listings.",
          "The archive is required only for advertisements that generated a consumer complaint.",
          "The archive substitutes for broker pre-approval of advertising."
        ],
        correctChoice: 0,
        rationale: "The archive exists for accountability: an advertisement can be reviewed only if it can be produced. Reuse is a convenience, complaint-triggered retention comes too late, and a record of what ran is not a substitute for approval before it ran."
      },
      {
        prompt: "During an open house, a visitor asks the licensee to let him wander the home alone while the licensee waits at the entry. What is the sound practice?",
        choices: [
          "Keep visitors accompanied or otherwise supervised consistently for every visitor, since access control protects the seller's property and applies uniformly.",
          "Allow it, since refusing could offend a potential buyer.",
          "Allow it for visitors who appear serious about purchasing and accompany the rest.",
          "Allow it only after the visitor signs the visitor register."
        ],
        correctChoice: 0,
        rationale: "The practice must be uniform, because judgments about which visitors seem trustworthy or serious are exactly where bias enters. A signature does not supervise anyone, and consistency both protects the seller and defends the licensee."
      }
    ],
    remediation: [
      {
        prompt: "Listing copy describes a property as 'ideal for professionals, no students.' What is wrong with it?",
        choices: [
          "It expresses a preference about who may occupy the property rather than describing the property, and preferences of that kind risk excluding protected groups.",
          "Nothing, because occupation and student status are not protected characteristics.",
          "Only the phrase 'no students' is a problem; 'ideal for professionals' is acceptable.",
          "It is acceptable if the seller can show a legitimate business reason for the preference."
        ],
        correctChoice: 0,
        rationale: "This is the same defect as 'family-friendly': the copy sorts people rather than describing the home. Whether a particular label is itself a protected class is the wrong question when the effect is to signal who is unwelcome."
      },
      {
        prompt: "A licensee wants to run social media advertisements for a listing that are shown only to users in a narrow age range. What is the concern?",
        choices: [
          "Restricting who is shown a housing advertisement by characteristics such as age can deny groups access to the housing opportunity, which is the harm advertising rules address.",
          "There is no concern, since audience targeting is a platform feature rather than the licensee's advertisement.",
          "The only concern is cost efficiency, since narrow targeting reduces the audience.",
          "The concern applies only if the advertisement copy itself mentions age."
        ],
        correctChoice: 0,
        rationale: "Who is permitted to see a housing advertisement is part of the advertisement. Neutral copy delivered selectively can exclude just as effectively as discriminatory wording, and using a platform's tool does not shift responsibility away from the advertiser."
      },
      {
        prompt: "A tenant with a disability asks a property manager for permission to install a grab bar in the bathroom at the tenant's expense. How should the request be treated?",
        choices: [
          "As a request for a reasonable modification, evaluated on whether it is reasonable and necessary because of the disability, rather than refused as an unauthorized alteration.",
          "As a lease violation, since alterations to the unit are prohibited without landlord approval.",
          "As a request that may be refused if the property has other units already equipped with grab bars.",
          "As a request that must be granted immediately without any discussion of restoration or workmanship."
        ],
        correctChoice: 0,
        rationale: "A modification request is evaluated as a fair-housing question, not as a lease-enforcement question. Availability of other units does not answer it, and evaluating it properly can still include reasonable conditions about how the work is done."
      },
      {
        prompt: "A salesperson's advertisement is accurate and identifies the brokerage but was never submitted for broker approval as office policy requires. It has already run. What should happen now?",
        choices: [
          "Report it, have it reviewed, and correct the process, because the approval requirement exists to make the broker's supervision effective rather than to catch inaccuracies alone.",
          "Nothing, since the advertisement met the substantive requirements.",
          "Remove the advertisement and take no further action, since the issue is now moot.",
          "Note it informally, since a first occurrence does not warrant a record."
        ],
        correctChoice: 0,
        rationale: "The supervision failure is the issue, and it persists whether or not this advertisement was accurate. Quiet removal and informal handling both leave the gap in place for the next advertisement."
      },
      {
        prompt: "What should a licensee do when a seller instructs that the property not be shown to a particular group of prospective buyers?",
        choices: [
          "Refuse the instruction, explain that it is unlawful, notify the broker, and address whether the listing can continue.",
            "Follow the instruction, since the seller controls access to his own property.",
          "Follow the instruction informally by scheduling around those buyers without stating a reason.",
          "Continue showing the property to everyone but avoid telling the seller, to keep the listing."
        ],
        correctChoice: 0,
        rationale: "The instruction cannot be followed openly or quietly, and scheduling around buyers accomplishes the same exclusion. Concealing the refusal from the seller leaves the unlawful expectation in place and the broker uninformed."
      }
    ]
  },
  "assignment-07": {
    subject: "Buyer representation and property selection",
    applied: {
      prompt: "A buyer tells a licensee he is preapproved, wants to see homes this weekend, does not want to sign any representation agreement yet, and asks the licensee to tell him which of two neighborhoods is 'better for someone like me.' How should the licensee proceed?",
      choices: [
        "Provide the agency disclosure and explain the relationship options, decline to characterize either neighborhood by who lives there while offering objective information the buyer can evaluate, and confirm what the preapproval actually establishes.",
        "Show the homes first and address representation, disclosure, and financing questions once the buyer identifies a property he wants.",
        "Decline to show any property until the buyer signs a written representation agreement.",
        "Answer the neighborhood question honestly based on the licensee's knowledge of the area, since the buyer asked for advice."
      ],
      correctChoice: 0,
      rationale: "Three things are in play and only one is optional. Agency disclosure comes early because agency can arise from conduct; the neighborhood question invites steering regardless of how it is phrased; and a preapproval's strength depends on what was verified. A written representation agreement is negotiable, so refusing to show anything without one overstates the requirement."
    },
    engagement: [
      {
        prompt: "What is the primary purpose of a buyer consultation before showing property?",
        choices: [
          "To establish the buyer's objectives, constraints, and financial position so the search is grounded in what the buyer can actually pursue.",
          "To persuade the buyer to sign a representation agreement before seeing competing brokerages.",
          "To determine how quickly the buyer intends to purchase so the licensee can prioritize his time.",
          "To identify which properties the licensee's own brokerage has listed."
        ],
        correctChoice: 0,
        rationale: "The consultation exists to align the search with reality. Signing, prioritization, and in-house inventory are the licensee's interests, not the buyer's objectives."
      },
      {
        prompt: "A buyer presents a lender's preapproval letter. What does it establish?",
        choices: [
          "That a lender has reviewed some information and indicated a likely loan amount subject to conditions, which is stronger than a prequalification but is not a loan commitment.",
          "That the loan is approved and will fund provided the buyer does not change jobs.",
          "That the buyer's income and assets have been fully verified and underwritten.",
          "That the lender has committed to lend on any property within the stated amount."
        ],
        correctChoice: 0,
        rationale: "A preapproval is conditional and property-independent. Treating it as a commitment misleads the seller when the offer is presented and sets up the transaction to fail at underwriting."
      },
      {
        prompt: "Which practice best avoids steering during a property search?",
        choices: [
          "Using the buyer's own stated criteria to select properties and providing objective sources for questions about schools, demographics, and area characteristics.",
          "Showing properties only in areas where the licensee believes the buyer will feel comfortable.",
          "Showing a balanced mix of neighborhoods chosen by the licensee to represent the whole market.",
          "Asking the buyer which protected characteristics matter to him so his preferences can be honored."
        ],
        correctChoice: 0,
        rationale: "Steering is defined by who chooses on what basis, not by intent or variety. Assumptions about comfort, curated balance, and soliciting protected-characteristic preferences all substitute the licensee's sorting for the buyer's."
      },
      {
        prompt: "A buyer asks the licensee whether he really needs a home inspection on a newly built house. What is the sound advice?",
        choices: [
          "Recommend independent investigation appropriate to the property and explain that the licensee's own observations are not a substitute for a professional inspection.",
          "Advise that new construction carries a builder warranty, so an inspection adds little value.",
          "Advise that an inspection is unnecessary if the buyer waives the inspection contingency to strengthen the offer.",
          "Decide for the buyer based on the licensee's own walkthrough of the property."
        ],
        correctChoice: 0,
        rationale: "The licensee's role is to recommend investigation and identify what she is not qualified to assess. A warranty addresses remedies after a problem appears, waiver is a negotiating decision rather than an inspection substitute, and substituting her own walkthrough exceeds her competence."
      },
      {
        prompt: "Why should a buyer's offer strategy and the advice behind it be documented?",
        choices: [
          "So the file shows what the buyer was told about risks and options and that the decisions on price, terms, and contingencies were the buyer's.",
          "So the licensee can demonstrate to her broker that she pursued the transaction diligently.",
          "So the seller's agent can verify the buyer's motivations during negotiation.",
          "So the brokerage can analyze which offer strategies succeed most often."
        ],
        correctChoice: 0,
        rationale: "Documentation protects the buyer's informed decision and the licensee's ability to show she advised. Internal diligence and market analytics are byproducts, and the buyer's motivations are not for the other side."
      }
    ],
    remediation: [
      {
        prompt: "A buyer wants to see a property listed by the licensee's own brokerage. What must be addressed before proceeding?",
        choices: [
          "Whether the arrangement creates dual agency and, if so, obtaining informed written consent from both parties before continuing.",
          "Nothing, provided a different salesperson in the office handles the seller.",
          "Only whether the buyer is comfortable, since the seller already agreed to the listing.",
          "Whether the brokerage's compensation changes, which is the only practical effect."
        ],
        correctChoice: 0,
        rationale: "The agency question belongs to the brokerage, so assigning a second salesperson does not by itself eliminate it. Consent must be informed and from both parties, and compensation is a consequence rather than the issue."
      },
      {
        prompt: "A buyer says he can 'definitely afford' a price well above his preapproval amount because a relative will help. What should the licensee do?",
        choices: [
          "Ask him to confirm with his lender how that assistance would be treated and documented before the search is built around the higher figure.",
          "Proceed at the higher price, since the buyer knows his own finances.",
          "Proceed at the preapproval amount and disregard the additional funds.",
          "Ask the relative directly for confirmation of the funds."
        ],
        correctChoice: 0,
        rationale: "Whether outside funds support a larger loan depends on how the lender treats them. Taking the buyer's word, ignoring the funds, or contacting the relative all bypass the only party whose treatment of the money decides the question."
      },
      {
        prompt: "A buyer asks the licensee to recommend the best public school in the area for his child. What is the correct approach?",
        choices: [
          "Direct him to the school district and published performance information so he can evaluate schools himself, rather than ranking schools for him.",
          "Recommend the school the licensee's own children attend, disclosing the connection.",
          "Recommend the school most of his buyers select.",
          "Decline to discuss schools at all, since school questions relate to familial status."
        ],
        correctChoice: 0,
        rationale: "School quality is a proxy that can carry protected-characteristic assumptions, so the buyer should apply his own criteria to objective sources. Personal or popularity-based recommendations import the licensee's judgment; refusing to point to any source withholds information the buyer can properly use."
      },
      {
        prompt: "An inspection reveals a condition the buyer's licensee does not understand well enough to evaluate. What is the correct step?",
        choices: [
          "Advise the buyer to obtain an evaluation from the appropriate specialist and document the recommendation and the buyer's response.",
          "Give the buyer her general impression of how serious such conditions usually are.",
          "Ask the listing agent whether the seller considers the condition significant.",
          "Wait to see whether the inspector flags it as a major issue in the final report."
        ],
        correctChoice: 0,
        rationale: "The correct response to reaching the limit of competence is referral plus a record of it. An impression, the seller's view, and passive waiting all leave the buyer without the expert evaluation the condition calls for."
      },
      {
        prompt: "A buyer wants to waive all contingencies to win a competitive bidding situation. What should the licensee do?",
        choices: [
          "Explain in writing what protections each contingency provides and what waiving it would expose him to, then follow the buyer's informed decision.",
          "Refuse to write the offer, since waiving contingencies is against the buyer's interest.",
          "Write the offer as instructed without comment, since the terms are the buyer's decision.",
          "Waive only the inspection contingency, which is the one sellers care most about."
        ],
        correctChoice: 0,
        rationale: "Terms are the client's decision and advice is the licensee's obligation, so both refusing and staying silent fail. Selectively waiving on the licensee's own theory of what sellers want substitutes her judgment for the buyer's."
      }
    ]
  },
  "assignment-08": {
    subject: "Purchase agreements, counteroffers, and contingencies",
    applied: {
      prompt: "A buyer's inspection contingency period passes without the buyer delivering anything in writing. The buyer assumes the contingency simply expired and that he is now committed. The seller's agent assumes the contingency was removed automatically and tells the seller the transaction is firm. The licensee is asked to confirm the status. What is the correct analysis?",
      choices: [
        "Read the contract's own removal mechanism: under the standard California residential form, contingencies remain in effect until removed in writing, so the passage of the date does not by itself remove them, and the seller's remedy is to deliver the notice the contract requires.",
        "Confirm that the contingency expired automatically when the date passed, since deadlines in a contract are self-executing.",
        "Confirm that the buyer is now committed, since he failed to act within the period he negotiated.",
        "Advise that the contract is now void because neither party acted within the contingency period."
      ],
      correctChoice: 0,
      rationale: "The answer is in the contract's removal mechanism rather than in an assumption about deadlines. The standard California residential form uses active written removal, so a passed date leaves the contingency in place and gives the seller the right to deliver a notice requiring the buyer to act. Nothing in the situation makes the contract void."
    },
    engagement: [
      {
        prompt: "A seller responds to an offer by changing the price and the closing date and signing. What is the legal effect?",
        choices: [
          "It is a counteroffer, which rejects the original offer and gives the buyer the power to accept, reject, or counter again.",
          "It is an acceptance with modifications, which forms a contract on the seller's terms.",
          "It is an acceptance, since the seller signed the buyer's document.",
          "It is a rejection with no further effect, so the buyer must submit a new offer."
        ],
        correctChoice: 0,
        rationale: "An acceptance must match the offer. Changing material terms rejects the offer and makes a new one, which the original offeror is free to accept or not — it neither forms a contract nor ends the negotiation."
      },
      {
        prompt: "What is the function of a contingency in a purchase agreement?",
        choices: [
          "It conditions the buyer's obligation on a defined event or approval, giving a defined path to cancel if the condition is not satisfied.",
          "It delays the formation of the contract until the condition occurs.",
          "It gives the buyer an unconditional right to cancel for any reason before closing.",
          "It shifts responsibility for the condition to the seller until it is resolved."
        ],
        correctChoice: 0,
        rationale: "A contingency operates inside a formed contract: the agreement exists, and performance is conditioned. It is neither a delay in formation nor a general escape clause, and it does not transfer the underlying responsibility."
      },
      {
        prompt: "A seller receives multiple offers. What governs how they are presented and handled?",
        choices: [
          "The seller's lawful instructions and the agent's duties to present offers and to avoid misrepresenting the competing offers to anyone.",
          "A requirement that every buyer be told the terms of the competing offers so all can respond equally.",
          "A requirement that the highest offer be accepted, since the agent must obtain the best price for the seller.",
          "The order in which the offers were received, since earlier offers have priority."
        ],
        correctChoice: 0,
        rationale: "The seller decides which offer to accept and whether competing terms are disclosed. Price is only one factor, and there is no priority rule based on timing."
      },
      {
        prompt: "Why does a purchase agreement specify how notices between the parties must be delivered?",
        choices: [
          "Because rights often depend on whether and when a notice was delivered, so the method and timing must be provable.",
          "Because the parties would otherwise have no way to communicate during escrow.",
          "Because escrow requires copies of all communications between the parties.",
          "Because notice requirements determine which party pays closing costs."
        ],
        correctChoice: 0,
        rationale: "Delivery provisions exist so a later dispute about a deadline can be resolved with evidence. The parties can always talk; what they cannot do is prove an informal conversation satisfied a contractual notice."
      },
      {
        prompt: "The parties agree during escrow to move the closing date by a week. How should this be handled?",
        choices: [
          "Document the change in a written amendment signed by both parties and deliver it to escrow, so the file and the escrow instructions match the agreement.",
          "Confirm the new date by email between the agents, which is sufficient to modify the contract.",
          "Instruct escrow to close on the new date, since escrow controls the closing schedule.",
          "Treat the change as informal, since a short extension does not alter the substance of the agreement."
        ],
        correctChoice: 0,
        rationale: "A term of the contract is changed by the parties in writing, not by their agents' correspondence or by escrow's scheduling. Treating a date change as informal is precisely how disputes about who breached arise."
      }
    ],
    remediation: [
      {
        prompt: "A buyer wants to cancel because his loan was denied, and the financing contingency is still in place. What is the correct step?",
        choices: [
          "Follow the contract's cancellation procedure, delivering the required written notice and supporting documentation within the contract's terms.",
          "Notify the seller's agent verbally, since the denial itself terminates the contract.",
          "Instruct escrow to return the deposit, since a denied loan entitles the buyer to a refund.",
          "Stop performing and allow the seller to cancel for non-performance."
        ],
        correctChoice: 0,
        rationale: "The contingency gives a path to cancel, and the path has requirements. A verbal notice, a unilateral instruction to escrow, and silent non-performance each forfeit the protection the contingency was meant to provide."
      },
      {
        prompt: "A buyer signs a counteroffer but adds a handwritten change to one term before returning it. What has occurred?",
        choices: [
          "A further counteroffer, which the seller may accept or reject; no contract exists until one party accepts the other's terms without change.",
          "Acceptance of the counteroffer, with the handwritten change treated as a request.",
          "A binding contract on the original counteroffer terms, since the buyer signed it.",
          "Withdrawal of the buyer's original offer, ending the negotiation."
        ],
        correctChoice: 0,
        rationale: "This is the mirror image of the seller's counteroffer: any change to the terms is a new offer, however small the change or however it is written. Signing does not convert a modification into an acceptance."
      },
      {
        prompt: "A seller wants to cancel because the buyer has not removed a contingency by the agreed date. What must generally occur first?",
        choices: [
          "The seller must deliver the written notice the contract requires, giving the buyer the specified period to act before cancellation is effective.",
          "Nothing further; the seller may cancel immediately once the date has passed.",
          "The seller must obtain the buyer's written agreement to cancel.",
          "The seller must first accept a backup offer to establish damages."
        ],
        correctChoice: 0,
        rationale: "This is the counterpart to the applied scenario: because removal is active, the seller's route is the contractual notice. Immediate cancellation skips it, the buyer's agreement is not required to invoke it, and a backup offer is irrelevant to the procedure."
      },
      {
        prompt: "An agent tells a competing buyer that another offer is 'in the high 700s' when no such offer exists, hoping to raise the price. What is this?",
        choices: [
          "A misrepresentation that exposes the agent and the brokerage to liability and discipline, regardless of whether the price actually rose.",
          "A negotiating tactic that is permissible because offer terms are confidential and need not be described accurately.",
          "Acceptable if the seller instructed the agent to create competitive pressure.",
          "Acceptable if the agent expects a comparable offer to arrive shortly."
        ],
        correctChoice: 0,
        rationale: "Declining to disclose competing terms is permissible; inventing them is not. A client's instruction cannot authorize a misrepresentation, and an anticipated offer is not an existing one."
      },
      {
        prompt: "What is the most effective way to prevent disputes about deadlines during escrow?",
        choices: [
          "Maintain a written timeline of contractual dates with the evidence of each notice and removal delivered, and confirm status in writing at each step.",
          "Rely on escrow to track dates, since escrow holds the instructions.",
          "Rely on the transaction management software's automated reminders.",
          "Confirm dates verbally with the other agent at each milestone."
        ],
        correctChoice: 0,
        rationale: "Disputes are resolved with proof of what was delivered and when, which is why the timeline must be paired with the evidence. Escrow, reminders, and verbal confirmations help the work happen but do not create the record."
      }
    ]
  },
  "assignment-09": {
    subject: "Disclosures and property-condition risk",
    applied: {
      prompt: "While previewing a listing the agent notices staining across a bedroom ceiling and a fresh patch of paint around it. The seller says a pipe leaked two years ago, was repaired, and 'there is nothing to disclose because it's fixed.' The agent's transfer disclosure draft says nothing about it. What should happen?",
      choices: [
        "The past leak and the repair are disclosed, the agent's own visual observation of the staining is separately noted, and the buyer is advised to investigate the repair with an appropriate professional.",
        "Nothing is disclosed, because a repaired condition is no longer a defect affecting the property.",
        "The staining is disclosed but the leak is not, since the agent observed the staining and the leak is the seller's information.",
        "The matter is left to the buyer's inspector, since an inspection will reveal any remaining moisture issue."
      ],
      correctChoice: 0,
      rationale: "A repaired condition is still a fact a buyer would want to know, because the repair's adequacy is exactly what is at issue. The seller's disclosure and the agent's own visual-inspection observation are separate obligations, and the possibility that an inspector might find it does not discharge either one."
    },
    engagement: [
      {
        prompt: "What does the agent's visual inspection duty in a residential transaction require?",
        choices: [
          "A reasonably competent and diligent visual inspection of the accessible areas, with disclosure of material facts it reveals.",
          "An inspection of the entire property including areas that require moving belongings or opening walls.",
          "A review of the seller's disclosure for accuracy, without independent observation.",
          "No independent inspection, provided the buyer is advised to hire a professional inspector."
        ],
        correctChoice: 0,
        rationale: "The duty is bounded by what is reasonably accessible and visual — the agent is not an inspector and does not open walls. But it is an independent duty: reviewing the seller's paperwork or recommending an inspector does not satisfy it."
      },
      {
        prompt: "A seller asks whether he must disclose a condition the buyer could easily see for himself. What is the correct answer?",
        choices: [
          "Disclose it anyway; the obligation is to disclose known material facts, and obviousness is not a substitute for disclosure.",
          "No disclosure is required for conditions visible on an ordinary walkthrough.",
          "No disclosure is required if the buyer's agent accompanied the buyer through the property.",
          "Disclosure is required only if the buyer asks about that specific condition."
        ],
        correctChoice: 0,
        rationale: "Disclosure is measured by what the seller knows and what a buyer would consider important, not by how visible it is or whether anyone asked. Assuming the buyer noticed is exactly the assumption that produces disputes after closing."
      },
      {
        prompt: "What is the significance of a natural hazard disclosure in a California residential sale?",
        choices: [
          "It informs the buyer that the property lies within one or more mapped hazard zones, which affects risk, insurance, and sometimes building requirements.",
          "It certifies that the property is safe from the hazards identified in the mapped zones.",
          "It replaces the need for the buyer to investigate hazard conditions independently.",
          "It applies only to properties that have previously experienced a hazard event."
        ],
        correctChoice: 0,
        rationale: "The disclosure locates the property relative to mapped zones so the buyer can investigate further. It certifies nothing about safety, and it applies based on mapping rather than on the property's event history."
      },
      {
        prompt: "Which of the following is generally treated as outside the scope of required property-condition disclosure?",
        choices: [
          "The manner of a prior occupant's death or a prior occupant's illness, which are subject to specific legal limits on disclosure.",
          "A known foundation crack that was repaired last year.",
          "A boundary dispute with a neighbor that has not been resolved.",
          "A recurring drainage problem in the side yard."
        ],
        correctChoice: 0,
        rationale: "Deaths and occupants' health information are subject to specific legal limits, and disclosing them can itself create liability. The other three are physical or legal conditions affecting the property and its value."
      },
      {
        prompt: "Why does the timing of disclosure delivery matter, not just its content?",
        choices: [
          "Delivery can start a period during which the buyer may act, so late delivery shifts the buyer's rights and can affect whether the transaction can be cancelled.",
          "Late delivery only affects whether escrow can close on schedule.",
          "Timing matters only for disclosures the seller prepares, not those the agent prepares.",
          "Timing is a courtesy; the content is what the law addresses."
        ],
        correctChoice: 0,
        rationale: "Disclosure rules attach consequences to delivery, including rights that run from the delivery date. Treating timing as scheduling or courtesy is how a buyer's right to respond gets compressed or lost."
      }
    ],
    remediation: [
      {
        prompt: "An agent learns from a neighbor that the listed home flooded three years ago. The seller says nothing about it. What should the agent do?",
        choices: [
          "Raise it with the seller and the broker, and ensure that what is known and what remains unverified are addressed in the disclosure rather than dropped.",
          "Disregard it, since neighborhood talk is not a reliable source and the seller did not report it.",
          "Tell the buyer directly and privately, without involving the seller.",
          "Include it in the disclosure as an established fact reported by a neighbor."
        ],
        correctChoice: 0,
        rationale: "An unverified report of a material condition is neither ignorable nor assertable as fact. The professional path runs through the seller and the broker so the file shows the issue was surfaced and how it was resolved."
      },
      {
        prompt: "A property built before 1978 is being sold. What does the lead-based paint requirement obligate the seller to do?",
        choices: [
          "Disclose known lead-based paint and hazards, provide available records and the required pamphlet, and give the buyer the opportunity to conduct an assessment.",
          "Test the property for lead-based paint and provide the results to the buyer.",
          "Remediate any lead-based paint before transferring the property.",
          "Disclose only if the buyer intends to occupy the property with children."
        ],
        correctChoice: 0,
        rationale: "The obligation is disclosure, records, pamphlet, and opportunity to assess — not testing and not remediation. It is triggered by the age of the housing, not by the buyer's household."
      },
      {
        prompt: "A buyer asks the listing agent whether the neighborhood is safe. What is the sound response?",
        choices: [
          "Decline to characterize safety, and refer the buyer to law-enforcement and public data sources so he can evaluate the area himself.",
          "Share the agent's own impression, since the buyer asked a direct question and deserves an answer.",
          "State that the neighborhood is safe if the agent is not aware of any incidents.",
          "Decline to answer and change the subject without explanation."
        ],
        correctChoice: 0,
        rationale: "Characterizing safety is an opinion that can carry protected-characteristic assumptions and that the agent cannot support. Referring to objective sources answers the buyer's real need; an unexplained refusal leaves him with nothing."
      },
      {
        prompt: "A seller completes the transfer disclosure but leaves several items blank because he is unsure. What should the agent advise?",
        choices: [
          "Complete every item, stating what is unknown as unknown rather than leaving blanks, since a blank is ambiguous and invites a later dispute about whether it was answered.",
          "Leave the blanks, since a seller cannot be required to answer questions he cannot answer.",
          "Answer the uncertain items as 'no,' since the seller has no knowledge of a problem.",
          "Have the agent complete the uncertain items based on her own observations."
        ],
        correctChoice: 0,
        rationale: "'Unknown' is a real and honest answer; a blank is not. Marking uncertain items 'no' asserts knowledge the seller does not have, and the agent completing the seller's disclosure misattributes the statement."
      },
      {
        prompt: "The seller delivers a required disclosure after the buyer has already removed his contingencies. What is the consequence?",
        choices: [
          "The late delivery may revive or extend the buyer's right to respond, so the agent should identify the issue immediately rather than proceeding as if the transaction were firm.",
          "There is no consequence, since the buyer received the disclosure before closing.",
          "The buyer forfeits any right to respond because he removed his contingencies.",
          "The seller may cure the delay by extending the closing date."
        ],
        correctChoice: 0,
        rationale: "This is the timing principle applied at the worst moment. Rights that run from delivery are not extinguished by the buyer having acted earlier without the information, and rescheduling the closing does not address the buyer's right to respond."
      }
    ]
  },
  "assignment-10": {
    subject: "Financing the transaction",
    applied: {
      prompt: "Ten days before closing, the buyer's lender reports that the appraisal came in $20,000 below the contract price and that the loan will be reduced accordingly. The buyer's appraisal contingency has already been removed. The buyer asks his agent what his options are and whether he can simply cancel. How should the agent proceed?",
      choices: [
        "Lay out the practical options — bring additional funds, request a price reduction, or seek a negotiated resolution — explain that the removed contingency limits his cancellation rights under the contract, and recommend he consult counsel before deciding to stop performing.",
        "Advise the buyer that he may cancel and recover his deposit, because a low appraisal means the property is not worth the contract price.",
        "Advise the buyer to cancel and let the parties argue about the deposit afterward.",
        "Tell the buyer he must proceed and bring the additional funds, because the contingency is gone."
      ],
      correctChoice: 0,
      rationale: "The buyer needs the real option set and an accurate picture of what removing the contingency cost him. Whether he can cancel and what happens to the deposit is a legal question the agent should not resolve, which is why the recommendation to consult counsel belongs in the answer — as does refusing to tell him he simply must perform."
    },
    engagement: [
      {
        prompt: "What is the practical difference between a prequalification and a preapproval?",
        choices: [
          "A prequalification rests largely on information the borrower states; a preapproval involves the lender reviewing supporting information, making it a stronger but still conditional indication.",
          "A prequalification is issued by a lender and a preapproval is issued by a mortgage broker.",
          "A preapproval is a binding commitment to lend and a prequalification is not.",
          "A prequalification is for conventional loans and a preapproval is for government loans."
        ],
        correctChoice: 0,
        rationale: "The distinction is the depth of the lender's review. Neither is a commitment, and the difference has nothing to do with who issues it or the loan program."
      },
      {
        prompt: "What does the loan-to-value ratio express?",
        choices: [
          "The loan amount as a percentage of the property's value, which affects the lender's risk exposure and often the loan terms.",
            "The borrower's total monthly debt as a percentage of income.",
          "The percentage of the purchase price the buyer pays in cash.",
          "The ratio of the appraised value to the contract price."
        ],
        correctChoice: 0,
        rationale: "Loan-to-value measures the loan against the collateral's value. Debt against income is a different ratio, and the down payment is the complement of loan-to-value rather than the measure itself."
      },
      {
        prompt: "A seller agrees to credit the buyer for closing costs. What should the agent confirm?",
        choices: [
          "That the buyer's lender permits a credit of that size for this loan program, since exceeding the allowed limit can force the terms to be restructured late in escrow.",
          "That the credit is documented only in a side agreement between the parties.",
          "That escrow agrees to apply the credit, since escrow controls the settlement statement.",
          "Nothing further, since a seller credit is a negotiation between buyer and seller."
        ],
        correctChoice: 0,
        rationale: "Credits interact with loan program limits, so the lender's tolerance governs what can actually be delivered. A side agreement that the lender does not see is worse than a problem — it is a misrepresentation to the lender."
      },
      {
        prompt: "Why does a financing contingency matter to a seller as well as to a buyer?",
        choices: [
          "It defines when the seller learns whether the buyer's financing is secure, and therefore how long the property is committed to a transaction that may not close.",
          "It obligates the seller to assist the buyer in obtaining financing.",
          "It guarantees the seller a remedy if the buyer's loan is denied.",
          "It requires the seller to accept the buyer's chosen lender."
        ],
        correctChoice: 0,
        rationale: "For a seller the contingency is a timing and certainty question. It does not create seller obligations to help, does not guarantee a remedy, and does not dictate the lender."
      },
      {
        prompt: "A buyer wants to change loan programs during escrow to get a better rate. What should the agent advise him to check first?",
        choices: [
          "How the change affects the timeline, the appraisal, the required documentation, and the closing date the parties agreed to.",
          "Only whether the new rate is meaningfully better than the current one.",
          "Only whether the new lender will match the current lender's closing costs.",
          "Nothing; the loan is the buyer's private arrangement and does not affect the contract."
        ],
        correctChoice: 0,
        rationale: "A program change can restart underwriting and require a new appraisal, which puts the contractual closing date at risk. Rate and cost comparisons matter to the buyer, but they are not what threatens the transaction."
      }
    ],
    remediation: [
      {
        prompt: "A buyer's loan is conditionally approved subject to verification of employment. Two weeks before closing he accepts a new job. What should he be advised?",
        choices: [
          "Tell the lender immediately, because employment is a condition of the approval and the change may affect whether the loan can fund.",
          "Wait until after closing to notify the lender, since the approval was already issued.",
          "Notify the lender only if the new position pays less than the previous one.",
          "Notify the seller's agent so the closing date can be extended."
        ],
        correctChoice: 0,
        rationale: "A conditional approval depends on the facts staying as underwritten, and concealing a change from the lender is the serious version of this mistake. Whether the pay is higher or lower does not decide it, and the seller's agent is not the party who needs to evaluate it."
      },
      {
        prompt: "A buyer asks his agent which loan program is best for him. What is the appropriate response?",
        choices: [
          "Explain the general characteristics of the common program types and refer the specific recommendation to a qualified lender who has his financial information.",
          "Recommend the program the agent has seen work most often for buyers in this price range.",
          "Recommend the program with the lowest current interest rate.",
          "Decline to discuss financing at all, since loan advice requires a separate license."
        ],
        correctChoice: 0,
        rationale: "Program suitability depends on the borrower's financial detail, which the lender holds. General education is appropriate and useful; a specific recommendation based on pattern or headline rate is not, and refusing to discuss financing at all withholds help the agent can properly give."
      },
      {
        prompt: "An appraisal comes in below the contract price while the appraisal contingency is still in place. What does the contingency give the buyer?",
        choices: [
          "A defined path to respond, which may include renegotiating or cancelling according to the contract's terms and timeline.",
          "An automatic reduction of the purchase price to the appraised value.",
          "An automatic cancellation of the contract.",
          "The right to require the seller to obtain a second appraisal."
        ],
        correctChoice: 0,
        rationale: "A contingency creates a right to respond within a procedure, not an automatic outcome. Nothing about it changes the price by itself or obligates the seller to re-appraise."
      },
      {
        prompt: "What is the effect of a buyer making a materially larger down payment than originally planned?",
        choices: [
          "It reduces the loan-to-value ratio and the lender's exposure, which can affect the loan terms and reduce the risk that a low appraisal derails the loan.",
          "It has no effect on the loan, since the purchase price is unchanged.",
          "It requires an amendment to the purchase agreement in every case.",
          "It obligates the lender to approve the loan."
        ],
        correctChoice: 0,
        rationale: "Increasing cash lowers the loan against the same collateral, which is the loan-to-value relationship from the other direction. It changes the lender's risk without obligating approval and without necessarily changing the contract."
      },
      {
        prompt: "The buyer's lender says the loan will fund two days after the contractual closing date. What should the agents do?",
        choices: [
          "Notify both parties promptly and address the delay through the contract's mechanism, with any date change documented in a signed amendment.",
          "Allow the closing date to pass and let escrow close when funds arrive.",
          "Have the agents agree to the new date by email, which is sufficient between professionals.",
          "Advise the buyer to demand that the lender fund on time under the contract."
        ],
        correctChoice: 0,
        rationale: "A missed closing date is a contractual event, not a scheduling inconvenience, and it is changed the same way any other term is: in writing between the parties. The lender is not a party to the purchase agreement."
      }
    ]
  },
  "assignment-11": {
    subject: "Escrow, title, closing, and possession",
    applied: {
      prompt: "Three days before closing, the preliminary report shows a recorded lien against the seller that neither party mentioned, and the buyer's final walkthrough reveals that the refrigerator listed as included has been removed. The seller says the lien was 'paid years ago' and that he took the refrigerator because it was a gift from his mother. How should the agent handle both items?",
      choices: [
        "Route the lien to escrow and title for confirmation that it will be released or cleared at closing, and address the refrigerator as a contract-term discrepancy to be resolved in writing between the parties before closing.",
        "Instruct escrow to close and hold funds in reserve for both items, resolving them after possession transfers.",
        "Treat the lien as resolved on the seller's statement and treat the refrigerator as a minor item not worth delaying closing.",
        "Advise the buyer to refuse to close until the seller returns the refrigerator and personally provides proof the lien was paid."
      ],
      correctChoice: 0,
      rationale: "The two issues run on different tracks and should not be merged. Clearing title is escrow and title's function and requires documentary confirmation, not the seller's recollection. What conveys with the property is a contract question the parties resolve in writing. Neither is solved by closing first, and escalating to a refusal to close skips the ordinary channels."
    },
    engagement: [
      {
        prompt: "What best describes the escrow holder's role?",
        choices: [
          "A neutral third party that holds funds and documents and acts only according to the parties' mutual written instructions.",
          "An agent of the buyer, since the buyer typically pays the escrow fee.",
          "A representative of the lender, since the lender's funds pass through escrow.",
          "An advocate that resolves disputes between the parties during the transaction."
        ],
        correctChoice: 0,
        rationale: "Neutrality and strict adherence to mutual instructions define escrow. It represents neither side regardless of who pays, and it has no authority to resolve a dispute — a dispute stops escrow rather than being decided by it."
      },
      {
        prompt: "What is the purpose of a preliminary report?",
        choices: [
          "It reports the condition of title as shown in the records and states the terms on which the title insurer would be willing to issue a policy.",
          "It guarantees that title is clear of all defects as of the report date.",
          "It is the title insurance policy issued at the close of escrow.",
          "It certifies the property's legal boundaries and physical condition."
        ],
        correctChoice: 0,
        rationale: "A preliminary report is an offer to insure on stated terms, including exceptions — it is neither a guarantee nor the policy itself, and it addresses record title rather than physical boundaries."
      },
      {
        prompt: "Why does the manner in which the buyer takes title matter?",
        choices: [
          "It affects ownership rights, survivorship, and tax and estate consequences, which is why buyers should be referred to legal or tax counsel rather than advised by the agent.",
          "It determines which title insurance company may issue the policy.",
          "It affects only how the property is listed on the county tax roll.",
          "It is a formality that can be changed freely after closing at no cost."
        ],
        correctChoice: 0,
        rationale: "Vesting carries legal and tax consequences that exceed a licensee's scope, which is why the correct action is referral. It is not a formality and changing it later is not costless."
      },
      {
        prompt: "What is the function of prorations at closing?",
        choices: [
          "They allocate ongoing costs such as taxes and certain fees between seller and buyer according to the period each owns the property.",
          "They adjust the purchase price to reflect the property's appraised value.",
          "They allocate the brokerage compensation between the two brokerages.",
          "They reimburse the buyer for repairs the seller agreed to make."
        ],
        correctChoice: 0,
        rationale: "Prorations divide continuing charges at the ownership boundary. They are unrelated to price adjustments, brokerage splits, or repair credits, each of which is handled by its own mechanism."
      },
      {
        prompt: "When does the buyer typically become the owner of record?",
        choices: [
          "When the deed is recorded, which is what gives constructive notice of the transfer to the world.",
          "When the purchase agreement is fully signed by both parties.",
          "When escrow receives the buyer's funds.",
          "When the buyer takes physical possession of the property."
        ],
        correctChoice: 0,
        rationale: "Recording is the act that provides constructive notice. Contract formation, funding, and possession are all separate events that may occur before or after it."
      }
    ],
    remediation: [
      {
        prompt: "The buyer asks escrow to release his deposit early so he can pay for repairs he plans after closing. What should escrow do?",
        choices: [
          "Decline unless both parties instruct the release in writing, because escrow may act only on mutual instructions.",
          "Release the funds, since the deposit is the buyer's money until closing.",
          "Release the funds if the buyer's agent confirms the request in writing.",
          "Release the funds and note the disbursement on the settlement statement."
        ],
        correctChoice: 0,
        rationale: "This tests escrow's neutrality from the funds side: whose money it is does not matter, because escrow's authority comes from mutual instructions. One party's agent cannot supply the other party's consent."
      },
      {
        prompt: "The preliminary report lists an easement across the rear of the lot. What is the appropriate step?",
        choices: [
          "Ensure the buyer reviews the underlying document and understands its effect, referring him to counsel if the legal effect on his intended use is unclear.",
          "Treat it as routine, since most properties carry easements of some kind.",
          "Ask the title company to remove it from the policy as an exception.",
            "Advise the buyer it will not affect him unless the easement holder exercises it."
        ],
        correctChoice: 0,
        rationale: "An exception matters because of what the underlying document says about this property and this buyer's intended use. Treating it as routine, requesting its removal, or predicting its practical effect all substitute assumption for the document."
      },
      {
        prompt: "At the final verification of condition the buyer finds that an agreed repair was not completed. What is the correct path?",
        choices: [
          "Document the finding and address it through the contract before closing, since the ordinary leverage to resolve it disappears once the transaction closes.",
          "Close as scheduled and pursue the seller afterward for the cost of the repair.",
          "Instruct escrow to withhold funds for the repair without the seller's agreement.",
          "Treat the walkthrough as informational only, since it is not an inspection."
        ],
        correctChoice: 0,
        rationale: "The verification exists precisely so problems surface while the transaction can still respond. Escrow cannot withhold unilaterally, and pursuing the seller after closing converts a solvable issue into a claim."
      },
      {
        prompt: "The parties agree the seller may remain in the property for five days after closing. What should be in place?",
        choices: [
          "A written occupancy agreement addressing term, payment, condition, insurance, and what happens if the seller does not vacate on time.",
          "An oral understanding between the parties, since the arrangement is brief.",
          "A note in the escrow instructions stating the seller will vacate within five days.",
          "Nothing, since possession follows ownership automatically."
        ],
        correctChoice: 0,
        rationale: "Post-closing occupancy separates ownership from possession and creates real risk about condition, insurance, and holdover. A brief term does not reduce the need for terms, and a one-line escrow note addresses none of them."
      },
      {
        prompt: "Why should the agent audit the transaction file after closing?",
        choices: [
          "To confirm that every required disclosure, notice, amendment, and signature is present and consistent, since a later dispute is defended with the file.",
          "To calculate the brokerage's earnings on the transaction.",
          "To remove superseded drafts so the file contains only final documents.",
          "To satisfy escrow's requirement for a closed-file summary."
        ],
        correctChoice: 0,
        rationale: "The post-closing audit exists to make the file complete and coherent while events are still fresh. Removing superseded drafts is the opposite of what is wanted: the sequence of versions is often what shows when a term changed and who agreed."
      }
    ]
  },
  "assignment-12": {
    subject: "Property management and leasing practice",
    applied: {
      prompt: "A property manager receives a rental application from an applicant who uses a wheelchair, has a service animal, and receives a housing subsidy. The owner tells the manager: 'No pets, no subsidies, and that unit has two steps at the entry so it won't work for him anyway.' How should the manager respond?",
      choices: [
        "Explain that a service animal is not a pet for this purpose, that the applicant must be evaluated on the same objective criteria as every other applicant, and that a request related to the entry steps is handled as a reasonable accommodation or modification question rather than as a reason to reject.",
        "Follow the owner's instructions, since the owner sets the rental criteria for his own property.",
        "Process the application but apply the owner's pet deposit to the service animal, which treats all animals consistently.",
        "Reject the application on the entry-steps ground alone, since that is a physical characteristic of the unit rather than a decision about the applicant."
      ],
      correctChoice: 0,
      rationale: "Each of the owner's three reasons is a fair-housing problem. A service animal is not subject to a pet policy or pet deposit, screening must apply the same objective criteria to everyone, and the manager may not decide on the applicant's behalf that a unit will not work for him — accessibility is addressed through accommodation and modification, not through exclusion."
    },
    engagement: [
      {
        prompt: "What does a property management agreement primarily establish?",
        choices: [
          "The scope of the manager's authority, the owner's obligations, compensation, and how funds and reporting are handled.",
          "The rent that will be charged for each unit during the management term.",
          "The tenants' rights and obligations under their leases.",
          "The manager's obligation to guarantee full occupancy."
        ],
        correctChoice: 0,
        rationale: "The agreement defines the manager–owner relationship: authority, duties, money, and reporting. Rent levels change over time, tenant obligations live in the leases, and no manager guarantees occupancy."
      },
      {
        prompt: "What is the correct treatment of tenant security deposits held by a broker acting as property manager?",
        choices: [
          "They are funds belonging to others and must be held in the required trust account, kept separate from the broker's own funds, with records that account for every deposit and disbursement.",
          "They may be held in the broker's general operating account provided the total is tracked in the accounting system.",
          "They may be forwarded to the owner immediately, since the deposit belongs to the owner.",
          "They may be held in any account as long as the tenant receives interest."
        ],
        correctChoice: 0,
        rationale: "Deposits are trust funds and commingling them with brokerage funds is a serious violation regardless of how well they are tracked internally. Whether and when funds move to the owner is governed by the agreement and the law, not by convenience."
      },
      {
        prompt: "Which tenant-screening practice is most defensible?",
        choices: [
          "Applying written, objective criteria uniformly to every applicant and documenting how each application was evaluated against them.",
          "Evaluating each applicant individually based on the manager's overall impression during the showing.",
          "Selecting the applicant the current tenants would most likely get along with.",
          "Preferring applicants referred by existing tenants, since referrals have a track record."
        ],
        correctChoice: 0,
        rationale: "Uniform written criteria applied consistently is what makes a decision reviewable and defensible. Impressions, compatibility judgments, and referral preferences all introduce discretion where bias operates, and referral preferences can perpetuate the existing tenant composition."
      },
      {
        prompt: "A tenant reports a plumbing failure that has left the unit without water. What is the manager's obligation?",
        choices: [
          "Respond promptly, because habitability obligations attach to conditions of that kind and delay increases both the tenant's harm and the owner's exposure.",
          "Schedule the repair for the next routine maintenance visit, since the tenant can use other facilities.",
          "Require the tenant to submit the request in writing before any response.",
          "Refer the tenant to the owner, since repair decisions are the owner's."
        ],
        correctChoice: 0,
        rationale: "Loss of water is a habitability matter, not routine maintenance. Written-request formalities and referral to the owner may be part of the process, but neither justifies delaying the response."
      },
      {
        prompt: "What should the manager confirm before entering an occupied unit for a non-emergency repair?",
        choices: [
          "That the required notice has been given for a permitted purpose, at a reasonable time, and that the entry is documented.",
          "That the tenant is home so entry can be observed.",
          "That the owner has authorized the entry in writing.",
          "That the repair cannot reasonably be scheduled for a time the tenant requested."
        ],
        correctChoice: 0,
        rationale: "Lawful entry turns on notice, purpose, and timing. Whether the tenant is present, the owner's separate authorization, and scheduling convenience do not substitute for the notice requirement."
      }
    ],
    remediation: [
      {
        prompt: "An owner instructs the manager to rent only to applicants without children because the property has a pool. What should the manager do?",
        choices: [
          "Refuse the instruction and explain that familial status is protected and that a safety concern is addressed through rules applied to everyone, not through exclusion.",
          "Follow the instruction, since a pool creates a genuine safety risk for children.",
          "Follow the instruction but offer families units at the owner's other properties.",
          "Rent to families but require them to sign a liability waiver for the pool."
        ],
        correctChoice: 0,
        rationale: "A safety rationale does not create an exception to familial status protection, and steering families to other properties is textbook steering. A waiver imposes a condition on one protected group that others do not bear."
      },
      {
        prompt: "A tenant with a disability asks to be moved to a ground-floor unit when one becomes available. How is the request evaluated?",
        choices: [
          "As a reasonable accommodation request, assessed on whether it is reasonable and necessary because of the disability.",
          "As an ordinary transfer request subject to the property's standard waiting list.",
          "As a request that may be denied because the tenant signed a lease for the current unit.",
          "As a request that must be granted immediately regardless of availability."
        ],
        correctChoice: 0,
        rationale: "A disability-related request is evaluated under the accommodation standard rather than routine policy, which is what makes ordinary waiting-list and lease-term answers inadequate. Reasonableness is still part of the assessment, so it is not automatic either."
      },
      {
        prompt: "A manager discovers he has deposited a tenant's rent into the brokerage operating account by mistake. What is the correct response?",
        choices: [
          "Correct the deposit immediately, document the error and the correction, and notify the broker so the trust records reconcile and the cause is addressed.",
          "Transfer the amount at the next scheduled reconciliation, since the totals will balance either way.",
          "Leave it and offset the amount against the next owner disbursement.",
          "Correct it quietly without a record, since the error was unintentional and caused no loss."
        ],
        correctChoice: 0,
        rationale: "Trust accounting is judged by the record as much as by the balance, which is why an unrecorded correction is its own problem. Deferring the fix or netting it against a later disbursement leaves funds misplaced in the meantime."
      },
      {
        prompt: "What is the most important control when a tenancy is being terminated?",
        choices: [
          "Following the required notice type, content, timing, and delivery method exactly, since defects in the notice commonly defeat the termination.",
          "Documenting the tenant's conduct that led to the decision.",
          "Confirming the owner's agreement with the decision in writing.",
          "Ensuring the security deposit accounting is prepared in advance."
        ],
        correctChoice: 0,
        rationale: "Termination procedures are formal and unforgiving, and a good reason delivered by a defective notice fails. The other three are appropriate practices that do not cure a bad notice."
      },
      {
        prompt: "Why should owner reporting be regular and itemized rather than summary?",
        choices: [
          "Because the owner is entitled to an accounting of funds held and handled on his behalf, and itemized records are what make the trust accounting verifiable.",
          "Because owners generally prefer more detail in their monthly statements.",
          "Because itemized reporting reduces the manager's liability for maintenance decisions.",
          "Because lenders require itemized statements for investment properties."
        ],
        correctChoice: 0,
        rationale: "The reporting obligation flows from handling someone else's money: an accounting that cannot be verified is not an accounting. Owner preference, liability, and lender requirements are secondary to that duty."
      }
    ]
  },
  "assignment-13": {
    subject: "Ethics, risk management, and dispute prevention",
    applied: {
      prompt: "A licensee realizes she transposed two digits when she reported the square footage in the listing, and the buyer relied on it in setting his offer. Escrow closes in four days. Her manager suggests waiting: the buyer has an inspection report, the figure came from a public record, and raising it now may kill the transaction. What should she do?",
      choices: [
        "Correct the figure in writing to both sides immediately, notify her broker, and let the buyer decide what to do with accurate information while he still can.",
        "Say nothing, since the figure came from a public record and the buyer had his own opportunity to verify it.",
        "Wait until after closing and offer the buyer a credit if he raises the issue.",
        "Correct it verbally to the buyer's agent so the record is not disturbed."
      ],
      correctChoice: 0,
      rationale: "An error the licensee knows about becomes a misrepresentation the moment she decides to leave it uncorrected, and its value to the buyer depends on reaching him before he is committed. The source of the figure and the buyer's own diligence reduce neither the duty nor the exposure; a verbal correction and a post-closing credit both arrive after the decision they should have informed."
    },
    engagement: [
      {
        prompt: "What distinguishes a negligent misrepresentation from an innocent mistake in practice?",
        choices: [
          "Whether the licensee had a reasonable basis for the statement and whether reasonable care was used before making it.",
          "Whether the licensee intended to deceive the other party.",
          "Whether the other party suffered a financial loss as a result.",
          "Whether the statement concerned a fact the licensee was required to disclose."
        ],
        correctChoice: 0,
        rationale: "The negligence standard asks about the care taken, not the intent behind it — intent distinguishes fraud, and loss goes to damages rather than to whether the statement was negligent."
      },
      {
        prompt: "Which pattern most warrants heightened scrutiny for possible transaction fraud?",
        choices: [
          "Pressure to close unusually quickly combined with unexplained changes in parties, funding sources, or documentation.",
          "A buyer purchasing a property well below the asking price after extended negotiation.",
          "A seller who insists on reviewing every document with an attorney before signing.",
          "A transaction in which the buyer and seller already know each other."
        ],
        correctChoice: 0,
        rationale: "Urgency plus shifting participants or paperwork is the classic combination, because it defeats verification. Aggressive negotiation, legal review, and prior acquaintance are ordinary features of legitimate transactions."
      },
      {
        prompt: "A licensee refers a client to a contractor in which the licensee's spouse holds an ownership interest. What is required?",
        choices: [
          "Disclose the relationship before the client relies on the referral, so the client can weigh it.",
          "Nothing, provided the contractor's pricing is competitive with other bids.",
          "Nothing, since the interest is the spouse's rather than the licensee's.",
          "Disclose the relationship only if the client later asks how the contractor was selected."
        ],
        correctChoice: 0,
        rationale: "A family member's interest is the licensee's conflict for disclosure purposes, and competitive pricing is not a substitute for letting the client evaluate the recommendation. Waiting to be asked defeats the point."
      },
      {
        prompt: "A client sends an angry message alleging that the licensee mishandled a deadline. What is the correct first response?",
        choices: [
          "Notify the broker, preserve all related records, and respond factually without admitting or denying liability before the file has been reviewed.",
          "Respond immediately with a detailed defense so the client's concern does not harden.",
          "Apologize and offer a fee reduction to resolve the matter quickly.",
          "Wait for the client to put the complaint in a formal written demand before responding."
        ],
        correctChoice: 0,
        rationale: "Escalation to the broker and preservation of the record come first, because both a hasty defense and a conciliatory offer can commit the brokerage before anyone knows what happened. Silence until a formal demand arrives generally makes matters worse."
      },
      {
        prompt: "Why is contemporaneous documentation more valuable than a reconstruction prepared after a dispute arises?",
        choices: [
          "A record created as events occurred, with dates and sources, is far more credible than one assembled once the outcome is known.",
            "A reconstruction is inadmissible in any proceeding.",
          "A reconstruction takes longer to prepare than contemporaneous notes.",
          "Contemporaneous notes are protected from disclosure in litigation."
        ],
        correctChoice: 0,
        rationale: "Credibility is the whole point: a record made before anyone knew there would be a dispute carries weight that a later account cannot. Reconstructions are not automatically inadmissible, and notes are not privileged from disclosure."
      }
    ],
    remediation: [
      {
        prompt: "A licensee tells a buyer that a property 'will definitely appreciate' in the next two years. What is the problem?",
        choices: [
          "It states a future outcome as fact when the licensee has no basis to guarantee it, which can be treated as a misrepresentation the buyer relied on.",
          "There is no problem, since predictions about the market are understood to be opinions.",
          "The problem is only that the prediction was not put in writing.",
          "The problem arises only if the property fails to appreciate."
        ],
        correctChoice: 0,
        rationale: "The defect is stating a prediction as a certainty, which is what makes it actionable. Whether it was written and how the market later performed go to proof, not to whether the statement was proper."
      },
      {
        prompt: "A licensee notices that a wire instruction email from escrow has a slightly different reply address than earlier messages. What should happen?",
        choices: [
          "Stop, verify the instructions by calling escrow at an independently known number, and warn the client not to send funds until verified.",
          "Forward the instructions to the client with a note to be careful.",
          "Reply to the email asking escrow to confirm the account details.",
          "Proceed, since escrow's instructions arrived from an address in the existing thread."
        ],
        correctChoice: 0,
        rationale: "Verification must use a channel the fraudster does not control, which is why replying to the suspicious message confirms nothing. Forwarding with a caution and proceeding on thread familiarity both leave the client exposed."
      },
      {
        prompt: "A brokerage's errors and omissions coverage exists primarily to do what?",
        choices: [
          "Respond to claims arising from professional services, within its terms and limits, which makes prompt notice of a potential claim important.",
          "Eliminate the licensee's responsibility for professional errors.",
          "Cover intentional misconduct by licensees in the office.",
          "Replace the need for supervision and documented procedures."
        ],
        correctChoice: 0,
        rationale: "Coverage is bounded by its terms and usually conditioned on timely notice, which is why late reporting can forfeit it. It does not transfer responsibility, generally excludes intentional acts, and is not a substitute for supervision."
      },
      {
        prompt: "Two clients of the same brokerage end up in a dispute over one transaction. What should the brokerage do?",
        choices: [
          "Recognize the conflict, disclose it, and ensure each client can obtain independent advice rather than having the brokerage adjudicate between them.",
          "Have the responsible broker decide the dispute impartially, since he supervises both licensees.",
          "Withdraw from representing both clients immediately without explanation.",
          "Continue representing both and remain neutral on the disputed issue."
        ],
        correctChoice: 0,
        rationale: "A brokerage cannot resolve a dispute between its own clients, however impartial the broker intends to be. Silent withdrawal leaves both clients stranded, and staying in while claiming neutrality abandons the duties owed to each."
      },
      {
        prompt: "When should a licensee refer a matter to an attorney rather than continue advising?",
        choices: [
          "When the question turns on the legal effect of documents, rights, or remedies, which is outside the licensee's scope regardless of her experience.",
          "Only when the client asks whether an attorney is necessary.",
          "Only after a dispute has formally begun.",
          "Only when the brokerage's own liability is at stake."
        ],
        correctChoice: 0,
        rationale: "The trigger is the nature of the question, not the client's request, the stage of the dispute, or whose interests are exposed. Experience does not extend the scope of the license."
      }
    ]
  },
  "assignment-14": {
    subject: "Implicit bias and fair housing participatory practicum",
    applied: {
      prompt: "In the practicum you take the consumer role. Your licensee partner, without being asked, tells you that you would 'be more comfortable' in a different area, shows you three homes there instead of the two you asked about, and mentions that the schools are 'a better fit for your family.' Afterward, in the debrief, your partner says he was genuinely trying to help and meant nothing by it. What is the most accurate analysis?",
      choices: [
        "The conduct is steering regardless of the intent behind it, because the licensee substituted his own assumptions about where the consumer belongs for the consumer's stated criteria — which is exactly why implicit bias is addressed through changed practice rather than through good intentions.",
        "There is no fair housing issue, because the licensee acted in good faith and the consumer was free to insist on the original properties.",
        "The only problem is the school comment; redirecting the search is ordinary professional judgment about the client's needs.",
        "The conduct is a problem only if the consumer belongs to a protected class and can prove the licensee knew it."
      ],
      correctChoice: 0,
      rationale: "This is the core lesson of the practicum. Steering is defined by whose criteria drove the search, not by intent, and implicit bias operates precisely where the licensee experiences his own judgment as helpfulness. Nothing about the consumer's freedom to object, the licensee's good faith, or proof of what he knew changes the effect on the consumer's access to housing."
    },
    engagement: [
      {
        prompt: "What distinguishes implicit bias from explicit bias?",
        choices: [
          "Implicit bias operates automatically and outside conscious awareness, so it can shape behavior in someone who sincerely holds egalitarian views.",
          "Implicit bias is held by institutions while explicit bias is held by individuals.",
          "Implicit bias is unlawful while explicit bias is merely unprofessional.",
          "Implicit bias affects only decisions made under time pressure."
        ],
        correctChoice: 0,
        rationale: "The defining feature is that it operates without awareness, which is why sincerity is not protective. Both kinds are individual and institutional, and time pressure amplifies bias rather than defining it."
      },
      {
        prompt: "What does 'systemic' bias describe in a housing context?",
        choices: [
          "Patterns built into practices, policies, and historical structures that produce unequal outcomes even without any individual acting with bias.",
          "Bias that is shared by a majority of individuals in an industry.",
          "Bias that has been proven in a legal proceeding.",
          "Bias expressed openly rather than privately."
        ],
        correctChoice: 0,
        rationale: "Systemic effects live in structures and can persist through neutral actors, which is what distinguishes them from the sum of individual attitudes. Prevalence, proof, and openness describe individual bias."
      },
      {
        prompt: "Which practice most reliably interrupts bias in day-to-day licensed work?",
        choices: [
          "Applying the same written, objective criteria and the same service steps to every consumer, and documenting how each was handled.",
          "Making a conscious effort to treat everyone fairly at each decision point.",
          "Avoiding any discussion of neighborhoods, schools, or demographics with consumers.",
          "Working primarily with consumers referred by past clients, who are known quantities."
        ],
        correctChoice: 0,
        rationale: "Structure and consistency constrain the discretion in which bias operates; effort alone does not, because implicit bias is not accessible to introspection. Avoiding topics withholds useful information, and referral-only practice tends to reproduce existing patterns."
      },
      {
        prompt: "A consumer asks a licensee to describe the racial composition of a neighborhood. What is the correct response?",
        choices: [
          "Decline to provide it, explain that providing it would risk steering, and direct the consumer to publicly available census information.",
          "Provide the information, since it is publicly available and the consumer requested it directly.",
          "Provide a general impression without specific figures.",
          "Refuse and end the discussion of the neighborhood entirely."
        ],
        correctChoice: 0,
        rationale: "The licensee supplying the information is what makes it steering, even though the data itself is public — which is why pointing to the public source is the right move and a general impression is not. Ending the neighborhood discussion altogether withholds legitimate information."
      },
      {
        prompt: "What is the purpose of the participatory component of this fair housing requirement?",
        choices: [
          "To have students practice recognizing and interrupting bias in realistic interactions, since knowledge of the rules alone does not change behavior under pressure.",
          "To assess whether students hold discriminatory attitudes before licensure.",
          "To document student participation for the course completion record.",
          "To satisfy a requirement that courses include interactive technology."
        ],
        correctChoice: 0,
        rationale: "The requirement is skills-based: the gap it addresses is between knowing the rule and behaving differently in a live interaction. It is not an attitude screen, a recordkeeping device, or a technology mandate."
      }
    ],
    remediation: [
      {
        prompt: "In the role-play a licensee greets two consumers differently: one is offered coffee and a seat, the other is asked immediately whether he is preapproved. Both arrived for the same appointment. What is the concern?",
        choices: [
          "Differential service at the first point of contact can deny one consumer the same opportunity, and it is exactly the kind of automatic behavior that structured, uniform intake is designed to prevent.",
          "There is no concern, since asking about preapproval is a legitimate qualifying question.",
          "The concern is only about courtesy, which is a customer-service matter rather than a compliance one.",
          "The concern arises only if the consumer who was questioned is later denied a showing."
        ],
        correctChoice: 0,
        rationale: "Unequal treatment at intake shapes everything downstream, which is why it is a compliance issue and not a courtesy issue. A legitimate question asked of only one consumer is the problem, and the harm does not wait for a later denial."
      },
      {
        prompt: "After the practicum a student says the exercise was uncomfortable and that he does not believe he has any biases. What is the constructive response?",
        choices: [
          "Note that implicit bias by definition is not available to self-report, so the exercise targets practices and outcomes rather than self-assessment.",
          "Accept the statement, since the student knows his own mind better than an exercise does.",
          "Point out that discomfort itself is evidence that the student holds bias.",
          "Suggest the student repeat the exercise until he reports a different conclusion."
        ],
        correctChoice: 0,
        rationale: "The response has to redirect from self-assessment to practice, because self-report is precisely the instrument implicit bias evades. Treating discomfort as proof, or pressing for a different answer, converts an educational exercise into an accusation."
      },
      {
        prompt: "Which record best demonstrates that a licensee's property recommendations were driven by the consumer's criteria?",
        choices: [
          "A written record of the criteria the consumer stated and the search parameters applied, showing the properties shown followed from them.",
          "The licensee's testimony that she always follows client instructions.",
          "The absence of any complaint from the consumer.",
          "A list of the properties shown, without the criteria that produced it."
        ],
        correctChoice: 0,
        rationale: "The criteria are what make the list meaningful; the list alone shows what happened without showing why. Testimony and the absence of complaints prove nothing about how the selection was made."
      },
      {
        prompt: "A seller's instruction, a buyer's request, and a licensee's own assumption all point toward limiting who sees a property. Which of these may the licensee act on?",
        choices: [
          "None of them, where the limitation is based on protected characteristics; a buyer's own choice of where to look is different from a licensee restricting access.",
          "The buyer's request only, since a consumer may define his own search.",
          "The seller's instruction only, since the seller owns the property.",
          "All three, provided the licensee documents the source of the limitation."
        ],
        correctChoice: 0,
        rationale: "None of the three sources authorizes restricting access on protected characteristics. The distinction the answer preserves is real: a buyer choosing where to search is his own decision, while the licensee limiting who may see a property is exclusion — and documenting the source does not legitimize it."
      },
      {
        prompt: "What should a licensee's fair housing action plan contain to be useful rather than symbolic?",
        choices: [
          "Specific, checkable practices — uniform intake, written criteria, objective information sources, and documentation — rather than a statement of commitment.",
          "A written statement of the licensee's commitment to equal treatment.",
          "A list of the protected classes under federal and California law.",
          "A schedule for attending fair housing continuing education."
        ],
        correctChoice: 0,
        rationale: "A plan changes outcomes only if it changes what is actually done and can be checked afterward. Commitments, class lists, and training schedules are inputs that leave day-to-day practice unchanged."
      }
    ]
  },
  "assignment-15": {
    subject: "Integrated California residential transaction",
    applied: {
      prompt: "You are reviewing a completed file before archiving it. The agency disclosure is signed but dated three days after the listing agreement. The transfer disclosure is signed but has two items left blank. There is an email agreeing to move the closing date, but no signed amendment. The buyer's contingency removal is in the file, undated. The transaction closed and no one has complained. What is the correct assessment?",
      choices: [
        "Each item is a defect that would be visible to a reviewer or in a dispute, and the file should be documented and escalated now — the absence of a complaint does not make an incomplete record complete.",
        "The file is acceptable, because the transaction closed without objection and all required documents are present in some form.",
        "Only the undated contingency removal matters, since the others are documentation formalities.",
        "The defects should be corrected now by dating the removal and completing the blanks so the file is clean before archiving."
      ],
      correctChoice: 0,
      rationale: "All four are real defects: disclosure timing, an incomplete disclosure, an unsigned modification, and an undated notice on which rights depended. The last option is the dangerous one — completing or dating documents after the fact to make a file look clean is falsification, which is far worse than the original gaps."
    },
    engagement: [
      {
        prompt: "In what order do the agency disclosure and the listing agreement occur in a seller representation?",
        choices: [
          "The agency disclosure comes first, so the seller understands the relationship before committing to the listing.",
          "They are executed together, since both establish the relationship.",
          "The listing agreement comes first, and the disclosure confirms the relationship it created.",
          "The order is a matter of office preference."
        ],
        correctChoice: 0,
        rationale: "The disclosure informs the decision, so it must precede the commitment. Simultaneous or later execution gives the seller the information after the choice is made."
      },
      {
        prompt: "A buyer's offer is accepted on Monday. Which sequence correctly reflects the transaction's early structure?",
        choices: [
          "A binding contract exists on acceptance, and the contingency periods begin running under the contract's terms from that point.",
          "The contract becomes binding only when escrow opens and the deposit is delivered.",
          "The contract becomes binding when the buyer's loan is approved.",
          "The contract becomes binding when the seller delivers the transfer disclosure."
        ],
        correctChoice: 0,
        rationale: "Acceptance forms the contract; escrow, funding, and disclosure delivery are performance steps inside it. Contingencies condition performance rather than delay formation."
      },
      {
        prompt: "Which document controls what personal property conveys with the home?",
        choices: [
          "The purchase agreement and any signed amendments, not the listing description or the marketing photographs.",
          "The listing description, since that is what the buyer relied on when making the offer.",
          "The final walkthrough checklist completed before closing.",
          "The escrow instructions prepared by the escrow holder."
        ],
        correctChoice: 0,
        rationale: "The parties' signed agreement governs. Marketing material may create expectations and even liability for misrepresentation, but it does not set the contract terms, and escrow instructions implement the contract rather than define it."
      },
      {
        prompt: "At which point does a residential transaction most commonly generate a dispute that the file must answer?",
        choices: [
          "Around deadlines and notices — whether something was delivered, to whom, and when.",
          "At the initial pricing discussion with the seller.",
          "During the selection of the escrow and title companies.",
          "At the signing of the listing agreement."
        ],
        correctChoice: 0,
        rationale: "Delivery and timing questions are what contracts make consequential and what memories dispute, which is why proof of notices is the backbone of a defensible file."
      },
      {
        prompt: "What is the purpose of a compliance audit of a completed transaction file?",
        choices: [
          "To confirm the file is complete, internally consistent, and able to show what was done and when, so that it can answer questions later.",
          "To confirm that the brokerage was paid the correct compensation.",
          "To satisfy the escrow holder's file-closing requirements.",
          "To identify which licensee should be credited with the transaction."
        ],
        correctChoice: 0,
        rationale: "The audit is about evidentiary completeness and coherence. Compensation, escrow's requirements, and internal credit are administrative matters that do not test whether the file can answer a later question."
      }
    ],
    remediation: [
      {
        prompt: "A buyer's agent presents an offer without having provided the agency disclosure to the listing side. When should it have been provided?",
        choices: [
          "Before or at the time the offer was presented, so the seller knows whom the presenting agent represents while evaluating it.",
          "Within a reasonable time after the offer is accepted.",
          "Only if the seller asks who the agent represents.",
          "At the opening of escrow, along with the other transaction documents."
        ],
        correctChoice: 0,
        rationale: "The disclosure is tied to the moment the seller evaluates the offer. Acceptance, a request from the seller, and escrow opening all come after the decision it was meant to inform."
      },
      {
        prompt: "Escrow's instructions and the purchase agreement conflict on the closing date. Which governs, and what should happen?",
        choices: [
          "The parties' agreement governs, and the discrepancy should be reconciled in writing between the parties with corrected instructions to escrow.",
          "The escrow instructions govern, since escrow controls the closing.",
          "Whichever document was signed most recently governs automatically.",
          "The discrepancy is immaterial as long as both dates fall in the same week."
        ],
        correctChoice: 0,
        rationale: "Escrow implements the parties' agreement rather than superseding it, so the fix runs through the parties. Recency does not automatically resolve a conflict between different instruments, and a date discrepancy is exactly what disputes are made of."
      },
      {
        prompt: "A file contains a disclosure signed by the buyer but no evidence of when he received it. Why does that matter?",
        choices: [
          "Because rights and deadlines may run from delivery, so without a delivery date the file cannot show whether the buyer's response period was honored.",
          "Because an undated signature is invalid.",
          "Because escrow cannot close without a dated disclosure.",
          "It does not matter, since the signature proves the buyer received it."
        ],
        correctChoice: 0,
        rationale: "The signature proves receipt but not when, and timing is what the rights depend on. The signature is not invalid, and the gap is a proof problem rather than a closing obstacle."
      },
      {
        prompt: "Which sequence correctly orders a residential transaction's core compliance events?",
        choices: [
          "Agency disclosure, representation agreement, offer and acceptance, disclosure delivery and investigation, contingency removal, closing, then file audit and retention.",
          "Offer and acceptance, agency disclosure, representation agreement, contingency removal, disclosure delivery, closing.",
          "Representation agreement, offer and acceptance, closing, disclosure delivery, contingency removal, file audit.",
          "Agency disclosure, offer and acceptance, contingency removal, disclosure delivery, closing, representation agreement."
        ],
        correctChoice: 0,
        rationale: "Relationship first, then agreement, then contract, then the information the buyer needs before he gives up his contingencies, then closing and retention. Each wrong sequence puts a decision before the information meant to inform it."
      },
      {
        prompt: "A licensee discovers a missing document while auditing a closed file. What is the correct action?",
        choices: [
          "Note the gap, obtain the missing document if it legitimately exists, and escalate to the broker if it does not — without creating or backdating anything.",
          "Recreate the document from the transaction records and date it to match the transaction.",
          "Leave the file as it is, since the transaction has closed and cannot be changed.",
          "Remove the related documents so the file does not show an inconsistency."
        ],
        correctChoice: 0,
        rationale: "A gap honestly recorded is survivable; a manufactured document is not. Recreating with a matching date is falsification, and removing surrounding records to hide the inconsistency is worse still. Doing nothing at least avoids compounding it, but it forfeits the chance to obtain a document that may genuinely exist."
      }
    ]
  }
};

export default { courseId: "ca-real-estate-practice-45", version: "1.0", assignments };
