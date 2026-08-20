/**
 * Virginia Principles and Practices of Real Estate (60 class hours) — module question bank.
 *
 * 18VAC135-20-400 lists the twenty-five subjects a principles and practices course must include
 * and sets a floor of sixty class hours. It prescribes no assessment, no passing score, and no
 * hour allocation. The items here are therefore a StateCourse instructional standard, not a Board
 * requirement, and every document stating the 80 percent engagement threshold must say so.
 *
 * These items are NOT the monitored final assessment. The final is administered after the
 * sixtieth instructional hour, outside instructional time, under
 * `virginia/compliance/monitored-final-exam-sop.md`, and its bank is held in
 * `virginia/assessments/` and is never published. These items gate progression through the
 * course and are visible to the student by design.
 *
 * Each of the fifteen Course Day modules carries:
 *   applied      — one scenario item worked inside the module
 *   engagement   — five scored items
 *   remediation  — five alternate items on the same rules, served after a failed engagement
 *                  check alongside the alternate explanation
 *
 * Every item's correct answer sits at index 0 here for authoring legibility. The engine permutes
 * choices deterministically per item id before delivery, so what a student sees is not ordered by
 * correctness and a recorded selection keeps its meaning permanently.
 *
 * Rationales cite the section the rule comes from, and every section cited was read directly from
 * law.lis.virginia.gov on 2026-08-20 and recorded in
 * `virginia/regulatory/primary-text-readings.md`. Where the primary text has not been read, the
 * item does not ask for the figure — it asks where the figure lives.
 *
 * Course version 1.0 submission draft — not approved. No Virginia pre-license credit is available.
 */

const modules = {
  "module-01": {
    subject: "The market, the product, and what is being sold",
    applied: {
      prompt: "A seller conveys the surface of a parcel by deed and expressly reserves the mineral rights. A buyer's licensee is asked what the seller conveyed and what the seller kept.",
      choices: [
        "The seller conveyed real property — land and improvements together with a defined subset of the legal interests in them — and retained the mineral rights, which are themselves real property.",
        "The seller conveyed real estate and retained personal property, because severed mineral rights become chattels.",
        "The seller conveyed a defeasible fee, because the reservation is a condition on the grant.",
        "The seller conveyed nothing until the deed is recorded, because recording is what transfers title."
      ],
      correctChoice: 0,
      rationale: "Real property is real estate plus the legal interests in it, and the bundle of rights is separable: a grantor may convey some interests and retain others without either share ceasing to be real property. A reservation is not a condition, so no defeasible fee arises, and title passes on delivery rather than on recording."
    },
    engagement: [
      {
        prompt: "Which of the three terms adds the legal interests a person may hold?",
        choices: [
          "Real property — it is real estate plus the interests that may be possessed, used, transferred, encumbered, or excluded.",
          "Real estate — it is land plus the interests attached to it.",
          "Land — it includes the surface, the space above, and the subsurface interests.",
          "All three mean the same thing and the distinction is only academic."
        ],
        correctChoice: 0,
        rationale: "Land is physical; real estate is land plus permanent attachments; real property adds the legal interests. The rest of the course operates on the third term, because what a licensee markets is a set of rights rather than the bricks."
      },
      {
        prompt: "A large employer announces 3,000 jobs in a locality where construction takes two years. Over the next six months, what does the market do and why?",
        choices: [
          "Prices rise and vacancy falls, because supply is effectively fixed in the short run so a demand increase shows up almost entirely as price.",
          "Prices stay level while builders increase supply to meet the new demand.",
          "Prices fall, because a larger population increases the number of properties for sale.",
          "Nothing changes for at least two years, because the market cannot respond until new units are delivered."
        ],
        correctChoice: 0,
        rationale: "Immobility and the construction lag mean the existing stock cannot expand quickly. The adjustment is in price rather than quantity, and the delayed supply response is the mechanism that produces the cycle."
      },
      {
        prompt: "Which is stronger evidence of a property's value?",
        choices: [
          "A closed arm's-length sale of a comparable property four months ago.",
          "An identical house next door listed last week at the seller's chosen price.",
          "The locality's assessed value for taxation.",
          "An automated valuation model estimate from a public website."
        ],
        correctChoice: 0,
        rationale: "A closed sale records a price a buyer paid and a seller accepted. An active listing is an unaccepted offer, an assessment is an administrative figure produced for taxation on an assessment cycle, and an automated model cannot see condition or unrecorded work."
      },
      {
        prompt: "A seller screwed a bookcase, cut to fit an alcove exactly, into the studs. The contract is silent. Who takes it and what decides?",
        choices: [
          "The buyer, because the item is a fixture — adaptation to this specific property together with objective intention controls, and method of annexation supports it.",
          "The seller, because personal property remains the seller's unless the contract says otherwise.",
          "The seller, because the seller's stated intention after the fact controls the fixture test.",
          "It is divided, because a custom item is a trade fixture."
        ],
        correctChoice: 0,
        rationale: "Intention is the controlling factor and is judged objectively; method of annexation and adaptation are evidence of it. An item cut to fit a specific alcove evidences an intention to make it permanent. A trade fixture is installed by a tenant for a business, which this is not."
      },
      {
        prompt: "Why is a ZIP code a poor definition of a market area?",
        choices: [
          "Because a market area is bounded by whatever actually changes buyer behaviour — school zones, rivers, jurisdictional lines — and a ZIP code is a mail-delivery convenience that frequently spans several of them.",
          "Because ZIP codes change too often to be reliable.",
          "Because ZIP codes are not published in a form the multiple listing service can use.",
          "Because a market area must always be a single subdivision."
        ],
        correctChoice: 0,
        rationale: "The boundary of a market area is an evidentiary question about competition for the same buyers, not an administrative one. Starting from a ZIP code because the software offers it begins the analysis with an error."
      }
    ],
    remediation: [
      {
        prompt: "A buyer asks whether the standing timber on a wooded lot is included in the sale of the land. What is it, before it is cut?",
        choices: [
          "Real estate, because it is permanently attached to the land by nature; cutting it severs it into personal property.",
          "Personal property, because timber is a harvestable commodity.",
          "A trade fixture, because it can be removed for commercial use.",
          "An emblement, because it grows on the land."
        ],
        correctChoice: 0,
        rationale: "Standing timber is part of the real estate; severance converts it to personal property. Emblements are annual crops produced by a tenant's labour, which timber is not."
      },
      {
        prompt: "Which physical characteristic of land explains why national housing statistics are close to useless for advising an individual seller?",
        choices: [
          "Immobility — a parcel cannot be moved, so demand in one place cannot be met from another and markets are local.",
          "Scarcity — there is a fixed total quantity of land.",
          "Durability — the stock changes slowly.",
          "Uniqueness — no two parcels are identical."
        ],
        correctChoice: 0,
        rationale: "All four characteristics matter, but immobility is the one that makes markets local, makes location dominate value, and makes an aggregate figure a poor description of any particular market."
      },
      {
        prompt: "Months of inventory in a market rises from 2.1 to 7.4 over a year. What does the figure describe?",
        choices: [
          "The number of months it would take to sell everything now on the market at the current pace — a shift from a seller's market toward a buyer's market.",
          "The average number of months a property has been listed.",
          "The number of months of construction currently underway.",
          "A regulatory measure of market health published by the locality."
        ],
        correctChoice: 0,
        rationale: "Months of inventory is active listings divided by average monthly closed sales. The commonly quoted six-month balance point is a rule of thumb from national data, not a rule of law, and it varies by market and price band."
      },
      {
        prompt: "A licensee tells a client, 'the median price in the county rose 8 percent, so your house is worth 8 percent more.' What is wrong?",
        choices: [
          "A median describes a mix of properties, so a change in the median can be entirely a change in what sold rather than a change in any individual property's value.",
          "Nothing is wrong; the median is the standard measure of individual property value.",
          "The licensee should have used the mean, which is more accurate.",
          "The licensee should have used months of inventory instead."
        ],
        correctChoice: 0,
        rationale: "Aggregates hide the property. If more large houses sold this quarter, the median rose without any individual property becoming more valuable. Under § 54.1-2131 A 4 the duty is ordinary care, and an unsupported inference about value fails it."
      },
      {
        prompt: "Which of these is a licensee qualified to do?",
        choices: [
          "Present market evidence and explain the range it supports, while referring legal, tax, inspection and lending questions to the appropriate professional.",
          "Estimate value for a lender in support of a loan.",
          "Advise a client on the tax consequences of a sale.",
          "Determine whether a proposed use complies with the zoning ordinance."
        ],
        correctChoice: 0,
        rationale: "The licence permits real estate brokerage services. It does not make the licensee an appraiser, an accountant, or a zoning administrator, and a large part of licensee discipline consists of people who forgot that."
      }
    ]
  },

  "module-02": {
    subject: "Estates, ownership, private rights, and public control",
    applied: {
      prompt: "A grants Blackacre 'to B for life, then to C.' A dies, then B dies. A buyer's licensee is asked who owns Blackacre at each stage.",
      choices: [
        "B held a life estate and C a vested remainder in fee simple; A retained nothing, so A's death changed nothing; on B's death C's remainder became possessory.",
        "A retained a reversion, so on B's death the property returned to A's heirs and C took nothing.",
        "B held a fee simple determinable and C a possibility of reverter.",
        "C held a life estate pur autre vie measured by B's life."
      ],
      correctChoice: 0,
      rationale: "The grant disposed of the entire estate, so no reversion was retained. Had it read only 'to B for life', A would have kept a reversion and A's heirs would take on B's death."
    },
    engagement: [
      {
        prompt: "Two unmarried siblings hold title as joint tenants with right of survivorship. One sells their interest to a stranger. What results?",
        choices: [
          "The buyer takes as a tenant in common with the remaining sibling, and there is no survivorship between them.",
          "The sale is void, because a joint tenant may not convey without the other's consent.",
          "The buyer becomes a joint tenant, because the survivorship language runs with the title.",
          "The remaining sibling takes the whole immediately by survivorship."
        ],
        correctChoice: 0,
        rationale: "A conveyance destroys the unities of time and title as to that share, so the transferee takes as a tenant in common. Survivorship would only have operated had the sibling died still owning."
      },
      {
        prompt: "Which form of concurrent ownership is available only to spouses and generally protects the property from a creditor of one spouse alone?",
        choices: [
          "Tenancy by the entirety.",
          "Joint tenancy with right of survivorship.",
          "Tenancy in common.",
          "Community property."
        ],
        correctChoice: 0,
        rationale: "Tenancy by the entirety treats spouses as a single owner, carries survivorship, and neither may convey or encumber alone. Virginia is not a community property state, so a student working from a national text should know that term does not describe Virginia title."
      },
      {
        prompt: "A neighbour says the seller has always let them cut across the back corner. Nothing is recorded and nothing was written. What is it most likely to be, and what is the risk?",
        choices: [
          "Most likely a licence — personal and revocable — but long, open, continuous and hostile use could have ripened into a prescriptive easement, which is a legal determination on facts nobody has established.",
          "An easement appurtenant, because the use benefits the neighbour's parcel.",
          "An encroachment, because the neighbour is using land they do not own.",
          "Nothing at all, because an interest in land must be recorded to exist."
        ],
        correctChoice: 0,
        rationale: "A licence is permission, personal and revocable, and not an interest in land. Prescription can create an easement without any recording. The licensee's job is to disclose the conversation as a material fact actually known and route the question to the title examiner, a surveyor and counsel — not to decide whether the neighbour has a right."
      },
      {
        prompt: "A recorded 1948 covenant restricts sale of the lot to persons of a particular race. What must a Virginia licensee do?",
        choices: [
          "Treat it as void and unenforceable, and neither honour it nor attempt to honour it — § 36-96.3 A 6 makes honouring or attempting to honour such a covenant an unlawful discriminatory housing practice.",
          "Disclose it to the buyer and enforce it, because recorded covenants run with the land.",
          "Ask the association whether it wishes to waive the covenant in this instance.",
          "Refuse the listing, because the covenant makes the title unmarketable."
        ],
        correctChoice: 0,
        rationale: "§ 36-96.3 A 6 makes it unlawful to include such a covenant in a transfer, sale, rental or lease, or for any person to honour or exercise, or attempt to honour or exercise, one. Historic racial covenants remain physically present in many Virginia chains of title; they are unenforceable, and repeating them as though they operated would itself be a violation."
      },
      {
        prompt: "A buyer wants to run an animal-care business from a house in a district permitting only single-family dwellings and a listed set of home occupations that does not include animal care. The lot is unusually narrow. Which relief mechanism fits?",
        choices: [
          "None of the usual ones — only a rezoning or a text amendment reaches a use the ordinance does not permit, and that is a legislative act with no guarantee of success.",
          "A variance, because the narrow lot creates a hardship arising from the property itself.",
          "A special use permit, because animal care is a conditional use in every residential district.",
          "A nonconforming use, because the buyer will begin the use immediately."
        ],
        correctChoice: 0,
        rationale: "A variance relieves a bulk or dimensional requirement, not a use prohibition; a special use permit authorises a use the ordinance lists as permissible subject to conditions; a nonconforming use must have been lawful when established. The licensee's correct action is to refer the buyer to the zoning administrator in writing before the buyer relies on the intended use."
      }
    ],
    remediation: [
      {
        prompt: "A deed conveys land 'so long as it is used as a public library.' What estate is created and what does the grantor retain?",
        choices: [
          "A fee simple determinable, and the grantor retains a possibility of reverter — title returns automatically if the use ceases.",
          "A fee simple subject to a condition subsequent, and the grantor retains a right of re-entry that must be exercised.",
          "A life estate measured by the library's operation.",
          "A fee simple absolute, because a stated purpose does not limit a grant."
        ],
        correctChoice: 0,
        rationale: "Durational language — 'so long as', 'while', 'until' — creates a determinable fee ending automatically. Conditional language — 'but if', 'provided that', 'on condition that' — creates a condition subsequent requiring the grantor to act."
      },
      {
        prompt: "Which government power takes private property for public use and pays just compensation?",
        choices: [
          "Eminent domain, executed through a condemnation proceeding.",
          "Police power, which regulates use for health, safety and welfare.",
          "Escheat, which returns property to the Commonwealth.",
          "Taxation, which is backed by a lien and ultimately by sale."
        ],
        correctChoice: 0,
        rationale: "The four powers are police power, eminent domain, taxation and escheat. Police power regulates without compensation because nothing is taken; eminent domain takes and compensates."
      },
      {
        prompt: "A use was lawful when established and a later ordinance amendment made it non-compliant. What is it, and what should a licensee marketing the property never assume?",
        choices: [
          "A nonconforming use — and the licensee must never assume the right survives a change of ownership, an expansion, or a period of vacancy; that is a question for the zoning administrator in writing.",
          "A variance, which runs with the land permanently.",
          "A special use permit, which the new owner inherits automatically.",
          "An illegal use that must be discontinued at settlement."
        ],
        correctChoice: 0,
        rationale: "Nonconforming uses are generally allowed to continue but typically may not be expanded and may be lost on abandonment or destruction. Answering a zoning question from memory is how licensees create liability."
      },
      {
        prompt: "Where zoning permits a use and a recorded restrictive covenant forbids it, which governs the owner?",
        choices: [
          "The covenant, as a matter of private obligation — private restrictions can be stricter than zoning and are enforced privately, by an association or a neighbour.",
          "The zoning ordinance, because public law overrides private agreement.",
          "Whichever was recorded first.",
          "Neither, because the conflict makes both unenforceable."
        ],
        correctChoice: 0,
        rationale: "Covenants are private law. The locality does not enforce them and the ordinance does not repeal them; an owner is bound by both, and must satisfy the stricter."
      },
      {
        prompt: "A subdivision's final plat has not been recorded. A developer offers to sell 'Lot 14'. What is the problem?",
        choices: [
          "A lot does not exist until the plat is recorded, so there is nothing with a legal description to sell.",
          "Nothing, provided the preliminary plat has been approved by the planning commission.",
          "The lot exists but cannot be financed until the improvements are bonded.",
          "The lot exists but may not be advertised until the streets are dedicated."
        ],
        correctChoice: 0,
        rationale: "The recorded final plat is what legally creates the lots. Selling from an unrecorded preliminary plan is selling something with no legal description, which is the identification problem Hour 9 addresses."
      }
    ]
  },

  "module-03": {
    subject: "Describing land, conveying it, and proving title",
    applied: {
      prompt: "A deed calls for 'S 12° 00′ 00″ W, 320 feet to a large oak tree at the edge of the branch'. A modern survey finds the oak stump at 344 feet. A buyer asks which is right.",
      choices: [
        "The monument controls over the stated distance under the ordinary rule that monuments prevail over courses and distances — and the discrepancy is a title and survey matter to be put in front of the surveyor and the title examiner, not resolved by the licensee.",
        "The stated distance controls, because a deed's written terms govern over physical objects.",
        "The description fails entirely, because it does not close.",
        "The buyer and the adjoining owner must split the difference."
      ],
      correctChoice: 0,
      rationale: "Monuments prevail because a monument is what a person on the ground can actually find, and the parties fixed the boundary by reference to it. The licensee's role is to route the question, not to answer it."
    },
    engagement: [
      {
        prompt: "A grantor signs and acknowledges a deed, locks it in a safe deposit box, tells no one, and dies two years later. Did title pass?",
        choices: [
          "No — delivery with present intent to pass title is missing, and signature and acknowledgment make the instrument recordable without transferring anything.",
          "Yes — a signed and acknowledged deed is effective on execution.",
          "Yes, but only from the date the deed was found.",
          "No, because the deed was never recorded and recording is what transfers title."
        ],
        correctChoice: 0,
        rationale: "A deed takes effect on delivery. Recording gives constructive notice to the world; it is not the transfer. The property instead passes under the grantor's will or by intestate succession."
      },
      {
        prompt: "Which deed warrants title against defects arising at any time, including before the grantor owned the property?",
        choices: [
          "A general warranty deed.",
          "A special warranty deed.",
          "A quitclaim deed.",
          "A deed in lieu of foreclosure."
        ],
        correctChoice: 0,
        rationale: "A special warranty deed warrants only against defects arising during the grantor's own ownership; a quitclaim warrants nothing and conveys whatever the grantor has, which may be nothing."
      },
      {
        prompt: "A buyer twice sees a family living in the detached guest cottage. The seller calls them 'friends staying a while' and no lease is recorded. What kind of notice does the buyer have?",
        choices: [
          "Inquiry notice — visible possession by someone other than the seller obliges a reasonable purchaser to investigate, and the buyer is charged with whatever a proper inquiry would have revealed.",
          "No notice, because nothing is recorded.",
          "Constructive notice, because possession is a recorded fact.",
          "Actual notice, because the seller made a statement about the occupants."
        ],
        correctChoice: 0,
        rationale: "Possession is notice. The licensee must disclose the observed occupancy as a material fact actually known and insist the question go in writing to the seller and the settlement agent — not accept the seller's characterisation as settling it."
      },
      {
        prompt: "A title commitment's Schedule B-I lists 'obtain and record a certificate of satisfaction for the 2011 deed of trust'. What is that?",
        choices: [
          "A requirement — an action that must be completed before the policy issues, with an owner and a deadline.",
          "An exception — a risk the insurer declines to cover.",
          "An exclusion — a printed category removed from every policy of this form.",
          "An endorsement extending coverage."
        ],
        correctChoice: 0,
        rationale: "Schedule B-I carries requirements, which are action items; Schedule B-II carries exceptions, which are risks the buyer keeps. Exclusions are printed in the policy form and remove whole categories such as zoning and eminent domain."
      },
      {
        prompt: "After closing, a buyer discovers the neighbour's garage sits three feet inside the boundary. The commitment excepted 'matters that an accurate survey would disclose'. Is the buyer covered?",
        choices: [
          "No — an encroachment is exactly the kind of matter an accurate survey would disclose, and it was excepted; the buyer should have obtained a survey during the contract period or sought extended coverage removing the exception.",
          "Yes — encroachments are a title defect and are always covered by an owner's policy.",
          "Yes — the lender's policy covers it and the buyer is a named insured on it.",
          "No — because title insurance covers physical condition rather than boundaries."
        ],
        correctChoice: 0,
        rationale: "Standard policies except survey matters and rights of parties in possession. Title insurance covers no physical condition at all, and a lender's policy protects the lender rather than the buyer."
      }
    ],
    remediation: [
      {
        prompt: "Which element of a valid deed is supplied by the grantee?",
        choices: [
          "None — the grantee does not sign a deed; acceptance is presumed where the conveyance benefits the grantee.",
          "The signature, which both parties must provide.",
          "The acknowledgment before a notary.",
          "The legal description."
        ],
        correctChoice: 0,
        rationale: "A deed requires a competent grantor, an identifiable grantee, a recital of consideration, words of conveyance, an adequate legal description, the grantor's signature, and delivery and acceptance. The grantee's signature is not among them."
      },
      {
        prompt: "Why is acknowledgment before a notary obtained on a Virginia deed?",
        choices: [
          "Because it is generally required to record the deed, and an unrecordable deed is a practical disaster even though the deed may be valid between the parties without it.",
          "Because a deed is void without it.",
          "Because it substitutes for delivery.",
          "Because it converts a quitclaim into a warranty deed."
        ],
        correctChoice: 0,
        rationale: "Acknowledgment is a recording requirement rather than a validity requirement between the parties, and recording is what gives constructive notice to the world."
      },
      {
        prompt: "A searcher finds a conveyance out from someone who never appears anywhere as a grantee. What has been found?",
        choices: [
          "A gap in the chain of title — often the result of an unrecorded deed, an unrecorded probate, or a name change.",
          "A cloud, which is any recorded instrument casting doubt on title.",
          "An encumbrance running with the land.",
          "A defect that title insurance cannot address."
        ],
        correctChoice: 0,
        rationale: "A gap is a break in the succession; a cloud is a recorded instrument or claim casting doubt without necessarily defeating title. Both are cleared by curative work or, where nothing else will do, a quiet title action."
      },
      {
        prompt: "A buyer pays for the lender's title policy and declines the owner's policy. What have they bought?",
        choices: [
          "Protection for the lender's security interest, in the amount of the loan and declining as it is repaid — nothing for themselves.",
          "Protection for both parties, since the lender's policy names the borrower.",
          "Protection for themselves that converts to the lender on default.",
          "Nothing at all, because a lender's policy is not issued in a purchase transaction."
        ],
        correctChoice: 0,
        rationale: "A lender's policy insures the lender only. A buyer who declines the owner's policy has purchased protection for someone else, and correcting that misunderstanding is part of the licensee's ordinary care."
      },
      {
        prompt: "Which legal description system is NOT used in Virginia?",
        choices: [
          "The rectangular or government survey system of principal meridians, base lines, townships and sections.",
          "Metes and bounds.",
          "Lot and block by reference to a recorded plat.",
          "Reference to a recorded condominium plat with elevations."
        ],
        correctChoice: 0,
        rationale: "Virginia is not a public land survey state. A student should understand the rectangular system's arithmetic for a national examination — a quarter of a quarter section is 40 acres — but should not expect it in a Virginia deed."
      }
    ]
  },

  "module-04": {
    subject: "Liens, taxes, and the law of contracts",
    applied: {
      prompt: "A property sells at a foreclosure sale under a deed of trust recorded in 2019. Also of record: unpaid current-year real property taxes, a judgment docketed in 2021, and a second deed of trust recorded in 2022.",
      choices: [
        "Taxes are paid first by statutory priority regardless of date, then the 2019 first deed of trust; the 2021 judgment and the 2022 deed of trust are junior to the foreclosing lien and are extinguished as to the property, whether or not any surplus reaches them.",
        "The liens are paid strictly in recording order, so taxes are paid last.",
        "All four liens survive the sale and the purchaser takes subject to each.",
        "The judgment takes priority over both deeds of trust because a judgment is a general lien."
      ],
      correctChoice: 0,
      rationale: "Real property tax liens carry statutory priority conferred by statute rather than by recording date. Junior liens are extinguished as to the property, though the underlying debts may survive against the debtor personally — which is why a purchaser at a foreclosure sale needs counsel."
    },
    engagement: [
      {
        prompt: "Why is a mechanic's lien the most dangerous lien for a buyer of a recently improved property?",
        choices: [
          "Because of relation back — its priority is generally measured from an earlier date tied to the commencement of work rather than from filing, so a lien filed after closing can outrank a deed of trust recorded before it.",
          "Because it attaches to all of the debtor's property rather than to one parcel.",
          "Because it cannot be released once filed.",
          "Because it takes priority over real property taxes."
        ],
        correctChoice: 0,
        rationale: "Virginia's mechanics' lien scheme is in Title 43 with strict deadlines and formalities. The warning sign a licensee must act on is recent or ongoing construction on a property being sold — a question for the settlement agent and counsel, every time."
      },
      {
        prompt: "A property is assessed at $412,000 in a locality with a rate of $0.89 per $100. What is the annual tax?",
        choices: [
          "$3,666.80.",
          "$36,668.00.",
          "$366.68.",
          "$4,120.00."
        ],
        correctChoice: 0,
        rationale: "$412,000 ÷ 100 = 4,120 hundreds; 4,120 × $0.89 = $3,666.80. Expressed in mills the same rate is 8.9 mills, and $412,000 × 0.0089 gives the same answer."
      },
      {
        prompt: "A licensee tells a buyer, 'the assessment is $412,000, so it's worth at least that.' What is wrong?",
        choices: [
          "Assessed value is an administrative figure produced on an assessment cycle for taxation and is not evidence of market value; presenting it as such is a misrepresentation under 18VAC135-20-300.",
          "Nothing — assessed value is the locality's official determination of market value.",
          "The licensee should have used the prior year's assessment.",
          "The licensee should have said 'at most' rather than 'at least'."
        ],
        correctChoice: 0,
        rationale: "Assessment practice is set by the locality and the figure is produced for taxation. A licensee should also never tell a buyer the tax will stay at the seller's level, because assessments commonly change after a sale."
      },
      {
        prompt: "An oral agreement to buy a house, fully agreed on every term, is what?",
        choices: [
          "Unenforceable — the statute of frauds requires a contract for an interest in land to be in writing and signed by the party to be charged.",
          "Void, because a land contract requires a writing to exist at all.",
          "Voidable at either party's option.",
          "Valid and enforceable, since all four contract elements are present."
        ],
        correctChoice: 0,
        rationale: "The four elements may all be present and the contract still not be enforceable in court. Void means no legal effect ever; voidable means one party may disaffirm; unenforceable means valid on its face but not enforceable."
      },
      {
        prompt: "A seller counteroffers. While the counteroffer is outstanding, a second buyer submits a written offer. What must the licensee do with the second offer?",
        choices: [
          "Present it to the seller promptly — § 54.1-2131 A 2 c requires timely presentation of written offers even when the property is already under contract, and 18VAC135-20-300 3 makes failure to tender promptly every written offer a misrepresentation or omission.",
          "Hold it until the counteroffer expires, since only one negotiation may be open at a time.",
          "Return it to the buyer's agent, because a counteroffer is an exclusive negotiation.",
          "Present it only if the licensee believes it is competitive."
        ],
        correctChoice: 0,
        rationale: "Every written offer goes to the client, including one the licensee thinks is insulting. Whether the seller may accept it is a separate question; whether it must be presented is not."
      }
    ],
    remediation: [
      {
        prompt: "Classify a judgment lien in all three dimensions.",
        choices: [
          "Involuntary, statutory, and general — it attaches to all of the debtor's real property in the jurisdiction, including property acquired later.",
          "Voluntary, statutory, and specific.",
          "Involuntary, equitable, and specific.",
          "Voluntary, equitable, and general."
        ],
        correctChoice: 0,
        rationale: "A deed of trust, by contrast, is voluntary and specific. A judgment against a seller shows up in the title search and must be satisfied at closing."
      },
      {
        prompt: "An owner refinances a first deed of trust while a home equity line remains recorded. Why does the new lender require a subordination agreement?",
        choices: [
          "Because without it the equity line would advance to first position when the old first is released, and the new lender would be in second.",
          "Because the equity line must be closed before a refinance.",
          "Because subordination converts the equity line into a general lien.",
          "Because statutory priority requires it whenever two liens exist."
        ],
        correctChoice: 0,
        rationale: "Priority ordinarily runs from recording, so releasing the senior lien promotes the junior one. A recorded subordination agreement is how a lienholder agrees to take a lower position than recording order would give."
      },
      {
        prompt: "A borrower pays off a deed of trust in full but nothing is recorded. What is the consequence?",
        choices: [
          "The lien remains of record as a cloud on title until a certificate of satisfaction is recorded — one of the most common defects a title examination reveals.",
          "The lien is automatically extinguished by payment and nothing further is needed.",
          "The lien converts to a judgment lien.",
          "The lien remains enforceable and the lender may still foreclose."
        ],
        correctChoice: 0,
        rationale: "Payment alone does not clear the record, and clearing a paid-off deed of trust can require locating a lender that has been acquired twice since."
      },
      {
        prompt: "A sales contract has been ratified and settlement is three weeks away. Classify it.",
        choices: [
          "Valid and executory — all elements are present and performance remains outstanding.",
          "Valid and executed, because both parties have signed.",
          "Voidable, because either party may still terminate.",
          "Unenforceable until settlement occurs."
        ],
        correctChoice: 0,
        rationale: "The industry uses 'executed' loosely to mean signed; the legal meaning is performed, and examinations use the legal meaning."
      },
      {
        prompt: "Annual tax $3,570, paid in arrears, settlement 15 September, 365-day year, settlement day charged to the buyer. What is the seller's share and which side does it fall on?",
        choices: [
          "$2,513.67 — a debit to the seller and a credit to the buyer, because the buyer will pay the whole bill when it comes due.",
          "$2,513.67 — a debit to the buyer and a credit to the seller.",
          "$1,056.33 — a debit to the seller and a credit to the buyer.",
          "$2,677.50 — a debit to the seller, computed on nine full months."
        ],
        correctChoice: 0,
        rationale: "$3,570 ÷ 365 = $9.7808 daily; 1 January to 14 September is 257 days; 257 × $9.7808 = $2,513.67. Taxes in arrears mean the seller owes the buyer. The day count and the settlement-day rule come from the contract, not from habit."
      }
    ]
  }
};

export default modules;
