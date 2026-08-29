/**
 * CA-BLOCK rollout — the HAND-AUTHORED pedagogy for Real Estate Principles assignments.
 *
 * Same apparatus as the Mortgage rollout (see mortgage-block-specs.mjs for the full design
 * rationale): the generator (scripts/generate-principles-block-maps.mjs) derives every screen
 * range from the frozen lesson's own headings; what it must never invent lives here, written
 * after reading the lesson — each block's learning objective (blocks B1-B6 follow the lesson's
 * six sections; the seventh entry is B7, synthesis), and the mapping of the eight practice
 * problems to the block teaching their concept. Every problem 1-8 must be assigned to exactly one
 * block. Block/screen ids use the "pr" prefix (e.g. "pr1-b3") to stay collision-free with the
 * Mortgage course's "a" prefix once both share one registry.
 */

export const PRINCIPLES_BLOCK_SPECS = {
  1: {
    objectives: [
      "Explain why real property is treated differently in law from other assets, tracing the consequences of immobility, indestructibility, and uniqueness, and describe the bundle of rights and how its sticks separate across leases, security interests, easements, and covenants.",
      "Describe the Department of Real Estate's jurisdiction and consumer-protection purpose, identify what counts as licensed activity under the license law, and explain why the activity — not the title used — is what triggers it.",
      "Distinguish the broker's and the salesperson's roles, explain why the brokerage rather than the individual salesperson is the party to a listing or representation agreement, and describe what reasonable supervision actually requires as a system.",
      "Apply the legal-conclusion test to distinguish licensed real estate practice from the unauthorized practice of law, and route a consumer's actual questions correctly, referring well rather than refusing badly.",
      "Rank the sources of California real estate law from constitution to brokerage policy, explain why forms and publications are not themselves law, and read a statute or regulation for its definitions, scope, operative verbs, and exceptions.",
      "Identify each participant in a residential transaction and what each is accountable for, locate where accountability gaps recur, and explain the licensee's role as the participant who owns what would otherwise belong to nobody.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 the three physical characteristics and P2 the bundle of rights both teach §1; P3 the
       unlicensed-activity/compensation question teaches §2; P4 the brokerage-as-party question
       and P5 the supervision assessment both teach §3; P6 the within-scope/refer sort teaches §4;
       P7 the forms-are-not-law/brokerage-policy question teaches §5; P8 the accountability-gap
       diagnosis teaches §6. Every section owns a problem — no inventory gap in this assignment. */
    problemMap: { 1: [1, 2], 2: [3], 3: [4, 5], 4: [6], 5: [7], 6: [8] },
  },
};
