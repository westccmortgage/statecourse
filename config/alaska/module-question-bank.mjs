/**
 * Alaska Real Estate Salesperson Prelicense (40 contact hours) — module question bank.
 *
 * 12 AAC 64.410(a)(8) requires a student to complete the course and an instructor
 * evaluation before a certificate may issue, and 12 AAC 64.430(b) requires a
 * correspondence course to include an unanswered examination or project activity
 * turned in to the instructor for grading. The items here are neither of those. They
 * are in-module assessment: they gate progression through the course, and they do not
 * satisfy the rule's instructor-graded instrument, which is filed with the Commission
 * for prior approval and is not published to students in advance.
 *
 * Each module carries:
 *   applied      — one scenario item worked inside the module
 *   engagement   — five scored items
 *   remediation  — five alternate items on the same concepts, served after a failed
 *                  engagement check alongside the alternate explanation
 *
 * Every item's correct answer sits at index 0 here for authoring legibility. The engine
 * permutes choices deterministically per item id before delivery, so what a student sees
 * is not ordered by correctness and a recorded selection keeps its meaning permanently.
 *
 * Course version 1.0 submission draft — not certified. No Alaska credit is available.
 */

const modules = {
  "module-01": {
    subject: "Licensee relationships, disclosure, and conflict of interest",
    applied: {
      prompt: "A licensee lists a house for a seller. An unrepresented buyer calls, asks to see it, and the licensee shows it and answers questions about the roof. The buyer later complains that the licensee never told him about a known drainage problem and never gave him anything explaining the relationship. What went wrong?",
      choices: [
        "The licensee provided specific assistance to the buyer, which owes every duty in AS 08.88.615 — including disclosure of material information about the physical condition of the real estate and delivery of the consumer pamphlet before assistance began.",
        "Nothing went wrong; a listing licensee owes an unrepresented buyer no duties at all under Alaska's statutory scheme.",
        "The licensee created a dual agency by showing the property, which Alaska permits with written consent.",
        "The licensee owed the buyer the AS 08.88.620 duties because showing property makes the buyer a represented person."
      ],
      correctChoice: 0,
      rationale: "AS 08.88.600 distinguishes representing a person from providing specific assistance. Specific assistance still triggers every duty in AS 08.88.615, which includes disclosing material information about the physical condition and giving the pamphlet before assistance begins. It does not trigger the AS 08.88.620 duties, which run only to a represented person, and it does not create a dual agency — AS 08.88.650 does not permit one."
    },
    engagement: [
      {
        prompt: "Where does the law of the licensee relationship come from in Alaska?",
        choices: [
          "From AS 08.88.600 – 08.88.695, because AS 08.88.675 expressly abrogates the common law of agency to the extent it is inconsistent with those sections.",
          "From the common law of agency, which the statutes supplement.",
          "From the listing agreement, which the statutes leave the parties free to write.",
          "From national practice standards adopted by the Commission."
        ],
        correctChoice: 0,
        rationale: "AS 08.88.675 abrogates the common law of agency to the extent inconsistent with the statutory scheme. The statute is the law of the relationship; common-law doctrine survives only where it does not conflict."
      },
      {
        prompt: "What form does Alaska require to establish a neutral licensee relationship?",
        choices: [
          "A separate form titled \"Waiver of Right To Be Represented\", signed as a preauthorisation.",
          "A clause in the listing agreement acknowledging neutrality.",
          "A verbal disclosure confirmed in writing after the fact.",
          "No form; neutrality arises by operation of law when one licensee assists both sides."
        ],
        correctChoice: 0,
        rationale: "AS 08.88.610(c) requires the consent to be given on a separate form bearing that title. A clause buried in another document does not comply, and neutrality never arises automatically."
      },
      {
        prompt: "Which duty is owed to a represented person but not to a person receiving only specific assistance?",
        choices: [
          "The duty to advise the person to seek expert advice on matters relating to the transaction that are beyond the licensee's expertise.",
          "Reasonable skill and care.",
          "Honest and good faith dealing.",
          "Timely presentation of written communications."
        ],
        correctChoice: 0,
        rationale: "The duty to advise a person to seek expert advice sits in AS 08.88.620, which lists the additional duties owed to a represented person. Skill and care, honesty and good faith, and timely presentation of written communications are AS 08.88.615 duties owed in every licensee relationship."
      },
      {
        prompt: "How must a written conflict of interest disclosure begin under AS 08.88.391?",
        choices: [
          "With the words \"Disclosure of Conflict of Interest.\", underlined and in bold.",
          "With the licensee's name and licence number.",
          "With the property's legal description.",
          "With a recital that the client waives the conflict."
        ],
        correctChoice: 0,
        rationale: "AS 08.88.391 prescribes the opening words, underlined and in bold, and requires verbal disclosure confirmed in writing as soon as possible after the conflict is identified. The form is part of the requirement, not a suggestion."
      },
      {
        prompt: "What is a designated licensee relationship?",
        choices: [
          "A relationship in which a named licensee represents a party, without the representation being imputed to the broker or to the broker's other licensees.",
          "A dual agency in which one licensee represents both parties with written consent.",
          "A relationship designated by the client after closing for referral purposes.",
          "A relationship in which the broker personally represents both parties."
        ],
        correctChoice: 0,
        rationale: "AS 08.88.640 and .650 allow a broker to designate a licensee to represent a party, and knowledge is not imputed across the firm. Alaska does not permit dual agency, which is why the designated structure exists."
      }
    ],
    remediation: [
      {
        prompt: "A licensee says she is a \"dual agent\" for both parties. What is wrong with the statement in Alaska?",
        choices: [
          "Alaska does not permit dual agency; representing both parties is not an available relationship, and 12 AAC 64.130(2) makes representing more than one party grounds for discipline.",
          "Nothing; Alaska permits dual agency with informed written consent from both parties.",
          "Nothing, provided the broker rather than the salesperson holds the relationship.",
          "It is permitted only where both parties are unrepresented."
        ],
        correctChoice: 0,
        rationale: "AS 08.88.650 does not permit dual agency, and 12 AAC 64.130(2) separately makes representing more than one party in a transaction grounds for revocation or suspension."
      },
      {
        prompt: "When must the consumer pamphlet be given?",
        choices: [
          "Before the licensee begins providing specific assistance.",
          "At the first written offer.",
          "At closing, with the other transaction documents.",
          "Only to represented persons, at the time the representation agreement is signed."
        ],
        correctChoice: 0,
        rationale: "AS 08.88.615 places the pamphlet among the duties owed in every licensee relationship and requires it before assistance begins. Waiting until an offer or closing is too late."
      },
      {
        prompt: "A neutral licensee learns the seller will accept less than the asking price. What may the licensee tell the buyer?",
        choices: [
          "Nothing about the seller's bargaining position; the neutral licensee's duties are set by statute and do not include advocating for or advantaging either party.",
          "Everything, because a neutral licensee owes no confidentiality to anyone.",
          "Only what the seller expressly authorises in the listing agreement, without a separate form.",
          "Whatever the buyer asks, because the buyer signed the waiver."
        ],
        correctChoice: 0,
        rationale: "Neutrality is not the absence of duty. The statutory scheme fixes what a neutral licensee owes each party, and disclosing one party's bargaining position to the other is not within it."
      },
      {
        prompt: "A licensee's spouse wants to buy the licensee's listing. What does AS 08.88.391 require?",
        choices: [
          "Verbal disclosure of the conflict to the persons adversely affected or their licensees, confirmed in writing as soon as possible after the conflict is identified, in a disclosure beginning with the prescribed underlined bold words.",
          "Nothing, because the licensee is not the buyer.",
          "Written disclosure at closing.",
          "Withdrawal from the transaction, with no disclosure permitted."
        ],
        correctChoice: 0,
        rationale: "AS 08.88.391 requires both the verbal disclosure and the written confirmation, as soon as possible after the conflict is identified. It also connects to 12 AAC 64.130(10), which prohibits using relatives to conceal a licensee's profit and identity."
      },
      {
        prompt: "What effect does AS 08.88.640 have on the broker's knowledge when a licensee is designated?",
        choices: [
          "Knowledge held by the designated licensee is not imputed to the broker or to the broker's other licensees.",
          "All knowledge is imputed to the broker, who therefore represents both parties.",
          "Knowledge is imputed only where the broker personally supervises the transaction.",
          "Knowledge is imputed unless the client signs a waiver."
        ],
        correctChoice: 0,
        rationale: "The absence of imputed knowledge is what makes the designated structure work in a state that does not permit dual agency. Without it, one designation would contaminate the whole firm."
      }
    ]
  },

  "module-02": {
    subject: "Forms of ownership",
    applied: {
      prompt: "Two unmarried business partners buy a duplex together and ask you how they should take title. One says he wants his half to pass to his sister if he dies; the other wants the survivor to take everything. What do you do?",
      choices: [
        "Explain in general terms how the available forms differ in survivorship and transferability, tell them the choice has estate, tax, and creditor consequences, and advise them to get expert advice before the deed is drawn — the duty AS 08.88.620(3) imposes on a represented person's licensee.",
        "Recommend joint tenancy with right of survivorship, since it avoids probate and is simplest.",
        "Recommend tenancy in common, since they are business partners.",
        "Fill in the vesting on the purchase agreement as tenants in common and let the title company sort it out at closing."
      ],
      correctChoice: 0,
      rationale: "The two partners want incompatible outcomes, which is precisely a matter beyond a licensee's expertise. AS 08.88.620(3) makes advising a represented person to seek expert advice a statutory duty. Explaining how the forms differ is proper; choosing for them, or leaving the vesting to be discovered at closing, is not."
    },
    engagement: [
      {
        prompt: "What distinguishes joint tenancy from tenancy in common?",
        choices: [
          "The right of survivorship: on a joint tenant's death the interest passes to the surviving joint tenants rather than through the decedent's estate.",
          "Joint tenants must hold equal shares; tenants in common may not.",
          "Only joint tenants may convey their interest during life.",
          "Tenancy in common is available only to married couples."
        ],
        correctChoice: 0,
        rationale: "Survivorship is the operative difference. A tenant in common's share passes under the will or by intestacy; a joint tenant's does not enter the estate at all."
      },
      {
        prompt: "What is a common interest community under AS 34.08?",
        choices: [
          "Real estate in which a person, by virtue of ownership of a unit, is obligated to pay for real estate other than that unit — the definition that brings condominiums, cooperatives, and planned communities under one statute.",
          "Any subdivision governed by recorded covenants.",
          "Any development in which owners share a private road.",
          "A cooperative only; condominiums are governed separately."
        ],
        correctChoice: 0,
        rationale: "AS 34.08 is Alaska's Uniform Common Interest Ownership Act, and its defining feature is the obligation, arising from unit ownership, to pay for real estate other than the unit."
      },
      {
        prompt: "What is a life estate, and what happens to the property when the measuring life ends?",
        choices: [
          "A freehold estate measured by the duration of a life, after which the property passes to a remainderman or reverts to the grantor.",
          "A leasehold for the tenant's lifetime.",
          "An estate that terminates on the holder's remarriage.",
          "An interest that cannot be conveyed or encumbered during the life tenant's life."
        ],
        correctChoice: 0,
        rationale: "A life estate is freehold, not leasehold. The life tenant may convey what they have, but a purchaser takes an interest that ends when the measuring life does."
      },
      {
        prompt: "Which entity form allows a real estate holding to survive the death of an individual owner without probate of the property itself?",
        choices: [
          "Ownership by an entity such as a corporation or limited liability company, where the decedent's interest is in the entity rather than in the land.",
          "Sole ownership with a recorded beneficiary designation on the deed of trust.",
          "Tenancy in common with a written partnership agreement.",
          "A leasehold estate of more than one year."
        ],
        correctChoice: 0,
        rationale: "Where an entity owns the land, the individual owns an interest in the entity. That interest passes according to the entity's governing documents and the owner's estate plan; the land itself does not change hands."
      },
      {
        prompt: "Why does the authority of a person signing for an entity matter to a real estate transaction?",
        choices: [
          "Because a conveyance signed by someone without authority may not convey, and the title company will require evidence of authority before insuring.",
          "Because entities may not own Alaska real property without Commission approval.",
          "Because entity-owned property is exempt from recording.",
          "Because entity signatures need not be acknowledged."
        ],
        correctChoice: 0,
        rationale: "Authority is the first question a title examiner asks about an entity conveyance, and it is a question a licensee should raise at listing rather than at closing."
      }
    ],
    remediation: [
      {
        prompt: "A tenant in common dies leaving a will. Where does her interest go?",
        choices: [
          "Through her estate, according to the will.",
          "To the surviving co-tenants by survivorship.",
          "To the surviving co-tenants unless the will says otherwise.",
          "To the state, because co-tenancy interests are not devisable."
        ],
        correctChoice: 0,
        rationale: "A tenancy in common has no survivorship. The interest is part of the estate and passes as the will or intestacy law directs."
      },
      {
        prompt: "What must a unit owner give a purchaser before a contract for the sale of a unit in a common interest community is executed?",
        choices: [
          "The declaration as amended, the bylaws, the rules or regulations, and the AS 34.08.590 certificate.",
          "Only the current year's operating budget.",
          "Only the association's insurance certificate.",
          "Nothing; the association delivers everything at closing."
        ],
        correctChoice: 0,
        rationale: "AS 34.08.590(a) lists all four, and the certificate itself must state fourteen enumerated items. The purchase contract stays voidable until the certificate is delivered and for five days after."
      },
      {
        prompt: "A remainderman wants to sell the property while the life tenant is alive. What is the obstacle?",
        choices: [
          "The remainderman holds a future interest and cannot deliver present possession; a sale of the whole requires the life tenant to join.",
          "Remainder interests are not transferable in Alaska.",
          "The life tenant must first record a disclaimer.",
          "The property cannot be sold at all until the life estate ends."
        ],
        correctChoice: 0,
        rationale: "The remainderman can sell what they own — the future interest — but not present possession. Selling the entire fee requires both interests at the table."
      },
      {
        prompt: "What does the fact that a property is in a common interest community change about a listing?",
        choices: [
          "Assessments, reserves, restrictions, and the AS 34.08.590 resale certificate become part of the listing work, and the certificate has to be ordered early enough to meet the closing date.",
          "Nothing; the sale proceeds as any other.",
          "The association becomes a party to the purchase agreement.",
          "The seller's disclosure obligations under AS 34.70 no longer apply."
        ],
        correctChoice: 0,
        rationale: "AS 34.70.200(2) expressly includes a unit subject to AS 34.07 or AS 34.08 within \"real property\", so the disclosure obligations still apply — and the resale certificate adds a deadline the licensee has to manage."
      },
      {
        prompt: "Two people take title \"as joint tenants with right of survivorship\" and one later conveys her interest to a third party. What is the likely result?",
        choices: [
          "The conveyance severs the joint tenancy as to that interest, leaving the third party a tenant in common with the remaining owner.",
          "The conveyance is void, because a joint tenant cannot convey.",
          "The third party becomes a joint tenant with the survivorship right intact.",
          "The remaining owner acquires the whole by survivorship immediately."
        ],
        correctChoice: 0,
        rationale: "Severance is the classic consequence of a lifetime conveyance by a joint tenant. It is also a legal question with estate consequences, which makes it AS 08.88.620(3) territory rather than a licensee's opinion."
      }
    ]
  },

  "module-03": {
    subject: "Property law: public and private rights and limitations",
    applied: {
      prompt: "A buyer is considering a remote parcel reached across land the seller says \"everybody has always driven over.\" There is no recorded easement. The buyer asks whether access is a problem.",
      choices: [
        "Tell him that recorded access and habitual use are different things, that an unrecorded claim of access is a legal question about which you cannot advise, and that he should have counsel and the title company examine access before the contingency date — recording it in the file.",
        "Assure him that long-standing use creates a prescriptive easement in Alaska, so access is secure.",
        "Assure him the title policy will insure access whether or not an easement is recorded.",
        "Tell him access is not a real estate matter and refer him to the borough."
      ],
      correctChoice: 0,
      rationale: "Whether a prescriptive or implied easement exists is a legal conclusion, and whether a policy insures access depends on the commitment's exceptions. AS 08.88.620(3) makes advising a represented client to get expert advice a duty. Recording the recommendation and the date protects both the client and the file."
    },
    engagement: [
      {
        prompt: "What is the difference between a public and a private limitation on land?",
        choices: [
          "A public limitation arises from government power — zoning, taxation, eminent domain, police power; a private limitation arises from agreement or grant, such as an easement or a restrictive covenant.",
          "A public limitation is recorded and a private one is not.",
          "A public limitation may be waived by the owner and a private one may not.",
          "A public limitation binds only municipalities."
        ],
        correctChoice: 0,
        rationale: "The distinction is the source of the restriction. Both may be recorded, both bind owners, and both show up in a title examination — but only the private ones were agreed to."
      },
      {
        prompt: "What is an easement appurtenant?",
        choices: [
          "An easement benefiting a dominant parcel and burdening a servient parcel, which runs with the land when either is conveyed.",
          "An easement personal to an individual that ends on that person's death.",
          "A revocable permission to cross land.",
          "A limitation imposed by a municipality on a parcel's use."
        ],
        correctChoice: 0,
        rationale: "An appurtenant easement attaches to the land rather than the person. That is what distinguishes it from an easement in gross and from a mere licence, which is revocable."
      },
      {
        prompt: "Which of these is an exercise of the police power rather than a taking?",
        choices: [
          "Zoning that restricts how a parcel may be used, without compensation.",
          "Condemnation of a strip of land for a road, with compensation.",
          "Escheat of property to the state where an owner dies without heirs.",
          "A tax foreclosure sale for unpaid property taxes."
        ],
        correctChoice: 0,
        rationale: "The police power regulates use for public health, safety, and welfare without compensation. Eminent domain takes property and requires just compensation; escheat and tax foreclosure are separate governmental powers."
      },
      {
        prompt: "What does a restrictive covenant do?",
        choices: [
          "It privately limits how land may be used, is recorded, and may be enforced by those the covenant benefits.",
          "It transfers a possessory interest in the land.",
          "It attaches only to the original parties and does not bind successors.",
          "It is enforceable only by the municipality."
        ],
        correctChoice: 0,
        rationale: "Covenants are private land-use control. Whether a particular covenant runs with the land and who may enforce it are legal questions, but the recorded covenant is a limitation a licensee must find and disclose."
      },
      {
        prompt: "Why does land status matter more in Alaska title work than in most states?",
        choices: [
          "Because large areas are federal, state, borough, municipal, and Alaska Native corporation land, and the conveyance history of a parcel can turn on which it came from and on what terms.",
          "Because Alaska has no recording system for private land.",
          "Because Alaska does not recognise fee simple ownership.",
          "Because all Alaska land is subject to a state right of first refusal."
        ],
        correctChoice: 0,
        rationale: "Alaska's land history — federal and state selections, municipal entitlements, and the Alaska Native Claims Settlement Act — leaves reservations, exceptions, and conditions in chains of title that a licensee should expect to see in a commitment."
      }
    ],
    remediation: [
      {
        prompt: "A neighbour has parked on the corner of a listing for eleven years. What should the licensee do?",
        choices: [
          "Treat it as a finding, disclose it, and route the question of what rights it may have created to the title company and counsel.",
          "Advise the seller that eleven years is not long enough to matter.",
          "Advise the seller to erect a fence before listing to defeat any claim.",
          "Ignore it, because possession by a neighbour is not a title matter."
        ],
        correctChoice: 0,
        rationale: "Visible occupation is the classic trigger for inquiry notice, and whether it has ripened into a right is a legal question. Recognise, disclose, route."
      },
      {
        prompt: "What is an encroachment, and does it matter whether the intrusion is onto the neighbour's land or into a setback?",
        choices: [
          "A physical intrusion of an improvement onto adjoining land or across a setback.",
          "A recorded restriction on the use of land.",
          "A lien securing an unpaid debt.",
          "A government limitation on density."
        ],
        correctChoice: 0,
        rationale: "An encroachment is physical. It is usually found by a survey rather than in the record, which is why a survey exception in a title commitment matters."
      },
      {
        prompt: "How does an easement in gross differ from an easement appurtenant?",
        choices: [
          "It benefits a person or entity rather than a parcel, so there is no dominant estate — a utility easement being the common example.",
          "It is always revocable at will.",
          "It cannot be recorded.",
          "It terminates automatically on conveyance of the servient parcel."
        ],
        correctChoice: 0,
        rationale: "The absence of a dominant estate is the defining feature. Commercial easements in gross, such as utility easements, are generally transferable and are recorded."
      },
      {
        prompt: "A buyer wants to run a business from a house in a residential zone. What is the correct response?",
        choices: [
          "Tell him the zoning question has to be answered by the municipality or borough before he relies on it, and put a contingency in the contract with a date.",
          "Assure him home occupations are permitted everywhere in Alaska.",
          "Assure him that a covenant permitting home occupations overrides zoning.",
          "Tell him zoning does not apply outside incorporated cities, so there is nothing to check."
        ],
        correctChoice: 0,
        rationale: "The answer comes from the governing body, not from the licensee, and it belongs in the contract as a dated contingency. Restrictive covenants and zoning operate independently; complying with one does not satisfy the other."
      },
      {
        prompt: "What is the relationship between a recorded covenant and a zoning ordinance when they conflict?",
        choices: [
          "Both apply independently, and the more restrictive one governs what the owner may actually do.",
          "The zoning ordinance always supersedes the covenant.",
          "The covenant always supersedes the ordinance, because it was agreed to.",
          "The later in time supersedes the earlier."
        ],
        correctChoice: 0,
        rationale: "They come from different sources and neither repeals the other. An owner has to satisfy both, which in practice means the stricter one controls."
      }
    ]
  },

  "module-04": {
    subject: "Forms of conveyances and recording of documents",
    applied: {
      prompt: "A title commitment on your listing shows a requirement to obtain a reconveyance of a deed of trust the seller says was paid off in 2012, and the lender has since been acquired twice. Closing is in 21 days.",
      choices: [
        "Send it to the title company immediately, tell the seller that a paid loan never reconveyed still appears in the chain and that obtaining the reconveyance takes time, and treat the closing date as at risk until it is resolved.",
        "Tell the seller her recollection of payoff is enough and the title company will insure over it.",
        "Prepare and record a quitclaim deed from the seller to herself to clear the cloud.",
        "Wait until the buyer's title review period expires, since the buyer did not object."
      ],
      correctChoice: 0,
      rationale: "Recollection is not a document. The requirement has to be satisfied by a recorded reconveyance, and chasing one through two acquisitions is the kind of delay that moves closings. Preparing a deed to solve a lien problem is not a solution and is not what AS 08.88.405 contemplates."
    },
    engagement: [
      {
        prompt: "Which element of a deed most often fails?",
        choices: [
          "Delivery, which requires the grantor's present intent to convey.",
          "Words of conveyance.",
          "Consideration, which must be substantial.",
          "The grantee's signature."
        ],
        correctChoice: 0,
        rationale: "A deed signed and kept in a drawer conveys nothing. Consideration is recited but need not be substantial, and a grantee does not sign a deed."
      },
      {
        prompt: "What does a special or limited warranty deed warrant?",
        choices: [
          "Only against defects arising during the grantor's own ownership.",
          "Against all defects, including those arising before the grantor owned.",
          "Nothing at all.",
          "Only that the grantor is of legal age and sound mind."
        ],
        correctChoice: 0,
        rationale: "The special warranty limits the promise to the grantor's own period of ownership, which is why institutional sellers, relocation companies, and estates use it."
      },
      {
        prompt: "What does recording accomplish?",
        choices: [
          "It gives constructive notice to the world and establishes priority against later claimants; it does not make an otherwise ineffective deed effective.",
          "It makes an undelivered deed effective.",
          "It transfers title from grantor to grantee.",
          "It guarantees the grantor had good title."
        ],
        correctChoice: 0,
        rationale: "Delivery gives effect; recording gives notice. Recording an undelivered deed does not cure the delivery failure, and it warrants nothing about the grantor's title."
      },
      {
        prompt: "What is inquiry notice, and can a buyer be charged with it without having actually investigated?",
        choices: [
          "Knowledge the law charges a person with because visible circumstances would have prompted a reasonable person to investigate.",
          "Knowledge charged because an instrument is recorded.",
          "Knowledge a person actually has.",
          "Knowledge a title company acquires in its search."
        ],
        correctChoice: 0,
        rationale: "Inquiry notice is why a buyer asks who is living in the house. Constructive notice comes from the record; actual notice is what a person in fact knows."
      },
      {
        prompt: "Which part of a title commitment tells the buyer what will not be covered?",
        choices: [
          "The exceptions schedule.",
          "The requirements schedule.",
          "The insuring provisions.",
          "The commitment's effective date."
        ],
        correctChoice: 0,
        rationale: "Requirements are what must be done before the policy issues; exceptions are what the policy will not cover. The exceptions schedule is the document to read and send to the client before the contingency date."
      }
    ],
    remediation: [
      {
        prompt: "A grantor signs a deed to her son, tells him about it, and keeps it in her safe until her death six years later. Has the property been conveyed?",
        choices: [
          "Probably not, because delivery requires the grantor's present intent to convey and a deed retained by the grantor generally has not been delivered — but it is a legal question for a probate lawyer.",
          "Yes, because the deed was signed and the son knew of it.",
          "Yes, because the deed took effect on the grantor's death.",
          "No, because a deed to a family member requires consideration."
        ],
        correctChoice: 0,
        rationale: "Delivery is the failing element and the consequence is large. A licensee recognises the issue and routes it; the answer belongs to counsel."
      },
      {
        prompt: "What does a quitclaim deed convey?",
        choices: [
          "Whatever interest the grantor has, which may be nothing, with no warranty.",
          "Nothing; a quitclaim deed is void as a conveyance.",
          "Full fee simple title with warranties limited to the grantor's ownership.",
          "Only an easement interest."
        ],
        correctChoice: 0,
        rationale: "A quitclaim is not defective; it simply promises nothing. A buyer accepting one in an arm's-length purchase should be asking why."
      },
      {
        prompt: "Where are Alaska real property instruments recorded?",
        choices: [
          "In the recording district where the property is located, in a system administered by the Department of Natural Resources.",
          "With the borough assessor.",
          "With the superior court clerk in the judicial district.",
          "With the Alaska Real Estate Commission."
        ],
        correctChoice: 0,
        rationale: "Alaska records by recording district under the Department of Natural Resources. Confirm the district rather than assuming it from the mailing address."
      },
      {
        prompt: "A buyer intends to record his deed \"whenever he gets around to it.\" What is the risk?",
        choices: [
          "An unrecorded deed is good between the parties but exposed to a later good-faith purchaser who records first.",
          "The deed becomes void if not recorded within thirty days.",
          "The seller may rescind until recording.",
          "There is no risk; recording is a formality."
        ],
        correctChoice: 0,
        rationale: "Priority turns on notice and recording. The licensee explains what recording does and why it happens at closing, without advising on the legal consequences beyond that."
      },
      {
        prompt: "The legal description on the purchase agreement does not match the seller's deed. What is this?",
        choices: [
          "A finding, not a typo, until proven otherwise — it goes to the title company immediately.",
          "A clerical error the closing agent will correct without notice.",
          "A matter for the buyer's lender.",
          "Evidence that the seller does not own the property."
        ],
        correctChoice: 0,
        rationale: "Marketing and contracting on a description that does not match the record risks a contract for something nobody can identify. Raise it at once."
      }
    ]
  },

  "module-05": {
    subject: "Contracts and transaction documents",
    applied: {
      prompt: "A buyer offers a snow machine worth about $9,000 as earnest money. The seller says she is inclined to accept and asks you to write it up.",
      choices: [
        "Communicate the non-cash substitute to the seller before she accepts the offer, identify it as a non-cash substitute on the earnest money receipt, have control of the machine surrendered to the broker, and have the broker inform the principal parties.",
        "Write the offer showing $9,000 earnest money, since the parties know what it is.",
        "Accept the machine into your own possession and note it in the file.",
        "Tell the seller Alaska does not permit non-cash earnest money."
      ],
      correctChoice: 0,
      rationale: "12 AAC 64.130(12) requires the substitute to be communicated to the owner before acceptance and identified as a non-cash substitute on the receipt. 12 AAC 64.271 requires control of the item to be surrendered to the broker and the broker to inform the principal parties. Alaska permits non-cash earnest money; it just conditions it, and a salesperson never holds it."
    },
    engagement: [
      {
        prompt: "What does AS 08.88.405 authorise an Alaska licensee to do?",
        choices: [
          "Prepare real property contracts, earnest money agreements, leases, and other documents related to real property, in the course of the licensee's work as a licensee.",
          "Give legal advice about real property contracts to clients.",
          "Prepare any document a client asks for, including wills and business formations.",
          "Nothing; document preparation is the unauthorised practice of law in Alaska."
        ],
        correctChoice: 0,
        rationale: "The statute begins \"Notwithstanding AS 08.08\" and carves the activity out of the unauthorised-practice prohibition. It is bounded three ways: to licensees, to documents related to real property, and to the course of licensed work."
      },
      {
        prompt: "What does a counteroffer do to the offer it answers?",
        choices: [
          "It rejects it, so the original offer no longer exists to be accepted.",
          "It suspends it until the counteroffer expires.",
          "It leaves it open unless the counteroffer says otherwise.",
          "It converts it into an option."
        ],
        correctChoice: 0,
        rationale: "Once the seller counters, the buyer's offer is dead. If the buyer walks, the seller cannot go back and accept it."
      },
      {
        prompt: "Under AS 34.70.010, when must the residential disclosure statement be delivered?",
        choices: [
          "Before the transferee makes a written offer.",
          "Before closing.",
          "Within three days after acceptance.",
          "At the same time as the title commitment."
        ],
        correctChoice: 0,
        rationale: "The buyer is meant to have the statement in hand when deciding what to offer. Late delivery triggers the AS 34.70.020 termination right — three days from in-person delivery, six from mailing."
      },
      {
        prompt: "How soon must earnest money reach the trust account?",
        choices: [
          "Within five days following receipt, unless geographical location, weather, or transportation make it impossible or unreasonable.",
          "Within one business day, without exception.",
          "Within thirty days.",
          "By closing."
        ],
        correctChoice: 0,
        rationale: "12 AAC 64.200 sets five days and adds Alaska's exception for genuine impossibility. The exception is not a general extension, and the file should record the dates and the reason."
      },
      {
        prompt: "When does the three-year retention period in AS 08.88.351 begin to run?",
        choices: [
          "It begins at the initiation of the transaction and continues until three years after the listing ends, the sale closes or otherwise ends, the management contract ends, or another obligation ends.",
          "Three years from the date the file was opened.",
          "Three years from the date of the purchase agreement.",
          "Three years from the date the licensee leaves the brokerage."
        ],
        correctChoice: 0,
        rationale: "AS 08.88.351(c) measures from the ending date, not the opening one. This is the provision people most often get wrong."
      }
    ],
    remediation: [
      {
        prompt: "A seller agrees on the phone to extend an expiring exclusive listing. Is that effective?",
        choices: [
          "No. AS 08.88.341 requires an exclusive listing's definite expiration date to be renewed or extended only by written agreement signed by the client or an authorised representative.",
          "Yes, if the licensee documents the call in the file.",
          "Yes, because the statute of frauds does not apply to extensions.",
          "Yes, for up to thirty days."
        ],
        correctChoice: 0,
        rationale: "AS 08.88.341 is a licence-law rule stricter than the statute of frauds, and continuing to advertise after expiry also engages 12 AAC 64.130(6), which requires written owner authority to advertise."
      },
      {
        prompt: "A seller accepted an offer in writing this morning; a higher written offer arrives this afternoon. Must it be presented?",
        choices: [
          "No. 12 AAC 64.130(13) requires submission of all written bona fide offers received before the seller accepts another offer in writing and the broker knows of the acceptance — both conditions are met.",
          "Yes, until closing.",
          "Yes, unless the first buyer's earnest money has cleared.",
          "No, because a licensee never has to present an offer after showing has stopped."
        ],
        correctChoice: 0,
        rationale: "The obligation runs until written acceptance plus broker knowledge. Informing the seller anyway is good practice — the seller may want a backup — but the disciplinary duty has ended. Reverse the times and the answer reverses."
      },
      {
        prompt: "When may a broker refuse to return earnest money to a buyer whose offer was not accepted?",
        choices: [
          "Never — 12 AAC 64.250(7) prohibits refusal, though the broker may delay until one business day after the buyer's cheque has cleared.",
          "Whenever the seller instructs the broker to hold it.",
          "Until the property is relisted.",
          "For thirty days, to cover the brokerage's marketing costs."
        ],
        correctChoice: 0,
        rationale: "The money was never the seller's or the broker's. The only permitted delay is one business day after the cheque clears."
      },
      {
        prompt: "What is the effect on the seller of disclosing a known defect on the AS 34.70 form?",
        choices: [
          "AS 34.70.030 relieves the transferor of liability for a defect or condition disclosed in the statement.",
          "It creates liability the seller would not otherwise have had.",
          "It has no legal effect; the form is informational only.",
          "It obliges the seller to repair the defect before closing."
        ],
        correctChoice: 0,
        rationale: "This is the argument that persuades a reluctant seller. Under Alaska law disclosure removes liability; concealment does not."
      },
      {
        prompt: "A condominium buyer is eight days from closing and the association has not produced the resale certificate. What is the buyer's position?",
        choices: [
          "The contract remains voidable by the purchaser until the certificate is provided and for five days after, or until conveyance, whichever occurs first — AS 34.08.590(c).",
          "The buyer must close and pursue the association afterwards.",
          "The buyer's only remedy is against the seller for the delay.",
          "The contract terminates automatically on the tenth day."
        ],
        correctChoice: 0,
        rationale: "The seller is not liable for the association's delay, but the buyer's termination right stays alive. The association has ten days from a written request under .590(b), which is why the certificate is ordered at listing."
      }
    ]
  },

  "module-06": {
    subject: "Financing instruments and accounting principles",
    applied: {
      prompt: "A seller in default under a deed of trust asks you whether the lender can pursue her personally for the shortfall if the house sells at a trustee's sale for less than she owes.",
      choices: [
        "Tell her that AS 34.20.100 bars a deficiency after a trustee's sale, that she has a cure right under AS 34.20.070(b) until the sale date, and that whether the lender proceeds that way and what the tax consequences are must come from a lawyer and a tax adviser — and get her to them now.",
        "Assure her she will owe nothing in any scenario, because Alaska is a non-recourse state.",
        "Tell her the lender will certainly pursue her, since deficiency judgments are standard.",
        "Tell her you cannot discuss foreclosure at all and end the conversation."
      ],
      correctChoice: 0,
      rationale: "AS 34.20.100 bars a deficiency after a trustee's sale, but whether the lender uses that route, whether a second lien exists, and the tax treatment are all open. AS 08.88.620(3) makes advising a represented person to get expert advice a duty — which is a reason to route the question, not a reason to refuse to explain the timetable."
    },
    engagement: [
      {
        prompt: "What is the difference between a promissory note and a deed of trust?",
        choices: [
          "The note is the debt and creates personal liability; the deed of trust pledges the property as security for that debt.",
          "The note secures the property and the deed of trust states the repayment terms.",
          "They are two names for the same instrument.",
          "The note is recorded and the deed of trust is not."
        ],
        correctChoice: 0,
        rationale: "Sue on the note and you are suing a person; foreclose the security instrument and you are proceeding against land. Blurring them makes every foreclosure question unanswerable."
      },
      {
        prompt: "May a trustor redeem after an Alaska trustee's sale?",
        choices: [
          "No, unless the deed of trust so declares — AS 34.20.090(a) makes no redemption the default.",
          "Yes, within twelve months of the sale in every case.",
          "Yes, within ninety days of the sale.",
          "Yes, but only if the beneficiary purchased at the sale."
        ],
        correctChoice: 0,
        rationale: "No redemption is the default after a trustee's sale. The twelve-month period belongs to judicial foreclosure, where AS 09.35.250 measures it from the order confirming the sale."
      },
      {
        prompt: "When must the notice of default be recorded relative to the trustee's sale?",
        choices: [
          "Not less than 30 days after the default and not less than 90 days before the sale.",
          "Not less than 10 days after the default and 30 days before the sale.",
          "At any time after default, with no minimum period before sale.",
          "Not less than 90 days after the default and 30 days before the sale."
        ],
        correctChoice: 0,
        rationale: "AS 34.20.070(b) sets both ends of the window, and the trustee then has 10 days after recording to mail certified copies to the persons AS 34.20.070(c) names."
      },
      {
        prompt: "One point on a $330,000 loan is how much?",
        choices: [
          "$3,300 — one percent of the loan amount.",
          "$3,300, computed as one percent of the purchase price.",
          "$330, one tenth of one percent of the loan.",
          "It depends on the note rate."
        ],
        correctChoice: 0,
        rationale: "A point is one percent of the loan, never of the price. The distinction matters whenever price and loan differ, which is almost always."
      },
      {
        prompt: "What does the third step of the 12 AAC 64.220(f) monthly reconciliation compare?",
        choices: [
          "The bank balance against the sum of the transaction ledgers.",
          "The bank statement against the check register.",
          "The monthly deposits against the monthly expenditures.",
          "The broker's operating account against the trust account."
        ],
        correctChoice: 0,
        rationale: "Steps one and two can both balance while money has been moved between transactions. Only the cross-check against the sum of the ledgers exposes that."
      }
    ],
    remediation: [
      {
        prompt: "A lender holding a deed of trust sues on the note and takes judgment. May it then run a trustee's sale?",
        choices: [
          "No — AS 34.20.070(a) provides that a beneficiary who forecloses judicially or sues on the note and obtains judgment may not exercise the nonjudicial remedies.",
          "Yes, provided the judgment is unsatisfied.",
          "Yes, provided the notice of default is recorded within thirty days of judgment.",
          "Yes, because the two remedies are independent."
        ],
        correctChoice: 0,
        rationale: "The election is binding. Having taken judgment on the note, the lender is on the judicial track, where a deficiency is enforceable but the debtor gets a redemption right."
      },
      {
        prompt: "Price $385,000, appraisal $372,000, loan $330,000. What is the loan-to-value ratio?",
        choices: [
          "88.7 percent, computed on the appraisal because LTV uses the lesser of price or appraised value.",
          "85.7 percent, computed on the price.",
          "88.7 percent, computed on the price.",
          "It cannot be computed without the down payment."
        ],
        correctChoice: 0,
        rationale: "330,000 ÷ 372,000 = 88.7 percent. The gap between price and appraisal is the buyer's to bring in cash unless the appraisal contingency says otherwise."
      },
      {
        prompt: "May a broker pay a salesperson's commission directly from the trust account?",
        choices: [
          "No — 12 AAC 64.250(1) prohibits it; the brokerage's share moves to the operating account first.",
          "Yes, if identified to a specific transaction.",
          "Yes, within fifteen days of closing.",
          "Yes, provided the ledger records it."
        ],
        correctChoice: 0,
        rationale: "12 AAC 64.240(a) requires each commission withdrawal to be separate and identified to a transaction, and (b) requires withdrawal within fifteen days of settlement — but the salesperson is never paid out of the trust account."
      },
      {
        prompt: "Closing 12 September, annual tax $4,380 paid in arrears by the buyer, seller owns the day of closing, 365-day convention. What is the seller's share?",
        choices: [
          "$3,060.00, debited to the seller and credited to the buyer.",
          "$3,060.00, credited to the seller and debited to the buyer.",
          "$1,320.00, debited to the seller.",
          "$4,380.00, debited to the seller."
        ],
        correctChoice: 0,
        rationale: "4,380 ÷ 365 = $12.00 a day; 255 days through 12 September; 255 × 12 = $3,060. Because the buyer will pay the whole bill in arrears, the seller is debited and the buyer credited."
      },
      {
        prompt: "What must an Alaska licensee hold before taking a residential mortgage loan application and negotiating its terms?",
        choices: [
          "A mortgage loan originator licence under AS 06.60.012, with registry registration, a unique identifier, and sponsorship by a mortgage licensee or registered depository institution.",
          "Nothing beyond the real estate licence.",
          "A broker's licence rather than a salesperson's.",
          "Written authorisation from the lender."
        ],
        correctChoice: 0,
        rationale: "Explaining loan types and referring to lenders is licensee work. Taking applications, negotiating terms, and quoting and locking rates is separately licensed under AS 06.60."
      }
    ]
  },

  "module-07": {
    subject: "Alaska real estate license law and Alaska landlord tenant law",
    applied: {
      prompt: "A property manager holds a $2,400 security deposit on a unit renting for $1,200. The tenant gives proper 30-day notice, delivers possession on 31 August, and the manager finds $310 of tenant-caused damage. The manager mails an itemised notice and the $2,090 balance on 26 September.",
      choices: [
        "The mailing is timely: because costs are deducted for damages from the tenant's noncompliance with AS 34.03.120, AS 34.03.070(g) allows 30 days rather than the 14 that would otherwise apply.",
        "The mailing is late: the tenant gave complying notice, so the 14-day deadline applied and expired on 14 September.",
        "The mailing is late: all deposit refunds are due within 14 days regardless of deductions.",
        "The mailing is premature: the manager must wait 30 days before mailing anything."
      ],
      correctChoice: 0,
      rationale: "AS 34.03.070(g) gives 14 days where the tenant gave notice complying with AS 34.03.290, but 30 days where costs are deducted for damages from the tenant's noncompliance with AS 34.03.120. A wilful failure to comply exposes the landlord to up to twice the amount withheld under .070(d), and for a licensee 12 AAC 64.560 adds a disciplinary characterisation."
    },
    engagement: [
      {
        prompt: "How many hours of Commission-approved education must a salesperson applicant complete before licensure?",
        choices: [
          "40 hours, under AS 08.88.091(b), completed within the 18 months immediately preceding the application under 12 AAC 64.063(a)(2).",
          "30 hours, under AS 08.88.091(c).",
          "20 hours, the same as the continuing education requirement.",
          "60 hours, of which 40 may be correspondence."
        ],
        correctChoice: 0,
        rationale: "40 hours is the salesperson requirement; the 30-hour figure in AS 08.88.091(c) applies to broker and associate broker applicants. The 18-month recency rule is a separate trap."
      },
      {
        prompt: "What happens if a newly licensed salesperson does not complete the 30 post-licensing hours within one year?",
        choices: [
          "The licence automatically lapses 30 days after the end of the one-year period, subject to reinstatement under AS 08.88.241.",
          "The licence is suspended after a hearing.",
          "The Commission issues a warning and a six-month extension.",
          "Nothing, provided the hours are completed before renewal."
        ],
        correctChoice: 0,
        rationale: "AS 08.88.095(e) lapses the licence automatically. No notice is required and no hearing is held, which is why the date is diaried on the day the licence issues."
      },
      {
        prompt: "What is the maximum the real estate recovery fund will pay for any one licensee?",
        choices: [
          "$50,000, distributed pro rata among valid claimants if that is insufficient.",
          "$50,000 per claim, without an aggregate limit.",
          "$125, the recovery fund fee.",
          "$250,000, the fund's minimum average balance."
        ],
        correctChoice: 0,
        rationale: "AS 08.88.475(a) caps liability at $50,000 for any one licensee, and (b) distributes it pro rata without regard to filing order. The $250,000 to $500,000 band is the fund's target average balance under AS 08.88.455(a)."
      },
      {
        prompt: "How much may an Alaska landlord take as prepaid rent and security deposit combined on a unit renting for $1,600 a month?",
        choices: [
          "$3,200 — two months' periodic rent under AS 34.03.070(a) — plus up to one month more for a pet that is not a service animal under (h).",
          "$1,600, one month's rent.",
          "Any amount, because the cap applies only below $1,000 a month.",
          "$4,800, three months' rent."
        ],
        correctChoice: 0,
        rationale: "The cap is two months' periodic rent, however denominated, and does not apply where rent exceeds $2,000 a month. The pet deposit under (h) is separate, capped at one month, accounted for separately, and applied only to pet-related damage."
      },
      {
        prompt: "What notice must a landlord give before entering a dwelling unit to show it to a prospective purchaser?",
        choices: [
          "At least 24 hours notice, entering only at reasonable times and with the tenant's consent, except in an emergency or where impracticable.",
          "No notice; the tenant may not withhold consent.",
          "48 hours notice in writing.",
          "Seven days notice, as for a termination."
        ],
        correctChoice: 0,
        rationale: "AS 34.03.140(c) sets 24 hours, reasonable times, and consent. The tenant may not unreasonably withhold consent under (a), but that is not the same as the landlord having a right to enter at will."
      }
    ],
    remediation: [
      {
        prompt: "Which of these requires an Alaska real estate licence?",
        choices: [
          "Collecting rent for the use of another person's real estate.",
          "Renting out a room in the home you own and occupy.",
          "Working as a salaried bookkeeper for a brokerage, doing no client-facing work.",
          "Buying a house for yourself."
        ],
        correctChoice: 0,
        rationale: "AS 08.88.161(3) and (4) put collecting rent for others and practising property management inside the licence requirement. AS 08.88.161 reaches activity for another person, not activity on one's own account."
      },
      {
        prompt: "A tenant is served a seven-day notice for unpaid rent and pays in full on day six. What happens?",
        choices: [
          "The tenancy does not terminate; AS 34.03.220(b) terminates it only if the tenant fails to pay in full within seven days after the notice.",
          "The tenancy terminates anyway, because the notice was validly served.",
          "The tenancy terminates unless the landlord accepts the payment in writing.",
          "The landlord may still recover possession but not damages."
        ],
        correctChoice: 0,
        rationale: "Payment in full inside the period defeats the notice. Note the subsection's other features: only one written notice of default need be given as to any one default, and a landlord may accept a partial payment and extend the eviction date accordingly."
      },
      {
        prompt: "What may a broker obtain when a non-noticed audit would be a grave hardship?",
        choices: [
          "A 24-hour delay, during which the records are sealed or secured by and at the direction of the auditor, with the seals broken only by the auditor.",
          "A seven-day continuance with the records left in the broker's custody.",
          "A right to have counsel present before any records are produced.",
          "Nothing; a non-noticed audit may never be delayed."
        ],
        correctChoice: 0,
        rationale: "12 AAC 64.135(b) allows the delay and specifies the sealing. There is no point at which the broker has unsupervised time with the records."
      },
      {
        prompt: "What happens to a licensee's licence if an errors and omissions premium goes unpaid and coverage terminates?",
        choices: [
          "The Commission shall suspend the licence as of the date coverage terminated, and the licensee must immediately surrender it.",
          "The licensee has thirty days to obtain replacement coverage before any action.",
          "The Commission issues a warning at the next renewal.",
          "Nothing, provided no claim arises during the gap."
        ],
        correctChoice: 0,
        rationale: "12 AAC 64.620 suspends as of the termination date, 12 AAC 64.630 requires immediate surrender, and AS 08.88.071(a)(3)(I) makes failure to carry and maintain the coverage a disciplinary ground. Transactions worked in the interval were worked without a licence."
      },
      {
        prompt: "A licensee holds her own tenants' security deposits in her personal chequing account. What is the consequence?",
        choices: [
          "Under 12 AAC 64.560 it is fraudulent or dishonest conduct within AS 08.88.071(a)(3)(A)(iv), on top of the AS 34.03.070(d) exposure to twice the amount withheld.",
          "Nothing, because she owns the property and AS 34.03 does not apply to owner-landlords.",
          "It is permitted if she accounts separately for each tenant.",
          "It is a technical violation with no disciplinary consequence."
        ],
        correctChoice: 0,
        rationale: "12 AAC 64.570(b)(2)(D) allows the broker's trust account or the licensee's own trust account to which the broker has access for oversight and review. A personal chequing account is neither, and 12 AAC 64.560 characterises the failure in advance."
      }
    ]
  },

  "module-08": {
    subject: "Federal fair housing and RESPA laws",
    applied: {
      prompt: "A landlord tells you he will not rent to an applicant because she is a single mother, and separately that his application form asks every applicant to state marital status. He asks you to handle the file.",
      choices: [
        "Tell him the refusal violates the Fair Housing Act's familial status protection and AS 18.80.240(1), that AS 18.80.240(3) makes the marital status inquiry itself unlawful, that AS 18.80.240(4) makes it unlawful for you to accept or retain the listing on that understanding, and that under 12 AAC 64.130(19) a fair housing violation is grounds to revoke your licence.",
        "Take the file and simply decline to pass on his instruction, leaving the form unchanged.",
        "Take the file and remove the marital status question, since familial status refusals are lawful for small landlords.",
        "Decline the file without explanation and say nothing about the form."
      ],
      correctChoice: 0,
      rationale: "Familial status is a federal protected class and marital status is an Alaska one. AS 18.80.240(3) prohibits the inquiry itself, so the form is unlawful whether or not anyone acts on it. AS 18.80.240(4) reaches the licensee who accepts or retains the listing with the understanding that discrimination may occur, and 12 AAC 64.130(19) makes it a licence matter."
    },
    engagement: [
      {
        prompt: "Which is a federal protected class under the Fair Housing Act?",
        choices: [
          "Familial status.",
          "Marital status.",
          "Age.",
          "Source of income."
        ],
        correctChoice: 0,
        rationale: "The seven federal classes are race, colour, religion, national origin, sex, disability, and familial status. Marital status and age are protected by Alaska's AS 18.80.240 but are not federal Fair Housing Act classes."
      },
      {
        prompt: "Which Fair Housing Act prohibition has no exemptions at all?",
        choices: [
          "The prohibition on discriminatory advertising in 42 U.S.C. 3604(c).",
          "The prohibition on refusing to rent.",
          "The reasonable accommodation requirement.",
          "The design and construction requirements."
        ],
        correctChoice: 0,
        rationale: "An owner whose transaction is otherwise exempt still may not advertise discriminatorily. And no exemption reaches 42 U.S.C. 1982, so racial discrimination is never exempt."
      },
      {
        prompt: "May a landlord charge a pet deposit for an assistance animal needed by a person with a disability?",
        choices: [
          "No. Allowing the animal is a reasonable accommodation and no pet deposit or fee may be charged for it.",
          "Yes, up to one month's rent under AS 34.03.070(h).",
          "Yes, if the same deposit is charged to every tenant with an animal.",
          "Yes, but it must be refunded at the end of the tenancy."
        ],
        correctChoice: 0,
        rationale: "AS 34.03.070(h) permits an additional deposit only for a pet that is not a service animal, and the federal accommodation duty points the same way. The animal that is there because of a disability is not the one you charge for."
      },
      {
        prompt: "What does RESPA section 8(a) prohibit?",
        choices: [
          "Giving or accepting any fee, kickback, or thing of value pursuant to an agreement or understanding that settlement service business be referred to any person.",
          "Charging more than a reasonable fee for a settlement service.",
          "A seller requiring the buyer to use a particular title company.",
          "Failing to deliver the Closing Disclosure three business days before consummation."
        ],
        correctChoice: 0,
        rationale: "Section 8(b) covers unearned fees and splits; section 9 covers the seller-required title company; the Closing Disclosure timing is Regulation Z. Section 8(a) is specifically the referral prohibition, and \"thing of value\" is construed broadly."
      },
      {
        prompt: "What must accompany a referral to an affiliated settlement service provider?",
        choices: [
          "A written affiliated business arrangement disclosure at or before the time of referral, no requirement that the consumer use the affiliate, and no thing of value beyond a return on the ownership interest.",
          "A written disclosure delivered at closing.",
          "The consumer's written waiver of the right to shop.",
          "Nothing, provided the affiliate's charges are at market rates."
        ],
        correctChoice: 0,
        rationale: "Section 8(c)(4) and 12 C.F.R. 1024.15 set all three conditions. Delivering the disclosure at closing is too late; the timing is at or before referral."
      }
    ],
    remediation: [
      {
        prompt: "A buyer asks which neighbourhood has \"the better sort of people.\" What is the correct response?",
        choices: [
          "Decline to characterise neighbourhoods by who lives in them, point to objective sources the buyer can consult, and show every property meeting the buyer's stated criteria.",
          "Answer honestly based on your own knowledge of the area's demographics.",
          "Show only properties in areas you believe the buyer would prefer.",
          "Refuse to work with the buyer and end the relationship."
        ],
        correctChoice: 0,
        rationale: "Characterising neighbourhoods by who lives in them is steering under 42 U.S.C. 3604 and reachable under AS 18.80.240(1), (2), and (5). Note in the file what criteria the buyer gave and what you showed."
      },
      {
        prompt: "Which Alaska provision prohibits the inquiry itself rather than only acting on the answer?",
        choices: [
          "AS 18.80.240(3), which makes it unlawful to make a written or oral inquiry or record of a person's sex, marital status, changes in marital status, race, religion, disability, colour, or national origin where the person is seeking to buy, lease, or rent.",
          "AS 18.80.240(6), on blockbusting.",
          "AS 18.80.250, on financing practices.",
          "12 AAC 64.130(19)."
        ],
        correctChoice: 0,
        rationale: "Paragraph (3) makes the inquiry the violation. A licensee trained only on federal law would miss it, which is why intake forms and casual conversation need attention."
      },
      {
        prompt: "A title company offers your brokerage a $50 gift card for every closing you send it. What is this?",
        choices: [
          "A thing of value for the referral of settlement service business, prohibited by RESPA section 8(a) and exposing a fine up to $10,000, up to a year's imprisonment, and treble the charge under section 8(d).",
          "A permitted marketing expense, since gift cards are not cash.",
          "A permitted cooperative brokerage payment under section 8(c).",
          "Permitted, provided it is disclosed to the client."
        ],
        correctChoice: 0,
        rationale: "\"Thing of value\" reaches gift cards, meals, tickets, trips, and discounts. Disclosure does not cure a section 8(a) violation, and in Alaska AS 08.88.401(d) and 12 AAC 64.130(7) apply as well."
      },
      {
        prompt: "When must the consumer receive the Closing Disclosure?",
        choices: [
          "At least three business days before consummation, under 12 C.F.R. 1026.19(f).",
          "At consummation.",
          "Within three business days after application.",
          "Seven business days before consummation."
        ],
        correctChoice: 0,
        rationale: "Three business days before consummation for the Closing Disclosure; within three business days of application for the Loan Estimate. An APR increase beyond tolerance, a change in loan product, or the addition of a prepayment penalty restarts the three-day period."
      },
      {
        prompt: "Which is prohibited by RESPA section 9?",
        choices: [
          "A seller requiring, as a condition of selling, that the buyer purchase title insurance from a particular company.",
          "A buyer choosing the buyer's own title company.",
          "A lender selecting the appraiser.",
          "A brokerage splitting a commission with a cooperating brokerage."
        ],
        correctChoice: 0,
        rationale: "12 U.S.C. 2608 prohibits the seller-required title company and makes the seller liable to the buyer for three times all charges made for the title insurance. Cooperative brokerage compensation is expressly preserved by section 8(c)."
      }
    ]
  }
};

export default modules;
