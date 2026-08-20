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
  },

  "module-05": {
    subject: "The sales contract, disclosure, and the start of agency",
    applied: {
      prompt: "A ratified contract sets settlement for 30 October, a financing contingency expiring 15 November, and a ten-day inspection period from a 2 October ratification. What must the licensee do?",
      choices: [
        "Raise both problems in writing immediately — the financing contingency expires after settlement, which is incoherent — and route them to the parties for correction by written amendment, without deciding what the conflicting dates legally mean.",
        "Tell the client that the earlier date always controls and proceed.",
        "Redraft the financing clause so the dates are consistent.",
        "Do nothing, because a contingency that expires after settlement simply lapses."
      ],
      correctChoice: 0,
      rationale: "Issue-spotting incompleteness and inconsistency is within a licensee's competence and is what ordinary care under § 54.1-2131 A 4 requires. What a clause means, and what a party should do about it, are not — § 54.1-2101.1 limits the licensee to assisting with contract forms as the statute permits."
    },
    engagement: [
      {
        prompt: "A buyer asks whether a Virginia seller must tell them about problems with the house. What is the accurate answer?",
        choices: [
          "No — § 55.1-703 is a buyer-beware statute under which the owner furnishes a Real Estate Board statement saying the owner makes no representations and advising the purchaser to exercise whatever due diligence they deem necessary.",
          "Yes — the seller must complete a condition checklist covering the roof, plumbing, electrical and known defects.",
          "Yes, but only for defects the seller has actually repaired.",
          "Only if the buyer requests the disclosure in writing before making an offer."
        ],
        correctChoice: 0,
        rationale: "Virginia does not use the condition-checklist model most states use. The section is headed 'Required disclosures for buyer to beware; buyer to exercise necessary due diligence', and it names home inspection, mould assessment, energy analysis, survey and contacting the locality as examples of that diligence."
      },
      {
        prompt: "A listing licensee knows the county has approved a plan to widen the road in front of the property. Does § 54.1-2131 B require disclosure of it to a prospective buyer?",
        choices: [
          "No — the statute expressly provides that 'physical condition of the property' does not refer to matters relating to highways or public streets, so the physical-condition duty does not reach it; the licensee must still treat the buyer honestly and should state what is known and direct them to the locality.",
          "Yes — any known fact affecting value must be disclosed under § 54.1-2131 B.",
          "Yes — road plans are improvements to the land within the meaning of the section.",
          "No, and the licensee may deny knowledge of it if asked."
        ],
        correctChoice: 0,
        rationale: "The statute draws three exclusions: matters outside the boundaries or relating to adjacent properties, governmental land use regulations, and highways or public streets. Toward the seller, who is the client, the road plan is a material fact of actual knowledge and § 54.1-2131 A 6 requires it be disclosed."
      },
      {
        prompt: "For target housing built before 1978, what must a seller give a purchaser in addition to the disclosure and the pamphlet?",
        choices: [
          "A ten-day opportunity to conduct a risk assessment or inspection for lead-based paint, unless the parties agree in writing to a different period.",
          "A five-day right of rescission.",
          "A certificate that the property is free of lead-based paint.",
          "Nothing further; the pamphlet satisfies the rule."
        ],
        correctChoice: 0,
        rationale: "The federal requirement also includes the prescribed warning statement and acknowledgments in the contract and any available records and reports. The licensee is obliged to ensure compliance and to retain the signed acknowledgment, and the seller cannot waive it."
      },
      {
        prompt: "Before entering any brokerage relationship, § 54.1-2136 requires a licensee to advise a prospective client of what two things?",
        choices: [
          "The type of brokerage relationship proposed by the broker, and the broker's compensation and whether it will be shared with another broker who may have a relationship with another party.",
          "The firm's licence number and the supervising broker's contact information.",
          "The brokerage agreement's termination date and the fee.",
          "The property's condition and the seller's asking price."
        ],
        correctChoice: 0,
        rationale: "Both, before the relationship begins — not at the end of the listing appointment and not at the contract. § 54.1-2140 separately provides that paying compensation creates no brokerage relationship, which is why the compensation arrangement must be explained up front."
      },
      {
        prompt: "A buyer's inspection reveals a failing HVAC system and the buyer asks, 'can we cancel and get our deposit back?' What does the licensee do?",
        choices: [
          "Read the inspection contingency with the buyer, identify what it permits, the deadline, and the required form of notice, and make sure the buyer acts within the period — without advising whether the deposit is returnable or whether the seller is in breach.",
          "Tell the buyer they may cancel because a failing system is a material defect.",
          "Tell the buyer to wait and see whether the seller offers a repair.",
          "Send a termination notice on the buyer's behalf."
        ],
        correctChoice: 0,
        rationale: "Whether termination is available and whether the deposit is returnable are legal conclusions for counsel. A contingency period allowed to lapse without notice may be deemed satisfied or waived, so protecting the deadline is the licensee's contribution."
      }
    ],
    remediation: [
      {
        prompt: "Under § 54.1-2137 C, what happens to a written brokerage agreement that states no termination date?",
        choices: [
          "It terminates 90 days after the date of the agreement.",
          "It continues until either party gives written notice.",
          "It is void for uncertainty.",
          "It continues for one year by default."
        ],
        correctChoice: 0,
        rationale: "§ 54.1-2137 C also requires the agreement to state the amount of the brokerage fees and how and when they are paid, and the services to be rendered; § 54.1-2110.1 B 6 requires the supervising broker's name and contact information."
      },
      {
        prompt: "When must a licensee engaged by a buyer enter into a brokerage agreement with that buyer?",
        choices: [
          "Prior to showing property to the prospective buyer — § 54.1-2132 A 1.",
          "Before presenting an offer.",
          "Within three days of the first showing.",
          "At any time before settlement."
        ],
        correctChoice: 0,
        rationale: "This is the most distinctive rule in the article and the one licensees from other states most often get wrong. In Virginia the agreement comes before the showing."
      },
      {
        prompt: "What survives the termination, expiration, or completion of a brokerage relationship under § 54.1-2137 D?",
        choices: [
          "Two duties only — to account for all money and property relating to the relationship, and to keep confidential the client's personal and financial information and anything else the client asked be kept confidential.",
          "All of the duties in § 54.1-2131 A, indefinitely.",
          "Nothing at all; the relationship ends completely.",
          "Only the duty of ordinary care."
        ],
        correctChoice: 0,
        rationale: "Unless the law provides otherwise or the client consents in writing to release. Confidentiality does not expire with the listing, and it is the duty most likely to surface years later."
      },
      {
        prompt: "A deposit is received by the firm. Where must it go?",
        choices: [
          "Into a federally insured escrow account in the firm's licensed name, labelled escrow at the financial institution, whose balance must be sufficient at all times to account for all funds held.",
          "Into the firm's operating account, with the amount tracked on the transaction ledger.",
          "To the seller, who is the party entitled to it on ratification.",
          "To the settlement agent immediately, regardless of what the contract says."
        ],
        correctChoice: 0,
        rationale: "18VAC135-20-181 A 1 sets the account requirements and A 2 names earnest money deposits among the funds that must be deposited. The principal broker is responsible for the account and must hold signatory authority."
      },
      {
        prompt: "What is the difference between an addendum and an amendment?",
        choices: [
          "An addendum is attached at the time of contracting and forms part of the original agreement; an amendment changes an existing contract and requires the assent of all parties.",
          "An addendum changes an existing contract; an amendment is attached at the time of contracting.",
          "They are two words for the same document.",
          "An addendum is binding and an amendment is advisory."
        ],
        correctChoice: 0,
        rationale: "A contingency is a third thing again: a condition that must be satisfied or waived before a duty becomes absolute."
      }
    ]
  },

  "module-06": {
    subject: "Virginia brokerage relationships, licensing, and discipline",
    applied: {
      prompt: "A supervising broker assigns Licensee A to the seller and Licensee B to the buyer in the same residential transaction. The buyer asks Licensee B whether the seller would take less. Licensee A knows; the supervising broker knows.",
      choices: [
        "This is designated agency under § 54.1-2139.1: A may disclose client confidences only to their own broker, the supervising broker is a dual agent or representative and may not pass information between the sides, and written consent from both clients is required, timed under 18VAC135-20-220 A 3.",
        "The supervising broker may tell Licensee B, because information within one firm is not confidential between its licensees.",
        "This is dual agency, and once both clients consent the licensees may share freely.",
        "Licensee B may ask Licensee A directly, since designated agents are permitted to consult one another."
      ],
      correctChoice: 0,
      rationale: "Designated agency is not dual agency so long as no designated agent represents more than one client — but the supervising broker is expressly a dual agent or representative, and the statutory disclosure form acknowledges that the dual agent may not pass confidences between the sides."
    },
    engagement: [
      {
        prompt: "What standard of care does § 54.1-2131 A 4 impose on a licensee engaged by a seller?",
        choices: [
          "Ordinary care — and § 54.1-2144 abrogates the common law of agency to the extent inconsistent, so a fiduciary standard imported from national material does not govern.",
          "The utmost fiduciary care owed by an agent to a principal.",
          "Strict liability for any loss the client suffers.",
          "Whatever standard the brokerage agreement specifies."
        ],
        correctChoice: 0,
        rationale: "A Virginia brokerage-relationship question is answered from §§ 54.1-2130 through 54.1-2146, not from general agency doctrine. Where a national text and the Code differ, the Code governs in Virginia."
      },
      {
        prompt: "What knowledge standard triggers the duty to disclose material facts under §§ 54.1-2131 A 6 and 54.1-2132 A 7?",
        choices: [
          "Actual knowledge — there is no duty to investigate in these sections.",
          "Constructive knowledge of anything a reasonable licensee would have discovered.",
          "Knowledge imputed from the firm's other licensees.",
          "Knowledge of anything recorded in the land records."
        ],
        correctChoice: 0,
        rationale: "The same standard governs the § 54.1-2131 B physical-condition duty toward the other side, which is also expressly an actual-knowledge duty. A course teaching that a Virginia licensee must discover defects is overstating the rule."
      },
      {
        prompt: "What triggers the written disclosure of brokerage relationship required by § 54.1-2138 A?",
        choices: [
          "A substantive discussion about a specific property with an actual or prospective buyer or seller who is neither the licensee's client nor represented by another licensee.",
          "Any conversation with any member of the public about real estate.",
          "The presentation of an offer.",
          "The signing of a brokerage agreement."
        ],
        correctChoice: 0,
        rationale: "The disclosure must be in writing at the earliest practical time and in no event later than when specific real estate assistance is first provided, and if combined with other disclosures it must be conspicuous — bold, all capitals, underlined, or in a separate box."
      },
      {
        prompt: "Under 18VAC135-20-330, when is a supervising broker disciplined for a salesperson's violation?",
        choices: [
          "Only if the Board is satisfied that the broker knew or should have known of the violation and failed to take reasonable action under the circumstances to remedy the situation.",
          "Always — the broker is vicariously liable for every act of an affiliated licensee.",
          "Only if the broker directed the conduct.",
          "Only if the salesperson's licence is revoked first."
        ],
        correctChoice: 0,
        rationale: "This is a knew-or-should-have-known standard coupled with a failure to remedy, not vicarious liability. What makes 'should have known' bite is the supervision duties in § 54.1-2110.1 B: a broker without written policies, document review or oversight of unlicensed assistants has a much harder time saying they could not reasonably have known."
      },
      {
        prompt: "A licensee is convicted of a felony. What does 18VAC135-20-260 require?",
        choices: [
          "The conviction is a prohibited act, and the licensee must inform the Board in writing within 30 days of it.",
          "The licensee must surrender the licence immediately.",
          "Nothing, unless the felony involved a real estate transaction.",
          "The licensee must notify the Board at the next licence renewal."
        ],
        correctChoice: 0,
        rationale: "There are two 30-day self-reporting clocks in the section: one for convictions, one for disciplinary action against a professional or occupational licence in any jurisdiction. Both are frequently missed by licensees who assume the Board will learn of the matter another way."
      }
    ],
    remediation: [
      {
        prompt: "A limited service agent's written brokerage agreement must contain which three things?",
        choices: [
          "Disclosure that the licensee is acting as a limited service agent, a list of the specific services the licensee will provide, and a list of the specific standard-agent duties the licensee will NOT provide.",
          "The fee, the termination date, and the services.",
          "A waiver of the client's right to counsel, the fee, and the services.",
          "The supervising broker's name, the fee, and a statement that no duties are owed."
        ],
        correctChoice: 0,
        rationale: "§ 54.1-2138.1 A also requires the disclosure to be conspicuous and printed in bold or all capitals and underlined or boxed, and it prints consent language whose substance is that neither the other party nor the other party's licensee is obliged to help the client with the duties the limited service agent is not performing."
      },
      {
        prompt: "How long must a brokerage agreement be retained under 18VAC135-20-185 C 1?",
        choices: [
          "Three years from the date of execution — as must each disclosure and consent to dual or designated agency or representation.",
          "One year from settlement.",
          "Five years from the date of execution.",
          "Until the licence is renewed."
        ],
        correctChoice: 0,
        rationale: "Three other three-year periods sit alongside it: § 54.1-2138 D for brokerage-relationship disclosures relating to fully executed purchase contracts, and § 54.1-2110.1 B 7 for the supervising broker's supervision records."
      },
      {
        prompt: "Which of these does 18VAC135-20-270 name as a conflict of interest?",
        choices: [
          "Acting for more than one client in a transaction governed by §§ 54.1-2139, 54.1-2139.01 or 54.1-2139.1 without first obtaining the written consent of all clients.",
          "Representing a buyer and a seller in unrelated transactions in the same month.",
          "Accepting a referral fee from another broker.",
          "Listing a property at a price the licensee believes is too high."
        ],
        correctChoice: 0,
        rationale: "The section names only two acts: being active with a broker other than the licensee's principal broker without the principal broker's written consent, and acting for more than one client without first obtaining all clients' written consent."
      },
      {
        prompt: "A supervising broker lives 70 miles from a branch office where licensees regularly conduct business. What does § 54.1-2110.1 C require?",
        choices: [
          "Written certification of supervision, quarterly.",
          "Monthly in-person attendance at the branch.",
          "Appointment of a resident associate broker to replace them.",
          "Nothing additional, provided the broker is reachable by telephone."
        ],
        correctChoice: 0,
        rationale: "The trigger is residence more than 50 miles from the branch office. The broker may designate another broker to assist in administering the section's requirements, but that designation does not relieve the supervising broker of responsibility."
      },
      {
        prompt: "Under 18VAC135-20-155 B, can the Board reach conduct in a licensee's personal capacity?",
        choices: [
          "Yes — a licensee failing to comply with Chapter 21 or the Board's regulations in performing acts covered by § 54.1-2100 may be charged regardless of whether the acts are in a personal or professional capacity.",
          "No — the Board's jurisdiction is limited to licensed activity performed for a client.",
          "Only where the licensee used their licence number in the transaction.",
          "Only where the conduct occurred in Virginia."
        ],
        correctChoice: 0,
        rationale: "Selling one's own house badly is within reach of the Board. The point recurs in fair housing: § 36-96.2 A provides that the owner exemption does not inure to the benefit of any Real Estate Board licensee regardless of capacity."
      }
    ]
  },

  "module-07": {
    subject: "Escrow, records, advertising, and fair housing",
    applied: {
      prompt: "A firm receives a $10,000 earnest money deposit on Friday. The unlicensed office manager deposits it Monday into the operating account 'because the escrow account was short this month', and the firm moves it to escrow on Wednesday.",
      choices: [
        "Commingling and conversion — 18VAC135-20-181 A 1 requires all funds received in connection with a real estate transaction to go into a designated escrow account, A 2 names earnest money specifically, and A 1 e requires the balance to be sufficient at all times, which the shortfall already breached.",
        "A recordkeeping error only, cured by the Wednesday transfer.",
        "Permissible, because the funds reached escrow within five business days.",
        "The manager's violation alone, since the manager is unlicensed and the broker cannot be responsible."
      ],
      correctChoice: 0,
      rationale: "The principal broker is responsible for the accounts under A 1 b. § 54.1-2110.1 B 2 a requires written policies on escrow handling and 18VAC135-20-165 3 requires adequate supervision of unlicensed individuals; whether the broker is disciplined is decided by 18VAC135-20-330's knew-or-should-have-known standard."
    },
    engagement: [
      {
        prompt: "Which of these is NOT one of Virginia's protected classes under § 36-96.3?",
        choices: [
          "Occupation.",
          "Source of funds.",
          "Elderliness.",
          "Military status."
        ],
        correctChoice: 0,
        rationale: "The statutory list is race, colour, religion, national origin, sex, elderliness, source of funds, familial status, sexual orientation, gender identity, military status, and disability. Five of those are not in the federal Fair Housing Act, and they are the ones most likely to appear in a real complaint."
      },
      {
        prompt: "A licensee is selling their own home privately and wants to rely on the § 36-96.2 A owner exemption. May they?",
        choices: [
          "No — the exemption does not apply to or inure to the benefit of any licensee of the Real Estate Board, regardless of whether the licensee is acting in a personal or professional capacity.",
          "Yes, provided they own no more than three single-family houses.",
          "Yes, provided no advertising is used.",
          "Yes, but only for one sale in any 24-month period."
        ],
        correctChoice: 0,
        rationale: "The exemption is also lost the moment a licensee's services are used in any manner, and every exemption in § 36-96.2 is expressed 'except for subdivision A 3 of § 36-96.3', so discriminatory advertising is never exempt."
      },
      {
        prompt: "An advertisement says 'walk to St. Anne's'. Is that prima facie evidence of an illegal preference?",
        choices: [
          "No — § 36-96.3 A 3 provides that reference alone to places of worship is not prima facie evidence, though words or symbols associated with a particular religion, national origin, sex or race are, and a general disclaimer does not overcome them.",
          "Yes — any reference to a religious institution expresses a religious preference.",
          "Yes, unless the advertisement also names a non-religious landmark.",
          "It depends entirely on whether a complaint is filed."
        ],
        correctChoice: 0,
        rationale: "Students over-correct here. An audit that flags a compliant line will not be trusted on the lines that matter — such as 'a wonderful Christian community', which does use words associated with a particular religion."
      },
      {
        prompt: "A tenant with a disability asks to install grab bars at their own expense and asks for a parking space nearer the door in an unassigned lot. Classify each.",
        choices: [
          "The grab bars are a reasonable modification under § 36-96.3 B (i), at the tenant's expense, and the landlord may where reasonable require restoration of the interior; the parking space is a reasonable accommodation under B (ii), a change to a rule, whose ordinary cost falls on the provider.",
          "Both are reasonable accommodations and the landlord pays for both.",
          "Both are reasonable modifications and the tenant pays for both.",
          "Neither need be granted if the lease prohibits alterations and assigns no parking."
        ],
        correctChoice: 0,
        rationale: "A modification is a physical change and the tenant pays; an accommodation is a change to a rule and the provider bears the ordinary cost. Getting this backwards causes a violation in one direction and an improper charge to the owner in the other."
      },
      {
        prompt: "Under 18VAC135-20-190, who specifies the office contact information that must appear in an advertising disclosure?",
        choices: [
          "The principal or supervising broker, in the firm's written policies — the regulation requires the disclosure to include the firm's name and the office contact information and then delegates the format.",
          "The Real Estate Board, in a prescribed format published with the regulation.",
          "The multiple listing service in which the property is listed.",
          "The individual licensee, at their discretion."
        ],
        correctChoice: 0,
        rationale: "A course that states a required layout is stating a firm policy as though it were a Board rule. § 54.1-2110.1 B 2 c requires the firm to have written policies covering advertising and marketing."
      }
    ],
    remediation: [
      {
        prompt: "A listing goes under contract but the post stays up reading 'JUST LISTED' with the old price. Which rules are engaged?",
        choices: [
          "18VAC135-20-190 B 3, requiring property information to be consistent with the property's condition and current contract status, and B 4, requiring advertising to be updated in a timely manner after a material change to listing status.",
          "Only 18VAC135-20-300 1, bait and switch.",
          "None — advertising rules apply only before a property is listed.",
          "Only the multiple listing service's own rules."
        ],
        correctChoice: 0,
        rationale: "Where a third party controls the advertising, B 3 and B 4 prescribe the remedy — a timely written request for changes — and the request should be retained as evidence the duty was met. If the intent is to harvest leads rather than sell at those terms, 18VAC135-20-300 1 is also engaged."
      },
      {
        prompt: "Which funds does 18VAC135-20-181 A 2 require to be deposited into escrow?",
        choices: [
          "Down payments, earnest money deposits, money received on final settlement, application deposits, rental payments, rental security deposits, money advanced for closing expenses, and money advanced by the broker's client or others.",
          "Earnest money deposits only.",
          "Earnest money and rental security deposits only.",
          "Whatever the firm's written policy designates as escrow money."
        ],
        correctChoice: 0,
        rationale: "Rental payments and rental security deposits are on the list, which is why a property management portfolio is trust accounting from the first day."
      },
      {
        prompt: "A landlord instructs a licensee to advertise 'no Section 8'. What is the licensee's position?",
        choices: [
          "Refuse in writing — refusing housing choice vouchers is discrimination on the basis of source of funds under § 36-96.3 A 1, 2 and 3, and § 54.1-2133 makes fair housing compliance a duty owed to the client, so a client's instruction cannot authorise a violation.",
          "Comply, because the landlord is the client and the instruction is lawful if the property is exempt.",
          "Comply, but omit the phrase from the written advertisement only.",
          "Refer the question to the multiple listing service for a ruling."
        ],
        correctChoice: 0,
        rationale: "Income criteria must also be applied to the tenant's portion of the rent where a subsidy pays the balance, rather than to the whole rent, or the criterion screens voucher holders out as a class."
      },
      {
        prompt: "Which record must the principal broker keep 'readily accessible from the broker's place of business' under 18VAC135-20-185 A?",
        choices: [
          "Financial records showing from whom money was received, the date of receipt, the place and date of deposit, and the final disposition of the funds.",
          "Only the escrow account bank statements.",
          "Only the brokerage agreements.",
          "Only records for transactions that closed."
        ],
        correctChoice: 0,
        rationale: "Where the principal broker's office is outside Virginia and the firm has a Virginia branch office, a copy of these records must be readily accessible in the Virginia office."
      },
      {
        prompt: "For which buildings does § 36-96.3 B (iii) impose design and construction accessibility requirements?",
        choices: [
          "Covered multi-family dwellings designed and constructed for first occupancy after 13 March 1991 — buildings of four or more units with one or more elevators, and ground floor units in other buildings of four or more units.",
          "All residential buildings constructed after 1988.",
          "All buildings open to the public, under the Americans with Disabilities Act.",
          "Single-family houses built for sale rather than for the owner's occupancy."
        ],
        correctChoice: 0,
        rationale: "Compliance with ANSI A117.1 or other HUD-adopted standards is deemed to satisfy the requirement. Housing is governed by fair housing law rather than the ADA, and ADA service-animal rules should not be imported into a housing accommodation analysis."
      }
    ]
  },

  "module-08": {
    subject: "Common-interest communities and leasing",
    applied: {
      prompt: "A condominium resale contract is ratified 3 June with no cancellation period specified. The seller's agent requests the resale certificate in writing on 5 June. Nothing arrives. On 24 June the buyer wants out.",
      choices: [
        "The buyer may cancel — § 55.1-2312 C provides that where neither the certificate nor a notice of unavailability has been delivered, the purchaser may cancel at any time prior to settlement, without penalty and with the deposit returned promptly.",
        "The buyer is out of time, because the three-day period ran from ratification.",
        "The buyer must wait for the certificate before any right arises.",
        "The buyer may cancel only if the association is found to have acted unreasonably."
      ],
      correctChoice: 0,
      rationale: "The written request started the 14-day clock in § 55.1-2309 B, after which the certificate is deemed unavailable — but the buyer received neither the certificate nor a notice of unavailability, which puts them in subsection C. Written notice must comply with the contract's terms, and under subsection D the purchaser bears the burden of demonstrating delivery."
    },
    engagement: [
      {
        prompt: "How long does an association have to deliver a resale certificate after a written request under § 55.1-2309 B?",
        choices: [
          "14 days, after which the resale certificate is deemed unavailable.",
          "10 business days, after which the seller may proceed without it.",
          "30 days, extendable once by the association.",
          "There is no deadline; the association delivers when it is able."
        ],
        correctChoice: 0,
        rationale: "The association may not require the purchaser's name before preparing the certificate, and the information must be current as of a date specified on it. § 55.1-2309 A also provides that the seller's obligation to obtain and provide the certificate shall not be waived or changed by agreement."
      },
      {
        prompt: "A resale certificate is delivered before ratification and the contract specifies no cancellation period. How long does the purchaser have to cancel?",
        choices: [
          "Three days from the date of ratification — § 55.1-2312 A.",
          "Three days from delivery of the certificate.",
          "Until settlement.",
          "Five days from ratification."
        ],
        correctChoice: 0,
        rationale: "If delivery occurs after ratification the period is three days from receipt under subsection B; if nothing is delivered the purchaser may cancel any time before settlement under subsection C. Where a unit is governed by more than one association, subsection E runs the period from the last certificate delivered."
      },
      {
        prompt: "A resident of a cooperative owns what?",
        choices: [
          "Shares in a corporation that owns the real property, together with a proprietary lease of an apartment — personal property, not real property.",
          "A fee simple interest in the apartment with an undivided share of the common elements.",
          "A life estate in the apartment measured by their residence.",
          "A leasehold estate for years granted by the other residents."
        ],
        correctChoice: 0,
        rationale: "There is no deed, financing is a share loan rather than a deed of trust, and the settlement mechanic differs entirely. Virginia governs cooperatives at Chapter 21 of Title 55.1, condominiums at Chapter 19, and property owners' associations at Chapter 18."
      },
      {
        prompt: "A tenant with eight months remaining transfers the apartment to a friend for the full remaining term, and the landlord consents in writing to the transfer. The friend stops paying. Who is liable?",
        choices: [
          "Both — this is an assignment, the assignee is in direct relationship with the landlord, and consent to an assignment is not a release; only a novation would have released the original tenant.",
          "The assignee only, because the landlord consented to the transfer.",
          "The original tenant only, because privity of contract survives.",
          "Neither, because the landlord's consent discharged the lease."
        ],
        correctChoice: 0,
        rationale: "A sublease transfers less than the entire remaining interest and makes the original tenant a landlord to the subtenant while remaining a tenant to the landlord. In neither case is the original tenant automatically released."
      },
      {
        prompt: "A property manager asks how many days' notice they must give before entering to show a unit, and how long they have to return a security deposit. What is the correct professional response?",
        choices: [
          "Read both from the current text of the Virginia Residential Landlord and Tenant Act, Chapter 12 of Title 55.1, then check the rental agreement, which may give the tenant more than the statute requires but not less — a remembered number is how a manager destroys a landlord's case.",
          "Give the standard figures of 24 hours and 30 days.",
          "Apply whatever the rental agreement says, since the parties may contract freely.",
          "Apply the commercial tenancy provisions in Chapter 14 of Title 55.1."
        ],
        correctChoice: 0,
        rationale: "Both are statutory and both have been amended over time. Classifying the tenancy first is what selects the chapter: Chapter 12 for residential, Chapter 13 for manufactured home lots, Chapter 14 for nonresidential, Chapter 16 for leases generally."
      }
    ],
    remediation: [
      {
        prompt: "What must a contract for the resale of a unit in a common interest community disclose under § 55.1-2308?",
        choices: [
          "That the unit is in a common interest community; that the seller or seller's agent must obtain and provide a resale certificate; the purchaser's right to cancel under § 55.1-2312; that an updated certificate may be requested under § 55.1-2311; and that the rights to receive the certificate and to cancel are waived conclusively if not exercised before settlement.",
          "Only the amount of the current assessment and the association's contact information.",
          "Only the purchaser's right to cancel.",
          "The association's budget, reserve study, and two years of minutes."
        ],
        correctChoice: 0,
        rationale: "If the contract does not contain them, the purchaser's sole remedy is to cancel the contract prior to settlement."
      },
      {
        prompt: "An association's certificate fails to note a violation incurred by the previous owner. What follows under § 55.1-2314?",
        choices: [
          "The purchaser is not required to remedy it — the association may enforce a previous owner's violation against a purchaser only if it was properly noted in the certificate or the seller failed to provide the certificate at all.",
          "The purchaser must remedy it but may recover the cost from the seller.",
          "The purchaser must remedy it, since the governing documents run with the land.",
          "The association may enforce it only after a further 14 days' notice."
        ],
        correctChoice: 0,
        rationale: "The purchaser must still abide by the governing documents as to matters arising after acquiring the unit. The preparer is liable to the seller for actual damages up to $1,000, and the Common Interest Community Board may assess penalties and issue cease and desist orders."
      },
      {
        prompt: "Which leasehold estate expires on its own without any notice?",
        choices: [
          "An estate for years — a fixed term with a definite beginning and end, whatever its length.",
          "A periodic estate.",
          "An estate at will.",
          "An estate at sufferance."
        ],
        correctChoice: 0,
        rationale: "The name misleads: a two-week lease is an estate for years. A periodic estate renews until notice; an estate at will has no fixed period; an estate at sufferance is a holdover after a lawful entry, distinguished from trespass only by that lawful entry."
      },
      {
        prompt: "When must the § 54.1-2138 B brokerage-relationship disclosure be given to an unrepresented landlord or tenant, and when does it not apply?",
        choices: [
          "In writing, included in all applications for lease or in the lease itself, whichever occurs first — and it does not apply to lease terms of less than two months.",
          "At the first showing, orally, with written confirmation within three days.",
          "At the signing of the lease in every case, with no exceptions.",
          "Only where the licensee represents the landlord."
        ],
        correctChoice: 0,
        rationale: "If the lease terms do not provide for the disclosure, it must be made in writing no later than the signing of the lease."
      },
      {
        prompt: "A landlord tells a licensee to change the locks on a tenant two months in arrears. What is the licensee's response?",
        choices: [
          "Decline in writing — self-help eviction is unlawful and possession is recovered through the statutory judicial process; § 54.1-2133 makes compliance with applicable law a duty, and a client's instruction cannot authorise a violation.",
          "Comply, since the tenant's breach terminated the tenancy.",
          "Comply, but give the tenant 24 hours' notice first.",
          "Refer the landlord to the association's governing documents."
        ],
        correctChoice: 0,
        rationale: "Removing possessions and shutting off utilities are equally unlawful. The licensee's contribution is documentation — the ledger, the notices actually given and how — and a referral to counsel and to Chapter 12 for the notice the statute requires."
      }
    ]
  },

  "module-09": {
    subject: "Property management and the instruments of finance",
    applied: {
      prompt: "A manager holds deposits and rents for 40 owners in one escrow account. A roof emergency at Owner A's property costs $9,400; Owner A's ledger holds $3,100. The manager pays the invoice from escrow and asks Owner A to reimburse.",
      choices: [
        "The manager has spent $6,300 of other owners' and tenants' money — conversion, and a breach of 18VAC135-20-181 A 1 e, which requires the balance to be sufficient at all times to account for all funds designated to be held.",
        "Permissible, because a pooled escrow account is allowed and the bank balance never went negative.",
        "Permissible, because an emergency repair preserves the asset for all owners.",
        "A recordkeeping problem only, cured when Owner A reimburses."
      ],
      correctChoice: 0,
      rationale: "A pooled account is permitted; a pooled ledger is not. Every owner and every deposit has its own running balance, and sufficiency is measured against the sum of the ledgers. The correct action was to obtain the funds or the owner's authority before paying, and the management agreement should have fixed the spending threshold in advance."
    },
    engagement: [
      {
        prompt: "In a Virginia residential purchase, which instrument is recorded and which is not?",
        choices: [
          "The deed of trust is recorded; the promissory note is not.",
          "The promissory note is recorded; the deed of trust is not.",
          "Both are recorded.",
          "Neither is recorded; only the deed conveying the property is."
        ],
        correctChoice: 0,
        rationale: "The note is the debt and can be sold on the secondary market; the deed of trust is the collateral and creates the lien. The deed conveying the property is a third instrument and is also recorded. On payoff a certificate of satisfaction must be recorded to release the deed of trust."
      },
      {
        prompt: "Name the three parties to a Virginia deed of trust.",
        choices: [
          "Grantor or trustor (borrower), trustee (neutral third party holding bare legal title with the power of sale), and beneficiary (lender).",
          "Mortgagor, mortgagee, and settlement agent.",
          "Vendor, vendee, and escrow agent.",
          "Grantor, grantee, and title insurer."
        ],
        correctChoice: 0,
        rationale: "Virginia is a deed-of-trust state. A student who learned 'mortgagor and mortgagee' from a national text must translate, and the distinction determines who conducts a foreclosure and whether a court is involved."
      },
      {
        prompt: "Which clause makes most modern loans non-assumable?",
        choices: [
          "The alienation or due-on-sale clause, permitting the lender to accelerate if the property is transferred without consent.",
          "The acceleration clause.",
          "The defeasance clause.",
          "The subordination clause."
        ],
        correctChoice: 0,
        rationale: "Acceleration is what lets a lender declare the whole balance due on default and is where every foreclosure begins; defeasance is what requires release on full payment; subordination changes lien position by agreement."
      },
      {
        prompt: "A buyer takes title 'subject to' an existing loan rather than assuming it. What is the position?",
        choices: [
          "The buyer takes no personal liability on the note, the seller remains liable, the loan stays in the seller's name, and the due-on-sale clause is very likely triggered.",
          "The buyer becomes personally liable and the seller is released.",
          "Both are jointly liable and the lender must consent in writing.",
          "The loan is automatically assumed by operation of law on recording."
        ],
        correctChoice: 0,
        rationale: "In an assumption the buyer becomes personally liable, but the seller is released only by a written release from the lender — the same rule as assignment of a lease. Both structures need counsel."
      },
      {
        prompt: "A buyer says they will bid at a trustee's sale and 'wipe out the other liens'. What is wrong?",
        choices: [
          "Only liens junior to the foreclosing deed of trust are extinguished as to the property; senior liens survive and real property tax liens hold statutory priority regardless of date.",
          "Nothing — a foreclosure sale conveys title free of all encumbrances.",
          "Only the second deed of trust survives; judgments are always extinguished.",
          "All liens survive and the purchaser assumes each of them."
        ],
        correctChoice: 0,
        rationale: "A purchaser at a trustee's sale is also buying whatever the trustee can convey, generally without warranties, inspection, or assured vacant possession. A title search and counsel are prerequisites."
      }
    ],
    remediation: [
      {
        prompt: "A management agreement is a brokerage agreement. Which requirements therefore apply?",
        choices: [
          "§ 54.1-2137 C — in writing, definite termination date or 90 days, the fee and how and when paid, the services to be rendered — and § 54.1-2110.1 B 6, the supervising broker's name and contact information.",
          "None; management agreements are ordinary commercial contracts outside Chapter 21.",
          "Only the requirement of a written signature by the owner.",
          "Only the fee disclosure in § 54.1-2136."
        ],
        correctChoice: 0,
        rationale: "§ 54.1-2135 governs licensees engaged to manage real estate, and its accounting duty does the heaviest work because the licensee holds other people's money continuously rather than once."
      },
      {
        prompt: "Which of these is a borrower's opportunity to cure arrears and have the loan restored?",
        choices: [
          "Reinstatement.",
          "Redemption, which is payment of the entire accelerated balance.",
          "Forbearance, under which payments are suspended and made up later.",
          "Deed in lieu of foreclosure."
        ],
        correctChoice: 0,
        rationale: "Whether and for how long each is available in Virginia is governed by the deed of trust and by statute, and a licensee should route the borrower to the servicer's loss-mitigation department, a HUD-approved housing counselling agency, and counsel rather than state a period."
      },
      {
        prompt: "What does private mortgage insurance protect?",
        choices: [
          "The lender, against loss on a conventional loan where the borrower put down less than 20 percent.",
          "The borrower, against default caused by loss of income.",
          "The property, against physical damage.",
          "The title, against defects existing at closing."
        ],
        correctChoice: 0,
        rationale: "This is the most persistent consumer misunderstanding in residential lending. FHA charges mortgage insurance premiums that insure the lender in the same way; VA charges a funding fee and requires no monthly mortgage insurance."
      },
      {
        prompt: "A buyer with a 600 credit score, $6,000 saved, and Army service asks a licensee which loan they qualify for. What may the licensee say?",
        choices: [
          "That VA, FHA and possibly USDA are categories worth raising with a lender — and nothing about whether the buyer qualifies, what rate or funding fee applies, or whether $6,000 is enough.",
          "That the buyer will qualify for a VA loan with no down payment.",
          "That FHA requires a 580 score and 3.5 percent down, so the buyer qualifies.",
          "That USDA will work if the property is outside the city limits."
        ],
        correctChoice: 0,
        rationale: "Programme guidelines change and eligibility depends on facts the licensee does not have. Stating them would breach the ordinary-care duty in § 54.1-2132 A 5 and risk a misrepresentation finding under 18VAC135-20-300."
      },
      {
        prompt: "Which of these belongs in a monthly owner report from a property manager?",
        choices: [
          "Rent roll and occupancy, collections and delinquency, income and expense against budget, the trust account balance and the owner's ledger, maintenance completed and outstanding, and upcoming lease expirations.",
          "The manager's own commission calculation only.",
          "A market appraisal of the property.",
          "The tenants' credit reports."
        ],
        correctChoice: 0,
        rationale: "18VAC135-20-185 A requires records showing from whom money was received, the dates of receipt and deposit, the place of deposit and the final disposition of funds, and monthly reconciliation of bank statement to book balance to the sum of the individual ledgers is what an audit under 18VAC135-20-225 looks for."
      }
    ]
  },

  "module-10": {
    subject: "Financing a transaction and closing it",
    applied: {
      prompt: "A title company offers a firm $1,200 a month under a 'marketing services agreement' to display its brochures, and referrals to that company are expected to rise.",
      choices: [
        "The question is whether the payment is for services actually performed at market value or is in substance payment for the referral of settlement service business — the latter violates RESPA section 8(a), and any excess over the value of services rendered is an unearned fee under 8(b); the label does not change the substance.",
        "Permissible, because affiliated business arrangements are allowed with disclosure.",
        "Permissible, because brochures are marketing rather than referral.",
        "Prohibited only if the firm requires clients to use that title company."
      ],
      correctChoice: 0,
      rationale: "The expectation that referrals will rise as a result of the payment is precisely the evidence enforcement looks for. The proposal goes to the principal broker and to counsel before any money changes hands, and § 54.1-2110.1 B 2 requires the firm to have written policies."
    },
    engagement: [
      {
        prompt: "Purchase price $400,000, appraisal $385,000, lender lends 80 percent LTV. How much must the buyer bring for the down payment?",
        choices: [
          "$92,000 — the lender lends against the lower of price or appraised value, so 0.80 × $385,000 = $308,000, leaving a $15,000 appraisal gap on top of the planned $80,000.",
          "$80,000, because the down payment is computed on the purchase price.",
          "$77,000, because the down payment is computed on the appraised value.",
          "$95,000, because the lender reduces the loan by the full gap plus a reserve."
        ],
        correctChoice: 0,
        rationale: "This calculation is the reason the appraisal contingency exists. The gap must be closed by the buyer, by a price reduction, by a successful reconsideration of value, or by termination under the contract's terms."
      },
      {
        prompt: "Loan $327,250 at 6.25 percent. What is the first month's interest?",
        choices: [
          "$1,704.43.",
          "$20,453.13.",
          "$2,015.86.",
          "$311.43."
        ],
        correctChoice: 0,
        rationale: "$327,250 × 0.0625 = $20,453.13 per year; ÷ 12 = $1,704.43. If the payment factor gives a monthly payment of $2,015.86, the principal portion of the first payment is $311.43 and the balance falls to $326,938.57."
      },
      {
        prompt: "What is the difference between a pre-qualification and a pre-approval, and why does it matter?",
        choices: [
          "A pre-qualification is an informal estimate from unverified information; a pre-approval rests on a submitted application, verified documentation and usually an underwriting decision — and a seller evaluating offers is entitled to know which is in front of them.",
          "They are the same thing under different lender branding.",
          "A pre-qualification is issued by a bank and a pre-approval by a mortgage broker.",
          "A pre-approval guarantees the loan will fund."
        ],
        correctChoice: 0,
        rationale: "Letting a pre-qualification be presented as a pre-approval misrepresents the buyer's position. Even a pre-approval is not funding, and a commitment can be withdrawn if the borrower's circumstances change."
      },
      {
        prompt: "Two days before settlement the lender issues a revised Closing Disclosure changing the loan product. What has happened?",
        choices: [
          "Certain changes, including a change in loan product, re-start the mandatory waiting period before consummation, so settlement cannot occur as scheduled and the date must be moved by written amendment.",
          "Nothing — a revised Closing Disclosure may be signed at the settlement table.",
          "The loan is cancelled and the buyer must reapply.",
          "The buyer may waive the waiting period orally at settlement."
        ],
        correctChoice: 0,
        rationale: "The licensee's job is to notify everyone in writing immediately, get the earliest permissible date from the lender, and amend the settlement date and every dependent date including possession and the rate lock. The lender and the settlement agent state the date; the licensee does not."
      },
      {
        prompt: "Under which Virginia statute are settlement agents regulated, and why does a licensee care?",
        choices: [
          "Chapter 10 of Title 55.1, the Consumer Real Estate Settlement Protection Act — and 18VAC135-20-155 A makes a violation of that chapter a ground for Real Estate Board discipline.",
          "Chapter 21 of Title 54.1, alongside real estate licensees.",
          "Chapter 12 of Title 55.1, alongside residential tenancies.",
          "They are regulated federally under RESPA only."
        ],
        correctChoice: 0,
        rationale: "§ 54.1-2132 F also refers to settlement services under Chapter 10. The settlement side of a Virginia transaction has its own statutory regime, and violating it can reach a licensee's own licence."
      }
    ],
    remediation: [
      {
        prompt: "What does an adjustable-rate mortgage's margin do?",
        choices: [
          "It is fixed for the life of the loan and is added to the moving index to produce the rate.",
          "It moves with the market while the index stays fixed.",
          "It caps the rate at each adjustment.",
          "It is the initial discount applied during the fixed period."
        ],
        correctChoice: 0,
        rationale: "Caps limit movement — an initial cap at the first adjustment, a periodic cap thereafter, and a lifetime cap. The question that matters for a borrower is not the start rate but the payment at the caps."
      },
      {
        prompt: "Gross monthly income $9,200, PITI $2,640, other obligations $610. What are the front-end and back-end ratios?",
        choices: [
          "28.7 percent and 35.3 percent.",
          "35.3 percent and 28.7 percent.",
          "28.7 percent and 6.6 percent.",
          "22.4 percent and 35.3 percent."
        ],
        correctChoice: 0,
        rationale: "Front-end is housing expense over gross monthly income: 2,640 ÷ 9,200 = 28.7 percent. Back-end is total monthly obligations: 3,250 ÷ 9,200 = 35.3 percent. The thresholds are the lender's and the programme's and change; this course states none."
      },
      {
        prompt: "Which of these does an approved-with-conditions underwriting decision most often fail on close to settlement?",
        choices: [
          "A prior-to-funding or prior-to-document condition raised late, such as documentation of an undocumented large deposit.",
          "The appraisal, which is ordered last.",
          "The buyer's credit score, which is pulled only at closing.",
          "The title commitment, which the lender does not review."
        ],
        correctChoice: 0,
        rationale: "Underwriting is frequently re-verified immediately before closing, so a furniture purchase made a week before settlement can undo an approval given a month earlier. A gift deposit needs a gift letter and a paper trail."
      },
      {
        prompt: "On a settlement statement, what does a credit to the buyer represent?",
        choices: [
          "An amount in the buyer's favour, reducing what they must bring — the loan amount, earnest money, seller and lender credits, and prorated items the seller owes.",
          "A charge to the buyer, increasing cash to close.",
          "An amount the buyer owes the lender after closing.",
          "The brokerage fee allocated to the buyer's firm."
        ],
        correctChoice: 0,
        rationale: "A debit is a charge; a credit is in the party's favour. Each side's statement balances, and the same prorated amount appears on both statements in opposite directions and to the penny."
      },
      {
        prompt: "What must be confirmed about a common-interest community before a purchase settles?",
        choices: [
          "That the resale certificate was obtained and delivered under § 55.1-2309 and that the § 55.1-2312 cancellation period has expired or is waived by proceeding to settlement.",
          "That the association has approved the buyer's application, in every case.",
          "That the association's reserves exceed one year of assessments.",
          "That no special assessment has been discussed in the last two years."
        ],
        correctChoice: 0,
        rationale: "§ 55.1-2308(v) provides that the rights to receive the certificate and to cancel are waived conclusively if not exercised before settlement, which is why the cancellation window must be diarised the moment the delivery date is known."
      }
    ]
  },

  "module-11": {
    subject: "Prorations and the appraisal of property",
    applied: {
      prompt: "Settlement 20 April. Annual taxes $3,650, calendar year, paid in arrears. The seller prepaid an annual insurance policy of $1,460 on 1 January which the buyer will not assume. A tenant paid $2,100 rent on 1 April and holds a $2,100 deposit with the seller. 365-day year, settlement day to the buyer.",
      choices: [
        "Taxes $1,090.00 debit seller credit buyer; insurance not prorated at all because the buyer is not assuming the policy; rent $770.00 debit seller credit buyer; deposit $2,100.00 in full debit seller credit buyer.",
        "Taxes $1,090.00 debit buyer credit seller; insurance $455.62 debit buyer credit seller; rent $770.00 debit seller credit buyer; deposit prorated 11/30.",
        "Taxes $2,560.00 debit seller credit buyer; insurance $1,004.38 debit buyer credit seller; rent $1,330.00 debit buyer credit seller; deposit not transferred.",
        "Taxes $1,090.00 debit seller credit buyer; insurance $455.62 debit buyer credit seller; rent $770.00 debit seller credit buyer; deposit $2,100.00 debit seller credit buyer."
      ],
      correctChoice: 0,
      rationale: "Daily tax $10.00; seller's days 1 January to 19 April is 109; $1,090.00, and arrears means the seller owes the buyer. A policy the buyer is not assuming is not prorated — a common error is to prorate it anyway. Daily rent $70.00 for 11 buyer days is $770.00. Security deposits are never prorated; the whole deposit transfers."
    },
    engagement: [
      {
        prompt: "An expense paid in advance is prorated which way at settlement?",
        choices: [
          "Debit buyer, credit seller — the seller has already paid through a period extending past closing, so the buyer owes the seller for the buyer's days.",
          "Debit seller, credit buyer.",
          "It is not prorated; the seller seeks a refund from the provider.",
          "It is split evenly regardless of the settlement date."
        ],
        correctChoice: 0,
        rationale: "Arrears runs the other way: the buyer will pay a bill covering the seller's period, so it is a debit to the seller and a credit to the buyer. Rent, collected in advance, is a debit to the seller and a credit to the buyer for the unearned portion, and deposits transfer in full."
      },
      {
        prompt: "Which condition in the definition of market value is most often missing from a distressed sale?",
        choices: [
          "That neither party is under duress, with a reasonable exposure time in an open market.",
          "That payment is in cash or its equivalent.",
          "That the buyer and seller are unrelated.",
          "That the property is legally transferable."
        ],
        correctChoice: 0,
        rationale: "Strip out any condition of the definition and the price observed is not evidence of market value without adjustment — which is the screen applied when selecting comparables."
      },
      {
        prompt: "A seller says, 'I spent $110,000 on the addition, so the house is worth $110,000 more.' Which principle answers this?",
        choices: [
          "Contribution — a component adds value equal to what it contributes to the whole, measured in the market, which is frequently less than its cost.",
          "Anticipation — value reflects expected future benefits.",
          "Substitution — a buyer will pay no more than the cost of an equally desirable substitute.",
          "Plottage — the increment from combining adjacent parcels."
        ],
        correctChoice: 0,
        rationale: "Regression and conformity explain why an addition that makes the house the largest on the street may add even less, and increasing and diminishing returns describes the same effect from the investment side."
      },
      {
        prompt: "A comparable is superior to the subject. Which is adjusted and in which direction?",
        choices: [
          "The comparable, downward — adjust the comparable, never the subject; comparable better, subtract.",
          "The subject, upward, to match the comparable.",
          "The comparable, upward, because it sold for more.",
          "Neither; a superior comparable is discarded."
        ],
        correctChoice: 0,
        rationale: "Every adjustment answers what the comparable would have sold for if it had been like the subject. A comparable inferior to the subject is adjusted up. Gross adjustment — the sum of the absolute values — measures comparability better than net adjustment does."
      },
      {
        prompt: "Which three items are excluded from operating expenses when computing net operating income?",
        choices: [
          "Debt service, depreciation, and capital expenditures — while replacement reserves are included.",
          "Property taxes, insurance, and management fees.",
          "Vacancy loss, collection loss, and replacement reserves.",
          "Utilities, maintenance, and turnover costs."
        ],
        correctChoice: 0,
        rationale: "NOI measures the property's own performance independent of how any owner financed it. Including debt service would give the same building a different NOI for every buyer, and omitting the replacement reserve describes a building that never needs a roof."
      }
    ],
    remediation: [
      {
        prompt: "Which three conventions must be settled before any proration is computed, and where do they come from?",
        choices: [
          "The day count, whether the settlement day is charged to the buyer or the seller, and the period — and all three come from the contract, not from habit.",
          "The interest rate, the loan amount, and the payoff date, set by the lender.",
          "The assessment cycle, the rate, and the exemptions, set by the locality.",
          "The commission rate, the split, and the fee, set by the broker."
        ],
        correctChoice: 0,
        rationale: "A 365-day year and a 360-day banker's year give different answers, and a licensee who computes an estimate without stating the conventions used has produced a number nobody can check."
      },
      {
        prompt: "Which test of highest and best use comes first?",
        choices: [
          "Legally permissible, then physically possible, then financially feasible, then maximally productive.",
          "Financially feasible, then legally permissible, then physically possible, then maximally productive.",
          "Maximally productive, then legally permissible, then physically possible, then financially feasible.",
          "Physically possible, then financially feasible, then legally permissible, then maximally productive."
        ],
        correctChoice: 0,
        rationale: "All four tests, in that order. Land is valued at its highest and best use as though vacant, which is why an old house on a commercially zoned corner may sell for land value."
      },
      {
        prompt: "Which form of depreciation is always incurable?",
        choices: [
          "External obsolescence — loss caused by something outside the property, which the owner cannot fix from inside the boundary.",
          "Physical deterioration.",
          "Functional obsolescence.",
          "Accrued depreciation of any kind."
        ],
        correctChoice: 0,
        rationale: "Physical deterioration and functional obsolescence are each curable where the cost to fix is recovered in value and incurable where it is not. The cost approach is value = land + cost new − accrued depreciation."
      },
      {
        prompt: "NOI is $232,440 and the market capitalization rate is 6.75 percent. What is the indicated value, and what happens if the rate moves to 7.25 percent?",
        choices: [
          "About $3,443,556 at 6.75 percent, falling to about $3,206,069 at 7.25 percent — a drop of roughly $237,000 for half a percentage point.",
          "About $1,569,000, rising as the rate rises.",
          "About $3,443,556, unchanged, because value depends only on NOI.",
          "About $15,691,000 at 6.75 percent."
        ],
        correctChoice: 0,
        rationale: "V = I ÷ R. A higher cap rate produces a lower value at the same NOI, so a market where rates rise is a market where values fall even if rents do not change. The rate is derived from comparable sales, not chosen."
      },
      {
        prompt: "What does a gross rent multiplier ignore?",
        choices: [
          "Vacancy and every operating expense, because it uses gross rent — so two buildings with identical gross rents and different expense structures appear identical when they are not.",
          "The sale price of the comparables.",
          "The subject's monthly rent.",
          "The condition of the property, which the cap rate captures."
        ],
        correctChoice: 0,
        rationale: "GRM = sale price ÷ monthly gross rent, and value = GRM × the subject's monthly gross rent. It is a screening tool for small residential income property, not a valuation method for anything serious."
      }
    ]
  },

  "module-12": {
    subject: "Investment, feasibility, and the physical property",
    applied: {
      prompt: "At a showing you observe a four-foot diagonal crack in a basement wall, fresh water staining below it, and a downspout discharging against the foundation at that corner. The house was built in 1974.",
      choices: [
        "Disclose all three in writing as material adverse facts about the physical condition actually known; refer the crack to a structural engineer; treat the downspout as an investigation item; and observe the federal lead-based paint requirements because 1974 construction is target housing — with no opinion about cause or seriousness.",
        "Tell the buyer it is probably normal settling and recommend they mention it to the inspector.",
        "Say nothing, because § 55.1-703 makes Virginia a buyer-beware state and the buyer must investigate.",
        "Disclose the staining only, since a crack is a structural matter outside the physical-condition duty."
      ],
      correctChoice: 0,
      rationale: "§ 54.1-2131 B requires written disclosure of material adverse facts about the physical condition actually known, and § 54.1-2131 A 6 requires material facts to be disclosed to the client. Diagnosis is outside the licence and a wrong one is a misrepresentation under 18VAC135-20-300. § 55.1-703 governs the owner, not the licensee."
    },
    engagement: [
      {
        prompt: "A property produces $60,000 NOI and costs $800,000, with $200,000 down and $600,000 borrowed at 9 percent interest-only. Is the leverage positive or negative?",
        choices: [
          "Negative — cash flow is $6,000, cash-on-cash is 3 percent, and that is below the 7.5 percent unleveraged return, so borrowing reduces the return on equity.",
          "Positive — any use of borrowed money increases the return on the investor's own cash.",
          "Neutral — leverage does not affect return, only risk.",
          "Positive — cash-on-cash is 12 percent."
        ],
        correctChoice: 0,
        rationale: "At 6 percent the same deal gives 12 percent cash-on-cash and is positive. Leverage amplifies whatever is happening in both directions, and the direction is decided by the relationship between the asset's return and the cost of debt."
      },
      {
        prompt: "Cash-on-cash return is before-tax cash flow divided by what?",
        choices: [
          "Total cash invested — the down payment plus closing costs, loan fees and any immediate capital outlay.",
          "The down payment alone.",
          "The purchase price.",
          "The loan amount."
        ],
        correctChoice: 0,
        rationale: "Using the down payment alone is the most common error. Cash-on-cash also omits appreciation, equity buildup and every tax effect; it measures one year's cash against cash, and it is useful precisely because it is narrow."
      },
      {
        prompt: "What may a licensee say about depreciation to an investor client?",
        choices: [
          "The concept — that a deduction is allowed on the improvements of income-producing property over a statutory recovery period, that land is not depreciable, and that depreciation reduces adjusted basis and so increases gain on sale — and nothing computed as advice.",
          "The exact annual deduction, once the price is known.",
          "How to allocate the purchase price between land and improvements.",
          "Whether a section 1031 exchange will qualify."
        ],
        correctChoice: 0,
        rationale: "Every figure depends on facts the licensee does not have and on law that changes. The rule is: compute the property, refer the person. Virginia also regulates exchange facilitators separately at Chapter 8 of Title 55.1."
      },
      {
        prompt: "In a sensitivity analysis, which single variable typically moves value most and is entirely outside the owner's control?",
        choices: [
          "The capitalization rate.",
          "The vacancy rate.",
          "Operating expenses.",
          "Market rent."
        ],
        correctChoice: 0,
        rationale: "On a base case of $336,440 NOI, moving the rate from 6.5 to 7.25 percent takes value from about $5,175,000 to about $4,641,000. Moving rent, vacancy, expenses and the rate together — as a downturn does — takes the same property to about $3,682,000, roughly 29 percent below the base case."
      },
      {
        prompt: "Which of these is the licensee's correct role when a condition is observed?",
        choices: [
          "Describe it accurately, disclose what the statute requires, and route it to the right professional — never diagnose it.",
          "Estimate the cost of repair so the client can negotiate.",
          "State whether it is a structural or a cosmetic problem.",
          "Advise whether the buyer should terminate."
        ],
        correctChoice: 0,
        rationale: "'It's just settling' and 'that stain is old' are opinions outside the licence, frequently wrong, and if wrong a misrepresentation under 18VAC135-20-300. The correct sentence is: I can see it, I have written it down, and here is who can tell you what it is."
      }
    ],
    remediation: [
      {
        prompt: "Which component of a house must never be cut or modified?",
        choices: [
          "A roof truss — it is an engineered assembly, and cutting a chord creates a structural problem.",
          "A ceiling joist.",
          "A header over an opening.",
          "A subfloor panel."
        ],
        correctChoice: 0,
        rationale: "A licensee needs construction vocabulary not to inspect but to describe accurately, recognise a question, and route it. Calling a truss a rafter will be misunderstood by the professionals the licensee is trying to involve."
      },
      {
        prompt: "What does § 55.1-703 name as examples of the due diligence a purchaser is advised to exercise?",
        choices: [
          "A home inspection as defined in § 54.1-500, a mould assessment by a business following EPA guidance, a residential building energy analysis as defined in § 54.1-1144, a property survey, and contacting the locality about zoning, lot coverage, height and setback requirements.",
          "A title search, an appraisal, and a credit check.",
          "An association document review and a reserve study only.",
          "Whatever the purchase contract's inspection contingency lists."
        ],
        correctChoice: 0,
        rationale: "The section also tells purchasers to investigate adjacent parcels, historic district ordinances, and Chesapeake Bay Preservation Act resource protection areas — each coupled with a statement that the owner makes no representations."
      },
      {
        prompt: "Which document confirms that a newly constructed building may lawfully be occupied?",
        choices: [
          "The certificate of occupancy.",
          "The final plat.",
          "The builder's warranty.",
          "The framing inspection approval."
        ],
        correctChoice: 0,
        rationale: "No closing on new construction should occur without confirming it. Change orders must be in writing and priced before work proceeds, and a builder's contract is usually the builder's form — a buyer signing one needs counsel."
      },
      {
        prompt: "What must a feasibility study count that is most often missed?",
        choices: [
          "Supply that is entitled but not yet built, which can appear on short notice.",
          "The subject property's own historical occupancy.",
          "The seller's asking price.",
          "The locality's assessed values."
        ],
        correctChoice: 0,
        rationale: "A project underwritten against current occupancy in a market with a large entitled pipeline is underwritten against a number that will not survive. Demand analysis is built from population, household formation, employment, income and absorption evidence."
      },
      {
        prompt: "Which is a reasonable threshold-setting practice in an investment decision?",
        choices: [
          "Setting the minimum return, coverage ratio, maximum price and acceptable downside in advance, before seeing the numbers.",
          "Setting the threshold after modelling the deal, so it reflects the opportunity.",
          "Adopting the seller's pro forma assumptions as the base case.",
          "Using the asking price's implied cap rate as the market rate."
        ],
        correctChoice: 0,
        rationale: "Setting a threshold after seeing the numbers is not analysis. The licensee presents the base case with every assumption sourced, the stress case, what could not be verified, and the open questions — not a recommendation to invest."
      }
    ]
  },

  "module-13": {
    subject: "Insurance, risk, and two integrated transactions",
    applied: {
      prompt: "Two days before settlement your buyer forwards an email that appears to come from the settlement agent's paralegal, correct display name and firm logo, subject 'Updated wire instructions — bank change'. The buyer asks whether it looks right.",
      choices: [
        "Treat it as fraudulent until verified: tell the buyer in writing at once not to send anything, telephone the settlement agent on a number obtained independently — never one from the email or its attachments — confirm with a named person, and notify the principal broker and the lender.",
        "Compare the email headers to the previous message and, if they match, tell the buyer to proceed.",
        "Reply to the email asking the paralegal to confirm the change.",
        "Tell the buyer that verifying wire instructions is the settlement agent's responsibility, not the licensee's."
      ],
      correctChoice: 0,
      rationale: "The attacker usually controls a compromised mailbox, so replying to the email and matching headers both confirm nothing. If money has moved, the buyer calls their bank immediately to request a recall and reports to IC3 and law enforcement — hours matter. The professional obligation rests on the ordinary-care duty at §§ 54.1-2131 A 4 and 54.1-2132 A 5."
    },
    engagement: [
      {
        prompt: "A buyer says title insurance and a home warranty make an inspection unnecessary. What does each actually respond to?",
        choices: [
          "Title insurance is backward-looking indemnity against defects in title existing at the policy date and not excepted, and covers no physical condition; a home warranty is a contract covering specified systems and appliances subject to exclusions, caps and pre-existing-condition provisions — so neither responds to a failing roof, a septic failure, or an encroachment.",
          "Title insurance covers physical defects existing at closing and the warranty covers everything after.",
          "The warranty covers pre-existing defects and title insurance covers boundary problems.",
          "Together they cover everything an inspection would find."
        ],
        correctChoice: 0,
        rationale: "The defect an inspection would find is the one most likely to be excluded from a warranty as pre-existing. § 55.1-703 itself names a home inspection as diligence the purchaser is advised to exercise."
      },
      {
        prompt: "Which peril is excluded from a standard homeowners policy and requires a separate policy?",
        choices: [
          "Flood.",
          "Fire.",
          "Windstorm.",
          "Theft."
        ],
        correctChoice: 0,
        rationale: "Flood coverage comes from the National Flood Insurance Program or the private flood market. Maps change, a substantial share of flood claims arise outside Special Flood Hazard Areas, and NFIP coverage has limits and a waiting period."
      },
      {
        prompt: "Which eight areas must a firm's written procedures and policies cover under § 54.1-2110.1 B 2?",
        choices: [
          "Escrow handling; fair housing compliance for residential work; advertising and marketing of the firm and affiliated teams or entities; negotiating and drafting contracts, leases and brokerage agreements; oversight and limits on unlicensed assistants; creating agency or independent contractor relationships; distributing new or amended law; and disclosing physical-condition information.",
          "Escrow, fair housing, advertising, and supervision only.",
          "Whatever the principal broker considers necessary for the firm's business.",
          "The eight areas listed in 18VAC135-20-165."
        ],
        correctChoice: 0,
        rationale: "A firm without these policies has a supervision failure, and their absence makes 'should have known' much easier to establish against the broker under 18VAC135-20-330."
      },
      {
        prompt: "A licensee is presented with a listing by an owner who will only communicate by email, refuses video identification, is remote, wants a fast cash closing, and gives proceeds instructions inconsistent with the record. What is this?",
        choices: [
          "The recognised pattern of seller impersonation fraud — the response is to insist on identity verification through the settlement agent and to escalate to the principal broker.",
          "An ordinary out-of-state seller, provided the deed is notarised.",
          "A matter for the title insurer only, since forgery is a covered risk.",
          "A matter for the buyer's lender, since the loan will not fund without verification."
        ],
        correctChoice: 0,
        rationale: "The pattern targets unencumbered, often vacant or non-owner-occupied property. Settlement agents are regulated under Chapter 10 of Title 55.1, and identity verification is properly routed through them."
      },
      {
        prompt: "A listing agreement dated 2 February states no termination date. On 20 May the seller accepts an offer. What must be resolved first?",
        choices: [
          "Whether the listing still exists — § 54.1-2137 C 1 terminated it 90 days after 2 February, in early May, unless it was extended in writing.",
          "Whether the buyer's agent is entitled to a share of the fee.",
          "Whether the seller's disclosure statement was delivered.",
          "Whether the property was advertised in the firm's name."
        ],
        correctChoice: 0,
        rationale: "§ 54.1-2137 B requires a brokerage agreement before providing brokerage services, so an expired listing is not a paperwork problem. If both sides are in one firm, written consent to designated or dual representation is also required, timed by 18VAC135-20-220 A 3."
      }
    ],
    remediation: [
      {
        prompt: "What does a lender's title policy insure, and how does its coverage change over time?",
        choices: [
          "The lender's security interest, in the amount of the loan, with coverage declining as the loan is paid down.",
          "The buyer's equity, increasing as the loan is paid down.",
          "Both parties equally, for the purchase price.",
          "The property's physical condition for the life of the loan."
        ],
        correctChoice: 0,
        rationale: "An owner's policy insures the buyer's interest in the amount of the purchase price for as long as the insured or their heirs hold an interest. A buyer who pays for the lender's policy and declines the owner's has purchased protection for someone else."
      },
      {
        prompt: "Which retention obligation applies to brokerage-relationship disclosures relating to fully executed purchase contracts?",
        choices: [
          "Three years, under § 54.1-2138 D, whether or not the disclosure was acknowledged in writing.",
          "One year from settlement.",
          "Three years, but only where the disclosure was signed.",
          "Five years, under 18VAC135-20-185."
        ],
        correctChoice: 0,
        rationale: "Two other three-year periods sit alongside it: 18VAC135-20-185 C 1 for brokerage agreements and dual and designated consents, and § 54.1-2110.1 B 7 for supervision records, which must be furnished to the Board's agent on request."
      },
      {
        prompt: "What is the single control that defeats most email account compromise?",
        choices: [
          "Multi-factor authentication on every email account.",
          "Changing passwords every 30 days.",
          "Using a firm-branded email domain.",
          "Encrypting attachments with a shared password."
        ],
        correctChoice: 0,
        rationale: "Alongside it: unique passwords in a manager, encrypted document transmission rather than plain attachments, least-privilege access, secure disposal, a retention schedule, and a written incident-response plan naming who is called first."
      },
      {
        prompt: "In a seller file at ratification, which of these is required by statute rather than by good practice?",
        choices: [
          "The written brokerage agreement with a definite termination date, the fee and how and when paid, the services, and the supervising broker's name and contact information.",
          "A signed net-proceeds estimate.",
          "A copy of the comparative market analysis presented at listing.",
          "Photographs taken before any staging."
        ],
        correctChoice: 0,
        rationale: "§ 54.1-2137 C and § 54.1-2110.1 B 6 supply those requirements. The other three are sensible file practice and are not statutory."
      },
      {
        prompt: "Which is the correct professional response to a Board complaint?",
        choices: [
          "Notify the principal broker immediately, preserve every record and change nothing, notify the errors and omissions carrier within the policy's reporting period, respond to the Board within the time given, and obtain counsel.",
          "Contact the complainant to explain the misunderstanding before responding.",
          "Wait for the Board to make contact a second time before responding.",
          "Correct any errors found in the file before producing it."
        ],
        correctChoice: 0,
        rationale: "18VAC135-20-240 requires provision of information to the Board, so failing to respond is itself a violation, and altering records is a far graver matter than the original complaint. § 54.1-2111.1 provides a voluntary compliance program for brokers."
      }
    ]
  },

  "module-14": {
    subject: "Case labs and mathematics mastery",
    applied: {
      prompt: "A licensee's internal note on a rental applicant reads: 'Nice guy, National Guard, gets deployed — probably won't be around, look for someone more stable.' The applicant is rejected.",
      choices: [
        "Military status is a Virginia protected class under § 36-96.3, so the rejection violates A 1 and A 2 — and the written note is direct evidence of the reason; the firm needs published objective written criteria applied uniformly and documented, in its § 54.1-2110.1 B 2 b fair housing policy.",
        "Permissible, because deployment affects the applicant's ability to perform the lease.",
        "Permissible if the landlord applies the same reasoning to all applicants in the armed forces.",
        "A problem only if the applicant files a complaint within the limitation period."
      ],
      correctChoice: 0,
      rationale: "18VAC135-20-330 names Chapter 5.1 of Title 36 expressly, so a fair housing violation by an affiliated licensee can reach the supervising broker on the knew-or-should-have-known standard."
    },
    engagement: [
      {
        prompt: "A licensee shows a buyer three properties on Saturday and signs a buyer brokerage agreement on Sunday. What was breached and when?",
        choices: [
          "§ 54.1-2132 A 1, on Saturday — a licensee engaged by a buyer shall enter into a brokerage agreement prior to showing property, and signing on Sunday does not cure Saturday.",
          "Nothing, provided the agreement is signed before an offer is written.",
          "§ 54.1-2137 C, because the agreement lacked a termination date.",
          "§ 54.1-2138 A, because no disclosure was given at the open house."
        ],
        correctChoice: 0,
        rationale: "§ 54.1-2136's preconditions must also have preceded the relationship, and if the licensee had a substantive discussion about a specific property with someone neither client nor represented, § 54.1-2138 A required written disclosure no later than when specific real estate assistance was first provided."
      },
      {
        prompt: "A listing licensee withholds a low written offer, believing it a waste of the seller's time. Which rules are broken?",
        choices: [
          "18VAC135-20-300 3 — failure to tender promptly every written offer — and § 54.1-2131 A 2 c, requiring timely presentation of written offers, together with the ordinary-care duty at A 4 and performance per the agreement at A 1.",
          "None, provided the licensee informed the buyer's agent of the seller's position.",
          "Only 18VAC135-20-260, prohibited acts.",
          "Only the firm's internal policy on offer handling."
        ],
        correctChoice: 0,
        rationale: "The pre-qualification letter is not a ground for withholding; it is a fact to present with the offer so the seller can weigh it. The licensee substituted their judgment for the client's, which is the error the rule exists to prevent."
      },
      {
        prompt: "Eighteen months after a closing, a licensee representing a buyer knows the former seller's lowest acceptable figure from the earlier engagement. May they use it?",
        choices: [
          "No — § 54.1-2137 D preserves the confidentiality duty after termination, expiration or completion, unless the law provides otherwise or the client consents in writing; the conflict with the current buyer's interests goes to the principal broker and may require declining the engagement as to this property.",
          "Yes — the duty ended with the brokerage relationship.",
          "Yes, provided the licensee does not identify the source.",
          "Only if the former seller is no longer represented."
        ],
        correctChoice: 0,
        rationale: "The two duties that survive are to account and to keep confidential. § 54.1-2138 C separately requires written disclosure to all clients and customers already involved if the licensee's relationship changes."
      },
      {
        prompt: "A landlord's published criteria require income of three times the rent. An applicant with a housing choice voucher has income of 1.6 times the rent, with the voucher paying the balance. The manager rejects them.",
        choices: [
          "Discrimination on the basis of source of funds under § 36-96.3 A 1 and A 2 — the criterion must be applied to the tenant's portion of the rent where a subsidy pays the balance.",
          "Permissible, because the criterion is published and applied to everyone.",
          "Permissible, because vouchers are a federal programme outside Virginia law.",
          "Permissible if the landlord also rejects applicants without vouchers at the same income."
        ],
        correctChoice: 0,
        rationale: "Applying a whole-rent income multiple to a subsidised applicant screens voucher holders out as a class. Waiving a published criterion for one applicant and not another is separately the classic evidentiary pattern in a disparate-treatment case."
      },
      {
        prompt: "A student computes a September 12 tax proration as '9 ÷ 12 × $4,380 = $3,285, debit buyer'. Classify the errors.",
        choices: [
          "A period error (254 days, not nine months), a method error (whole months rather than the 365-day daily rate the convention requires), and a side error (arrears means debit seller, credit buyer) — the correct entry is $3,048.00 debit seller, credit buyer.",
          "Only a side error; the arithmetic is otherwise correct.",
          "Only a rounding error.",
          "No error; the shortcut is an accepted approximation."
        ],
        correctChoice: 0,
        rationale: "$4,380 ÷ 365 = $12.00 daily; 1 January to 11 September is 254 days; 254 × $12.00 = $3,048.00. Correcting an error by method rather than by answer is what prevents it recurring."
      }
    ],
    remediation: [
      {
        prompt: "A lot measures 210 feet by 290 feet. How many acres, and at $78,000 per acre what is the indicated land value?",
        choices: [
          "1.398 acres and about $109,044.",
          "0.716 acres and about $55,848.",
          "1.398 acres and about $1,090,440.",
          "60,900 acres and about $4.75 billion."
        ],
        correctChoice: 0,
        rationale: "210 × 290 = 60,900 square feet; ÷ 43,560 = 1.398 acres; × $78,000 = $109,044. One acre is 43,560 square feet."
      },
      {
        prompt: "Sale price $624,000, total fee 5.5 percent, split evenly between firms, listing salesperson on a 70/30 split with their firm. What does the salesperson receive?",
        choices: [
          "$12,012.",
          "$17,160.",
          "$34,320.",
          "$5,148."
        ],
        correctChoice: 0,
        rationale: "$624,000 × 0.055 = $34,320; the listing firm's half is $17,160; 70 percent of that is $12,012. § 54.1-2136 (ii) requires the compensation and whether it will be shared to be disclosed before the relationship begins."
      },
      {
        prompt: "A comparable sold at $455,000 with a 3-car garage against the subject's 2 (a bay contributes $9,000), 1,850 square feet against the subject's 1,975 (at $70 per square foot), four months ago in a market rising 0.3 percent per month. What is the adjusted price?",
        choices: [
          "$460,210.",
          "$449,790.",
          "$472,210.",
          "$438,750."
        ],
        correctChoice: 0,
        rationale: "Garage superior, so −$9,000. Area inferior by 125 square feet, so +$8,750. Market conditions 4 × 0.3 percent = 1.2 percent of $455,000, so +$5,460. $455,000 − 9,000 + 8,750 + 5,460 = $460,210."
      },
      {
        prompt: "Which entry is never prorated at settlement?",
        choices: [
          "A tenant's security deposit — the whole deposit transfers, debit seller credit buyer.",
          "Real property taxes paid in arrears.",
          "Association dues paid in advance.",
          "Rent collected in advance."
        ],
        correctChoice: 0,
        rationale: "The deposit is the tenant's money held in trust, not an expense shared by ownership period. It is also escrow money under 18VAC135-20-181 A 2 once a firm holds it."
      },
      {
        prompt: "What does a decision log entry in a management file record?",
        choices: [
          "Date and time; who said what and by what channel; what was decided; on what authority — statute, lease, management agreement or the owner's written instruction; who was notified; and the next step and its date.",
          "The manager's conclusion and the date it was reached.",
          "Only communications with the owner.",
          "Only matters that resulted in an expenditure."
        ],
        correctChoice: 0,
        rationale: "A log kept contemporaneously is evidence. A log reconstructed after a complaint is an admission that none was kept."
      }
    ]
  },

  "module-15": {
    subject: "Cumulative review, simulation, and readiness",
    applied: {
      prompt: "A seller tells her licensee, 'don't put the roof leak in writing — the buyer's inspection will find it, and § 55.1-703 says I make no representations anyway.'",
      choices: [
        "The instruction cannot be followed: § 55.1-703 governs the owner, not the licensee, and § 54.1-2131 B requires the licensee to disclose in writing all material adverse facts about the physical condition actually known — failing to do so is also misrepresentation or omission under 18VAC135-20-300 2.",
        "The instruction may be followed, because the client controls what is disclosed about their own property.",
        "The instruction may be followed provided the licensee tells the buyer to obtain an inspection.",
        "The instruction may be followed because Virginia is a buyer-beware state."
      ],
      correctChoice: 0,
      rationale: "A client's instruction cannot authorise a violation, and § 54.1-2131 B expressly provides that no cause of action arises against a licensee for revealing information as required. The licensee confirms the position in writing and notifies the principal broker."
    },
    engagement: [
      {
        prompt: "What standard of care does a Virginia licensee owe a client, and why is it not a fiduciary standard?",
        choices: [
          "Ordinary care — §§ 54.1-2131 A 4 and 54.1-2132 A 5 — because § 54.1-2144 abrogates the common law of agency to the extent inconsistent with the article.",
          "The utmost fiduciary care, as at common law.",
          "Ordinary care toward customers and fiduciary care toward clients.",
          "Whatever standard the firm's written policy adopts."
        ],
        correctChoice: 0,
        rationale: "Where a national text and the Code differ, the Code governs in Virginia. A brokerage-relationship question is answered from §§ 54.1-2130 through 54.1-2146."
      },
      {
        prompt: "Which liens survive a foreclosure sale?",
        choices: [
          "Liens senior to the foreclosing lien, and real property tax liens, which hold statutory priority regardless of recording date.",
          "All liens of record, which the purchaser assumes.",
          "Only liens the purchaser agrees in writing to assume.",
          "None; a foreclosure conveys clear title."
        ],
        correctChoice: 0,
        rationale: "Junior liens are extinguished as to the property, though the underlying debts may survive against the debtor personally. Proceeds go to costs of sale, then the foreclosing lien, then junior liens in priority order, then any surplus to the borrower."
      },
      {
        prompt: "State the three § 55.1-2312 cancellation periods.",
        choices: [
          "Delivery before ratification: the agreed period or three days from ratification. Delivery after ratification: the agreed period or three days from receipt. No delivery at all: any time before settlement.",
          "Three days in every case, running from ratification.",
          "Fourteen days from the written request in every case.",
          "Until settlement in every case."
        ],
        correctChoice: 0,
        rationale: "Written notice must comply with the contract's terms and the purchaser bears the burden of demonstrating delivery. Where a unit is governed by more than one association the period runs from the last certificate delivered, and cancellation is without penalty with the deposit returned promptly."
      },
      {
        prompt: "Does Virginia's residential property disclosure statute require an owner to describe the property's condition?",
        choices: [
          "No — § 55.1-703 is headed 'Required disclosures for buyer to beware' and the owner furnishes a Real Estate Board statement whose content is that the owner makes no representations, coupled with advice that the purchaser exercise whatever due diligence they deem necessary.",
          "Yes — the owner completes a condition checklist covering the major systems.",
          "Yes, but only for latent defects the owner cannot see.",
          "Only where the buyer's contract requires it."
        ],
        correctChoice: 0,
        rationale: "The licensee's duty is separate and narrower in subject but stricter in form: material adverse facts about the physical condition actually known, disclosed in writing under § 54.1-2131 B."
      },
      {
        prompt: "By what standard is a supervising broker disciplined for an affiliated salesperson's violation?",
        choices: [
          "Knew or should have known of the violation and failed to take reasonable action under the circumstances to remedy it — 18VAC135-20-330.",
          "Strict vicarious liability for all acts of affiliated licensees.",
          "Only where the broker directed or ratified the act.",
          "Only where the salesperson's licence is revoked."
        ],
        correctChoice: 0,
        rationale: "The section names Chapter 21 of Title 54.1, Chapter 5.1 of Title 36, and the Board's regulations. What makes 'should have known' bite is the supervision duties in § 54.1-2110.1 B."
      }
    ],
    remediation: [
      {
        prompt: "Which of these is Virginia's rule and not the national one?",
        choices: [
          "A brokerage agreement with a buyer must be signed before showing property.",
          "A counteroffer terminates the original offer.",
          "Title passes on delivery rather than on recording.",
          "Adjustments are made to the comparable rather than to the subject."
        ],
        correctChoice: 0,
        rationale: "§ 54.1-2132 A 1 is the most distinctive rule in the article. The other three are general principles that apply in Virginia as elsewhere."
      },
      {
        prompt: "May a licensee selling their own home rely on the fair housing owner exemption?",
        choices: [
          "No — § 36-96.2 A provides that the exemption does not apply to or inure to the benefit of any Real Estate Board licensee, regardless of whether the licensee is acting in a personal or professional capacity.",
          "Yes, provided they own no more than three single-family houses.",
          "Yes, provided no licensee's services are used.",
          "Yes, for one sale in any 24-month period."
        ],
        correctChoice: 0,
        rationale: "18VAC135-20-155 B makes the same point from the licensing side: conduct in a personal capacity is reachable by the Board where it involves acts covered by § 54.1-2100."
      },
      {
        prompt: "In designated agency, who is the dual agent?",
        choices: [
          "The principal or supervising broker supervising the transaction — the designated agents are not, provided neither represents more than one client.",
          "Both designated agents, jointly.",
          "Nobody; designated agency eliminates dual agency entirely.",
          "The firm as an entity, which holds the licence."
        ],
        correctChoice: 0,
        rationale: "§ 54.1-2139.1 A says so expressly, and the statutory disclosure form acknowledges that the dual agent may not pass confidences between the sides. Designated agents may disclose client confidences only to their own broker."
      },
      {
        prompt: "Where does a licensee find the current text of the Board's regulations?",
        choices: [
          "18VAC135-20, published free and current at law.lis.virginia.gov alongside the Code of Virginia.",
          "In the Board's printed handbook, issued at licensure.",
          "In the multiple listing service's rules library.",
          "In the firm's written policies, which restate them."
        ],
        correctChoice: 0,
        rationale: "The rule this course has followed throughout is to read the section rather than a summary of it. Four times in this project a secondary description diverged from the primary text, once by thirty hours."
      },
      {
        prompt: "What is this course's regulatory status, and what must never be said about it?",
        choices: [
          "It is a submission draft, not approved, and carries no Virginia pre-license credit — approval is a decision of the Real Estate Board and until it is recorded no completion of this course qualifies anyone for anything.",
          "It is approved pending final administrative processing.",
          "It satisfies 18VAC135-20-400 and therefore carries credit.",
          "It carries credit for students who complete all 60 hours."
        ],
        correctChoice: 0,
        rationale: "The course also does not license anyone: licensure requires application to the Board, examination, and the Board's action. Every document in this package states the status in these terms."
      }
    ]
  }
};

export default modules;
