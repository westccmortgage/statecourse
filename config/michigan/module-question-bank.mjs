/**
 * Michigan Salesperson Prelicensure (40 clock hours) — module question bank.
 *
 * R 339.22157(2)(e) requires "a method of assessment of the student's performance
 * during each module of instruction", and (f) requires "a remediation for any student
 * who is deficient in the assessment to repeat the module until the student understands
 * the course content material". This file is both.
 *
 * Each module carries:
 *   applied      — one scenario item assessing performance inside the module
 *   engagement   — five scored items
 *   remediation  — five alternate items on the same concepts, served after a failed
 *                  engagement check, alongside the alternate explanation
 *
 * Every item's correct answer sits at index 0 here for authoring legibility. The engine
 * permutes choices deterministically per item id before delivery, so what a student sees
 * is not ordered by correctness and a recorded selection keeps its meaning permanently.
 *
 * Course version 1.0 submission draft — not approved. No Michigan credit is available.
 */

const modules = {
  "module-01": {
    subject: "Michigan license law, the Occupational Code, and the regulated activity",
    applied: {
      prompt: "An unlicensed man manages two duplexes he owns and, at a neighbour's request, begins advertising her vacancies, showing her units, signing leases for her, and collecting her rent in exchange for winter storage of his boat on her lot. He tells a salesperson that no licence is needed because he takes no money. How should the salesperson respond?",
      choices: [
        "Explain that leasing and managing real estate for another as a business is licensed activity, that valuable consideration is not limited to money, and that the storage arrangement is compensation — so a licence is required and the work must run through a broker.",
        "Agree that no licence is required, because he receives no fee and the properties are next door to his own.",
        "Agree that no licence is required for leasing, since Michigan's definition reaches only sales and purchases.",
        "Tell him a licence is required only once he manages four or more units for others."
      ],
      correctChoice: 0,
      rationale: "Michigan's definition reaches leasing and managing real estate for others as a business, and it attaches to the intent to receive a fee, compensation, or valuable consideration. Storage of a boat is valuable consideration. Neither the absence of cash nor the number of units removes the activity from the licence requirement, and a salesperson may only perform it through an employing broker."
    },
    engagement: [
      {
        prompt: "What triggers Michigan's real estate licence requirement?",
        choices: [
          "Performing a listed activity for another person with the intent to collect or receive a fee, compensation, or valuable consideration.",
          "Holding oneself out as a real estate agent, whatever activity is performed.",
          "Receiving a commission after a transaction closes.",
          "Signing a listing agreement in one's own name."
        ],
        correctChoice: 0,
        rationale: "The statute defines the broker functionally: the act, done for another, with the intent to receive compensation. Receipt is not required, and the title a person uses is irrelevant."
      },
      {
        prompt: "A salesperson leaves one brokerage for another. What happens to the listings she took?",
        choices: [
          "They remain with the former broker, because the brokerage is the party to the listing agreement.",
          "They transfer with her, because she generated them.",
          "They terminate automatically on her departure.",
          "They are split between the two brokerages."
        ],
        correctChoice: 0,
        rationale: "The salesperson acts for the broker. The listing is a contract between the client and the brokerage, so it stays with the brokerage when the licensee moves."
      },
      {
        prompt: "Which exemption is available to an owner who begins marketing a neighbour's property for a fee?",
        choices: [
          "None. The owner exemption covers dealing in one's own property, and acting for another's account falls outside it.",
          "The owner exemption, because the properties are adjacent.",
          "The attorney-in-fact exemption, provided a written authorisation exists.",
          "The court-appointed fiduciary exemption."
        ],
        correctChoice: 0,
        rationale: "Every exemption is drawn for a reason and stops where the reason stops. Michigan's owner exemption exists because a principal acting on their own account is not an intermediary; acting for another's account is exactly what the licence reaches."
      },
      {
        prompt: "An unlicensed assistant at an open house is asked what price the seller would accept. What may the assistant do?",
        choices: [
          "Nothing that answers the question; conveying what a seller might accept is negotiating for another and requires a licence.",
          "State the seller's minimum, because the information came from the seller.",
          "Invite an offer at a lower figure, since only accepting an offer requires a licence.",
          "Answer, provided the supervising salesperson approves afterwards."
        ],
        correctChoice: 0,
        rationale: "Negotiating for others is licensed activity. An assistant may greet, distribute prepared material, and record names, but conveying a seller's negotiating position crosses into licensed work and exposes the supervising licensee as well."
      },
      {
        prompt: "A school tells prospective students it can supply the questions from the state licensing examination. What does R 339.22155 say about that?",
        choices: [
          "Revealing, discovering, soliciting, encouraging, or inducing anyone to reveal licensing examination questions is a ground for discipline of a school or instructor.",
          "It is permitted where the school obtained the questions from former students rather than from the Department.",
          "It is permitted for prelicensure courses but not for continuing education.",
          "The rule addresses only the Department's own employees."
        ],
        correctChoice: 0,
        rationale: "R 339.22155(b) makes it a disciplinary ground. A school offering examination questions is describing its own misconduct, and material obtained that way is unreliable in any event."
      }
    ],
    remediation: [
      {
        prompt: "A person prepares a comparative market analysis for a lender for a $400 fee. Is a Michigan licence involved?",
        choices: [
          "Yes. Providing or offering to provide market analyses for another for compensation is within Michigan's definition of broker activity.",
          "No, because a market analysis is not an appraisal.",
          "No, because the work was for a lender rather than a consumer.",
          "Only if the analysis is used to set a listing price."
        ],
        correctChoice: 0,
        rationale: "Michigan names market analyses expressly in the definition. The separate rule is that a market analysis is not an appraisal and must never be described as one."
      },
      {
        prompt: "Which is true of a salesperson's authority in Michigan?",
        choices: [
          "It exists only while the salesperson is employed by or associated with a licensed broker, and the brokerage contracts with clients.",
          "It permits the salesperson to contract directly with clients once they have two years' experience.",
          "It permits the salesperson to hold earnest money in a personal account for up to five days.",
          "It is unaffected by the status of the employing broker's licence."
        ],
        correctChoice: 0,
        rationale: "The chain of authority runs through the broker. The brokerage is the contracting party, holds the trust funds, owns the file, and is accountable for supervision."
      },
      {
        prompt: "What does an exemption from the licence requirement NOT do?",
        choices: [
          "It does not exempt anyone from fair housing law, from disclosure obligations, or from liability for fraud.",
          "It does not apply to owners of residential property.",
          "It does not survive a change in the property's zoning.",
          "It does not apply where the transaction exceeds $250,000."
        ],
        correctChoice: 0,
        rationale: "Exemptions address the licence requirement only. Fair housing and disclosure law reach the transaction, not the licence."
      },
      {
        prompt: "Which body resolves a commission dispute between two Michigan brokerages?",
        choices: [
          "Not the Department. LARA licenses and disciplines; a commission dispute is a contract matter for the parties, their agreement's dispute process, or a court.",
          "LARA, through its complaint process.",
          "The Michigan Department of Civil Rights.",
          "The county register of deeds."
        ],
        correctChoice: 0,
        rationale: "The Department's authority is licensing and discipline. Part of a licensee's competence is recognising when a client's complaint belongs in a different forum, and saying so without giving legal advice."
      },
      {
        prompt: "A licensee is asked whether a deed restriction can be enforced against a buyer. What is the correct handling?",
        choices: [
          "Decline to answer, name the limit, supply the recorded document, connect the question to the buyer's deadline, refer to a lawyer, and record it.",
          "Answer from experience, since the licensee has seen the restriction before.",
          "Tell the buyer the restriction is unlikely to be enforced.",
          "Answer only if the licensee has held a licence for more than five years."
        ],
        correctChoice: 0,
        rationale: "Enforceability is a legal conclusion. The line does not move with experience, and a competent referral has four parts: the limit, the facts, the deadline, and the record."
      }
    ]
  },

  "module-02": {
    subject: "Property, ownership, and interests in real estate",
    applied: {
      prompt: "A married Michigan couple list their home. At the listing appointment only the wife is present; she says her husband is working abroad and she will sign for both. The chandelier in the dining room is an inherited family piece she intends to take, and a tenant occupies the finished basement apartment on a written lease with nine months remaining. What must the salesperson establish before the property is marketed?",
      choices: [
        "That both spouses must sign, because entireties property cannot be conveyed by one; that the chandelier is expressly excluded in writing; and that the lease is obtained, because a buyer generally takes subject to it.",
        "That the wife's signature suffices if she holds a general power of attorney, that the chandelier need not be mentioned because it is personal to her, and that the tenant can be required to leave at closing.",
        "That the husband can ratify the listing later, that fixtures are settled at the walkthrough, and that leases end automatically on sale.",
        "Only that the price is supportable; the other matters are resolved by the title company."
      ],
      correctChoice: 0,
      rationale: "Three separate problems, each fatal if left. Entireties property requires both signatures. A chandelier wired into the ceiling is a fixture and conveys unless excluded in writing. A lease generally survives a sale, so a buyer expecting possession needs the term before writing an offer."
    },
    engagement: [
      {
        prompt: "Which three tests determine whether an item has become a fixture?",
        choices: [
          "Annexation, adaptation, and the intention of the person who installed it.",
          "Cost, age, and the seller's preference.",
          "Whether it is plugged in, whether it is visible, and whether it is insured.",
          "Whether it was listed in the advertisement, the tax record, and the appraisal."
        ],
        correctChoice: 0,
        rationale: "Intention is the most important of the three and is inferred from the other two together with the relationship of the parties."
      },
      {
        prompt: "What distinguishes tenancy by the entirety in Michigan?",
        choices: [
          "It is available only to a married couple, requires both signatures to convey or mortgage, and generally shields the property from a creditor of one spouse alone.",
          "It allows either spouse to convey the whole property.",
          "It divides ownership into unequal shares fixed at purchase.",
          "It ends automatically after twenty years."
        ],
        correctChoice: 0,
        rationale: "The protective feature is why Michigan families hold homes this way, and the signature requirement is the operational consequence for every licensee."
      },
      {
        prompt: "Two unmarried people take a deed reading only \"to A and B.\" What form results, and what happens on A's death?",
        choices: [
          "A tenancy in common, and A's share passes under A's will or by intestacy rather than to B.",
          "A joint tenancy, and B takes the whole by survivorship.",
          "A tenancy by the entirety, because they purchased together.",
          "A life estate in A with a remainder in B."
        ],
        correctChoice: 0,
        rationale: "Absent language creating survivorship, Michigan treats concurrent ownership as a tenancy in common. Telling unmarried co-buyers the choice exists, and sending them to a lawyer to make it, is one of the most valuable things a licensee can do before closing."
      },
      {
        prompt: "What is a land contract, and who holds legal title while the instalments are being paid?",
        choices: [
          "An instalment sale in which the seller keeps legal title until the price is paid while the buyer takes possession and equitable title.",
          "A listing agreement for vacant land.",
          "A contract for the sale of crops separate from the land.",
          "A lease with an option to purchase at a fixed price."
        ],
        correctChoice: 0,
        rationale: "Land contracts are common in Michigan and behave like financing. Recognise the instrument, insist both parties have counsel, and never draft the terms."
      },
      {
        prompt: "Which of the government's four powers over private property is always incurable by the owner?",
        choices: [
          "None of them is a form of depreciation; the four powers are police power, eminent domain, taxation, and escheat.",
          "Escheat, because it applies only after death.",
          "Taxation, because rates are set locally.",
          "Police power, because zoning cannot be changed."
        ],
        correctChoice: 0,
        rationale: "The question tests whether the student has conflated the four powers with the three kinds of depreciation in module 09. PETE describes limits on ownership; external obsolescence is the incurable form of depreciation."
      }
    ],
    remediation: [
      {
        prompt: "A tenant installs a walk-in cooler for her restaurant and leaves it in place two weeks after the lease ends. What is the risk?",
        choices: [
          "Trade fixtures are the tenant's, but the right to remove them is generally exercised before the term ends, and a tenant who leaves them may lose them.",
          "The cooler was always the landlord's, because it is plumbed and wired.",
          "The tenant may remove it at any time within one year.",
          "The landlord must store it at the tenant's expense indefinitely."
        ],
        correctChoice: 0,
        rationale: "This is a foreseeable, preventable loss, and the prevention is a licensee raising the removal deadline weeks earlier."
      },
      {
        prompt: "A buyer purchases a tenanted duplex intending to occupy it on closing day. What should the licensee have done?",
        choices: [
          "Obtained the leases before the offer and told the buyer plainly that possession depends on the tenancy, which is a legal question.",
          "Assured the buyer that a sale terminates existing leases.",
          "Advised the buyer to give the tenant notice after closing.",
          "Nothing; occupancy is the buyer's problem after closing."
        ],
        correctChoice: 0,
        rationale: "Leases generally survive a sale in Michigan. A buyer who plans to move in needs the term before writing the offer, and whether a particular lease binds a particular buyer is a legal question."
      },
      {
        prompt: "What is the difference between a life estate and a fee simple absolute?",
        choices: [
          "A life estate lasts for the life of a named person and then passes to a remainderman or reverts; a fee simple absolute is unlimited in duration and freely transferable.",
          "A life estate cannot be sold; a fee simple can.",
          "A life estate applies only to agricultural land.",
          "A life estate requires a court order to create."
        ],
        correctChoice: 0,
        rationale: "Life estates appear in Michigan family arrangements and in ladybird deeds, and whether the holder may sell alone depends on the instrument — a legal question."
      },
      {
        prompt: "A rural buyer is told the mineral rights convey, but the title commitment shows a 1974 severance. What must the licensee do?",
        choices: [
          "Disclose what the commitment shows in writing, stop repeating the seller's claim, and route to counsel what the severance permits.",
          "Rely on the seller, who has owned the land longer than the commitment covers.",
          "Advertise the minerals as included, with a disclaimer.",
          "Wait for the buyer to ask."
        ],
        correctChoice: 0,
        rationale: "A licensee who repeats a claim the record contradicts is making a representation they have been told is doubtful."
      },
      {
        prompt: "What are riparian rights?",
        choices: [
          "The rights of an owner whose land borders a river or stream, to reasonable use and access, bounded by the rights of others on the same water.",
          "The right to build a dock anywhere on a lake.",
          "The right to exclude the public from a Great Lakes shoreline entirely.",
          "The rights of an owner whose land borders a lake, which are littoral rights."
        ],
        correctChoice: 0,
        rationale: "Riparian attaches to flowing water and littoral to lakes. In Michigan the practical issues are frontage against easement access, dock permissions, and the ordinary high-water mark — facts to gather and legal questions to route."
      }
    ]
  },

  "module-03": {
    subject: "Legal descriptions, transfer of title, and recording in Michigan",
    applied: {
      prompt: "A purchase agreement describes the property only by street address. The tax record shows 2.5 acres; the seller's deed carries a metes and bounds description computing to about 2.1 acres; and the title commitment's Schedule B-II excepts an unrecorded-appearing driveway easement the seller has never mentioned. What does the salesperson do, and in what order?",
      choices: [
        "Obtain the legal description from the deed and use it; record the acreage discrepancy and route it to the title company and a surveyor; deliver the easement exception with the recorded document to the buyer; and stop advertising an acreage figure as fact until it is resolved.",
        "Use the tax record acreage because it is the public figure, and leave the description to the title company to correct at closing.",
        "Advertise the larger acreage with the words 'more or less' and address the easement at the walkthrough.",
        "Ask the seller which figure to use and rely on the answer."
      ],
      correctChoice: 0,
      rationale: "A street address will not support a conveyance. Three inconsistent acreage sources are a finding, not a rounding question, and publishing one of them as fact after seeing the others is a representation the licensee knows is doubtful. The easement exception belongs in the buyer's hands with the document, and its meaning goes to counsel."
    },
    engagement: [
      {
        prompt: "How many acres are in the Northwest Quarter of the Southeast Quarter of a section?",
        choices: ["40", "160", "80", "20"],
        correctChoice: 0,
        rationale: "640 divided by 4 for the Southeast Quarter is 160; divided by 4 again for the Northwest Quarter of it is 40. Each 'of' is another division."
      },
      {
        prompt: "What makes a deed effective?",
        choices: [
          "Delivery to the grantee with the grantor's present intent to convey, together with the other elements of a valid deed.",
          "Recording with the register of deeds.",
          "Payment of the purchase price.",
          "Notarisation of the grantor's signature."
        ],
        correctChoice: 0,
        rationale: "Recording gives notice; delivery makes the deed effective. A signed deed left in a drawer conveys nothing."
      },
      {
        prompt: "What does a quit claim deed convey?",
        choices: [
          "Whatever interest the grantor has, if any, with no warranty of title.",
          "A fee simple absolute free of encumbrances.",
          "Title warranted against defects arising during the grantor's ownership only.",
          "Nothing, unless accompanied by a title policy."
        ],
        correctChoice: 0,
        rationale: "A quit claim is not defective; it simply makes no promises. A buyer accepting one in an arm's-length purchase should be asking why."
      },
      {
        prompt: "Michigan is a race-notice state. What does a subsequent purchaser need to prevail over an earlier unrecorded interest?",
        choices: [
          "To take in good faith, for value, without notice of the earlier interest, and to record first.",
          "Only to record first.",
          "Only to have taken without notice.",
          "To record within thirty days of closing, regardless of notice."
        ],
        correctChoice: 0,
        rationale: "Both halves are required, which is what race-notice means. A later buyer who knew is not protected however fast they record."
      },
      {
        prompt: "Which schedule of a title commitment tells the buyer what the policy will NOT cover?",
        choices: [
          "Schedule B-II, the exceptions.",
          "Schedule A, the commitment terms.",
          "Schedule B-I, the requirements.",
          "The closing protection letter."
        ],
        correctChoice: 0,
        rationale: "B-I lists what must happen before the policy issues; B-II lists what the policy excepts. The exceptions are what the buyer is actually taking subject to."
      }
    ],
    remediation: [
      {
        prompt: "A buyer discovers a tenant living in a house represented as vacant. What legal significance does the occupancy carry?",
        choices: [
          "Possession is inquiry notice, so a buyer who does not ask may be charged with whatever an enquiry would have revealed.",
          "None; only recorded documents give notice.",
          "It voids the purchase agreement automatically.",
          "It shifts the burden to the title company alone."
        ],
        correctChoice: 0,
        rationale: "Inquiry notice is why a licensee walks the property and asks who is living there. It is the buyer's protection, not curiosity."
      },
      {
        prompt: "What is the effect of a monument in a metes and bounds description that conflicts with a stated distance?",
        choices: [
          "The monument generally controls over the measurement.",
          "The measurement controls, because it is more precise.",
          "The description is void.",
          "The grantor chooses which controls."
        ],
        correctChoice: 0,
        rationale: "This is why old descriptions referencing a large oak create problems when the oak is gone, and why a metes and bounds parcel is a reason to recommend a survey."
      },
      {
        prompt: "A property sold at sheriff's sale four months ago. What must a licensee establish before a buyer proceeds?",
        choices: [
          "Whether a redemption period is still running and when it ends, from the title company and counsel, in writing.",
          "The former owner's forwarding address.",
          "Whether the buyer can obtain homeowner's insurance.",
          "Nothing; a sheriff's deed conveys clear title immediately."
        ],
        correctChoice: 0,
        rationale: "Redemption periods in Michigan vary with the circumstances. A licensee must never state the length from memory, because it decides what the buyer would be acquiring and when they could occupy."
      },
      {
        prompt: "Why does an owner's title policy matter when the lender already requires one?",
        choices: [
          "The lender's policy insures the lender for the loan balance and pays the lender; it protects the buyer not at all.",
          "It does not; the lender's policy covers both parties.",
          "It only matters for cash purchases.",
          "It replaces the need for a survey."
        ],
        correctChoice: 0,
        rationale: "Describing the two products is a factual statement a licensee may make. The decision belongs to the buyer, with the title company available to explain further."
      },
      {
        prompt: "A title commitment requires a discharge of a mortgage the seller says was paid in 2011. What has to happen?",
        choices: [
          "The discharge must be obtained and recorded; a paid mortgage that was never discharged of record remains in the chain.",
          "Nothing, if the seller signs an affidavit of payment.",
          "The buyer must accept it as an exception.",
          "The title company will insure over it automatically."
        ],
        correctChoice: 0,
        rationale: "Recollection is not a document, and obtaining a discharge from a lender that has merged twice takes time the transaction may not have. Raise it immediately, not at closing."
      }
    ]
  },

  "module-04": {
    subject: "Encumbrances, liens, taxes, and land-use control",
    applied: {
      prompt: "A seller who has owned her home since 1994 mentions that she had her basement finished in the spring and paid the contractor in cash. Her tax bill is $2,180 and the state equalized value is nearly double her taxable value. A buyer asks what his taxes will be. Identify the two separate problems and the correct handling of each.",
      choices: [
        "The recent work creates construction lien exposure requiring a sworn statement and unconditional waivers from every subcontractor and supplier; and the buyer must be told in writing that taxable value uncaps in the year after a transfer, with the assessor asked for an estimate rather than the seller's bill quoted.",
        "Payment in cash resolves the lien question, and the buyer may be told his taxes will be about $2,180.",
        "The lien question belongs to the title company alone, and the tax figure is public so quoting it is accurate.",
        "Neither is the licensee's concern; both are resolved on the closing statement."
      ],
      correctChoice: 0,
      rationale: "Paying the general contractor does not extinguish a subcontractor's lien rights, and Michigan construction liens can relate back to the commencement of work. Separately, quoting a long-held seller's bill as the buyer's future tax is one of the most damaging routine errors available to a Michigan licensee, because uncapping resets taxable value to state equalized value in the year following a transfer."
    },
    engagement: [
      {
        prompt: "Which lien generally takes priority over a first mortgage recorded years earlier?",
        choices: [
          "The property tax lien.",
          "A judgment lien recorded last month.",
          "A condominium assessment lien.",
          "A second mortgage."
        ],
        correctChoice: 0,
        rationale: "Property tax liens have superior priority in Michigan, which is why lenders escrow taxes and why delinquency is the fastest way to lose a property."
      },
      {
        prompt: "What happens to a Michigan property's taxable value in the year after it is sold?",
        choices: [
          "It uncaps and becomes equal to the state equalized value.",
          "It continues to rise by no more than five percent or inflation.",
          "It is frozen at the previous owner's figure for three years.",
          "It is reduced to half the sale price."
        ],
        correctChoice: 0,
        rationale: "The annual cap applies only while ownership does not change. On transfer the cap resets, and for a long-held property the increase can be very large."
      },
      {
        prompt: "What is an easement appurtenant?",
        choices: [
          "A right benefiting one parcel and burdening another, which runs with the land to subsequent owners.",
          "A revocable permission to cross land.",
          "A right benefiting a utility company rather than a parcel.",
          "A physical intrusion of a structure over a boundary."
        ],
        correctChoice: 0,
        rationale: "Because it runs with the land, both the burden and the benefit pass automatically on a sale — which is why a buyer's plans so often collide with one."
      },
      {
        prompt: "A recorded 1955 covenant restricts occupancy by race. What is its effect?",
        choices: [
          "It is unlawful and unenforceable, and a licensee must never treat it as operative or use it in any way.",
          "It remains enforceable against subsequent owners because it was recorded.",
          "It is enforceable only by the original developer.",
          "It is enforceable until a court strikes it from the record."
        ],
        correctChoice: 0,
        rationale: "Such language survives in old Michigan records and has no legal effect. Michigan provides a procedure for having it removed, which a licensee may mention while routing the owner to counsel."
      },
      {
        prompt: "A buyer wants to run a home business. Who answers whether the zoning permits it?",
        choices: [
          "The municipality, and the answer belongs in the agreement as a contingency if it matters to the purchase.",
          "The licensee, from experience in the area.",
          "The title company.",
          "The seller, who has lived there longest."
        ],
        correctChoice: 0,
        rationale: "Zoning is entirely local and differs across municipal lines. Answering from experience in another township is how a licensee produces a confident wrong answer."
      }
    ],
    remediation: [
      {
        prompt: "Compute the annual tax on a taxable value of $84,000 at 38.5 mills.",
        choices: ["$3,234", "$32,340", "$323.40", "$2,184"],
        correctChoice: 0,
        rationale: "84,000 divided by 1,000 is 84; 84 times 38.5 is $3,234. A mill is one dollar per thousand dollars of taxable value."
      },
      {
        prompt: "What does the Michigan principal residence exemption do?",
        choices: [
          "It exempts an owner's principal residence from a portion of school operating tax, on a claim filed with the local unit and rescinded when the property is no longer the principal residence.",
          "It exempts the property from all property tax.",
          "It caps the sale price for tax purposes.",
          "It transfers automatically to the buyer at closing."
        ],
        correctChoice: 0,
        rationale: "It appears in nearly every Michigan residential transaction: whether it is in place, who must rescind, who must file, and by when. The licensee points to the assessor rather than completing the form."
      },
      {
        prompt: "A subcontractor records a lien three weeks after closing for work done two months before it. Why is that possible?",
        choices: [
          "Michigan construction liens can relate back to the commencement of the work, so a lien recorded later may outrank interests recorded earlier.",
          "Because the buyer failed to obtain title insurance.",
          "Because the seller did not record a notice of completion.",
          "It is not possible; liens attach only from the date of recording."
        ],
        correctChoice: 0,
        rationale: "Relation-back is exactly why sworn statements and unconditional waivers exist, and why recent work must be raised with the title company at listing."
      },
      {
        prompt: "Which kind of depreciation is caused by something off the property and cannot be cured by the owner?",
        choices: [
          "External obsolescence.",
          "Functional obsolescence.",
          "Curable physical deterioration.",
          "Deferred maintenance."
        ],
        correctChoice: 0,
        rationale: "External obsolescence is incurable by definition, because the cause lies outside the owner's control. It is also a material fact for disclosure once known."
      },
      {
        prompt: "A nonconforming use exists on a property a buyer wants. What should the licensee do?",
        choices: [
          "Treat whether the use retains protection as a legal and municipal question, route it, and make it a contingency if the buyer's plan depends on it.",
          "Assure the buyer the use is grandfathered permanently.",
          "Advise the buyer to expand the use before the sale closes.",
          "Ignore it, because the use predates the ordinance."
        ],
        correctChoice: 0,
        rationale: "Nonconforming uses usually carry limits on expansion and rules ending them if abandoned. Whether protection survives in a given case is not a licensee's call."
      }
    ]
  },

  "module-05": {
    subject: "Agency, the service provision agreement, and disclosure",
    applied: {
      prompt: "A seller tells a licensee to take $200,000 and keep everything above it, not to show the property to buyers from a particular country of origin, and not to disclose that the basement floods every spring because a drain was installed two years ago. Address each instruction.",
      choices: [
        "Refuse the net arrangement as prohibited by R 339.22135; refuse the showing instruction as unlawful discrimination, document it, notify the broker, and withdraw if the seller persists; and tell the seller the flooding history will be disclosed because it is a known material fact.",
        "Accept the compensation arrangement if the seller signs it, decline the showing instruction quietly, and follow the seller's wishes on the basement since he is the client.",
        "Accept all three, since obedience is a duty owed to the client.",
        "Refuse only the discrimination instruction; compensation and disclosure are matters for the parties."
      ],
      correctChoice: 0,
      rationale: "Three separate rules. Michigan prohibits net service provision agreements because they set the licensee's interest against the client's. Obedience runs only to lawful instructions, and following a discriminatory one makes the licensee personally liable. And a known material defect is disclosed regardless of the client's wishes, with withdrawal the answer if the client insists on concealment."
    },
    engagement: [
      {
        prompt: "Which duties are owed to a customer rather than a client?",
        choices: [
          "Honesty, disclosure of known material facts, and fair dealing — but not loyalty or confidentiality.",
          "All six agency duties, in reduced form.",
          "Confidentiality only.",
          "None; a customer is owed nothing."
        ],
        correctChoice: 0,
        rationale: "Treating what is owed a customer as nothing is the standard new-licensee error. A licensee who tells anyone something untrue about a property has a problem whether or not that person is a client."
      },
      {
        prompt: "When must a Michigan agency disclosure be given?",
        choices: [
          "In writing, before confidential information is disclosed — in practice at first substantive contact about a transaction.",
          "At the closing table, with the other documents.",
          "When the purchase agreement is signed.",
          "Only if the customer asks who the licensee represents."
        ],
        correctChoice: 0,
        rationale: "Given at the front door it does its job. Given after the buyer has explained their maximum, it documents a failure."
      },
      {
        prompt: "What does informed consent to dual agency require?",
        choices: [
          "That both parties understood what they gave up — no advocacy on price against the other, and no use of either party's confidential information.",
          "A signature on the brokerage's standard form.",
          "The broker's approval alone.",
          "Disclosure at closing that dual agency occurred."
        ],
        correctChoice: 0,
        rationale: "A signature obtained by saying 'this is just a form we all use' is not informed consent, and it will not look like one in a complaint."
      },
      {
        prompt: "A licensee repeats a seller's square-footage figure in an advertisement and it proves wrong. What is that?",
        choices: [
          "Misrepresentation, which does not require intent to deceive.",
          "Puffing, which is not actionable.",
          "The seller's problem alone.",
          "Acceptable if the source is disclosed after the fact."
        ],
        correctChoice: 0,
        rationale: "State facts with their source and stop. 'The seller states the roof was replaced in 2019; the buyer should verify' is defensible; asserting the figure is not."
      },
      {
        prompt: "Under R 339.22137, when may a licensee entitled to a commission also receive a referral fee from a settlement service provider in the same transaction?",
        choices: [
          "Only with the prior written consent of the parties, and never where other law such as RESPA prohibits it.",
          "Whenever the fee is disclosed verbally at closing.",
          "Whenever the provider is licensed in Michigan.",
          "Never, in any circumstances."
        ],
        correctChoice: 0,
        rationale: "Prior written consent, and the separate federal prohibition. Verbal disclosure at closing, after the client has relied on the recommendation, is not consent."
      }
    ],
    remediation: [
      {
        prompt: "Why does Michigan prohibit a net service provision agreement?",
        choices: [
          "Because it sets the licensee's interest against the client's: every dollar above the owner's figure belongs to the licensee, so the licensee is rewarded for the owner underestimating their property.",
          "Because commissions must be a percentage.",
          "Because it is difficult to compute at closing.",
          "Because the Department cannot audit it."
        ],
        correctChoice: 0,
        rationale: "R 339.22135. The prohibition exists because the arrangement corrupts the advice, which is what the client is paying for."
      },
      {
        prompt: "A seller instructs a licensee not to present offers below the asking price. What is the correct handling?",
        choices: [
          "Explain that all offers will be presented, put the instruction and the response in writing, and escalate to the broker.",
          "Follow the instruction, since the seller directs their own transaction.",
          "Follow it but keep a private note of the offers received.",
          "Terminate the listing immediately without discussion."
        ],
        correctChoice: 0,
        rationale: "Suppressing offers conflicts with the duty of disclosure to the client. Silently discarding them is how a licensee ends up in front of the Department."
      },
      {
        prompt: "Which duty survives the end of an agency relationship?",
        choices: [
          "Confidentiality, indefinitely, along with the obligation to account for anything held.",
          "Obedience.",
          "Loyalty in future transactions.",
          "None; all duties end with the relationship."
        ],
        correctChoice: 0,
        rationale: "A former client's negotiating position, motivation, and finances remain confidential after the relationship ends."
      },
      {
        prompt: "An unrepresented buyer asks a listing agent whether to offer full price. What is the correct response?",
        choices: [
          "Decline the advice, explain that the licensee represents the seller, offer public facts only, and suggest the buyer obtain their own representation.",
          "Advise the buyer to offer less, since the seller will counter anyway.",
          "Advise full price, since it protects the seller.",
          "Answer only after the buyer signs an agency disclosure."
        ],
        correctChoice: 0,
        rationale: "Advising the buyer on what to offer would breach loyalty to the seller. Stating days on market and public comparable sales is factual; advising on negotiation is not."
      },
      {
        prompt: "What is the licensee's obligation when the seller's disclosure statement contradicts what the licensee has observed?",
        choices: [
          "Raise it with the seller in writing, and disclose the known material fact to the buyer regardless of whether the seller corrects the statement.",
          "Transmit the statement as completed, since it is the seller's document.",
          "Mark the item 'unknown' on the licensee's own copy.",
          "Wait until the inspection reveals it."
        ],
        correctChoice: 0,
        rationale: "The licensee's disclosure duty runs alongside the seller's statutory statement and is not satisfied by it. A licensee cannot transmit a statement they know to be false."
      }
    ]
  },

  "module-06": {
    subject: "Contracts, purchase agreements, and the Michigan seller disclosure",
    applied: {
      prompt: "A seller counters a $290,000 offer at $299,000. Two days later the buyer says he accepts the original $290,000. Meanwhile the purchase agreement names only one of two spouses on title, gives closing on 15 October and possession on 1 November with nothing else about the interval, and the lead disclosure for the 1962 house is scheduled to be signed at closing. Identify each problem.",
      choices: [
        "There is no contract at $290,000 because the counter rejected that offer; the agreement must name both spouses because entireties property requires both; the seventeen-day occupancy interval needs a written agreement; and the lead disclosure and ten-day opportunity must precede the buyer's obligation, not the closing.",
        "The buyer's acceptance revives the original offer; the missing spouse can sign at closing; possession is customary and needs no agreement; and lead disclosure at closing is normal practice.",
        "Only the lead disclosure timing is a problem; the others are administrative.",
        "Only the counter-offer analysis matters; the rest are the title company's responsibility."
      ],
      correctChoice: 0,
      rationale: "Four independent failures. A counter-offer rejects the original, so nothing remains to accept. Entireties property requires both signatures. An occupancy interval with no written terms produces the dispute nobody planned for. And the federal lead rule gives the buyer a ten-day opportunity that cannot be given retroactively at closing."
    },
    engagement: [
      {
        prompt: "What is the effect of a counter-offer?",
        choices: [
          "It rejects the original offer, which cannot afterwards be accepted.",
          "It suspends the original offer until the counter is answered.",
          "It creates a contract on the original terms with a modification.",
          "It has no effect until reduced to writing."
        ],
        correctChoice: 0,
        rationale: "This is the mechanic that ends more transactions than any other single misunderstanding, and it is why a seller should be told before countering that they are giving up the ability to accept."
      },
      {
        prompt: "What does Michigan's statute of frauds require for a contract to sell land?",
        choices: [
          "A writing signed by the party to be charged.",
          "Notarised signatures of both parties.",
          "Recording with the register of deeds.",
          "Consideration of at least one dollar."
        ],
        correctChoice: 0,
        rationale: "Leases longer than one year are covered too, and amendments should be written for the same reason."
      },
      {
        prompt: "A buyer's inspection contingency lapses without being exercised. What generally follows?",
        choices: [
          "The contingency is waived and the buyer becomes obligated.",
          "The contingency extends automatically until the inspection is complete.",
          "The seller must grant an extension on request.",
          "The contract terminates automatically."
        ],
        correctChoice: 0,
        rationale: "The date is the whole mechanism, which is why a licensee's diary is a professional instrument and why inspections are scheduled early rather than against the deadline."
      },
      {
        prompt: "Who must deliver a Michigan Seller's Disclosure Statement, and when?",
        choices: [
          "A seller of residential property of one to four dwelling units, before the parties are bound, with a statutory termination right where it is delivered late.",
          "The listing licensee, at closing.",
          "The buyer's lender, before the appraisal.",
          "Any seller of any property, within ten days of closing."
        ],
        correctChoice: 0,
        rationale: "Getting the statement to a buyer before the offer keeps the transaction stable and gives the buyer the information while it can still affect their decision."
      },
      {
        prompt: "For target housing built before 1978, what does federal law give the buyer?",
        choices: [
          "Disclosure of known lead hazards, the EPA pamphlet, a ten-day opportunity to inspect unless waived in writing, and the prescribed warning in the contract.",
          "A right to terminate at any time before closing.",
          "A seller-funded lead inspection.",
          "A three-day right of rescission after closing."
        ],
        correctChoice: 0,
        rationale: "The licensee's obligation is personal and includes three-year retention of the signed disclosure. Signing at closing documents that the buyer never had the opportunity the rule exists to give."
      }
    ],
    remediation: [
      {
        prompt: "A seller writes 'subject to my attorney's approval' beside her signature on an acceptance. What is that?",
        choices: [
          "A counter-offer, because it adds a term.",
          "An acceptance with a condition subsequent.",
          "A binding contract subject to a formality.",
          "A rejection with no further effect."
        ],
        correctChoice: 0,
        rationale: "The licensee's job is to recognise it as a counter and treat it as one, rather than telling the buyer they have a deal."
      },
      {
        prompt: "What does earnest money do?",
        choices: [
          "It evidences the buyer's commitment and funds a remedy; it is not what makes the contract binding.",
          "It is the consideration that forms the contract.",
          "It transfers equitable title to the buyer.",
          "It reduces the purchase price by operation of law."
        ],
        correctChoice: 0,
        rationale: "The parties' promises are the consideration. New licensees frequently believe a contract is not binding until earnest money is paid."
      },
      {
        prompt: "When may a seller answer 'unknown' on the disclosure statement?",
        choices: [
          "When the seller genuinely does not know; it is not a place for something the seller knows and would rather not say.",
          "Whenever the seller has not personally inspected the item.",
          "Whenever a repair was made by a contractor.",
          "Whenever the property is sold as is."
        ],
        correctChoice: 0,
        rationale: "A seller who marks 'unknown' beside a system they have repaired twice has created evidence rather than avoided it."
      },
      {
        prompt: "A financing contingency says only that the buyer must obtain 'a mortgage.' What is the drafting problem?",
        choices: [
          "It is satisfied by any mortgage on any terms, so it protects the buyer far less than they think.",
          "It is unenforceable for vagueness.",
          "It obliges the seller to provide financing.",
          "It extends automatically until financing is obtained."
        ],
        correctChoice: 0,
        rationale: "A financing contingency has to describe the loan — type, amount, and rate ceiling — because the buyer's protection is only as specific as the description."
      },
      {
        prompt: "Which exemption from the Seller Disclosure Act still leaves the seller exposed for fraud?",
        choices: [
          "All of them; an exemption from the statutory statement is not an exemption from liability for fraud, nor from the licensee's own duty to disclose known material facts.",
          "None; an exemption is complete.",
          "Only the fiduciary exemption.",
          "Only transfers between spouses."
        ],
        correctChoice: 0,
        rationale: "A buyer purchasing an exempt property is buying with less information, not with fewer rights against misrepresentation."
      }
    ]
  },

  "module-07": {
    subject: "Civil rights law and equal opportunity in housing",
    applied: {
      prompt: "An owner instructs a licensee to prefer 'a mature, settled tenant, not students', to advertise the unit as 'perfect for a young professional', and to target the online advertisement to users aged 25 to 40 within three miles. He adds that as a small owner he is exempt. Address each element.",
      choices: [
        "Age is protected under Michigan's Elliott-Larsen Act so 'mature' is unlawful; 'young professional' describes the occupant and reaches age and familial status; the age-banded targeting excludes protected classes by proxy and must be replaced with the platform's housing settings; and the small-owner exemption is unavailable once a licensee is involved and never reaches race.",
        "The instruction is lawful in Michigan because age is not a federally protected class, and the advertising copy is a matter of style.",
        "Only the targeting is a problem; the wording and the instruction are the owner's choice.",
        "The exemption cures all three, because the owner has fewer than four units."
      ],
      correctChoice: 0,
      rationale: "This item exists because each element fails for a different reason. Michigan protects age and marital status where the federal Act does not; advertising rules reach words, imagery and targeting alike; and the private-owner exemption disappears the moment a broker is used, quite apart from section 1982 admitting no exemption for race at all."
    },
    engagement: [
      {
        prompt: "Which two classes does Michigan's Elliott-Larsen Civil Rights Act protect that the federal Fair Housing Act does not?",
        choices: [
          "Age and marital status.",
          "Familial status and disability.",
          "Religion and national origin.",
          "Colour and sex."
        ],
        correctChoice: 0,
        rationale: "This is why a Michigan licensee cannot work from the federal list. Michigan also protects sexual orientation and gender identity or expression expressly rather than by interpretation."
      },
      {
        prompt: "What makes conduct steering?",
        choices: [
          "Directing a person toward or away from an area on the basis of a protected characteristic — intent is not the test.",
          "Refusing to show a property at all.",
          "Advertising in a publication read mainly by one group.",
          "Charging a different commission."
        ],
        correctChoice: 0,
        rationale: "Steering is the violation licensees commit while trying to be helpful. The defence is method: objective criteria, recorded, and show everything that matches."
      },
      {
        prompt: "A tenant with a disability requests an assistance animal in a no-pets building. What may the housing provider require?",
        choices: [
          "Where the disability or the need is not obvious, information confirming a disability-related need — not a diagnosis, medical records, or proof of training.",
          "A pet deposit and additional monthly rent.",
          "Proof that the animal has completed a certified training programme.",
          "A letter naming the tenant's condition."
        ],
        correctChoice: 0,
        rationale: "An assistance animal is not a pet, so pet deposits, pet rent, and breed or weight restrictions do not apply, and the permitted enquiry is narrow."
      },
      {
        prompt: "Who ordinarily bears the cost of a reasonable modification in private housing?",
        choices: [
          "The tenant, and the provider may in appropriate cases require interior restoration at the end of the tenancy.",
          "The housing provider, in all cases.",
          "The municipality, through an accessibility grant.",
          "It is shared equally by statute."
        ],
        correctChoice: 0,
        rationale: "Accommodation changes a rule and the provider bears that cost; modification changes the premises and the tenant ordinarily pays. Students reverse these constantly."
      },
      {
        prompt: "Which exemption from the federal Fair Housing Act applies to discrimination based on race?",
        choices: [
          "None. Section 1982 of the Civil Rights Act of 1866 prohibits racial discrimination in property transactions without exception.",
          "The Mrs. Murphy exemption for owner-occupied buildings of four or fewer units.",
          "The private-owner exemption for owners of three or fewer houses.",
          "The religious organisation exemption."
        ],
        correctChoice: 0,
        rationale: "A licensee should never be relying on an exemption. If the analysis has reached the point of looking for one, something has already gone wrong."
      }
    ],
    remediation: [
      {
        prompt: "A buyer asks, 'What kind of people live in this subdivision?' What is the correct answer?",
        choices: [
          "That the licensee does not describe neighbourhoods by their residents, followed by the objective sources the buyer can consult for themselves.",
          "A factual demographic summary from census data.",
          "A general reassurance that the neighbourhood is friendly.",
          "A description of the nearest place of worship and school."
        ],
        correctChoice: 0,
        rationale: "Answering the question as asked is steering however it is answered. Giving the buyer the means to answer it themselves is a service."
      },
      {
        prompt: "What is blockbusting, and must a property actually change hands for it to occur?",
        choices: [
          "Inducing sales or rentals by representations about the entry into a neighbourhood of persons of a protected class.",
          "Buying a block of properties to resell at a profit.",
          "Refusing to lend in a defined geographic area.",
          "Advertising several listings in a single publication."
        ],
        correctChoice: 0,
        rationale: "Today it also appears in subtler forms — remarks about a neighbourhood 'changing', or solicitation timed to demographic movement."
      },
      {
        prompt: "A housing advertisement is targeted online by age band and interests. Why is that a problem even if no protected characteristic was named?",
        choices: [
          "Targeting is part of the advertisement, and exclusion by algorithm is still exclusion; platforms restrict housing-ad targeting for that reason.",
          "It is not a problem, because the platform rather than the advertiser selects the audience.",
          "It is a problem only if a complaint is filed.",
          "It is permitted where the property is a rental rather than a sale."
        ],
        correctChoice: 0,
        rationale: "A licensee who cannot explain who saw their advertisement and who did not has a problem they cannot answer. Keep the campaign configuration."
      },
      {
        prompt: "Where may a Michigan fair housing complaint be brought?",
        choices: [
          "With HUD, with the Michigan Department of Civil Rights, or in court — and LARA may separately discipline the licensee for the same conduct.",
          "Only with HUD, within one year.",
          "Only with LARA.",
          "Only in federal court, within two years."
        ],
        correctChoice: 0,
        rationale: "A licensee facing a fair housing complaint may be facing three proceedings at once, and none of them substitutes for the others."
      },
      {
        prompt: "A client instructs a licensee to discriminate and the licensee complies. Who is liable?",
        choices: [
          "The licensee personally; a client's instruction is not a defence.",
          "The client alone, since the licensee was following instructions.",
          "The broker alone, under supervisory liability.",
          "Nobody, if the instruction was verbal."
        ],
        correctChoice: 0,
        rationale: "Obedience runs only to lawful instructions. The written refusal is what separates the licensee from the client's conduct."
      }
    ]
  },

  "module-08": {
    subject: "Real estate finance and settlement law",
    applied: {
      prompt: "A buyer asks the licensee to write the agreement at $315,000 with a $15,000 'repair credit' rather than $300,000, so the down payment can be financed. He also mentions he will rent the property out rather than occupy it, and asks the licensee to accept $150 per closing from a title company described as a marketing co-op fee. Address each.",
      choices: [
        "Refuse the inflated price and credit as a misstatement to the lender amounting to mortgage fraud; refuse to transmit a false occupancy declaration and explain that investment financing is a different product; and decline the title company payment as a RESPA section 8 referral fee with a label; then escalate all three to the broker and document.",
        "Write the agreement as asked since the lender will verify independently, note the occupancy privately, and accept the fee once disclosed at closing.",
        "Refuse only the price structure; the occupancy and the fee are between the buyer, the lender and the title company.",
        "Accept all three, since none of them is the licensee's decision to make."
      ],
      correctChoice: 0,
      rationale: "Three separate federal exposures in one conversation. An inflated price with an offsetting credit misstates the transaction to the lender; a false occupancy declaration is fraud the licensee would be facilitating; and a payment whose only variable is closing volume is a referral fee whatever it is called. A repair credit supported by actual repairs and disclosed to the lender is an entirely different thing — the difference is disclosure."
    },
    engagement: [
      {
        prompt: "What is the difference between the note and the mortgage?",
        choices: [
          "The note is the promise to repay — the debt; the mortgage pledges the property as security and gives the right to foreclose.",
          "The note is recorded and the mortgage is not.",
          "They are two names for the same instrument.",
          "The mortgage states the interest rate and the note states the collateral."
        ],
        correctChoice: 0,
        rationale: "Michigan is a lien theory state: the borrower holds title and the lender holds a lien. When a loan is sold, the note transfers and the mortgage follows it."
      },
      {
        prompt: "Why can a buyer usually not simply take over a seller's low-rate mortgage?",
        choices: [
          "The due-on-sale clause makes the balance payable on transfer; assumability is a specific feature of some loans, not a general right.",
          "Michigan prohibits assumption by statute.",
          "The buyer's credit cannot be substituted for the seller's.",
          "Recording a transfer automatically accelerates any mortgage."
        ],
        correctChoice: 0,
        rationale: "Whether a particular loan may be assumed is answered by the lender and the loan documents, which the licensee obtains rather than interprets."
      },
      {
        prompt: "A $228,000 loan carries 1.5 discount points. What is the cost at closing?",
        choices: ["$3,420", "$2,280", "$34,200", "$1,520"],
        correctChoice: 0,
        rationale: "A point is one percent of the loan amount: 228,000 times 0.015 equals $3,420."
      },
      {
        prompt: "What does RESPA section 8 prohibit?",
        choices: [
          "Giving or accepting anything of value for the referral of settlement service business.",
          "Charging a fee for services actually performed at market value.",
          "Any affiliated business arrangement between a brokerage and a title company.",
          "Requiring the buyer to obtain title insurance."
        ],
        correctChoice: 0,
        rationale: "Affiliated business arrangements are permitted with written disclosure, a statement that the consumer need not use the affiliate, and no fee for the referral itself."
      },
      {
        prompt: "How does the Closing Disclosure constrain a closing date?",
        choices: [
          "The borrower must receive it at least three business days before consummation, and certain changes restart the period.",
          "It must be delivered at closing and signed there.",
          "It must be delivered within three days of application.",
          "It has no effect on the closing date."
        ],
        correctChoice: 0,
        rationale: "A licensee who promises a closing date without accounting for the three-day rule has promised something the timeline may not allow."
      }
    ],
    remediation: [
      {
        prompt: "Which classes does the Equal Credit Opportunity Act protect that the federal Fair Housing Act does not?",
        choices: [
          "Marital status, age, and receipt of public assistance income.",
          "Familial status and disability.",
          "Race and colour.",
          "National origin and religion."
        ],
        correctChoice: 0,
        rationale: "The fair housing obligations and the lending rules overlap without being identical, which is why both lists have to be held separately."
      },
      {
        prompt: "A property is bought for $268,000 with 15 percent down. What is the loan-to-value?",
        choices: ["85 percent", "15 percent", "80 percent", "88 percent"],
        correctChoice: 0,
        rationale: "Down payment $40,200; loan $227,800; 227,800 divided by 268,000 is 85 percent — above 80, so mortgage insurance will ordinarily apply."
      },
      {
        prompt: "What must a licensee establish before a buyer offers on a property sold at sheriff's sale five weeks ago?",
        choices: [
          "Whether a redemption period is running and when it ends, in writing from the title company and counsel.",
          "The amount of the winning bid.",
          "Whether the former owner has vacated.",
          "Whether the property qualifies for FHA financing."
        ],
        correctChoice: 0,
        rationale: "The period's length varies with the circumstances and decides both what the buyer is acquiring and when they could occupy. Never state it from memory."
      },
      {
        prompt: "An FHA appraisal identifies peeling paint on a 1968 house. Why does the loan type matter to the seller?",
        choices: [
          "FHA carries property standards, so condition items may have to be corrected before closing regardless of what the buyer accepts.",
          "It does not; appraisals address value only.",
          "The buyer must pay for the correction under FHA rules.",
          "The property becomes ineligible permanently."
        ],
        correctChoice: 0,
        rationale: "Loan type changes the property requirements, not only the borrower's qualification. A listing agent should raise this with the seller before the appraisal rather than after."
      },
      {
        prompt: "A borrower's NOI calculation subtracts the mortgage payment. What is wrong?",
        choices: [
          "Debt service is not an operating expense; two owners of identical buildings with different loans would otherwise show different NOIs for the same property.",
          "Nothing; debt service is an operating cost.",
          "Depreciation should be subtracted instead.",
          "Vacancy should not have been deducted."
        ],
        correctChoice: 0,
        rationale: "Net operating income is effective gross income less operating expenses, before debt service, depreciation, and income taxes."
      }
    ]
  },

  "module-09": {
    subject: "Valuation, appraisal, and real estate mathematics",
    applied: {
      prompt: "A seller has spent $80,000 finishing a basement and adding a sunroom in a neighbourhood where comparable sales top out $40,000 below her target. She insists the price reflect what she spent, and a lender separately offers the licensee a fee to prepare 'a quick valuation' for a home-equity decision. Address both.",
      choices: [
        "Show the seller comparable sales with and without similar features and explain contribution and regression, giving a supported range in writing; and decline the lender's engagement, because a valuation for a credit decision is appraisal work the licensee is not licensed to perform.",
        "Price at the seller's figure since the property is hers, and accept the lender's fee because a market analysis is licensed activity in Michigan.",
        "Refuse the listing entirely and accept the lender's engagement.",
        "Average the comparable sales and the seller's cost, and decline the lender's fee only if it exceeds $500."
      ],
      correctChoice: 0,
      rationale: "Improvements add what they contribute, measured in the market, not what they cost — and an over-improved property is dragged by regression. Separately, a market analysis is licensed real estate activity in Michigan, but a valuation supporting a lender's credit decision is appraisal work, and describing one as adequate for the other misrepresents both the product and the licensee's authority."
    },
    engagement: [
      {
        prompt: "A comparable is superior to the subject. Which way is it adjusted?",
        choices: [
          "Downward — comparable better, subtract.",
          "Upward, to reflect its superiority.",
          "The subject is adjusted upward instead.",
          "No adjustment; a superior comparable is discarded."
        ],
        correctChoice: 0,
        rationale: "Adjust the comparable, never the subject — you do not yet know the subject's value. Students reverse this constantly."
      },
      {
        prompt: "Which approach is primary for residential property, and why?",
        choices: [
          "Sales comparison, because substitution describes how residential buyers behave.",
          "Cost, because it isolates land value.",
          "Income, because most houses could be rented.",
          "Gross rent multiplier, because it is quickest."
        ],
        correctChoice: 0,
        rationale: "A buyer will pay no more than the cost of an equally desirable substitute, which is the principle the whole approach rests on."
      },
      {
        prompt: "A building has $114,080 effective gross income and $46,800 of operating expenses. At a 7.5 percent capitalisation rate, what is the indicated value?",
        choices: ["$897,067", "$1,521,067", "$624,000", "$851,000"],
        correctChoice: 0,
        rationale: "NOI is 114,080 minus 46,800, or $67,280. Value equals NOI divided by the rate: 67,280 divided by 0.075."
      },
      {
        prompt: "How should several adjusted comparable indications be resolved?",
        choices: [
          "By reconciliation, weighting the better-matched comparables; never by averaging.",
          "By averaging, which removes bias.",
          "By selecting the highest, since sellers list high.",
          "By selecting the median automatically."
        ],
        correctChoice: 0,
        rationale: "An average treats a poorly matched comparable as equal to a good one. The comparable requiring the largest gross adjustment is the least reliable."
      },
      {
        prompt: "A parcel is 250 by 300 feet. How many acres?",
        choices: ["1.72", "0.58", "17.2", "2.50"],
        correctChoice: 0,
        rationale: "75,000 square feet divided by 43,560 square feet per acre is 1.72 acres."
      }
    ],
    remediation: [
      {
        prompt: "What are the four elements of value?",
        choices: [
          "Demand, utility, scarcity, and transferability.",
          "Cost, price, income, and appreciation.",
          "Location, condition, size, and age.",
          "Supply, demand, financing, and taxation."
        ],
        correctChoice: 0,
        rationale: "All four are required. Land with a defective title has no transferability, so it has no market value however desirable it is."
      },
      {
        prompt: "A house sells for $289,000 at 5.5 percent commission split evenly between brokerages, with the listing salesperson on a 70 percent split. What does the salesperson receive?",
        choices: ["$5,563.25", "$11,126.50", "$7,947.50", "$15,895.00"],
        correctChoice: 0,
        rationale: "Total commission $15,895; listing brokerage half is $7,947.50; 70 percent of that is $5,563.25."
      },
      {
        prompt: "What distinguishes a comparative market analysis from an appraisal?",
        choices: [
          "A market analysis is licensed real estate activity in Michigan; an appraisal is separately licensed work performed to professional standards for uses including lending decisions.",
          "An appraisal uses comparable sales and a market analysis does not.",
          "A market analysis is prepared for buyers and an appraisal for sellers.",
          "There is no difference; the terms are interchangeable."
        ],
        correctChoice: 0,
        rationale: "Label the product accurately, show the reasoning and sources, give a range rather than a false precision, and date it."
      },
      {
        prompt: "Taxes of $3,650 for the year, closing 12 September on the 365-day method with the day of closing charged to the buyer. What is the seller's share?",
        choices: ["$2,540", "$1,110", "$2,550", "$1,825"],
        correctChoice: 0,
        rationale: "Daily rate $10.00; the seller holds 1 January to 11 September, 254 days; 254 times 10.00 is $2,540."
      },
      {
        prompt: "An investor puts $95,000 down and clears $8,075 after debt service. What is the cash-on-cash return?",
        choices: ["8.5 percent", "11.8 percent", "6.4 percent", "9.5 percent"],
        correctChoice: 0,
        rationale: "8,075 divided by 95,000 is 8.5 percent. Cash-on-cash uses cash invested, not the purchase price."
      }
    ]
  },

  "module-10": {
    subject: "Closing, trust accounts, and professional practice",
    applied: {
      prompt: "Two days before closing a broker's operating account is short for payroll and the trust account holds $60,000 of earnest money; the broker proposes moving $8,000 and replacing it Friday. Separately, a buyer terminated after the inspection deadline and both parties now claim a $5,000 deposit, and the buyer's agent believes the buyer is right. What is the correct handling of each?",
      choices: [
        "Refuse the transfer as conversion regardless of the intention to repay, and escalate outside the brokerage if necessary; and hold the disputed deposit until the parties agree in writing or a court orders its disposition, escalating to the broker, referring both parties to counsel, and documenting the timeline.",
        "Permit the transfer since the funds return before anyone is prejudiced, and release the deposit to the buyer because the agent's analysis is sound.",
        "Refuse the transfer but release the deposit to whichever party's argument is stronger.",
        "Permit the transfer if documented in the ledger, and hold the deposit indefinitely without telling either party."
      ],
      correctChoice: 0,
      rationale: "Trust money may be disbursed only for its own purpose and only as authorised; an intention to repay describes concealment rather than a defence. And a broker does not adjudicate a deposit dispute — releasing to one party because their argument seems better exposes the broker to the other. Believing a client is right is not authority to act on it."
    },
    engagement: [
      {
        prompt: "A salesperson receives a $4,000 earnest money cheque. What must happen?",
        choices: [
          "It goes to the broker promptly for deposit in the trust account; a salesperson does not hold client money.",
          "It is deposited in the salesperson's account and transferred within five days.",
          "It is held until the offer is accepted, then deposited.",
          "It is given to the seller as evidence of good faith."
        ],
        correctChoice: 0,
        rationale: "Module 01's chain of authority in its most consequential form. A salesperson holding client funds over a weekend is a problem waiting for a complaint."
      },
      {
        prompt: "What is commingling, and does it require that any money be lost for the violation to be complete?",
        choices: [
          "Mixing trust funds with the broker's own money.",
          "Holding deposits for two transactions in one trust account.",
          "Using one bank for both operating and trust accounts.",
          "Depositing a cheque before the offer is accepted."
        ],
        correctChoice: 0,
        rationale: "Separate accounts, prompt deposit, per-transaction ledgers, and regular reconciliation are the controls. R 339.22134 governs."
      },
      {
        prompt: "On a settlement statement, what is the purchase price to the buyer?",
        choices: [
          "A debit — a charge against the buyer.",
          "A credit, because it is what they are receiving.",
          "Neither; it appears only on the seller's side.",
          "A debit to both parties."
        ],
        correctChoice: 0,
        rationale: "Debits charge and credits favour. The price is a debit to the buyer and a credit to the seller; the loan and the earnest money are credits to the buyer."
      },
      {
        prompt: "A seller prepaid the year's taxes and closing is 1 October. What happens on the statement?",
        choices: [
          "The buyer reimburses the seller for the remaining days, appearing as a debit to the buyer and a credit to the seller.",
          "The seller reimburses the buyer for the year to date.",
          "No proration occurs, because the taxes are paid.",
          "The proration is charged entirely to the lender."
        ],
        correctChoice: 0,
        rationale: "Prorations appear on both sides in opposite directions. Whether Michigan taxes are treated as paid in advance or in arrears is a matter of local custom the agreement must state."
      },
      {
        prompt: "Both parties instruct the broker in writing to release a disputed deposit to the buyer. May the broker?",
        choices: [
          "Yes; written agreement of both parties is an authorised basis for disbursement.",
          "No; only a court may order disbursement once a dispute exists.",
          "Only after thirty days have passed.",
          "Only if the buyer's agent concurs."
        ],
        correctChoice: 0,
        rationale: "What the broker may not do is release on one party's instruction, or on the broker's own view of who is right."
      }
    ],
    remediation: [
      {
        prompt: "At the walkthrough an agreed repair has not been done. What are the legitimate options?",
        choices: [
          "Delay closing, escrow funds against the repair under a written agreement, or take a credit — each of which is a contract amendment requiring signatures.",
          "Close on the seller's verbal promise to complete the work.",
          "Withhold the commission until the repair is done.",
          "Refuse to close and forfeit the buyer's deposit."
        ],
        correctChoice: 0,
        rationale: "A verbal promise at the closing table is the arrangement that produces the complaint six weeks later."
      },
      {
        prompt: "Price $268,500, earnest money $3,000, loan $214,800, buyer's closing costs $3,890, tax proration debiting the buyer $940. What is the cash to close?",
        choices: ["$55,530", "$50,750", "$57,410", "$53,650"],
        correctChoice: 0,
        rationale: "268,500 plus 3,890 plus 940, less 3,000 and 214,800, equals $55,530."
      },
      {
        prompt: "Why does a brokerage reconcile the trust account against individual ledgers?",
        choices: [
          "Because the total of the ledgers must equal the account balance, and a discrepancy investigated at once is an error rather than a pattern.",
          "Because the Department requires monthly bank statements.",
          "Because interest must be allocated to clients.",
          "Because clients may request statements."
        ],
        correctChoice: 0,
        rationale: "Reconciliation is the control that catches errors before they become shortfalls."
      },
      {
        prompt: "How long must a Michigan real estate school keep a student's record?",
        choices: [
          "Permanently; R 339.22154(1) requires the record to be established and permanently maintained.",
          "Three years from completion.",
          "Five years from completion.",
          "Until the student obtains a licence."
        ],
        correctChoice: 0,
        rationale: "Michigan records are never aged out, which distinguishes it from states with a term of years such as Virginia's five."
      },
      {
        prompt: "What does supervision by a broker require?",
        choices: [
          "An affirmative system — file review, advertising approval, availability for escalation — not merely a policy manual or an open door.",
          "Availability to answer questions when asked.",
          "A written manual issued at hire.",
          "Nothing beyond the licensee's own compliance, where the licensee is an independent contractor."
        ],
        correctChoice: 0,
        rationale: "Independent contractor status governs tax treatment and nothing about the regulatory relationship. For a new licensee, real file review is one of the few reliable indicators of what the first year will be like."
      }
    ]
  },
};

export default modules;
