/**
 * California Real Estate Principles (45 hours) — lesson question bank.
 * Format and authoring standard: see practice-question-bank.mjs.
 * Course version 1.0 — not approved; no California credit is available.
 */

const assignments = {
  "assignment-01": {
    subject: "The real estate profession and California regulatory structure",
    applied: {
      prompt: "A neighbor asks a newly licensed salesperson to 'just write up' a simple lease between the neighbor and his tenant, draft a clause protecting the neighbor if the tenant defaults, and explain what the neighbor's rights would be if he wanted to evict. The neighbor offers to pay her directly for the work. How should she respond?",
      choices: [
        "Explain that drafting custom protective clauses and advising on eviction rights is the practice of law, that any compensated licensed activity must run through her employing broker, and refer the neighbor to an attorney.",
        "Prepare the lease and the clause but decline payment, since unpaid assistance to a neighbor is not licensed activity.",
        "Prepare the lease using a standard form and accept payment directly, since completing a preprinted form is not the practice of law.",
        "Decline entirely and offer no explanation, since any involvement with a lease creates liability."
      ],
      correctChoice: 0,
      rationale: "Two separate limits apply at once. Drafting custom legal provisions and advising on remedies is the practice of law regardless of who pays or whether a form is used, and any compensation for licensed activity must flow through the employing broker rather than to the salesperson directly. Declining without explanation leaves the neighbor no better off than before."
    },
    engagement: [
      {
        prompt: "What distinguishes real property from personal property?",
        choices: [
          "Real property is land and what is permanently affixed to or appurtenant to it, together with the bundle of rights in it; personal property is movable property not so affixed.",
          "Real property is property that can be sold, while personal property is property that is kept for use.",
          "Real property is property with recorded title, while personal property is property without documentation.",
          "Real property is property used for business, while personal property is property used for personal purposes."
        ],
        correctChoice: 0,
        rationale: "The distinction rests on permanence of attachment to land and the rights that run with it. Sale, documentation, and use do not determine the classification."
      },
      {
        prompt: "Which best describes the Department of Real Estate's primary function?",
        choices: [
          "Administering the Real Estate Law to protect the public, including licensing, regulation, and enforcement against licensees.",
          "Setting commission rates and standard contract terms for California real estate transactions.",
          "Resolving contract disputes between buyers and sellers in California transactions.",
          "Certifying property values and approving appraisals for California properties."
        ],
        correctChoice: 0,
        rationale: "The Department's mandate is consumer protection through licensing, regulation, and enforcement. It does not set prices or contract terms, adjudicate private contract disputes, or certify valuations."
      },
      {
        prompt: "How does a salesperson's authority relate to the employing broker's?",
        choices: [
          "The salesperson acts on behalf of the broker, and the broker is responsible for supervising the salesperson's licensed activity.",
          "The salesperson holds independent authority and the broker's role is limited to providing office facilities.",
          "The salesperson and broker hold identical authority once the salesperson completes the required experience.",
          "The salesperson acts on behalf of the client directly, with the broker acting only as a payment intermediary."
        ],
        correctChoice: 0,
        rationale: "The salesperson license is derivative of the broker's, which is why supervision is the broker's obligation and not merely an administrative arrangement."
      },
      {
        prompt: "Which activity would most likely constitute the unauthorized practice of law by a licensee?",
        choices: [
          "Drafting a custom contract provision to address a party's particular legal risk.",
          "Filling in the blanks of a standard purchase agreement form in the ordinary course of a transaction.",
          "Explaining what a standard contingency provision generally does.",
          "Recommending that a client consult an attorney about a title exception."
        ],
        correctChoice: 0,
        rationale: "Composing legal language tailored to a party's legal risk crosses the line. Completing standard forms in the course of a transaction, explaining common provisions generally, and referring to counsel are all within a licensee's proper role."
      },
      {
        prompt: "Which source of authority governs a licensee's conduct most directly?",
        choices: [
          "Statutes and the Commissioner's Regulations, supplemented by case law, with brokerage policy operating within them.",
          "Local custom and practice in the licensee's market area.",
          "The written policies of the licensee's brokerage, which control over general law.",
          "The terms of the client's listing or representation agreement."
        ],
        correctChoice: 0,
        rationale: "Statutes and regulations are the controlling authority, interpreted by case law; brokerage policy operates inside those limits and may be stricter but never looser. Custom and private agreements cannot displace them."
      }
    ],
    remediation: [
      {
        prompt: "A licensee describes a home's built-in bookshelves as 'included in the sale.' On what basis are they most likely real property?",
        choices: [
          "They are affixed to the structure in a way indicating permanence, which makes them part of the real property unless the parties agree otherwise.",
          "They are included because the listing described them as included.",
          "They are personal property, because shelving is furniture regardless of how it is attached.",
          "They are real property only if the seller built them himself."
        ],
        correctChoice: 0,
        rationale: "Attachment is the operative fact, with the parties free to agree otherwise. The listing description and the identity of the builder do not determine classification, and the function of an item does not override how it is affixed."
      },
      {
        prompt: "A consumer complains that a licensee misrepresented a property. Which body has authority to discipline the licensee's license?",
        choices: [
          "The Department of Real Estate, which may suspend, revoke, or restrict the license after its process.",
          "The local association of realtors, which controls licensure in its market area.",
          "The escrow company, which may refuse to handle the licensee's future transactions.",
          "The civil court, which may revoke the license as part of a damages award."
        ],
        correctChoice: 0,
        rationale: "Licensing authority rests with the Department. Trade associations enforce membership rules rather than licensure, escrow can decline business but not discipline, and civil courts award remedies without revoking licenses."
      },
      {
        prompt: "A broker discovers that a salesperson accepted a referral fee directly from a lender. What is the problem?",
        choices: [
          "Compensation for licensed activity must be paid through the employing broker, not directly to the salesperson.",
          "There is no problem, because the fee came from a lender rather than from a client.",
          "The problem is only that the salesperson did not disclose the fee to the broker.",
          "The problem arises only if the referral fee exceeded a customary amount."
        ],
        correctChoice: 0,
        rationale: "The routing of compensation is the defect, independent of the payer, the disclosure, or the amount — each of which raises its own separate questions."
      },
      {
        prompt: "Which participant in a transaction bears responsibility for confirming that a licensee's client understands the legal effect of a signed contract?",
        choices: [
          "An attorney, because the legal effect of an executed contract is outside the licensee's scope even though the licensee may explain standard provisions.",
          "The escrow holder, who reviews all transaction documents before closing.",
          "The licensee, who is closest to the client and prepared the paperwork.",
          "The title company, which insures the transaction."
        ],
        correctChoice: 0,
        rationale: "Advising on legal effect belongs to counsel. Escrow is neutral and implements instructions, the licensee's role stops at general explanation, and title insurers address record title rather than contract interpretation."
      },
      {
        prompt: "Two licensees disagree about whether a practice is permitted; one cites long-standing local custom. How should the question be resolved?",
        choices: [
          "By checking the current statute and Commissioner's Regulations, since custom does not authorize conduct the law prohibits.",
          "By following the practice most common among established brokerages in the area.",
          "By asking the local association of realtors to decide.",
          "By adopting whichever interpretation better protects the client in the specific transaction."
        ],
        correctChoice: 0,
        rationale: "This is the same principle as the source-of-authority question: custom is evidence of what people do, not of what is permitted. Prevalence, association guidance, and a good-outcome rationale cannot override the governing text."
      }
    ]
  },
  "assignment-02": {
    subject: "Real property, personal property, and fixtures",
    applied: {
      prompt: "A buyer walks through a home and notes an antique chandelier in the dining room, a wall-mounted television on a bracket, and a large greenhouse the seller bolted to a concrete pad in the yard. The purchase agreement says nothing about any of them. After closing the seller has removed all three, leaving the bracket and the bolts. The buyer is furious. What is the sound analysis?",
      choices: [
        "Each item is analyzed separately for whether it became a fixture — attachment, adaptation, relationship of the parties, intention, and any agreement — which is exactly why they should have been addressed by name in the agreement before closing.",
        "All three conveyed with the property, because anything present at the showing is included unless the agreement excludes it.",
        "None conveyed, because the agreement did not list them and only listed items are included.",
        "The chandelier and television conveyed because they were inside the home, and the greenhouse did not because it was outside it."
      ],
      correctChoice: 0,
      rationale: "The fixture analysis is item-by-item and fact-driven, which is why blanket rules in either direction are wrong and why location inside or outside the house does not decide it. The practical lesson is that the tests are hard to apply after the fact, so items likely to be disputed are named in the contract."
    },
    engagement: [
      {
        prompt: "Which factors are used to determine whether an item has become a fixture?",
        choices: [
          "The method of attachment, adaptation to the property, the relationship of the parties, the intention of the party who attached it, and any agreement between the parties.",
          "The item's cost, its age, and whether it can be replaced.",
          "Whether the item is visible from outside the property and whether it is insured.",
          "Whether the item was present when the seller purchased the property."
        ],
        correctChoice: 0,
        rationale: "Attachment, adaptation, relationship, intention, and agreement are the recognized tests, with intention often treated as the most important and agreement able to settle the question outright."
      },
      {
        prompt: "What is a trade fixture, and what right does a tenant ordinarily have over one at the end of the lease?",
        choices: [
          "An item a tenant attaches to leased premises for use in the tenant's business, which the tenant generally may remove before the lease ends.",
          "A fixture that was installed by a licensed tradesperson rather than the owner.",
          "Any fixture that is traded between the buyer and seller during negotiation.",
          "A fixture in a commercial building, as distinguished from one in a residence."
        ],
        correctChoice: 0,
        rationale: "The defining features are the tenant's business use and the tenant's right to remove. Who installed it, whether it was negotiated, and the property type do not define the category."
      },
      {
        prompt: "Standing timber and unharvested crops planted annually are treated how?",
        choices: [
          "Natural attachments such as trees are generally real property, while annually cultivated crops are typically treated as personal property.",
          "Both are real property because they grow from the land.",
          "Both are personal property because they can be harvested and sold.",
          "Both are real property until the moment of sale, when they become personal property."
        ],
        correctChoice: 0,
        rationale: "The distinction turns on cultivation: things growing naturally from the soil are part of the land, while crops produced by annual labor are treated as personal property."
      },
      {
        prompt: "What does it mean that water rights are appurtenant to land?",
        choices: [
          "The right runs with the land and transfers with it rather than being owned separately by the person.",
          "The landowner owns the water itself outright and may sell it separately at will.",
          "The right exists only while the landowner physically uses the water.",
          "The right may be exercised only with the consent of neighboring landowners."
        ],
        correctChoice: 0,
        rationale: "Appurtenance means the right attaches to and transfers with the land. It is not outright ownership of the water, not contingent on continuous use, and not subject to neighbors' consent."
      },
      {
        prompt: "How should a licensee handle an item whose classification is genuinely uncertain?",
        choices: [
          "Have the parties address it expressly in the purchase agreement, since agreement resolves the question without litigating the tests.",
          "Advise the seller to remove it before showings so the question does not arise.",
          "Include it in the listing description as included, which binds the seller.",
          "Leave it to the parties to work out after closing, when they can inspect it directly."
        ],
        correctChoice: 0,
        rationale: "Express agreement is the reliable answer, and it is why the tests rarely need to be applied. Quietly removing the item, relying on marketing copy to create obligations, and deferring to after closing all create the dispute rather than preventing it."
      }
    ],
    remediation: [
      {
        prompt: "A tenant installs a commercial pizza oven in a leased storefront, running gas and venting through the roof. At the end of the lease he wants to take it. What is the likely analysis?",
        choices: [
          "It is likely a trade fixture removable by the tenant, subject to the lease terms and the tenant's obligation to repair damage caused by removal.",
          "It became part of the real property when it was connected to gas and vented, so it must stay.",
          "It may be removed only if the landlord consents at the time of removal.",
          "It may be removed only if the tenant can show the landlord would suffer no loss."
        ],
        correctChoice: 0,
        rationale: "Business use by a tenant is the trade-fixture hallmark, and substantial attachment does not defeat it. The tenant's obligation is to repair removal damage, not to obtain fresh consent or prove absence of loss."
      },
      {
        prompt: "A seller replaces a built-in refrigerator with a freestanding one before closing without telling the buyer. What is the concern?",
        choices: [
          "A built-in appliance is likely a fixture, so substituting a freestanding unit may change what was conveyed, and the substitution should have been disclosed and agreed.",
          "There is no concern, since a refrigerator is personal property in every case.",
          "There is no concern, provided the replacement is of equal or greater value.",
          "The concern is only about the appliance's condition rather than its classification."
        ],
        correctChoice: 0,
        rationale: "Built-in installation points toward fixture status, which is why the swap changes what the buyer receives. Value equivalence does not cure an unagreed substitution, and this is a classification issue rather than a condition issue."
      },
      {
        prompt: "Why does the relationship of the parties matter in the fixture analysis?",
        choices: [
          "Because the same item may be treated differently as between landlord and tenant than as between buyer and seller, reflecting the different expectations of those relationships.",
          "Because family members are held to a different standard than unrelated parties.",
          "Because the party with greater bargaining power determines the classification.",
          "Because the relationship determines who bears the cost of removal."
        ],
        correctChoice: 0,
        rationale: "The test recognizes that a tenant who installs something for business use is in a different position from a seller who improved his own home. It is not about kinship, bargaining power, or cost allocation."
      },
      {
        prompt: "A property's mineral rights were severed and sold to a third party years ago. What follows?",
        choices: [
          "The buyer of the surface takes without those mineral rights, and the severance should surface in the title work and be disclosed.",
          "The mineral rights automatically revert to the surface owner on transfer of the property.",
          "The severance is unenforceable unless the current owner agreed to it.",
          "The mineral rights transfer with the surface unless the deed expressly excludes them."
        ],
        correctChoice: 0,
        rationale: "Rights that have been severed stay severed and pass independently of the surface. They do not revert on transfer, are not defeated by a later owner's lack of consent, and a deed's silence does not reunite them."
      },
      {
        prompt: "Which best explains why intention is often treated as the most important fixture test?",
        choices: [
          "Because the objective indicators — how the item was attached and adapted — are used to infer what the attaching party intended, which is the question the other tests serve.",
          "Because the parties can state their intention after a dispute arises and that statement controls.",
          "Because intention is easier to prove than the physical facts of attachment.",
          "Because intention determines the item's value to the parties."
        ],
        correctChoice: 0,
        rationale: "Intention is inferred from the objective facts rather than asserted after the fact, which is precisely why the other tests exist. It is harder to prove directly, not easier, and it has nothing to do with value."
      }
    ]
  },
  "assignment-03": {
    subject: "Estates, ownership, and common interests",
    applied: {
      prompt: "Two unmarried siblings buy a home together, each contributing half. They tell the licensee they want the survivor to receive the whole property automatically if one dies, but they also want each to be able to leave her share to her own children if circumstances change. They ask the licensee which vesting to use. What is the correct response?",
      choices: [
        "Explain that these two goals point toward different forms of ownership and that the choice carries legal and tax consequences, then refer them to legal and tax counsel before escrow prepares the deed.",
        "Recommend joint tenancy, since it provides the survivorship they asked for first.",
        "Recommend tenancy in common, since it preserves each sibling's right to devise her share.",
        "Recommend they take title in whichever form escrow customarily uses and change it later if needed."
      ],
      correctChoice: 0,
      rationale: "The two stated goals are in tension: survivorship passes the whole interest automatically, while the ability to devise a share requires an interest that survives the owner. Resolving that tension is a legal and estate-planning question outside the license, and vesting is not a formality to be adjusted later without consequence."
    },
    engagement: [
      {
        prompt: "What distinguishes a freehold estate from a leasehold estate?",
        choices: [
          "A freehold estate is an ownership interest of indefinite duration; a leasehold is a possessory interest for a defined or periodic term.",
          "A freehold estate may be sold while a leasehold may not.",
          "A freehold estate applies to land while a leasehold applies to buildings.",
          "A freehold estate is recorded while a leasehold is not."
        ],
        correctChoice: 0,
        rationale: "Duration and the nature of the interest are what separate them — ownership of indefinite duration versus possession for a term. Transferability, property type, and recording do not define the categories."
      },
      {
        prompt: "What are the four unities required to create a joint tenancy?",
        choices: [
          "Time, title, interest, and possession.",
          "Time, title, intent, and possession.",
          "Interest, possession, survivorship, and agreement.",
          "Title, interest, contribution, and possession."
        ],
        correctChoice: 0,
        rationale: "The four unities are time, title, interest, and possession — the co-owners must take at the same time, by the same instrument, in equal shares, with equal rights of possession."
      },
      {
        prompt: "How does tenancy in common differ from joint tenancy?",
        choices: [
          "Tenants in common hold undivided interests that may be unequal and that pass to their heirs or devisees rather than to the surviving co-owners.",
          "Tenants in common must each hold an equal share and may not transfer without the others' consent.",
          "Tenancy in common may be created only between married persons.",
          "Tenancy in common gives each owner exclusive possession of a specific portion of the property."
        ],
        correctChoice: 0,
        rationale: "Unequal shares and the absence of survivorship are the distinguishing features. Interests are undivided, meaning no co-owner holds a specific physical portion, and consent is not required to transfer one's own interest."
      },
      {
        prompt: "What is the defining characteristic of a life estate?",
        choices: [
          "It lasts for the duration of a specified person's life, after which the property passes to the remainderman or reverts to the grantor.",
          "It gives the holder ownership that lasts until the holder chooses to sell it.",
          "It is a leasehold interest that continues for the tenant's lifetime.",
          "It is an ownership interest that automatically renews unless terminated."
        ],
        correctChoice: 0,
        rationale: "A life estate is measured by a life and ends when that life ends, with a remainder or reversion following. It is a freehold interest, not a lease, and it does not renew."
      },
      {
        prompt: "What does a buyer acquire when purchasing a condominium unit in a common interest development?",
        choices: [
          "Ownership of the individual unit together with an undivided interest in the common areas, subject to the governing documents and the association's authority.",
          "Ownership of the unit only, with the common areas owned entirely by the association.",
          "A long-term leasehold in the unit and a membership interest in the association.",
          "Ownership of the unit and the land beneath it, with shared maintenance obligations."
        ],
        correctChoice: 0,
        rationale: "The condominium form combines separate unit ownership with an undivided interest in common areas, governed by the development's documents. The land beneath is generally part of the common area rather than separately owned with the unit."
      }
    ],
    remediation: [
      {
        prompt: "One of three joint tenants sells her interest to an outside buyer. What is the effect?",
        choices: [
          "The buyer takes as a tenant in common with the other two, who remain joint tenants between themselves.",
          "The joint tenancy is destroyed entirely and all three owners become tenants in common.",
          "The sale is void, because a joint tenant cannot convey without the others' consent.",
          "The buyer takes as a joint tenant, stepping into the seller's position."
        ],
        correctChoice: 0,
        rationale: "Conveyance breaks the unities as to the transferred interest only. The remaining original owners still share the unities with each other, so their joint tenancy survives as between them."
      },
      {
        prompt: "What is the significance of California being a community property state?",
        choices: [
          "Property acquired by a married person during marriage is generally community property, which affects ownership, management, and disposition — and makes marital status a fact the transaction must account for.",
          "All property owned by married persons is owned equally regardless of when it was acquired.",
          "Married persons may not hold property separately in California.",
          "Community property applies only to the couple's primary residence."
        ],
        correctChoice: 0,
        rationale: "The characterization generally turns on acquisition during marriage, which is why property owned before marriage or received by gift or inheritance can remain separate. It is not limited to a residence, and separate ownership remains possible."
      },
      {
        prompt: "A life tenant wants to sell the property outright to a third party. What can he convey?",
        choices: [
          "Only the interest he holds, which ends at the measuring life, so the buyer takes an interest that terminates then.",
          "Full fee simple title, since a life tenant is the current owner in possession.",
          "Nothing, because a life estate cannot be transferred.",
          "Full title, provided the remainderman is notified of the sale."
        ],
        correctChoice: 0,
        rationale: "No one conveys more than he holds. A life estate is transferable, but what passes is still measured by the same life, and notice to the remainderman does not enlarge it."
      },
      {
        prompt: "A buyer is purchasing in a common interest development. Which documents most directly affect what he may do with the property?",
        choices: [
          "The declaration and governing documents, including use restrictions and the association's rules and assessments.",
          "The preliminary report, which lists the association as a party in interest.",
          "The purchase agreement, which incorporates the association's authority by reference.",
          "The association's most recent financial statement."
        ],
        correctChoice: 0,
        rationale: "Use restrictions live in the governing documents, which bind the owner directly. The preliminary report and purchase agreement point to them, and financial statements address the association's condition rather than what the owner may do."
      },
      {
        prompt: "A property is held in the name of a limited liability company. Who signs the deed on conveyance?",
        choices: [
          "The person authorized to act for the entity under its governing documents, whose authority should be confirmed rather than assumed.",
          "Any member of the company, since members own the entity.",
          "The company's registered agent, who is designated to act on the company's behalf.",
          "The person whose name appears on the property tax bill."
        ],
        correctChoice: 0,
        rationale: "Entity authority comes from the governing documents and must be verified — the same principle as confirming a trustee's authority. Membership, agent designation for service, and the tax roll do not establish signing authority."
      }
    ]
  },
  "assignment-04": {
    subject: "Land description, measurement, and boundaries",
    applied: {
      prompt: "A buyer is purchasing a rural parcel described in the deed by metes and bounds. The seller says the parcel is 'about five acres,' the listing says 5.2 acres, the assessor's record says 4.8 acres, and an old fence appears to run some distance inside one of the described boundary lines. The buyer plans to build near that boundary. What should the licensee advise?",
      choices: [
        "Recommend a survey, explain that the recorded legal description rather than the fence or the assessor's record establishes the boundary, and advise that a fence in a different location may raise legal questions requiring counsel.",
        "Rely on the assessor's parcel record, since it is an official government record of the parcel's size.",
        "Rely on the deed description and treat the fence as the practical boundary for building purposes.",
        "Average the three acreage figures and advise the buyer to plan the construction conservatively."
      ],
      correctChoice: 0,
      rationale: "The legal description governs, the assessor's record exists for taxation rather than boundary determination, and a fence inconsistent with the description raises legal questions a licensee cannot resolve. A survey locates the description on the ground, which is exactly what a buyer building near the line needs."
    },
    engagement: [
      {
        prompt: "What defines a metes and bounds description?",
        choices: [
          "It traces the boundary by directions and distances from a defined point of beginning and must close by returning to that point.",
          "It identifies the parcel by its lot and block number on a recorded subdivision map.",
          "It divides land into townships and sections measured from a base line and meridian.",
          "It identifies the parcel by the assessor's parcel number assigned by the county."
        ],
        correctChoice: 0,
        rationale: "Courses, distances, and a closing return to the point of beginning are the defining features. The other three describe lot and block, the rectangular survey system, and assessor identification respectively."
      },
      {
        prompt: "In the government survey system, how many acres are in a standard section?",
        choices: [
          "640 acres.",
          "160 acres.",
          "36 acres.",
          "43,560 acres."
        ],
        correctChoice: 0,
        rationale: "A section is one mile square, which is 640 acres. 160 acres is a quarter section, 36 is the number of sections in a township, and 43,560 is the number of square feet in an acre."
      },
      {
        prompt: "How many sections are in a standard township?",
        choices: [
          "36 sections.",
          "16 sections.",
          "40 sections.",
          "640 sections."
        ],
        correctChoice: 0,
        rationale: "A township is six miles square and therefore contains 36 one-mile-square sections."
      },
      {
        prompt: "A lot measures 150 feet by 200 feet. What is its area in acres, given that an acre is 43,560 square feet?",
        choices: [
          "Approximately 0.69 acres.",
          "Approximately 1.45 acres.",
          "Approximately 0.34 acres.",
          "Approximately 3.5 acres."
        ],
        correctChoice: 0,
        rationale: "150 × 200 = 30,000 square feet; 30,000 ÷ 43,560 ≈ 0.69 acres. The second figure inverts the division, and the others misplace the scale."
      },
      {
        prompt: "What is the purpose of an assessor's parcel number?",
        choices: [
          "It identifies the parcel for property tax administration and is not a legal description of the boundaries.",
          "It is the legal description used to convey the property in a deed.",
          "It establishes the parcel's recorded boundaries as surveyed by the county.",
          "It certifies that the parcel is a legally created lot."
        ],
        correctChoice: 0,
        rationale: "The assessor's number serves taxation. It neither conveys property, nor establishes boundaries, nor certifies that the parcel was lawfully created."
      }
    ],
    remediation: [
      {
        prompt: "A metes and bounds description does not return to its point of beginning. What does that indicate?",
        choices: [
          "The description does not close, which is a defect requiring professional resolution before the parcel's boundaries can be relied on.",
          "The parcel is irregularly shaped, which is common and requires no further action.",
          "The description covers only part of the parcel and the remainder is described separately.",
          "The description is a partial legal description that the assessor's record completes."
        ],
        correctChoice: 0,
        rationale: "Closure is a requirement of a valid metes and bounds description, not a matter of shape. A description that fails to close cannot define an enclosed area and needs surveyor and legal attention."
      },
      {
        prompt: "A neighbor's shed extends two feet onto the subject property. What is this called and why does it matter?",
        choices: [
          "An encroachment, which affects the buyer's use and may create legal claims over time, so it should be disclosed and evaluated.",
          "An easement, which gives the neighbor a legal right to maintain the shed.",
          "A boundary adjustment, which is resolved automatically when the property is sold.",
          "A nuisance, which the buyer may remove after closing without notice."
        ],
        correctChoice: 0,
        rationale: "Physical intrusion across a boundary is an encroachment. It is not an easement unless a right has actually been established, it does not resolve itself on transfer, and self-help removal invites liability."
      },
      {
        prompt: "What is the function of a recorded subdivision map in a lot and block description?",
        choices: [
          "It is the reference document that gives the lot and block numbers meaning by fixing the dimensions and location of each lot.",
          "It records each lot's ownership history for title purposes.",
          "It establishes the assessor's parcel numbers for the subdivision.",
          "It certifies that each lot has been surveyed at the time of sale."
        ],
        correctChoice: 0,
        rationale: "A lot and block description is meaningless without the recorded map it references, which is where the dimensions live. Ownership history, tax numbering, and sale-time surveys are separate matters."
      },
      {
        prompt: "A quarter of a quarter section contains how many acres?",
        choices: [
          "40 acres.",
          "160 acres.",
          "80 acres.",
          "10 acres."
        ],
        correctChoice: 0,
        rationale: "A section is 640 acres; a quarter is 160; a quarter of that quarter is 40."
      },
      {
        prompt: "Which evidence is most authoritative in locating a disputed boundary on the ground?",
        choices: [
          "A survey by a licensed surveyor applying the recorded legal description.",
          "The location of long-standing fences and hedges between the properties.",
          "The acreage stated in the listing and the assessor's record.",
          "The recollection of the current owners about where the line has been treated as running."
        ],
        correctChoice: 0,
        rationale: "A survey is what translates the recorded description into physical location. Fences, tax records, and recollection may be evidence in a legal dispute about the line, but none of them locates the description."
      }
    ]
  },
  "assignment-05": {
    subject: "Encumbrances, liens, easements, and restrictions",
    applied: {
      prompt: "A preliminary report on a home shows: a first deed of trust, a recorded easement giving the neighbor access across the driveway, a mechanic's lien recorded last month by a roofing contractor, and recorded covenants limiting the property to residential use. The buyer plans to run a small business from a converted garage. Which items most directly threaten his plan and his title?",
      choices: [
        "The covenants threaten the intended use, and the mechanic's lien threatens clear title at closing; the easement affects the driveway but not the business use, and the deed of trust is expected to be paid through escrow.",
        "All four are equal problems that must be removed before the buyer can close.",
        "Only the mechanic's lien matters, because the other three are ordinary and appear on most properties.",
        "Only the easement matters, because it gives a third party rights in the property the buyer is purchasing."
      ],
      correctChoice: 0,
      rationale: "Encumbrances have to be read for what each one does. Private use restrictions are what defeat a business use; an unresolved mechanic's lien is a money encumbrance that must be cleared or insured over; an access easement burdens the driveway; and the seller's financing is routinely paid off through escrow."
    },
    engagement: [
      {
        prompt: "What distinguishes a voluntary lien from an involuntary lien?",
        choices: [
          "A voluntary lien is created by the owner's own act, such as a deed of trust; an involuntary lien arises by operation of law, such as a tax or judgment lien.",
          "A voluntary lien may be removed at the owner's discretion; an involuntary lien may not.",
          "A voluntary lien is recorded while an involuntary lien is not.",
          "A voluntary lien secures a debt while an involuntary lien does not."
        ],
        correctChoice: 0,
        rationale: "The distinction is how the lien came into existence — by the owner's act or by law. Both are typically recorded, both can secure obligations, and neither is removable at will."
      },
      {
        prompt: "What is the difference between an easement and a license?",
        choices: [
          "An easement is an interest in land that generally runs with the property; a license is a personal privilege that is generally revocable.",
          "An easement is temporary while a license is permanent.",
          "An easement benefits the owner of the land while a license benefits a third party.",
          "An easement must be paid for while a license is granted without consideration."
        ],
        correctChoice: 0,
        rationale: "Durability and the nature of the interest separate them: an easement is a property interest that survives transfer, while a license is permission that can ordinarily be withdrawn."
      },
      {
        prompt: "In an easement appurtenant, what are the dominant and servient tenements?",
        choices: [
          "The dominant tenement is the parcel benefited by the easement; the servient tenement is the parcel burdened by it.",
          "The dominant tenement is the larger parcel; the servient tenement is the smaller one.",
          "The dominant tenement is the parcel that was created first; the servient tenement was created later.",
          "The dominant tenement is the parcel that pays for maintenance; the servient tenement uses it."
        ],
        correctChoice: 0,
        rationale: "Benefit and burden define the two parcels. Size, order of creation, and maintenance responsibility do not."
      },
      {
        prompt: "How is priority among recorded liens generally determined?",
        choices: [
          "Generally by the order of recording, first in time being first in right, with certain liens such as property tax liens given priority regardless of when they were recorded.",
          "Strictly by the order in which the underlying debts were incurred.",
          "By the size of each lien, with larger liens taking priority.",
          "By agreement among the lienholders, without which no priority exists."
        ],
        correctChoice: 0,
        rationale: "Recording order is the general rule with statutory exceptions, most notably property taxes. The date the debt arose, the amount, and private agreement do not set the general rule — though lienholders can subordinate by agreement."
      },
      {
        prompt: "What is the practical effect of recorded covenants and restrictions on a parcel?",
        choices: [
          "They are private restrictions that bind successive owners and limit use independently of what zoning permits.",
          "They are enforceable only against the original parties who agreed to them.",
          "They override zoning where the two conflict, because they are recorded against the specific property.",
          "They expire automatically when the property is sold to a new owner."
        ],
        correctChoice: 0,
        rationale: "Recorded restrictions run with the land and bind later owners. They operate alongside zoning rather than overriding it, and in practice the more restrictive of the two governs what the owner may actually do."
      }
    ],
    remediation: [
      {
        prompt: "A property owner has used a path across a neighbor's land for many years without permission. What issue does this raise?",
        choices: [
          "A possible prescriptive easement claim, which is a legal question requiring counsel rather than a determination a licensee can make.",
          "An automatic easement, since long use establishes the right.",
          "No issue, because use without permission cannot create rights.",
          "A license, which the neighbor may revoke at any time without consequence."
        ],
        correctChoice: 0,
        rationale: "Long adverse use may ripen into a right, but whether it has depends on legal elements a licensee is not qualified to evaluate. Neither the automatic-right answer nor the no-rights-ever answer is correct."
      },
      {
        prompt: "A contractor records a mechanic's lien for unpaid work. What makes this lien distinctive in priority terms?",
        choices: [
          "Its priority may relate back to when the work or improvement commenced rather than to the date the lien was recorded.",
          "It always takes priority over every other lien on the property.",
          "It takes priority only over liens recorded after the contractor completed the work.",
          "It has no priority until the contractor obtains a judgment."
        ],
        correctChoice: 0,
        rationale: "The relation-back feature is what makes mechanic's liens a hazard for lenders and buyers: a lien recorded later can outrank an interest that attached after the work began. It measures the lien from commencement rather than promoting it to first position, so it does not reach an encumbrance already attached and of record when work started. It is neither automatically first nor dependent on a judgment."
      },
      {
        prompt: "A buyer's preliminary report lists a utility easement running along the rear property line. What should the licensee advise?",
        choices: [
          "Review the recorded document to see the easement's width, location, and permitted use before assuming it will not affect the buyer's plans.",
          "Disregard it, since utility easements are standard on nearly all properties.",
          "Ask the title company to except it from the report.",
          "Advise the buyer that the utility must obtain permission before entering the easement area."
        ],
        correctChoice: 0,
        rationale: "The recorded document is what defines the burden, and a rear-line utility easement can prevent structures the buyer intends to build. Commonness is not analysis, exceptions are not removed on request, and the easement holder does not need fresh permission to use its rights."
      },
      {
        prompt: "What does it mean that a title insurance policy 'excepts' an item shown in the preliminary report?",
        choices: [
          "The policy does not insure against loss arising from that item, so the buyer bears that risk unless it is otherwise addressed.",
          "The item has been removed from title as a condition of issuing the policy.",
          "The insurer will defend a claim on that item but will not pay a loss.",
          "The item is insured only up to the amount of the buyer's down payment."
        ],
        correctChoice: 0,
        rationale: "An exception carves the item out of coverage, which is why exceptions must be read rather than skimmed. It does not clear the item from title and it is not a partial or defense-only coverage."
      },
      {
        prompt: "Zoning permits a duplex on a parcel, but the recorded covenants limit it to a single-family residence. What may the owner build?",
        choices: [
          "A single-family residence, because the private restriction is more restrictive and both apply.",
          "A duplex, because public zoning supersedes private restrictions.",
          "A duplex, because covenants apply only until the subdivision is fully built out.",
          "Either, at the owner's election, since the two authorities conflict."
        ],
        correctChoice: 0,
        rationale: "Both apply simultaneously, so the owner must satisfy each — which means the stricter one controls the outcome. Zoning permits rather than compels, so it does not override a private restriction."
      }
    ]
  },
  "assignment-06": {
    subject: "Government powers, land use, and environmental controls",
    applied: {
      prompt: "A buyer is considering a parcel where he plans to open a small retail shop. The parcel is zoned residential, but a similar shop operates two doors down, having been there since before the current zoning. The seller says the buyer 'can obviously do the same thing.' How should the licensee handle this?",
      choices: [
        "Explain that the neighboring use is likely a legal nonconforming use tied to that property's history, that it confers nothing on this parcel, and that the buyer must confirm with the planning agency what this parcel permits before relying on the plan.",
        "Agree with the seller, since an existing similar use in the immediate area establishes that the use is permitted there.",
        "Advise the buyer to purchase and apply for a variance afterward, since variances are routinely granted where a similar use exists nearby.",
        "Advise the buyer that zoning may be disregarded if the use does not disturb neighbors."
      ],
      correctChoice: 0,
      rationale: "A nonconforming use is a right attached to a specific property because of when its use began; it is not a precedent other parcels can claim. The only reliable answer comes from the agency with jurisdiction, and treating a variance as routine or zoning as optional would be inventing permission the buyer does not have."
    },
    engagement: [
      {
        prompt: "Which of the following is an exercise of the police power?",
        choices: [
          "Zoning regulations that limit how land may be used, adopted to protect public health, safety, and welfare.",
          "A government taking of private property for a public project with just compensation.",
          "The levy of annual property taxes on real property.",
          "The passing of property to the state when an owner dies without heirs."
        ],
        correctChoice: 0,
        rationale: "Zoning is the classic police power exercise. The other three describe eminent domain, taxation, and escheat — the remaining three governmental powers over private property."
      },
      {
        prompt: "What must accompany a government taking of private property under eminent domain?",
        choices: [
          "A public use or purpose and payment of just compensation to the owner.",
          "The owner's consent to the transfer.",
          "A finding that the property is not being productively used.",
          "An equivalent replacement property offered to the owner."
        ],
        correctChoice: 0,
        rationale: "Public purpose and just compensation are the constitutional conditions. Consent is not required — that is what distinguishes eminent domain from a sale — and neither productive use nor replacement property is the test."
      },
      {
        prompt: "What is the relationship between a general plan and zoning?",
        choices: [
          "The general plan sets the long-range policy for development, and zoning implements it through specific use regulations that must be consistent with it.",
          "Zoning sets the policy and the general plan applies it to individual parcels.",
          "They are alternative systems, and a jurisdiction adopts one or the other.",
          "The general plan governs private property and zoning governs public land."
        ],
        correctChoice: 0,
        rationale: "The general plan is the policy document and zoning is the implementing tool, which is why consistency between them matters. They are not alternatives and neither is limited by ownership type."
      },
      {
        prompt: "What is a variance, and what must be shown about the property before one is granted?",
        choices: [
          "Permission to deviate from a specific zoning requirement, granted because strict application would create a hardship peculiar to the property.",
          "A change in the zoning designation applicable to a parcel.",
          "Permission to continue a use that predates the current zoning.",
          "An exemption from building code requirements for older structures."
        ],
        correctChoice: 0,
        rationale: "A variance relieves a specific requirement based on hardship particular to the property. Rezoning changes the designation, a nonconforming use is grandfathered by timing, and building codes are a separate regulatory system."
      },
      {
        prompt: "Why does a property's location within a mapped environmental or natural hazard area matter to a buyer?",
        choices: [
          "It can affect insurance availability and cost, construction and improvement requirements, and the property's risk profile, and it triggers disclosure obligations.",
          "It prevents the property from being financed or insured.",
          "It obligates the seller to remediate the hazard before transfer.",
          "It affects only properties intended for new construction."
        ],
        correctChoice: 0,
        rationale: "Mapped hazard status changes cost, requirements, and risk, and it is disclosed so the buyer can investigate. It does not bar financing, does not obligate remediation, and applies regardless of construction plans."
      }
    ],
    remediation: [
      {
        prompt: "An existing use lawfully predates the current zoning that would now prohibit it. What is this called?",
        choices: [
          "A legal nonconforming use, which may generally continue but is typically limited in how far it may be expanded, rebuilt, or resumed after abandonment.",
          "A variance, granted because the use existed before the ordinance.",
          "A conditional use, permitted at the jurisdiction's discretion.",
          "A vested right, which permits the use to be expanded at the owner's discretion."
        ],
        correctChoice: 0,
        rationale: "The grandfathering is real but limited — that limitation is what buyers most often misunderstand. It is neither a variance, nor a discretionary conditional use, nor an unrestricted right."
      },
      {
        prompt: "A parcel's owner wants to divide it into four lots for sale. What framework applies?",
        choices: [
          "Subdivision regulation, which controls how land may be divided and what improvements and approvals are required before lots may be sold.",
          "Zoning alone, which determines whether the resulting lots meet minimum size.",
          "The building code, which governs the structures to be built on the lots.",
          "Private covenants, which are the only restriction on dividing a parcel."
        ],
        correctChoice: 0,
        rationale: "Dividing land triggers subdivision law, which is a distinct process from zoning compliance. Zoning, building codes, and covenants each apply to their own subject but none of them governs the act of division."
      },
      {
        prompt: "What is the significance of a conditional use permit?",
        choices: [
          "It allows a use that the zoning permits only under specified conditions, evaluated case by case for compatibility.",
          "It permanently rezones the parcel for the requested use.",
          "It exempts the applicant from the general plan's requirements.",
          "It converts a nonconforming use into a permitted use."
        ],
        correctChoice: 0,
        rationale: "A conditional use is contemplated by the ordinance but requires case-specific approval and conditions. It neither rezones, nor overrides the general plan, nor cures a nonconforming use."
      },
      {
        prompt: "A buyer asks who is responsible for determining whether a property can support his intended use. What is the sound answer?",
        choices: [
          "The buyer, with professional assistance, must verify permitted use with the jurisdiction; the licensee's role is to advise investigation, not to give the answer.",
          "The licensee, who should confirm the permitted use and report it to the buyer as fact.",
          "The seller, who must warrant that the property supports the buyer's intended use.",
          "The title company, whose report identifies permitted uses."
        ],
        correctChoice: 0,
        rationale: "Permitted-use determinations come from the jurisdiction. A licensee who reports it as fact assumes a risk she cannot support, the seller does not warrant the buyer's plans, and title reports address record title rather than land-use permissions."
      },
      {
        prompt: "Why do water-related requirements increasingly affect California property transactions?",
        choices: [
          "Because conservation requirements and supply conditions can affect what may be built, how a property may be landscaped or fitted, and what a buyer must investigate.",
          "Because water rights are automatically severed from land in California.",
          "Because water use is unregulated, leaving each owner to determine his own usage.",
          "Because water requirements apply only to agricultural property."
        ],
        correctChoice: 0,
        rationale: "Conservation requirements and supply conditions translate into concrete constraints on improvements and use. Water rights are not automatically severed, use is regulated, and the effects are not limited to agricultural land."
      }
    ]
  },
  "assignment-07": {
    subject: "Agency and brokerage relationships",
    applied: {
      prompt: "A homeowner has been talking with a licensee for weeks. The licensee has advised her on pricing, recommended repairs, and told her what he thinks a buyer will accept. Nothing has been signed and the licensee has not been paid. The homeowner now discovers the licensee also represents the buyer who made an offer. The licensee says no agency existed with her because there was no written agreement. Is he right?",
      choices: [
        "No — an agency relationship can arise from the parties' conduct, so advising her over weeks may have created duties regardless of any signed agreement or payment, and representing the buyer without disclosure and consent compounds the problem.",
        "Yes — without a written agreement and compensation there is no agency relationship and therefore no duties.",
        "Yes — agency requires a signed listing agreement in every case involving residential property.",
        "No — but the only consequence is that the licensee cannot claim a commission from the homeowner."
      ],
      correctChoice: 0,
      rationale: "Agency can be created by conduct, which is precisely why early disclosure matters: the relationship may already exist while the consumer is unaware of it. Payment is not what creates the duties, and the consequence is not merely a lost commission — undisclosed dual representation breaches duties actually owed."
    },
    engagement: [
      {
        prompt: "How may an agency relationship be created?",
        choices: [
          "By express agreement, by the conduct of the parties, or by ratification of acts performed on a principal's behalf.",
          "Only by a written agreement signed by both the principal and the agent.",
          "Only by the payment of compensation to the agent.",
          "Only by the agent's registration of the relationship with the Department of Real Estate."
        ],
        correctChoice: 0,
        rationale: "Express agreement, conduct, and ratification are the recognized routes. Writing and payment are common features of the relationship rather than its only sources, and there is no registration mechanism."
      },
      {
        prompt: "Which duty does an agent owe to a third party who is not the agent's principal?",
        choices: [
          "Honesty, fair dealing, and disclosure of material facts, but not the loyalty and confidentiality owed to a principal.",
          "The full set of fiduciary duties, identical to those owed to the principal.",
          "No duties at all, since the agent represents only the principal.",
          "Only the duty to transmit offers accurately."
        ],
        correctChoice: 0,
        rationale: "Non-clients are owed honesty, fair dealing, and disclosure of material facts. Fiduciary duties such as loyalty and confidentiality run to the principal alone, but that does not leave third parties without protection."
      },
      {
        prompt: "What does the duty of confidentiality protect?",
        choices: [
          "The principal's confidential information, such as the lowest price he would accept, which may not be disclosed without authorization.",
          "All information about the property, including its physical condition.",
          "The identity of the principal, which may never be disclosed to the other party.",
          "The terms of the final contract, which remain private after closing."
        ],
        correctChoice: 0,
        rationale: "Confidentiality covers the principal's negotiating position and similar private information. It never extends to concealing material facts about the property, which must be disclosed."
      },
      {
        prompt: "What is required for lawful dual agency in California?",
        choices: [
          "Informed written consent from both principals, after disclosure of what dual agency means and its limits.",
          "Disclosure to both principals, without any requirement of consent.",
          "Consent from the principal who is paying the compensation.",
          "Approval by the responsible broker, which substitutes for the principals' consent."
        ],
        correctChoice: 0,
        rationale: "Both principals must give informed written consent. Disclosure alone, one party's consent, and internal broker approval are each insufficient."
      },
      {
        prompt: "How may an agency relationship be terminated?",
        choices: [
          "By completion of the purpose, expiration of the term, mutual agreement, or revocation or renunciation, though termination may have contractual consequences.",
          "Only by the expiration of the written agreement's stated term.",
          "Only by mutual written agreement of the principal and the agent.",
          "Only by the principal, since the agent may not withdraw from the relationship."
        ],
        correctChoice: 0,
        rationale: "Several routes end an agency, and the power to end it is distinct from the right to do so without consequence — an early termination may still breach the contract. Either party may act to end the relationship."
      }
    ],
    remediation: [
      {
        prompt: "An agent discovers that his principal has instructed him to conceal a material defect. What controls?",
        choices: [
          "The duty of disclosure to the other party, since the duty of obedience extends only to lawful instructions.",
          "The duty of obedience, since the principal directs the agency.",
          "The duty of confidentiality, since the defect is the principal's information.",
          "The agent's own judgment about whether the defect would affect the price."
        ],
        correctChoice: 0,
        rationale: "Obedience is bounded by legality, and confidentiality protects negotiating position rather than concealment of material facts. The agent's view of the price effect does not determine what must be disclosed."
      },
      {
        prompt: "A salesperson negotiates a transaction. Whose agent is she, legally speaking?",
        choices: [
          "The broker's, with the broker being the agent of the principal — which is why the brokerage's agency position, not the individual's, defines the relationship.",
          "The principal's directly, with the broker having no agency role.",
          "Both the principal's and the broker's, in equal measure.",
          "Neither's, since a salesperson acts as an independent intermediary."
        ],
        correctChoice: 0,
        rationale: "The broker holds the agency with the principal and the salesperson acts for the broker. This is why a second salesperson in the same office does not eliminate a dual agency question."
      },
      {
        prompt: "What is the significance of an agent's duty of care?",
        choices: [
          "The agent must exercise the skill and diligence reasonably expected of a competent licensee, which can be breached by carelessness even without dishonesty.",
          "The agent must guarantee a favorable outcome for the principal.",
          "The agent must personally inspect and verify every fact affecting the transaction.",
          "The agent must follow the principal's instructions exactly, whatever they are."
        ],
        correctChoice: 0,
        rationale: "Care is a standard of competent performance, which is why negligence is actionable without any bad intent. It is not a guarantee of results, not unlimited verification, and not the same as obedience."
      },
      {
        prompt: "An agent receives compensation from the seller while representing the buyer. What is required?",
        choices: [
          "Disclosure of the compensation arrangement to the buyer, since the source of payment does not by itself determine whom the agent represents.",
          "Nothing, since payment by the seller means the agent represents the seller.",
          "The buyer must reimburse the seller to preserve the representation.",
          "The arrangement is prohibited, because an agent may only be paid by his own principal."
        ],
        correctChoice: 0,
        rationale: "Who pays and whom the agent represents are distinct questions, which is exactly why the arrangement must be disclosed. Payment from the other side is permissible with disclosure and does not need to be reimbursed."
      },
      {
        prompt: "After a listing expires, the former listing agent continues to hold the seller's confidential pricing information. What is his obligation?",
        choices: [
          "The duty of confidentiality generally survives the end of the agency, so he may not use or disclose that information afterward.",
          "The duty ends with the agency, so the information may be used freely.",
          "The duty ends unless the listing agreement expressly extends it.",
          "The duty continues only until the property is relisted with another brokerage."
        ],
        correctChoice: 0,
        rationale: "Confidentiality outlives the relationship, which is what makes it meaningful. It does not depend on an express extension or on what the seller does next."
      }
    ]
  },
  "assignment-08": {
    subject: "Contracts and transaction formation",
    applied: {
      prompt: "A seller and buyer shake hands on a price for a home and exchange text messages confirming the number and the closing month. The buyer then spends money on an inspection. The seller receives a higher offer and refuses to proceed, saying nothing was ever signed. The buyer asks the licensee whether he has a contract. What should the licensee say?",
      choices: [
        "Explain that contracts for the sale of real property generally must be in writing to be enforceable, that whether these communications satisfy that requirement is a legal question, and refer the buyer to an attorney rather than giving him an answer.",
        "Tell the buyer he has an enforceable contract, since the text messages record the essential terms and he relied on them.",
        "Tell the buyer he has no contract of any kind, since a handshake and texts cannot create obligations for real property.",
        "Tell the buyer that his inspection expense makes the agreement enforceable regardless of the writing requirement."
      ],
      correctChoice: 0,
      rationale: "The writing requirement for real property contracts is the governing principle, but whether particular electronic communications satisfy it, and whether the buyer's reliance changes the analysis, are legal questions with real complexity. Answering either way would be practicing law on a question the licensee cannot resolve."
    },
    engagement: [
      {
        prompt: "Which elements are required to form a valid contract?",
        choices: [
          "Capable parties, mutual consent, a lawful object, and consideration.",
          "A written document, signatures, notarization, and recording.",
          "An offer, an acceptance, a deposit, and a closing date.",
          "Mutual consent, a lawful object, and a licensed intermediary."
        ],
        correctChoice: 0,
        rationale: "Capacity, mutual consent, lawful object, and consideration are the essential elements. Notarization, recording, deposits, and intermediaries are transaction features rather than formation requirements."
      },
      {
        prompt: "What is the effect of a counteroffer on the original offer?",
        choices: [
          "It rejects the original offer and substitutes a new one, so the original can no longer be accepted unless it is renewed.",
          "It suspends the original offer, which may be accepted if the counteroffer is rejected.",
          "It modifies the original offer while leaving it otherwise in force.",
          "It has no legal effect until the original offeror responds to it."
        ],
        correctChoice: 0,
        rationale: "A counteroffer terminates the original offer's power of acceptance. It neither suspends nor amends the original, and it takes effect as a new offer on communication."
      },
      {
        prompt: "What does the Statute of Frauds require in a real estate context?",
        choices: [
          "That contracts for the sale of real property, and certain other agreements, be in writing and signed to be enforceable.",
          "That all real estate contracts be notarized before they take effect.",
          "That real estate contracts be recorded to bind the parties.",
          "That real estate contracts be prepared by an attorney."
        ],
        correctChoice: 0,
        rationale: "The requirement is a signed writing for enforceability. Notarization, recording, and attorney preparation are not what the doctrine requires."
      },
      {
        prompt: "A minor signs a purchase agreement for real property. What is the likely status of the contract?",
        choices: [
          "It is generally voidable, because capacity is an element of a valid contract and a minor's contracts may typically be disaffirmed.",
          "It is void from the outset and has no effect whatsoever.",
          "It is fully valid and enforceable against the minor.",
          "It is valid if a parent was present when it was signed."
        ],
        correctChoice: 0,
        rationale: "Capacity problems generally make a contract voidable at the incapacitated party's election rather than void. A parent's presence does not supply the minor's capacity."
      },
      {
        prompt: "What remedy does specific performance provide?",
        choices: [
          "A court order requiring a party to perform the contract, available where damages would be inadequate — as is often argued for real property because each parcel is unique.",
          "Money damages calculated to compensate the non-breaching party's losses.",
          "Cancellation of the contract and restoration of the parties to their prior positions.",
          "An amount fixed in advance by the parties as compensation for breach."
        ],
        correctChoice: 0,
        rationale: "Specific performance compels performance itself. The other three describe damages, rescission, and liquidated damages respectively."
      }
    ],
    remediation: [
      {
        prompt: "An offer states it will remain open until Friday. The offeror withdraws it on Wednesday, before acceptance. What is the general rule?",
        choices: [
          "An offer may generally be revoked before acceptance unless it is supported by consideration as an option, so the stated deadline does not by itself bind the offeror.",
          "The offer must remain open until Friday because the offeror stated a deadline.",
          "The offer may be revoked only if the offeree has not yet begun to consider it.",
          "The offer becomes irrevocable as soon as the offeree receives it."
        ],
        correctChoice: 0,
        rationale: "A stated deadline sets an outer limit but does not create irrevocability; consideration is what turns an offer into a binding option. Receipt and the offeree's deliberation do not bind the offeror."
      },
      {
        prompt: "What distinguishes rescission from a claim for damages?",
        choices: [
          "Rescission unwinds the contract and seeks to restore the parties to their prior positions, while damages leave the contract's effect intact and compensate for the loss.",
          "Rescission is available only for fraud, while damages are available for any breach.",
          "Rescission is granted by the parties, while damages are granted by a court.",
          "Rescission applies to real property contracts and damages apply to personal property contracts."
        ],
        correctChoice: 0,
        rationale: "The two remedies point in opposite directions: undoing the bargain versus compensating within it. Rescission is not limited to fraud and not limited by property type, and both can be pursued through the courts."
      },
      {
        prompt: "A contract's performance is conditioned on the buyer obtaining financing. What kind of provision is this?",
        choices: [
          "A condition, which qualifies the duty to perform without preventing the contract from being formed.",
          "A covenant, which is a promise that the buyer will obtain financing.",
          "A warranty, which guarantees the financing will be obtained.",
          "An option, which gives the buyer the right to decide whether to proceed."
        ],
        correctChoice: 0,
        rationale: "A condition qualifies performance within a formed contract. A covenant would promise the outcome, a warranty would guarantee it, and an option would give an unconditional election."
      },
      {
        prompt: "Parties agree in advance that a specified deposit will be the seller's sole recovery if the buyer defaults. What is this called?",
        choices: [
          "A liquidated damages provision, which fixes the recovery in advance and is subject to legal limits on enforceability.",
          "A penalty clause, which is enforceable as written between sophisticated parties.",
          "An option payment, which compensates the seller for holding the property.",
          "A forfeiture provision, which is automatically enforceable in real property contracts."
        ],
        correctChoice: 0,
        rationale: "Fixing damages in advance is liquidated damages, and its enforceability is constrained by law — which is exactly why a provision that operates as a penalty is treated differently. It is not an option payment and it is not automatically enforceable."
      },
      {
        prompt: "A contract's stated purpose is an activity that is illegal. What is the effect?",
        choices: [
          "The contract fails for want of a lawful object and is generally void, since legality is an element of formation.",
          "The contract is voidable at the election of the party who did not know of the illegality.",
          "The contract is enforceable if both parties knew of the illegality when they signed.",
          "The contract is enforceable except as to the illegal portion, which is simply ignored."
        ],
        correctChoice: 0,
        rationale: "Lawful object is a formation element, so its absence is more serious than a defect making a contract voidable. Mutual knowledge does not cure it, and severing an illegal core purpose is not available."
      }
    ]
  },
  "assignment-09": {
    subject: "Transfer, deeds, title, and recording",
    applied: {
      prompt: "An elderly owner signs a grant deed transferring her home to her nephew, has it notarized, and locks it in her desk, telling a friend the nephew should have the house 'when I am gone.' She dies two years later without ever giving him the deed. The nephew finds it and records it. Another relative disputes the transfer. What is the central legal issue?",
      choices: [
        "Whether the deed was ever delivered with the present intent to transfer title, since a deed takes effect on delivery and acceptance rather than on signing, notarization, or recording.",
        "Whether the deed was properly notarized, since notarization is what makes a deed valid.",
        "Whether the nephew recorded the deed within a required period after the owner's death.",
        "Whether the deed named the nephew with sufficient certainty to identify him as grantee."
      ],
      correctChoice: 0,
      rationale: "Delivery with present intent to pass title is what makes a deed operative, and an intent that the transfer occur at death points toward a testamentary disposition rather than a completed conveyance. Notarization enables recording rather than creating validity, recording does not substitute for delivery, and the grantee's identity is not in doubt."
    },
    engagement: [
      {
        prompt: "Which is required for a valid deed?",
        choices: [
          "A competent grantor, an identifiable grantee, words of conveyance, an adequate description of the property, and the grantor's signature.",
          "Notarization and recording in the county where the property is located.",
          "The grantee's signature accepting the conveyance.",
          "A recital of the actual consideration paid for the property."
        ],
        correctChoice: 0,
        rationale: "Those five elements make a deed valid. Notarization and recording concern the public record, the grantee does not sign, and the actual consideration need not be recited."
      },
      {
        prompt: "How does a grant deed differ from a quitclaim deed?",
        choices: [
          "A grant deed carries implied warranties that the grantor has not previously conveyed the property and has not encumbered it, while a quitclaim conveys only whatever interest the grantor may have, with no warranties.",
          "A grant deed conveys full ownership while a quitclaim conveys only a partial interest.",
          "A grant deed must be recorded while a quitclaim need not be.",
          "A grant deed is used between strangers while a quitclaim is used between family members."
        ],
        correctChoice: 0,
        rationale: "The difference is the warranties, not the quantity conveyed: a quitclaim from a full owner conveys full ownership. Recording practice and the parties' relationship do not define the instruments."
      },
      {
        prompt: "What is the primary legal effect of recording a deed?",
        choices: [
          "It gives constructive notice to the world of the interest, protecting the grantee against later claimants.",
          "It makes an otherwise invalid deed valid.",
          "It transfers title from the grantor to the grantee.",
          "It guarantees that the grantor held marketable title."
        ],
        correctChoice: 0,
        rationale: "Recording is about notice and priority. Title passes on delivery and acceptance, recording cannot cure an invalid deed, and it makes no guarantee about the state of the grantor's title."
      },
      {
        prompt: "What does a preliminary report accomplish that a title search alone does not?",
        choices: [
          "It states the terms and exceptions on which the title insurer would be willing to issue a policy, which is an offer to insure rather than a mere report of the record.",
            "It certifies that title is free of all defects as of its date.",
          "It resolves any liens or encumbrances discovered in the record.",
          "It substitutes for the policy once escrow closes."
        ],
        correctChoice: 0,
        rationale: "The preliminary report is an offer to insure on stated terms. It certifies nothing, clears nothing, and is superseded by the policy rather than replacing it."
      },
      {
        prompt: "Which is an example of an involuntary transfer of title?",
        choices: [
          "Escheat to the state when an owner dies without a will and without heirs.",
          "A gift of real property from a parent to a child.",
          "A sale of property through escrow to an unrelated buyer.",
          "A transfer of property into the owner's own living trust."
        ],
        correctChoice: 0,
        rationale: "Escheat occurs by operation of law without the owner's act. Gifts, sales, and transfers into one's own trust are all voluntary."
      }
    ],
    remediation: [
      {
        prompt: "Two deeds to the same property are executed by the same owner to different buyers. The second buyer records first without knowledge of the earlier deed. What principle governs the outcome?",
        choices: [
          "Recording and notice rules, under which a later purchaser who takes in good faith without notice and records first may prevail over an earlier unrecorded interest.",
          "The order in which the deeds were signed, which always controls.",
          "The amount paid by each buyer, with the higher price prevailing.",
          "The relationship of each buyer to the seller."
        ],
        correctChoice: 0,
        rationale: "This is why recording matters: the first-signed deed can lose to a later good-faith purchaser who records first. Price and relationship are irrelevant to priority."
      },
      {
        prompt: "What is the difference between actual notice and constructive notice?",
        choices: [
          "Actual notice is knowledge a person genuinely has; constructive notice is knowledge the law imputes, such as from the public record or from someone's visible possession.",
          "Actual notice comes from the public record; constructive notice comes from personal communication.",
          "Actual notice binds only the parties; constructive notice binds third parties.",
          "Actual notice applies to liens while constructive notice applies to deeds."
        ],
        correctChoice: 0,
        rationale: "The distinction is between what someone knows and what the law charges him with knowing. The record and visible possession are sources of constructive notice, not of actual notice."
      },
      {
        prompt: "A buyer is told the seller will 'convey by quitclaim to keep it simple.' What should the buyer understand?",
        choices: [
          "He receives whatever interest the seller has, with no warranty that the seller has any interest at all, so the state of title matters even more than usual.",
          "He receives the same protection as a grant deed, since the instruments have the same effect once recorded.",
          "He receives no interest until the seller confirms ownership separately.",
          "He receives full title, since a quitclaim from the record owner conveys everything."
        ],
        correctChoice: 0,
        rationale: "A quitclaim passes whatever the grantor has, which could be everything or nothing, and carries no warranties either way. That is precisely why it does not equal a grant deed."
      },
      {
        prompt: "What is the function of title insurance as distinct from the preliminary report?",
        choices: [
          "The policy indemnifies the insured against covered losses from title defects, within its terms and excluding the items it excepts.",
          "It guarantees that no defects exist in the property's title.",
          "It insures the physical condition of the property against loss.",
          "It transfers responsibility for clearing exceptions to the insurer."
        ],
        correctChoice: 0,
        rationale: "Title insurance is indemnity for covered losses, bounded by exclusions and exceptions. It does not guarantee perfect title, does not insure physical condition, and does not assume the job of clearing what it excepts."
      },
      {
        prompt: "Why does a buyer's possession of a property matter to a subsequent purchaser?",
        choices: [
          "Visible, open possession by someone other than the record owner may put a later purchaser on inquiry notice of that person's rights.",
          "It has no legal effect, since only the recorded documents matter.",
          "It automatically creates an ownership interest in the possessor.",
          "It obligates the record owner to disclose the possessor's identity."
        ],
        correctChoice: 0,
        rationale: "Possession is a classic source of inquiry notice, which is why searching only the record can be insufficient. It neither creates ownership by itself nor triggers a disclosure duty on the owner."
      }
    ]
  },
  "assignment-10": {
    subject: "Escrow, settlement, and transaction chronology",
    applied: {
      prompt: "Escrow has received mutual instructions, the buyer's funds, and the lender's documents. The day before recording, the buyer emails escrow directing it to hold back $3,000 from the seller's proceeds for a repair he says the seller promised verbally. The seller knows nothing about it. What must escrow do, and why?",
      choices: [
        "Escrow may not act on the buyer's unilateral instruction; a change to the disbursement requires mutual written instructions, and if the parties disagree, escrow's role is to stop rather than to decide between them.",
        "Escrow should hold the funds, since the buyer is entitled to protect himself against a promise the seller made.",
        "Escrow should disburse in full and let the buyer pursue the seller afterward, since the instruction arrived too late to act on.",
        "Escrow should ask the seller's agent to confirm whether the promise was made and act on that confirmation."
      ],
      correctChoice: 0,
      rationale: "Escrow's authority comes entirely from mutual instructions, which is why one party cannot redirect funds and why an agent's confirmation is not the missing consent. Disbursing in full also acts on one side's position; the neutral response to a genuine dispute is to stop and require the parties to resolve it."
    },
    engagement: [
      {
        prompt: "What makes escrow a valid escrow arrangement?",
        choices: [
          "A binding contract between the parties and their conditional delivery of funds and documents to a neutral third party who acts only on their mutual instructions.",
          "The involvement of a licensed escrow company selected by the lender.",
          "The deposit of the buyer's funds into a trust account before closing.",
          "The recording of the escrow instructions in the county records."
        ],
        correctChoice: 0,
        rationale: "A binding contract plus conditional delivery to a neutral holder is what constitutes escrow. Who selects the holder, the mechanics of the deposit, and recording are not what create it."
      },
      {
        prompt: "What do escrow instructions do?",
        choices: [
          "They tell the escrow holder what conditions must be satisfied and what to do with the funds and documents when they are.",
          "They replace the purchase agreement as the operative contract between the parties.",
          "They authorize the escrow holder to resolve disagreements between the parties.",
          "They set the closing date independently of the purchase agreement."
        ],
        correctChoice: 0,
        rationale: "Instructions direct escrow's performance. They implement the purchase agreement rather than replacing it, confer no authority to decide disputes, and do not independently set terms the parties agreed elsewhere."
      },
      {
        prompt: "What is the purpose of prorating property taxes at closing?",
        choices: [
          "To allocate the tax burden between seller and buyer according to the portion of the tax period each owned the property.",
          "To reduce the buyer's first-year tax obligation to the county.",
          "To adjust the purchase price for the property's assessed value.",
          "To reimburse the seller for taxes paid in prior years."
        ],
        correctChoice: 0,
        rationale: "Proration divides a continuing charge at the ownership boundary. It does not change what the county is owed, adjust the price, or reach back to prior years."
      },
      {
        prompt: "In what order do recording and disbursement typically occur at closing?",
        choices: [
          "Recording occurs first to establish the new interests of record, and disbursement follows once recording is confirmed.",
          "Disbursement occurs first so the seller is paid before title transfers.",
          "They occur simultaneously, since neither can precede the other.",
          "The order depends on which party's agent requests priority."
        ],
        correctChoice: 0,
        rationale: "Confirming recording before releasing funds protects against a gap in which money has moved but the interests are not of record. It is a deliberate sequence, not a simultaneous event or a matter of agent preference."
      },
      {
        prompt: "Why must the escrow file be retained after closing?",
        choices: [
          "Because it evidences what was instructed, received, disbursed, and recorded, which is what later questions about the transaction turn on.",
          "Because escrow must produce it for the buyer's lender annually.",
          "Because the file is required to issue the title insurance policy.",
          "Because retention allows escrow to reopen the transaction if an error is found."
        ],
        correctChoice: 0,
        rationale: "The file is the evidentiary record of a completed transaction. It is not an annual lender deliverable, not a prerequisite to the policy, and a closed escrow is not reopened by keeping the file."
      }
    ],
    remediation: [
      {
        prompt: "Why is the escrow holder described as a dual agent of both parties in a limited sense?",
        choices: [
          "Because escrow owes duties to both parties simultaneously but may act only within the mutual instructions, which is what keeps it neutral rather than an advocate for either.",
          "Because escrow may advise either party on the transaction's terms.",
          "Because escrow represents whichever party pays its fee.",
          "Because escrow becomes the agent of the buyer after recording."
        ],
        correctChoice: 0,
        rationale: "The limited agency describes duties owed to both, bounded strictly by the instructions. It confers no advisory role, does not follow the fee, and does not shift at recording."
      },
      {
        prompt: "The buyer's funds arrive but one of the seller's required documents is missing. What should escrow do?",
        choices: [
          "Hold and not close, because the conditions in the instructions have not been satisfied.",
          "Close and obtain the missing document afterward, since the funds are in hand.",
          "Close and note the missing document on the settlement statement.",
          "Return the buyer's funds and cancel the escrow."
        ],
        correctChoice: 0,
        rationale: "Escrow performs only when its conditions are met, which is exactly why it holds rather than closes. Closing with a note or unilaterally cancelling both go beyond what the instructions authorize."
      },
      {
        prompt: "What does a settlement statement show?",
        choices: [
          "An itemized accounting of the debits and credits to each party, including the purchase price, prorations, payoffs, and costs.",
          "The lender's underwriting conditions and how each was satisfied.",
          "The property's title exceptions and how each was cleared.",
          "The brokerage's internal allocation of compensation between licensees."
        ],
        correctChoice: 0,
        rationale: "The settlement statement is the money accounting for the transaction. Underwriting conditions, title exceptions, and internal commission splits are recorded elsewhere."
      },
      {
        prompt: "A seller asks escrow to release his proceeds a day early because his replacement purchase is closing. What controls?",
        choices: [
          "The instructions and the conditions for disbursement; escrow cannot advance funds because one party's separate transaction requires it.",
          "The escrow holder's discretion, since the funds are already the seller's after recording.",
          "The buyer's agent's consent, which is sufficient to authorize the release.",
          "The lender's approval, since the funds originate from the loan."
        ],
        correctChoice: 0,
        rationale: "Disbursement follows the instructions and their conditions. Escrow exercises no discretion over timing, and neither an agent nor the lender supplies the authority the instructions require."
      },
      {
        prompt: "Which best describes the chronology of a typical residential transaction?",
        choices: [
          "Contract formation, opening of escrow, satisfaction of conditions and contingencies, loan funding, recording, disbursement, and delivery of possession.",
          "Opening of escrow, contract formation, recording, loan funding, satisfaction of contingencies, possession.",
          "Contract formation, loan funding, recording, opening of escrow, satisfaction of contingencies, possession.",
          "Opening of escrow, satisfaction of contingencies, contract formation, recording, disbursement, possession."
        ],
        correctChoice: 0,
        rationale: "The contract comes first and everything else implements it, with funding preceding recording and disbursement following confirmation of recording. Each wrong sequence puts escrow or funding ahead of the agreement that authorizes it."
      }
    ]
  },
  "assignment-11": {
    subject: "Real estate finance foundations",
    applied: {
      prompt: "A borrower financed his California home purchase with a loan secured by a deed of trust. He defaults. The lender is considering its options and the borrower asks what could happen to him beyond losing the house. What is the accurate framework to explain?",
      choices: [
        "A deed of trust with a power of sale allows a nonjudicial trustee's sale, which is faster but limits the lender's ability to pursue the borrower for a deficiency; judicial foreclosure preserves more collection options but is slower — and California restricts deficiency recovery in defined circumstances, so the borrower should consult counsel about his specific loan.",
        "The lender may pursue the borrower personally for any shortfall in every case, since the promissory note is a personal obligation.",
        "The borrower can never be pursued for a shortfall in California, because all home loans are non-recourse.",
        "The outcome depends entirely on whether the lender is a bank or a private lender."
      ],
      correctChoice: 0,
      rationale: "The tradeoff between speed and collection rights is the core of the framework, and California's limits on deficiency recovery depend on the loan's characteristics. Both absolute answers are wrong, and the lender's identity is not what determines it — which is why the specific loan needs legal review."
    },
    engagement: [
      {
        prompt: "What is the relationship between a promissory note and a deed of trust?",
        choices: [
          "The note is the evidence of the debt and the promise to repay; the deed of trust is the security instrument that pledges the property as collateral for that debt.",
          "The note secures the property while the deed of trust evidences the debt.",
          "They are alternative documents, and a loan uses one or the other.",
          "The note is recorded and the deed of trust is retained by the lender."
        ],
        correctChoice: 0,
        rationale: "Debt and security are separate functions performed by separate documents. The deed of trust is what gets recorded, not the note."
      },
      {
        prompt: "Who are the three parties to a deed of trust?",
        choices: [
          "The trustor (borrower), the beneficiary (lender), and the trustee, who holds bare legal title for the purpose of the security.",
          "The mortgagor, the mortgagee, and the escrow holder.",
          "The borrower, the lender, and the title insurer.",
          "The grantor, the grantee, and the county recorder."
        ],
        correctChoice: 0,
        rationale: "Trustor, beneficiary, and trustee are the three parties, and the third-party trustee is exactly what distinguishes a deed of trust from a two-party mortgage."
      },
      {
        prompt: "In a fully amortized loan, how does the composition of each payment change over time?",
        choices: [
          "Early payments are mostly interest with little principal; over time the interest portion falls and the principal portion rises, with the payment amount unchanged.",
          "Early payments are mostly principal, with interest increasing as the balance is repaid.",
          "The interest and principal portions remain in the same proportion throughout the term.",
          "The payment amount decreases each period as the balance declines."
        ],
        correctChoice: 0,
        rationale: "Interest accrues on the outstanding balance, so as the balance falls the interest share falls and the principal share rises within a level payment."
      },
      {
        prompt: "A borrower pays two points on a $400,000 loan. How much is that?",
        choices: [
          "$8,000, because a point is one percent of the loan amount.",
          "$800, because a point is one tenth of one percent of the loan amount.",
          "$8,000, because a point is one percent of the purchase price.",
          "$4,000, because two points is one half of one percent of the loan amount."
        ],
        correctChoice: 0,
        rationale: "A point is one percent of the loan amount, so two points on $400,000 is $8,000. The calculation is based on the loan, not the purchase price."
      },
      {
        prompt: "What does the secondary mortgage market do?",
        choices: [
          "It buys loans originated in the primary market, which replenishes lenders' funds and lets them make additional loans.",
          "It makes loans directly to borrowers who cannot qualify in the primary market.",
          "It provides second mortgages behind existing first liens.",
          "It sets the interest rates that primary market lenders must charge."
        ],
        correctChoice: 0,
        rationale: "The secondary market buys existing loans, supplying liquidity to originators. It does not lend to consumers, is unrelated to lien position, and influences rather than sets rates."
      }
    ],
    remediation: [
      {
        prompt: "What is the practical significance of a trustee's power of sale in a deed of trust?",
        choices: [
          "It permits foreclosure without court action, which is generally faster than judicial foreclosure but carries consequences for the lender's ability to pursue a deficiency.",
          "It permits the lender to take possession of the property immediately upon default.",
          "It permits the trustee to sell the property at any time to protect the lender's interest.",
          "It eliminates the borrower's right to cure the default before sale."
        ],
        correctChoice: 0,
        rationale: "The power of sale enables nonjudicial foreclosure, with the speed-versus-remedies tradeoff that follows. It does not authorize immediate possession, sale at will, or elimination of the borrower's cure rights."
      },
      {
        prompt: "What does a loan-to-value ratio of 80 percent mean on a property valued at $600,000?",
        choices: [
          "The loan amount is $480,000, leaving $120,000 of the value not covered by the loan.",
          "The loan amount is $120,000, with the borrower financing the remaining 80 percent separately.",
          "The borrower's monthly debt equals 80 percent of his income.",
          "The property must appraise at 80 percent of the purchase price."
        ],
        correctChoice: 0,
        rationale: "80 percent of $600,000 is $480,000. The second option inverts the ratio, and the others confuse it with a debt-to-income ratio and an appraisal standard."
      },
      {
        prompt: "What distinguishes a qualifying ratio based on housing expense from one based on total debt?",
        choices: [
          "The housing ratio measures the housing payment against income, while the total debt ratio adds the borrower's other recurring obligations.",
          "The housing ratio applies to first mortgages and the total debt ratio to second mortgages.",
          "The housing ratio is used for conventional loans and the total debt ratio for government loans.",
          "The housing ratio measures the loan against value while the total debt ratio measures payments against income."
        ],
        correctChoice: 0,
        rationale: "The difference is what goes in the numerator: housing costs alone versus housing costs plus other recurring debt. Lien position and loan program do not define the two ratios, and neither measures loan against value."
      },
      {
        prompt: "A borrower has an adjustable-rate loan. What primarily determines the rate at each adjustment?",
        choices: [
          "The index the loan is tied to plus the lender's margin, subject to any caps in the note.",
          "The lender's discretion at each adjustment date.",
          "The borrower's credit score at the time of adjustment.",
          "The property's current appraised value."
        ],
        correctChoice: 0,
        rationale: "Index plus margin, constrained by caps, is the mechanism. It is not discretionary, and neither the borrower's later credit nor the property's value drives the adjustment."
      },
      {
        prompt: "What happens to the deed of trust when the loan is paid in full?",
        choices: [
          "The beneficiary requests the trustee to reconvey, and a recorded reconveyance clears the security interest from the record.",
          "The deed of trust expires automatically and no recording is needed.",
          "The borrower records a new deed transferring title back to himself.",
          "The lender returns the promissory note, which by itself clears the record."
        ],
        correctChoice: 0,
        rationale: "A recorded reconveyance is what removes the encumbrance from the record. Payoff does not clear the record automatically, the borrower does not deed to himself, and returning the note satisfies the debt without clearing the security."
      }
    ]
  },
  "assignment-12": {
    subject: "Valuation and appraisal foundations",
    applied: {
      prompt: "An owner spent $150,000 building a custom recording studio in his garage. He lists the home at $150,000 above neighborhood values, saying 'that is what it cost me.' Comparable homes without studios have sold at the neighborhood range; no comparable sale in the area includes a studio. How should the licensee explain valuation to him?",
      choices: [
        "Explain that cost and value are different concepts, that value is measured by what buyers in this market will pay, and that a highly specialized improvement often contributes far less than its cost — a phenomenon of over-improvement relative to the neighborhood.",
        "Agree that the improvement adds its full cost to value, since the money was actually spent on the property.",
        "Explain that the studio adds nothing to value, since no comparable sale includes one.",
        "Recommend listing at the higher price and reducing it later, since only the market can determine the contribution."
      ],
      correctChoice: 0,
      rationale: "Cost, price, and value are distinct, and an improvement contributes what the market pays for it, which for a specialized feature is often well under cost. It is not necessarily zero either — the absence of a directly comparable sale means the contribution is hard to measure, not that it is nothing."
    },
    engagement: [
      {
        prompt: "How do value, price, and cost differ?",
        choices: [
          "Value is what a property is worth in the market, price is what was actually paid in a particular transaction, and cost is the expenditure to create or improve it.",
          "Value and price are the same, and cost is what the seller originally paid.",
          "Value is set by the appraiser, price by the lender, and cost by the county assessor.",
          "Value applies to land and cost applies to improvements, with price being their sum."
        ],
        correctChoice: 0,
        rationale: "The three describe worth, an actual transaction amount, and expenditure. They frequently differ, which is why treating them as interchangeable produces errors like pricing at cost."
      },
      {
        prompt: "What are the four tests of highest and best use?",
        choices: [
          "Legally permissible, physically possible, financially feasible, and maximally productive.",
          "Currently zoned, presently occupied, recently improved, and profitably operated.",
          "Physically possible, socially desirable, environmentally sound, and profitable.",
          "Legally permissible, historically consistent, financially feasible, and locally popular."
        ],
        correctChoice: 0,
        rationale: "The four tests are applied in that order, each narrowing the possibilities until the use that produces the greatest value remains."
      },
      {
        prompt: "Which approach to value is most commonly relied on for a single-family residence?",
        choices: [
          "The sales comparison approach, which analyzes recent sales of similar properties with adjustments for differences.",
          "The cost approach, which estimates replacement cost less depreciation plus land value.",
          "The income capitalization approach, which converts expected income into a value indication.",
          "The assessed value approach, which uses the county's valuation for tax purposes."
        ],
        correctChoice: 0,
        rationale: "Owner-occupied homes are bought and sold in an active comparable market, which makes sales comparison the most reliable indicator. There is no 'assessed value approach' among the recognized methods."
      },
      {
        prompt: "How does the cost approach estimate value?",
        choices: [
          "By estimating the cost to replace the improvements, subtracting accrued depreciation, and adding the land value.",
          "By adding the original construction cost to the land's purchase price.",
          "By subtracting the property's operating expenses from its replacement cost.",
          "By comparing the property's cost to the cost of recently built comparable homes."
        ],
        correctChoice: 0,
        rationale: "Replacement cost less depreciation, plus land value, is the formula. Historical cost, operating expenses, and cost comparisons are not the method."
      },
      {
        prompt: "In the income approach, what is the general relationship between net operating income, the capitalization rate, and value?",
        choices: [
          "Value is estimated by dividing net operating income by the capitalization rate, so a higher rate produces a lower value for the same income.",
          "Value is estimated by multiplying net operating income by the capitalization rate.",
          "Value is estimated by dividing the capitalization rate by net operating income.",
          "Value is estimated by subtracting the capitalization rate from gross income."
        ],
        correctChoice: 0,
        rationale: "Value equals income divided by rate, which is why a higher required return corresponds to a lower value for the same income stream."
      }
    ],
    remediation: [
      {
        prompt: "A property's most profitable potential use would violate its zoning. How does this affect highest and best use?",
        choices: [
          "That use is excluded, because a use must be legally permissible before profitability is considered.",
          "That use establishes highest and best use, since the market determines value regardless of zoning.",
          "That use establishes highest and best use if a variance is theoretically obtainable.",
          "The property has no highest and best use until the zoning question is resolved."
        ],
        correctChoice: 0,
        rationale: "Legal permissibility is the first screen, so an unlawful use is eliminated before profitability matters. A theoretical variance is not permission, and the property still has a highest and best use among lawful alternatives."
      },
      {
        prompt: "Which type of depreciation generally cannot be cured by repair?",
        choices: [
          "External or economic obsolescence, which arises from influences outside the property boundaries.",
          "Physical deterioration from ordinary wear and tear.",
          "Functional obsolescence from an outdated floor plan.",
          "Deferred maintenance from postponed repairs."
        ],
        correctChoice: 0,
        rationale: "External obsolescence originates off the property, so the owner cannot repair its source. Physical deterioration, functional obsolescence, and deferred maintenance are all located within the property, whether or not curing them is economical."
      },
      {
        prompt: "Why must an appraiser's independence be protected?",
        choices: [
          "Because a valuation influenced by a party with an interest in the outcome is unreliable for the lending and transaction decisions that depend on it.",
          "Because appraisers are prohibited from communicating with any transaction participant.",
          "Because appraisal independence determines who may select the comparable sales.",
          "Because independence is what allows an appraiser to also act as the transaction's agent."
        ],
        correctChoice: 0,
        rationale: "Independence exists so the valuation can be relied on. Appraisers may communicate appropriately, they select their own comparables as part of their work, and independence is precisely what precludes an agency role."
      },
      {
        prompt: "A comparable property sold six months ago in a rising market. What adjustment is appropriate?",
        choices: [
          "A market conditions adjustment reflecting the change in values between that sale date and the effective date of the analysis.",
          "No adjustment, since a sale within the last year is current.",
          "A downward adjustment, since older sales are less reliable evidence.",
          "An adjustment based on the difference between the comparable's list price and sale price."
        ],
        correctChoice: 0,
        rationale: "Changing market conditions call for a time adjustment in the direction the market moved — upward in a rising market. Age of the sale is not itself a reason to adjust downward, and the list-to-sale spread measures negotiation rather than market change."
      },
      {
        prompt: "What is the essential limitation a licensee must observe when providing a comparative market analysis?",
        choices: [
          "It is an opinion of value for pricing purposes and must not be presented as an appraisal or used where an appraisal is required.",
          "It may not include closed sales, which are reserved for appraisal use.",
          "It may be prepared only for a client who has signed a representation agreement.",
          "It must be reviewed by a licensed appraiser before being given to a client."
        ],
        correctChoice: 0,
        rationale: "The limitation is about what the analysis is called and what it is used for. Licensees may use closed sales, may prepare an analysis for a prospective client, and need no appraiser review."
      }
    ]
  },
  "assignment-13": {
    subject: "Taxation, investment, and real estate mathematics",
    applied: {
      prompt: "An investor is comparing two rental properties. Property A costs $800,000 and produces $56,000 of net operating income. Property B costs $650,000 and produces $42,250 of net operating income. He plans to finance 70 percent of either purchase and asks which is the better investment. How should the licensee frame the analysis?",
      choices: [
        "Show that both produce a 6.5 percent capitalization rate on an all-cash basis, explain that the comparison therefore turns on financing terms, risk, condition, location, and the investor's own tax position, and refer the tax questions to a qualified tax professional.",
        "Recommend Property A, since it produces more net operating income in absolute dollars.",
        "Recommend Property B, since it requires less capital and therefore carries less risk.",
        "Recommend whichever property has appreciated more over the past five years."
      ],
      correctChoice: 0,
      rationale: "Both yield the same 6.5 percent unleveraged return ($56,000 ÷ $800,000 and $42,250 ÷ $650,000), so the arithmetic alone does not decide it. Absolute income, absolute price, and past appreciation each answer a different question than the one the investor asked, and the tax consequences belong to a tax professional."
    },
    engagement: [
      {
        prompt: "Under California's constitutional property tax limitation, what generally happens to a property's assessed value when it is sold?",
        choices: [
          "It is reassessed to the new value at the change of ownership, which typically resets the base for future taxation.",
            "It remains at the prior owner's assessed value, which transfers with the property.",
          "It is reduced to the purchase price only if the purchase price is lower than the prior assessment.",
          "It is recalculated annually based on current market value regardless of ownership."
        ],
        correctChoice: 0,
        rationale: "Change of ownership is the reassessment event, which is why a long-held property's assessment can be far below its market value while a newly purchased identical property's is not."
      },
      {
        prompt: "A property sells for $750,000 with a total brokerage compensation of 5 percent, split evenly between the two brokerages. How much does each brokerage receive?",
        choices: [
          "$18,750 each.",
          "$37,500 each.",
          "$15,000 each.",
          "$7,500 each."
        ],
        correctChoice: 0,
        rationale: "5 percent of $750,000 is $37,500 in total; split evenly, each brokerage receives $18,750. The second figure is the undivided total."
      },
      {
        prompt: "What does net operating income represent?",
        choices: [
          "Gross income less vacancy and operating expenses, before debt service and income taxes.",
          "Gross income less all expenses including the mortgage payment.",
          "Gross rental collections before any deductions.",
          "Cash remaining after debt service and capital improvements."
        ],
        correctChoice: 0,
        rationale: "Net operating income deliberately excludes financing and income taxes so properties can be compared independently of how each is financed or who owns it."
      },
      {
        prompt: "What is financial leverage in a real estate context?",
        choices: [
          "Using borrowed funds to control a larger asset, which can magnify returns on invested capital and equally magnify losses.",
          "The ability to negotiate a lower purchase price because of market conditions.",
          "The ratio of a property's income to its operating expenses.",
          "The tax advantage that comes from deducting mortgage interest."
        ],
        correctChoice: 0,
        rationale: "Leverage amplifies outcomes in both directions, which is what makes it a risk concept rather than simply a benefit. Negotiating power, expense ratios, and tax deductions are separate ideas."
      },
      {
        prompt: "A seller closes on April 1 having already paid the full annual property tax of $7,200 for a tax year beginning January 1. Using a 360-day year with 30-day months, what proration is due to the seller?",
        choices: [
          "$5,400, representing the nine months of the year the buyer will own the property.",
          "$1,800, representing the three months the seller owned the property.",
          "$3,600, representing half of the annual amount.",
          "$600, representing one month of the annual amount."
        ],
        correctChoice: 0,
        rationale: "The seller prepaid the whole year but owns only January through March, so the buyer reimburses the remaining nine months: $7,200 ÷ 12 × 9 = $5,400. The second figure is the seller's own share rather than the reimbursement."
      }
    ],
    remediation: [
      {
        prompt: "A property produces $48,000 of net operating income and comparable properties trade at an 8 percent capitalization rate. What value does the income approach indicate?",
        choices: [
          "$600,000.",
          "$384,000.",
          "$3,840.",
          "$960,000."
        ],
        correctChoice: 0,
        rationale: "$48,000 ÷ 0.08 = $600,000. The second and third options multiply instead of dividing; the fourth uses a 5 percent rate."
      },
      {
        prompt: "A rectangular lot measures 90 feet by 120 feet and sells for $486,000. What is the price per square foot?",
        choices: [
          "$45 per square foot.",
          "$54 per square foot.",
          "$4.50 per square foot.",
          "$450 per square foot."
        ],
        correctChoice: 0,
        rationale: "90 × 120 = 10,800 square feet; $486,000 ÷ 10,800 = $45. The other figures misplace the decimal or invert the dimensions."
      },
      {
        prompt: "Why is an owner advised to consult a tax professional before selling an investment property?",
        choices: [
          "Because the tax consequences depend on the owner's basis, holding period, depreciation history, and overall tax situation, which are outside a licensee's scope.",
          "Because the licensee must report the sale's tax consequences to the taxing authorities.",
          "Because tax advice is required before escrow may close on investment property.",
          "Because the tax owed determines the property's market value."
        ],
        correctChoice: 0,
        rationale: "The variables are personal to the owner and the advice requires tax expertise. Licensees do not report tax consequences, escrow does not require tax advice, and taxes do not determine market value."
      },
      {
        prompt: "A buyer pays $900,000 with 25 percent down. What is the loan amount, and what is the loan-to-value ratio?",
        choices: [
          "A $675,000 loan at a 75 percent loan-to-value ratio.",
          "A $225,000 loan at a 25 percent loan-to-value ratio.",
          "A $675,000 loan at a 25 percent loan-to-value ratio.",
          "A $720,000 loan at an 80 percent loan-to-value ratio."
        ],
        correctChoice: 0,
        rationale: "25 percent down is $225,000, leaving a $675,000 loan, which is 75 percent of value. The second option reports the down payment as the loan."
      },
      {
        prompt: "Two investments produce the same capitalization rate. What does that tell the investor?",
        choices: [
          "That they offer the same unleveraged return on price, which is a starting point rather than a conclusion, since risk, condition, location, and financing still differ.",
          "That the two properties are equally good investments.",
          "That the two properties will appreciate at the same rate.",
          "That the two properties carry the same level of risk."
        ],
        correctChoice: 0,
        rationale: "A capitalization rate compares income to price at a moment in time. It says nothing about future appreciation, risk, or overall suitability, which is why identical rates do not make identical investments."
      }
    ]
  },
  "assignment-14": {
    subject: "Fair housing, civil rights, and consumer protection",
    applied: {
      prompt: "A landlord tells a licensee: 'I won't rent to anyone on housing assistance, I don't want anyone with a service animal because of my no-pet rule, and I prefer a quiet single person over a family with kids.' The licensee's own view is that the landlord is entitled to choose his tenants. How should the licensee proceed?",
      choices: [
        "Explain that each of the three criteria raises a fair housing problem — source of income and familial status are protected in California, and a service animal is not a pet — refuse to apply them, and escalate to the broker to decide whether the brokerage can act for this owner at all.",
        "Apply only the quiet-tenant preference, since noise is a legitimate property concern unrelated to protected characteristics.",
        "Follow the landlord's instructions and document that they came from the owner rather than the licensee.",
        "Decline the engagement quietly without explaining the fair housing problem to the landlord."
      ],
      correctChoice: 0,
      rationale: "All three criteria are problems, and California's protections are broader than the federal baseline. Recasting a familial-status preference as a noise concern does not launder it, documenting an unlawful instruction does not permit carrying it out, and declining without explanation leaves the landlord to repeat the instruction with the next licensee."
    },
    engagement: [
      {
        prompt: "Which classes are protected under the federal Fair Housing Act?",
        choices: [
          "Race, color, religion, sex, national origin, familial status, and disability.",
          "Race, color, religion, national origin, age, and marital status.",
          "Race, religion, sex, disability, source of income, and sexual orientation.",
          "Race, color, creed, occupation, familial status, and citizenship."
        ],
        correctChoice: 0,
        rationale: "Those seven are the federal protected classes. Several of the other listed characteristics are protected under California law but are not part of the federal list."
      },
      {
        prompt: "How does California fair housing law relate to the federal Fair Housing Act?",
        choices: [
          "California protects the federal classes and adds further protected characteristics, so compliance with the federal minimum is not sufficient in California.",
          "California adopts the federal classes exactly, so the two are identical in scope.",
          "California law replaces federal law within the state, so only the state list applies.",
          "California law applies only to properties with more than four units, with federal law covering the rest."
        ],
        correctChoice: 0,
        rationale: "California's protections are broader, which is why a licensee who knows only the federal list will violate California law. State law adds to rather than replacing the federal floor."
      },
      {
        prompt: "What is 'blockbusting', and must a property actually change hands for it to occur?",
        choices: [
          "Inducing owners to sell or rent by representations about the entry into the neighborhood of persons of a protected characteristic.",
          "Refusing to make loans in particular neighborhoods based on their composition.",
          "Directing prospective buyers toward or away from areas based on protected characteristics.",
          "Refusing to show a property to a member of a protected class."
        ],
        correctChoice: 0,
        rationale: "Blockbusting exploits fear about neighborhood change to generate transactions. The other three describe redlining, steering, and outright refusal to deal."
      },
      {
        prompt: "What is the difference between a reasonable accommodation and a reasonable modification?",
        choices: [
          "An accommodation is a change in rules, policies, or services; a modification is a physical change to the premises.",
          "An accommodation is requested by a tenant while a modification is offered by a landlord.",
          "An accommodation applies to common areas while a modification applies to individual units.",
          "An accommodation is temporary while a modification is permanent."
        ],
        correctChoice: 0,
        rationale: "Rules versus physical structure is the distinction. Both are requested by the person with the disability and both can apply to units or common areas."
      },
      {
        prompt: "Why is bias in property valuation a fair housing concern rather than only a professional-standards concern?",
        choices: [
          "Because a valuation influenced by the characteristics of an owner or neighborhood can deny equal access to credit and to the accumulation of housing wealth.",
          "Because appraisers are licensed by the same agency that enforces fair housing law.",
          "Because valuations are public documents subject to civil rights review.",
          "Because appraisal bias affects only properties in areas covered by fair lending laws."
        ],
        correctChoice: 0,
        rationale: "The harm is unequal access to credit and to wealth-building, which is a civil rights injury rather than a technical error. Licensing arrangements and document status are not what make it one."
      }
    ],
    remediation: [
      {
        prompt: "A lender declines applications from a particular neighborhood at a markedly higher rate than comparable applications elsewhere, without a documented underwriting basis. What is this pattern called?",
        choices: [
          "Redlining, which denies credit access based on the location and composition of an area rather than on individual creditworthiness.",
          "Steering, which directs applicants toward particular neighborhoods.",
          "Blockbusting, which induces sales through fear of neighborhood change.",
          "Disparate treatment, which requires proof of an explicit discriminatory statement."
        ],
        correctChoice: 0,
        rationale: "Geographic denial of credit is redlining. The last option also misstates the law: discrimination can be shown without an explicit statement."
      },
      {
        prompt: "A tenant with a disability requests permission to keep an assistance animal in a building with a no-pet policy. How is the request analyzed?",
        choices: [
          "As a reasonable accommodation, because an assistance animal is not a pet for fair housing purposes and the policy may need to be adjusted.",
          "Under the pet policy, with a pet deposit charged consistently with other animals.",
          "As a lease violation that may be excused at the landlord's discretion.",
          "As permissible only if the animal has been professionally certified as a service animal."
        ],
        correctChoice: 0,
        rationale: "An assistance animal is evaluated under the accommodation framework, not the pet policy, which is why charging a pet deposit is itself a problem. Reliance on a certification requirement is a common error."
      },
      {
        prompt: "A licensee shows every available property to every buyer but describes some neighborhoods as 'better for people like you.' Has she avoided steering?",
        choices: [
          "No — characterizing neighborhoods by who belongs in them influences the buyer's choices, which is steering regardless of how many properties were shown.",
          "Yes, because the buyer was given access to the full inventory.",
          "Yes, provided the characterization was accurate.",
          "No, but only if the buyer actually changed his search as a result."
        ],
        correctChoice: 0,
        rationale: "Steering operates through influence as well as access, so showing everything does not cure it, and accuracy is not a defense. The violation does not depend on proving the buyer changed course."
      },
      {
        prompt: "An owner directs that a property be advertised as available to 'mature adults only.' What should the licensee do?",
        choices: [
          "Refuse to publish it, explain that the wording expresses a preference based on protected characteristics, and note that senior-housing exemptions are narrow and must actually apply.",
          "Publish it, since age-restricted communities are lawful in California.",
          "Publish it with a disclaimer that all applicants are welcome.",
          "Publish a revised version reading 'ideal for empty nesters.'"
        ],
        correctChoice: 0,
        rationale: "Lawful senior housing depends on specific qualifying criteria that must actually be met, not on the owner's preference. A disclaimer does not cure discriminatory wording, and a softened phrasing conveys the same preference."
      },
      {
        prompt: "A consumer tells a licensee she believes she was discriminated against by another brokerage. What is the appropriate response?",
        choices: [
          "Take the account seriously, document what she reports without characterizing it as established, inform her that enforcement agencies accept complaints, and notify the broker.",
          "Investigate the other brokerage's conduct and report the findings to the consumer.",
          "Advise her that such complaints are difficult to prove and rarely succeed.",
          "Take no action, since the conduct involved a different brokerage."
        ],
        correctChoice: 0,
        rationale: "The licensee's role is to record, inform, and escalate — not to investigate another firm, discourage the complaint, or disengage because the conduct was someone else's."
      }
    ]
  },
  "assignment-15": {
    subject: "Leasing, property management, license law, and integrated transaction",
    applied: {
      prompt: "A broker manages several rental properties. A review finds that tenant security deposits sit in the brokerage's general operating account, one owner has not received a statement in four months, the property management agreements for two owners were never signed, and a salesperson has been signing leases in her own name. The broker says nothing has gone wrong and no one has complained. What is the correct assessment?",
      choices: [
        "Each item is a serious defect independent of whether harm has occurred: deposits are trust funds that may not be commingled, owners are owed an accounting, authority must rest on a signed agreement, and a salesperson may not contract in her own name for licensed activity.",
        "Only the commingling is serious; the others are administrative matters to be corrected in the ordinary course.",
        "None is serious as long as the accounts balance and no owner or tenant has complained.",
        "The most serious item is the missing owner statements, since owners are the brokerage's clients."
      ],
      correctChoice: 0,
      rationale: "All four go to the core of a broker's obligations, and the absence of complaints is not evidence of compliance — it usually means the problems have not yet surfaced. Commingling is the gravest, but unsigned authority and a salesperson contracting in her own name are equally structural rather than clerical."
    },
    engagement: [
      {
        prompt: "What distinguishes an estate for years from a periodic tenancy?",
        choices: [
          "An estate for years has a fixed beginning and ending date and expires without notice; a periodic tenancy continues from period to period until properly terminated by notice.",
          "An estate for years lasts at least one year; a periodic tenancy lasts less than a year.",
          "An estate for years applies to commercial property; a periodic tenancy applies to residential property.",
          "An estate for years may be assigned; a periodic tenancy may not."
        ],
        correctChoice: 0,
        rationale: "The distinction is a definite term that self-terminates versus a recurring term requiring notice. It has nothing to do with duration in years, property type, or assignability."
      },
      {
        prompt: "How must a broker handle trust funds received in the course of licensed activity?",
        choices: [
          "Place them in a trust account or neutral escrow depository, keep them separate from the broker's own funds, and maintain records accounting for every receipt and disbursement.",
          "Deposit them in the brokerage operating account and track them with separate ledger entries.",
          "Forward them immediately to the principal to avoid holding funds at all.",
          "Hold them in any account, provided the total balance always exceeds the trust obligations."
        ],
        correctChoice: 0,
        rationale: "Separation plus records is the requirement. Internal ledger tracking inside an operating account is commingling, and a sufficient overall balance does not cure it."
      },
      {
        prompt: "What is a material fact for disclosure purposes?",
        choices: [
          "A fact that would affect a reasonable buyer's decision to buy or the price he would pay.",
          "Any fact the seller considers important about the property.",
          "Any fact that appears in the public record concerning the property.",
          "A fact that has caused measurable financial loss to a prior owner."
        ],
        correctChoice: 0,
        rationale: "Materiality is measured by the effect on a reasonable buyer's decision. The seller's own view, the public record, and prior losses each describe something different."
      },
      {
        prompt: "On what grounds may the Real Estate Commissioner discipline a licensee?",
        choices: [
          "For conduct in licensed activity such as misrepresentation and mishandling of trust funds, and also for certain conduct outside licensed activity that bears on fitness to hold a license.",
          "Only for conduct occurring within a licensed real estate transaction.",
          "Only after a court has entered a judgment against the licensee.",
          "Only for conduct that caused a consumer to suffer a financial loss."
        ],
        correctChoice: 0,
        rationale: "Discipline reaches both licensed activity and conduct outside it that reflects on fitness. It does not require a prior judgment or proof of consumer loss."
      },
      {
        prompt: "In an integrated review of a completed California transaction, which record most reliably shows compliance?",
        choices: [
          "A file in which each required disclosure, agreement, notice, and amendment appears with its date and evidence of delivery, consistent with the transaction's chronology.",
          "A closing statement showing that all funds were correctly disbursed.",
          "A signed acknowledgment from the client that he was satisfied with the service.",
          "The absence of any complaint from either party after closing."
        ],
        correctChoice: 0,
        rationale: "Compliance is shown by a complete, dated, internally consistent file. Correct disbursement, client satisfaction, and the absence of complaints each say nothing about whether the required steps occurred when they should have."
      }
    ],
    remediation: [
      {
        prompt: "A tenant remains in possession after a fixed-term lease expires and the landlord continues accepting monthly rent. What has likely arisen?",
        choices: [
          "A periodic tenancy, created by the parties' conduct in continuing the rental relationship.",
          "A tenancy at sufferance that continues indefinitely without any tenancy rights.",
          "A renewed estate for years on the same terms and for the same full term.",
          "No tenancy at all, leaving the tenant a trespasser despite the rent payments."
        ],
        correctChoice: 0,
        rationale: "Continued possession with accepted rent typically converts a holdover into a periodic tenancy. Acceptance of rent is what defeats the trespasser and sufferance characterizations, and it does not renew the full original term."
      },
      {
        prompt: "A broker's trust account is short by $2,000 because an owner disbursement was calculated incorrectly. What is the correct characterization?",
        choices: [
          "A trust fund shortage, which is a serious violation requiring immediate correction from the broker's own funds and a documented reconciliation of how it occurred.",
          "An accounting error that may be corrected at the next monthly reconciliation.",
          "An acceptable variance so long as it is under a nominal threshold.",
          "The responsible salesperson's personal liability rather than the broker's."
        ],
        correctChoice: 0,
        rationale: "A shortage means someone else's money is missing, which is why it must be cured immediately and traced. There is no tolerance threshold, and the broker cannot shift responsibility to a salesperson."
      },
      {
        prompt: "Which fact would most clearly require disclosure to a prospective buyer?",
        choices: [
          "Ongoing litigation between the homeowners association and a builder over construction defects affecting the building.",
          "The seller's reason for moving out of the area.",
          "The price the seller paid for the property when he bought it.",
          "The identity of the buyers who previously made unsuccessful offers."
        ],
        correctChoice: 0,
        rationale: "Construction-defect litigation affecting the building bears directly on value and desirability. Motivation, historical purchase price, and prior offerors are not property conditions and may be confidential."
      },
      {
        prompt: "A property manager wants to advertise a vacancy using photographs of a different, nicer unit in the same building. What is wrong with this?",
        choices: [
          "It misrepresents the unit being offered, which is deceptive advertising regardless of the units' similarity.",
          "Nothing, provided the units share the same floor plan.",
          "Nothing, provided the advertisement notes that photographs are representative.",
          "The problem is only that the manager lacks the owner's permission to use the images."
        ],
        correctChoice: 0,
        rationale: "Showing a different, better unit misleads about what is actually available. Shared floor plans do not equalize condition, and a generic disclaimer does not cure a specifically misleading impression."
      },
      {
        prompt: "In a final audit of a California residential file, which omission would be most consequential?",
        choices: [
          "No evidence of when required disclosures were delivered, since the buyer's rights and the transaction's defensibility depend on delivery timing.",
          "No copy of the property's marketing photographs.",
          "No record of which licensee showed the property on each occasion.",
          "No copy of the comparative market analysis prepared before listing."
        ],
        correctChoice: 0,
        rationale: "Delivery timing is what rights run from and what disputes are made of. Marketing images, showing logs, and the pricing analysis are useful records but none of them determines whether the buyer's statutory rights were honored."
      }
    ]
  }
};

export default { courseId: "ca-real-estate-principles-45", version: "1.0", assignments };
