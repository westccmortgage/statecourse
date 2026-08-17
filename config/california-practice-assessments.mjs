const RAW = [
  {
    applied: {
      prompt: "A new salesperson receives a seller's instruction to publish a listing immediately, but the responsible broker has not reviewed the file or authorized the advertising. What should the salesperson do?",
      correct: "Pause publication, preserve the seller's instruction, and obtain the responsible broker's review and authorization before performing the licensed activity.",
      distractors: [
        "Publish the listing because the seller, rather than the broker, owns the property.",
        "Ask an unlicensed assistant to publish it so the salesperson is not personally responsible.",
        "Publish it temporarily and obtain the broker's approval after the first buyer inquiry."
      ],
      rationale: "A California salesperson performs licensed activity only through the responsible broker. A principal's urgency does not eliminate supervision, advertising, or file-control requirements."
    },
    engagement: {
      prompt: "Which statement correctly distinguishes a California broker from a salesperson?",
      correct: "A salesperson may perform licensed acts only while affiliated with and under the supervision of a responsible broker; a broker may conduct licensed brokerage activity independently.",
      distractors: [
        "A salesperson may independently conduct brokerage activity after completing pre-license education.",
        "A broker and salesperson have identical authority, but a broker pays a higher renewal fee.",
        "A salesperson may accept compensation directly from any principal who signs a written agreement."
      ],
      rationale: "Pre-license education is not a license. California DRE explains that a salesperson may not perform licensed acts without a responsible broker."
    },
    remediation: {
      prompt: "An unlicensed assistant is asked to discuss a property's asking price and persuade a buyer to make an offer. What is the correct response?",
      correct: "The assistant must not perform the requested licensed activity; the matter must be handled by an appropriately licensed person under broker supervision.",
      distractors: [
        "The assistant may do so if the buyer already toured the property with a licensee.",
        "The assistant may negotiate as long as compensation is hourly rather than commission-based.",
        "The assistant may discuss price but may not prepare a written offer."
      ],
      rationale: "Unlicensed personnel may provide administrative support but may not perform acts requiring a real estate license. Compensation method does not convert licensed activity into clerical work."
    }
  },
  {
    applied: {
      prompt: "A team wants to use a prospect list that excludes neighborhoods based on the team's assumptions about language and culture. What should the supervising broker require?",
      correct: "Use documented, neutral business criteria that are applied consistently and review the campaign for fair-housing, advertising, privacy, and contact-rule compliance.",
      distractors: [
        "Approve the list because prospecting is not part of a real estate transaction.",
        "Use the list only for social media, where fair-housing standards do not apply.",
        "Let each salesperson decide which neighborhoods seem most appropriate for each group."
      ],
      rationale: "Prospecting and service systems must use lawful, objective criteria. Selective access based on protected characteristics or proxies can create discriminatory treatment."
    },
    engagement: {
      prompt: "What is the strongest compliance purpose of a written brokerage policy manual?",
      correct: "It translates law and broker standards into repeatable procedures, assigns responsibility, defines escalation, and creates evidence of reasonable supervision.",
      distractors: [
        "It transfers all legal responsibility from the broker to individual salespersons.",
        "It allows customary office practice to override statutory requirements.",
        "It eliminates the need for transaction-specific judgment and broker review."
      ],
      rationale: "A policy manual supports supervision and consistency but cannot replace current law or the broker's transaction-specific judgment."
    },
    remediation: {
      prompt: "A salesperson discovers that an approved advertisement contains an unverified claim about permitted property use. What should happen next?",
      correct: "Stop or correct the advertisement, notify the broker, verify the claim through a reliable source, and retain the original and corrected versions in the advertising record.",
      distractors: [
        "Leave the advertisement online until a consumer complains.",
        "Add the phrase 'buyer to verify' and keep every other statement unchanged.",
        "Delete the original advertisement and all related records so it cannot be misunderstood."
      ],
      rationale: "Truthful advertising requires verification and prompt correction. Preserving versions and the corrective action supports supervision and an auditable record."
    }
  },
  {
    applied: {
      prompt: "A listing broker begins advising a buyer about offer price while still representing the seller. Before acting as an agent for both principals, what is required?",
      correct: "The agency relationships and dual-agency implications must be disclosed, and the legally required informed consent must be obtained and documented.",
      distractors: [
        "Nothing further is required because both parties know the same brokerage is involved.",
        "Only the seller must consent because the listing agreement was signed first.",
        "Consent can wait until closing if neither party objects during escrow."
      ],
      rationale: "Dual agency is not created safely by assumption. California requires disclosure and consent, and confidentiality limits continue to matter."
    },
    engagement: {
      prompt: "Which information ordinarily remains protected when a broker represents both buyer and seller?",
      correct: "Confidential bargaining information, such as the seller's willingness to accept less or the buyer's willingness to pay more, unless disclosure is authorized or legally required.",
      distractors: [
        "Every known material fact affecting the property's value or desirability.",
        "The existence of the dual-agency relationship itself.",
        "All deadlines written in the purchase agreement."
      ],
      rationale: "Dual agency limits advocacy and protects each principal's confidential bargaining position, while material disclosure and contract duties still apply."
    },
    remediation: {
      prompt: "A buyer asks the dual agent, 'What is the lowest price the seller will take?' What is the best response?",
      correct: "Explain the agent's limited role and confidentiality duty, decline to reveal unauthorized bargaining information, and help the buyer evaluate an offer using lawful market evidence.",
      distractors: [
        "Reveal the seller's bottom line because the buyer is also a client.",
        "Give an intentionally high estimate to protect the seller.",
        "End the agency relationship immediately without discussing alternatives."
      ],
      rationale: "The dual agent must not use one principal's confidential bargaining information for the other. The agent may explain process and objective evidence."
    }
  },
  {
    applied: {
      prompt: "A seller signs a listing agreement, but the property description and exclusion of a rented solar system are incomplete. What should the agent do before marketing?",
      correct: "Resolve the property and authority information, document the solar obligation, complete required disclosures, and obtain broker review before publishing representations.",
      distractors: [
        "Market immediately because the listing agreement contains the seller's signature.",
        "Describe the solar system as owned unless a buyer specifically asks.",
        "Use the assessor's parcel number as a substitute for every missing fact."
      ],
      rationale: "A signed form does not cure incomplete authority or material property facts. Marketing should begin from a verified and supervised file."
    },
    engagement: {
      prompt: "What is the primary function of a listing agreement?",
      correct: "It establishes the broker's employment and authority, identifies the property and term, and states duties, compensation, and material conditions of the relationship.",
      distractors: [
        "It transfers title from the seller to the broker for the listing term.",
        "It guarantees that the property will sell at the listed price.",
        "It replaces all statutory disclosures required in the later transaction."
      ],
      rationale: "The listing agreement is an employment and authority document. It does not transfer ownership, promise a sale, or replace required disclosures."
    },
    remediation: {
      prompt: "A listing expires while negotiations with a prospect continue. What must the licensee review before claiming compensation or continuing to act?",
      correct: "The written listing terms, any protection clause and notice requirements, broker authority, the negotiation history, and any new written authorization.",
      distractors: [
        "Only whether the salesperson personally introduced the prospect.",
        "Whether the seller verbally promised to pay before expiration.",
        "Whether the prospect is willing to close within the same calendar year."
      ],
      rationale: "Authority and compensation depend on the agreement and facts. Expiration requires careful review rather than an assumption that earlier activity preserves authority."
    }
  },
  {
    applied: {
      prompt: "A seller insists that the list price be based only on a neighbor's asking price. How should the licensee respond?",
      correct: "Explain the difference between asking and closed-sale evidence, prepare a documented comparative analysis using genuinely comparable properties, and record the seller's final pricing decision.",
      distractors: [
        "Use the neighbor's price because sellers control every statement in advertising.",
        "Refuse the listing unless the seller accepts the exact price produced by the licensee.",
        "Represent the asking price as an appraisal to strengthen the marketing position."
      ],
      rationale: "Professional pricing advice distinguishes evidence from objectives and preserves the basis, limitations, and client's ultimate decision."
    },
    engagement: {
      prompt: "Which comparable usually provides the strongest indication of current market value?",
      correct: "A recent arm's-length closed sale that is physically, legally, and locationally similar, with supportable adjustments for meaningful differences.",
      distractors: [
        "The highest active listing in the broader county.",
        "A distressed sale selected only because its price supports the desired conclusion.",
        "Any property with the same bedroom count, regardless of condition or location."
      ],
      rationale: "Comparable selection and adjustments must be evidence-based. Active listings show competition but not an agreed closed-market result."
    },
    remediation: {
      prompt: "When preparing a seller net estimate, which approach is most reliable?",
      correct: "State the assumed sale price, itemize verified or clearly labeled estimated payoffs and costs, show the calculation, date the estimate, and explain that figures may change.",
      distractors: [
        "Subtract only the brokerage compensation because escrow will calculate everything else.",
        "Round all uncertain costs to zero so the seller sees the best possible outcome.",
        "Call the estimate a guaranteed net because the mathematics is correct."
      ],
      rationale: "A net sheet is a decision aid, not a guarantee. Assumptions, source dates, and variable charges must be visible."
    }
  },
  {
    applied: {
      prompt: "A digitally altered listing image removes power lines and changes the apparent view. What should the licensee do under California's 2026 advertising rules?",
      correct: "Provide the required clear disclosure of the material digital alteration, make the original unaltered image available, and obtain broker review before use.",
      distractors: [
        "Use the image without disclosure because the property itself was not physically changed.",
        "Label the image 'enhanced' but refuse to provide the original.",
        "Use the image only on social media, where real estate advertising rules do not apply."
      ],
      rationale: "Beginning in 2026, California Business and Professions Code section 10140.8 addresses materially digitally altered property images and access to the original."
    },
    engagement: {
      prompt: "A first-point-of-contact solicitation by a California licensee generally must make which information clear as required by law?",
      correct: "The licensee's identity and license identification information, together with responsible-broker identification where required.",
      distractors: [
        "Only the team's marketing name and social-media handle.",
        "Only the property's address and proposed price.",
        "The licensee's personal investment holdings and commission split."
      ],
      rationale: "California imposes identification requirements on solicitation materials. Team or branding language cannot obscure the licensed parties."
    },
    remediation: {
      prompt: "A seller asks the agent to advertise that a neighborhood is 'perfect for young families.' What is the best response?",
      correct: "Decline the demographic message and replace it with accurate, objective property and location facts that do not express a protected-class preference.",
      distractors: [
        "Use the phrase because age and familial status never apply to real estate advertising.",
        "Use the phrase only in private email campaigns.",
        "Use the phrase if the seller signs an instruction accepting responsibility."
      ],
      rationale: "A principal cannot authorize discriminatory advertising. Objective property facts serve consumers without expressing who belongs in the neighborhood."
    }
  },
  {
    applied: {
      prompt: "A buyer asks to see homes only in neighborhoods with 'people like us.' How should the buyer's agent respond?",
      correct: "Clarify lawful, objective housing criteria such as price, features, commute, and location boundaries without selecting or describing neighborhoods by protected-class composition.",
      distractors: [
        "Use demographic data privately but avoid mentioning it in writing.",
        "Ask the listing agents which areas best match the buyer's background.",
        "Comply because buyer-directed steering is not the agent's responsibility."
      ],
      rationale: "The professional must not participate in steering. The agent should translate the search into objective criteria controlled by the consumer."
    },
    engagement: {
      prompt: "What should a buyer consultation establish before property selection begins?",
      correct: "The representation relationship, objective needs and priorities, financing assumptions, material constraints, communication plan, and decision process.",
      distractors: [
        "A promise that every property shown is free from defects.",
        "The agent's authority to waive contingencies without later consent.",
        "A neighborhood ranking based on the residents' protected characteristics."
      ],
      rationale: "A documented consultation improves agency clarity and objective selection without guaranteeing property condition or delegating buyer decisions."
    },
    remediation: {
      prompt: "A buyer with a mobility disability requests a showing accommodation. What is the appropriate professional response?",
      correct: "Engage in a prompt, respectful process to arrange reasonable access without unnecessary medical inquiry, while coordinating safety and property authorization.",
      distractors: [
        "Decline because every prospect must use exactly the same showing procedure.",
        "Require the buyer to disclose a complete medical history before scheduling.",
        "Refer the buyer only to properties already labeled accessible."
      ],
      rationale: "Consistent service includes appropriately addressing disability-related accommodation rather than imposing identical procedures that deny access."
    }
  },
  {
    applied: {
      prompt: "A buyer wants the agent to remove the inspection contingency before the buyer has reviewed the inspection report. What should the agent do?",
      correct: "Explain the contingency's function and timing, identify the unresolved information and consequences, document the buyer's informed decision, and obtain broker guidance when needed.",
      distractors: [
        "Remove it immediately because contingencies only protect sellers.",
        "Refuse to present any offer containing fewer than all customary contingencies.",
        "Promise that the buyer can restore the contingency later without seller consent."
      ],
      rationale: "The buyer controls the decision after an accurate explanation. The licensee must not minimize risk or promise a unilateral reversal."
    },
    engagement: {
      prompt: "When does a counteroffer generally create a binding agreement?",
      correct: "When its terms are accepted as required and acceptance is communicated or delivered in the manner and time required by the documents and applicable law.",
      distractors: [
        "When the counteroffer is drafted, even before the other party receives it.",
        "When the listing agent says the parties are close enough on price.",
        "Automatically at the stated expiration time if no rejection was received."
      ],
      rationale: "A counteroffer changes proposed terms and requires valid acceptance. Silence or drafting alone ordinarily does not establish agreement."
    },
    remediation: {
      prompt: "Two counteroffers cross in email and contain different closing dates. What is the correct file-control response?",
      correct: "Stop assumptions, identify each version and timestamp, compare the terms, confirm what was signed and delivered, and obtain clear written agreement before treating the transaction as formed.",
      distractors: [
        "Use the earlier closing date because it is more efficient.",
        "Combine the favorable provisions from both versions into one presumed agreement.",
        "Ask escrow to select the controlling version after opening the file."
      ],
      rationale: "Version control and evidence of assent are essential. The licensee must not manufacture agreement from inconsistent documents."
    }
  },
  {
    applied: {
      prompt: "The agent observes a persistent ceiling stain, while the seller states that no leak has ever occurred. What should the agent do?",
      correct: "Document the observation, disclose the known material fact as required, avoid diagnosing the cause, and recommend appropriate investigation rather than concealing the conflict.",
      distractors: [
        "Accept the seller's statement and omit the stain from all communications.",
        "Diagnose a roof failure and estimate the complete repair cost.",
        "Paint the area before showings so buyers evaluate the property without distraction."
      ],
      rationale: "A licensee distinguishes observation from expert diagnosis. A known material condition should not be hidden merely because its cause is disputed."
    },
    engagement: {
      prompt: "What is the best distinction between disclosure and investigation?",
      correct: "Disclosure communicates known material facts; investigation obtains additional evidence through inspections, records, specialists, or other authorized diligence.",
      distractors: [
        "Disclosure guarantees the condition, while investigation transfers ownership.",
        "Investigation is required only after closing, while disclosure occurs before listing.",
        "They are identical terms for completing a seller questionnaire."
      ],
      rationale: "The agent's disclosure duty and the parties' investigation rights interact but are not the same process."
    },
    remediation: {
      prompt: "A report identifies possible foundation movement outside the agent's expertise. What should the agent say?",
      correct: "Accurately transmit the report, explain the transaction deadline, avoid interpreting engineering conclusions, and recommend review by an appropriate professional.",
      distractors: [
        "Tell the buyer the movement is cosmetic because most buildings settle.",
        "Discard the report if the inspector will not guarantee the conclusion.",
        "Estimate the structural repair and advise the buyer to rely on that estimate."
      ],
      rationale: "Competence includes recognizing professional boundaries and preserving the consumer's opportunity to obtain qualified advice."
    }
  },
  {
    applied: {
      prompt: "A buyer asks the real estate agent to guarantee that the buyer will qualify for a particular loan and interest rate. What is the best response?",
      correct: "Explain that loan terms and approval are determined by the lender from verified information, coordinate deadlines, and avoid representing an estimate or prequalification as a guarantee.",
      distractors: [
        "Guarantee approval if the buyer's credit score exceeds the agent's preferred threshold.",
        "Advise the buyer to omit debts that do not appear on the initial credit report.",
        "Remove the financing contingency because a prequalification is equivalent to final approval."
      ],
      rationale: "Financing representations must distinguish estimates, prequalification, underwriting, conditions, and final approval."
    },
    engagement: {
      prompt: "Why must an agent carefully monitor financing and appraisal deadlines?",
      correct: "Because missed dates can affect contingency rights, deposit risk, closing feasibility, and the parties' available contractual choices.",
      distractors: [
        "Because the agent, rather than the lender, makes the final credit decision.",
        "Because every appraisal automatically changes the purchase price.",
        "Because financing deadlines eliminate the need for written amendments."
      ],
      rationale: "The agent coordinates the contract chronology but does not underwrite the loan or unilaterally change contract terms."
    },
    remediation: {
      prompt: "The lender issues a conditional approval with several unresolved conditions one day before a contingency deadline. How should the agent characterize it?",
      correct: "As conditional rather than final, identify the outstanding conditions and deadline, communicate with the client and broker, and document any requested extension or informed contingency decision.",
      distractors: [
        "As final approval because the word 'approval' appears in the notice.",
        "As a loan denial that automatically cancels the transaction.",
        "As confidential information that must never be discussed with the buyer."
      ],
      rationale: "Conditional approval is not the same as clear-to-close. Precise communication lets the client evaluate the contract risk."
    }
  },
  {
    applied: {
      prompt: "The estimated closing statement differs materially from the purchase agreement's allocation of a credit. What should the agent do?",
      correct: "Compare the documents, notify the client, escrow holder, and broker, obtain a documented correction or authorized amendment, and do not assume the discrepancy will resolve itself.",
      distractors: [
        "Tell the client to sign because closing statements are never final.",
        "Change the escrow statement personally without informing the parties.",
        "Ignore the difference if the total purchase price is correct."
      ],
      rationale: "Closing review reconciles the contract, amendments, lender instructions, title, prorations, and settlement figures before funds and documents become final."
    },
    engagement: {
      prompt: "What is escrow's central role in a typical California transaction?",
      correct: "To act as a neutral stakeholder carrying out mutually agreed written instructions, handling documents and funds, and closing when the conditions are satisfied.",
      distractors: [
        "To advocate exclusively for the buyer in every dispute.",
        "To decide which party should receive disputed funds without authority.",
        "To replace title review, broker supervision, and the parties' contract."
      ],
      rationale: "Escrow follows authorized instructions as a neutral stakeholder; it does not become a party's negotiator or rewrite the agreement."
    },
    remediation: {
      prompt: "The seller wants to give keys before closing in exchange for a verbal promise that the buyer assumes all risk. What should the licensee do?",
      correct: "Explain that early possession changes material risk and responsibility, require broker review and appropriate written agreement, and coordinate insurance, utilities, condition, and escrow implications.",
      distractors: [
        "Deliver the keys because possession is unrelated to the purchase contract.",
        "Ask the buyer to send a text accepting risk and treat that as complete protection.",
        "Let the agents decide privately without involving the principals."
      ],
      rationale: "Possession outside the ordinary closing sequence creates significant legal and practical issues that require documented, supervised handling."
    }
  },
  {
    applied: {
      prompt: "A property manager receives a tenant security deposit payable to the brokerage. What is the first compliance priority?",
      correct: "Follow the governing agreement and current trust-fund rules for prompt handling, segregation, records, authorization, and reconciliation under broker supervision.",
      distractors: [
        "Deposit it into the manager's personal account until the tenant moves in.",
        "Use it temporarily for property repairs because the money relates to the same property.",
        "Return it to the tenant because a brokerage may never receive rental funds."
      ],
      rationale: "Funds belonging to others require controlled handling and records. Personal or operating use can create commingling or conversion risk."
    },
    engagement: {
      prompt: "Which record best supports a property manager's monthly accounting to an owner?",
      correct: "A reconciled ledger supported by bank records, receipts, invoices, leases, authorized disbursements, and a clear owner statement for the reporting period.",
      distractors: [
        "A verbal estimate of rent collected and expenses paid.",
        "A list of checks without the corresponding bank or property ledger.",
        "The manager's operating-account balance alone."
      ],
      rationale: "Property management accounting must connect each receipt and disbursement to the owner, property, authority, and reconciled account."
    },
    remediation: {
      prompt: "An owner instructs the manager to reject applicants who use housing assistance. What should the manager do?",
      correct: "Pause the instruction, consult current California fair-housing and source-of-income requirements with the broker, apply lawful written screening criteria consistently, and document the response.",
      distractors: [
        "Follow the instruction because the owner bears all legal responsibility.",
        "Use a higher income multiple only for applicants receiving assistance.",
        "Stop accepting applications so the policy cannot be challenged."
      ],
      rationale: "The manager cannot implement a discriminatory instruction. Broker supervision and current California requirements control the screening process."
    }
  },
  {
    applied: {
      prompt: "A salesperson discovers after acceptance that the listing agent misstated a material property feature. What is the best immediate response?",
      correct: "Notify the responsible broker, preserve the evidence, correct the representation through an authorized documented communication, and protect the affected parties' opportunity to evaluate available choices.",
      distractors: [
        "Wait until closing so the transaction is not disrupted.",
        "Delete the earlier message and send a new description without explanation.",
        "Tell the buyer the mistake is immaterial because it was unintentional."
      ],
      rationale: "Risk management favors prompt, supervised correction and a preserved audit trail rather than concealment or unilateral conclusions about materiality."
    },
    engagement: {
      prompt: "Which file characteristic most improves dispute prevention?",
      correct: "A chronological record connecting verified facts, disclosures, instructions, versions, decisions, delivery evidence, and follow-up actions.",
      distractors: [
        "Removing all internal notes after closing.",
        "Keeping only the final purchase agreement and no communications.",
        "Using verbal instructions so no preliminary disagreement appears in writing."
      ],
      rationale: "A reconstructable file supports service, supervision, correction, and later review. It should preserve rather than erase the decision path."
    },
    remediation: {
      prompt: "A client demands that the licensee conceal a known material fact. What is the correct professional boundary?",
      correct: "The licensee must not participate in concealment, should explain the disclosure obligation, involve the broker, document the instruction and response, and withdraw when continued representation cannot be lawful.",
      distractors: [
        "Follow the instruction because fiduciary loyalty overrides disclosure law.",
        "Conceal the fact only from unrepresented parties.",
        "Remain silent and let inspectors discover the condition independently."
      ],
      rationale: "Fiduciary loyalty does not authorize unlawful concealment. Broker escalation and documented lawful boundaries protect the consumer and licensee."
    }
  },
  {
    applied: {
      prompt: "During a role-play, an agent offers different service levels after assuming one consumer is less financially sophisticated because of accent and appearance. What should the observer identify?",
      correct: "An unverified assumption affecting service; the agent should reset to the same documented intake questions, objective criteria, options, and follow-up standards used for similarly situated consumers.",
      distractors: [
        "A harmless attempt to personalize service that requires no correction.",
        "A lawful financial qualification decision based on direct lender evidence.",
        "A fair-housing concern only if the consumer submits a written complaint."
      ],
      rationale: "Implicit bias can change service before an explicit discriminatory statement occurs. Structured criteria and observation make the decision process reviewable."
    },
    engagement: {
      prompt: "What is the purpose of a bias-interruption step in a real estate workflow?",
      correct: "To pause intuition-driven decisions, identify the facts and criteria being used, compare treatment, and correct unsupported differences before they affect housing opportunity.",
      distractors: [
        "To prohibit all professional discretion in every transaction.",
        "To collect protected-class data for marketing segmentation.",
        "To substitute a disclaimer for fair and consistent service."
      ],
      rationale: "Bias interruption adds a decision checkpoint. It does not eliminate judgment; it makes judgment evidence-based and consistent."
    },
    remediation: {
      prompt: "A colleague says, 'That buyer probably will not qualify, so we should not spend time showing the property.' No lender evidence supports the statement. What should happen?",
      correct: "Challenge the unsupported assumption, return to the same objective qualification and service process, document relevant facts, and escalate repeated unequal treatment to supervision.",
      distractors: [
        "Accept the prediction because experienced agents develop accurate intuition.",
        "Ask about the buyer's national origin before deciding.",
        "Avoid making a record so the comment cannot create liability."
      ],
      rationale: "Objective criteria and equal service should replace unsupported assumptions. Documentation and supervision are part of the corrective process."
    }
  },
  {
    applied: {
      prompt: "In the integrated transaction, the buyer's financing is conditional, a disclosure addendum is unsigned, and the contingency deadline is today. What is the best first action?",
      correct: "Create a verified issue-and-deadline list, notify the broker and client, coordinate the missing records, explain available contract choices without guaranteeing an outcome, and document instructions before the deadline.",
      distractors: [
        "Remove the contingency so the seller does not cancel.",
        "Assume the unsigned disclosure was accepted because the buyer received it.",
        "Wait for escrow to decide which issue is most important."
      ],
      rationale: "Integrated practice requires issue triage, supervision, precise communication, and documented client decisions rather than unilateral action."
    },
    engagement: {
      prompt: "Which sequence best describes a defensible California residential transaction file?",
      correct: "Identity and authority; agency and intake; property and financing facts; offer and acceptance; disclosures and investigation; contingencies and amendments; escrow, title, closing, possession, and retained records.",
      distractors: [
        "Advertising; verbal acceptance; key delivery; disclosures after closing.",
        "Loan application; appraisal; listing agreement; buyer consultation after acceptance.",
        "Escrow opening; property search; agency disclosure only if a dispute arises."
      ],
      rationale: "The integrated chronology links authority, documents, decisions, and deadlines from first contact through closing and record retention."
    },
    remediation: {
      prompt: "At final file review, two documents show different buyer names and one amendment lacks delivery evidence. What should the licensee do?",
      correct: "Treat the file as unresolved, verify identity and document versions, obtain authorized correction or confirmation, preserve the discrepancy and resolution, and complete broker review before final reliance.",
      distractors: [
        "Use the spelling appearing most often and discard the other document.",
        "Assume delivery because the amendment contains a signature.",
        "Close first and correct the archive after the deed records."
      ],
      rationale: "Final review is an exception-control process. Inconsistencies must be resolved and documented before they become embedded in closing or compliance records."
    }
  }
];

function rotate(items, offset) {
  const size = items.length;
  return items.map((_, index) => items[(index - offset + size) % size]);
}

export function getPracticeAssessment(assignmentSequence, kind) {
  const item = RAW[assignmentSequence - 1]?.[kind];
  if (!item) return null;
  const source = [item.correct, ...item.distractors];
  const choices = rotate(source, (assignmentSequence + (kind === "applied" ? 1 : kind === "remediation" ? 2 : 0)) % source.length);
  return {
    prompt: item.prompt,
    choices,
    correctChoice: choices.indexOf(item.correct),
    rationale: item.rationale
  };
}

export const PRACTICE_ASSESSMENT_COUNT = RAW.length * 3;
