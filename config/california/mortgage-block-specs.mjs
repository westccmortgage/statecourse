/**
 * CA-BLOCK rollout — the HAND-AUTHORED pedagogy for Mortgage assignments 2–15.
 *
 * The generator (scripts/generate-mortgage-block-maps.mjs) derives every screen range from the
 * frozen lesson's own headings; what it must never invent lives here, written after reading the
 * lesson: each block's learning objective (blocks B1–B6 follow the lesson's six sections; the
 * seventh entry is B7, synthesis), and the mapping of the eight practice problems to the block
 * teaching their concept. Every problem 1–8 must be assigned to exactly one block — the coverage
 * invariant requires each problem's range to have exactly one owner — and a block with no mapped
 * problem is a documented inventory gap whose active learning is its retrieval check, exactly as
 * pilot block B1 was.
 */

export const MORTGAGE_BLOCK_SPECS = {
  2: {
    objectives: [
      "Compute simple interest in all four directions and per diem interest, and explain why interest paid in arrears shifts the first payment and raises a payoff.",
      "Build rows of an amortization schedule, explain the shifting interest-principal split and what it explains for borrowers, and describe negative amortization and recast in plain terms.",
      "Identify the operative provisions of a promissory note, distinguish acceleration from alienation, and state what determines an adjustable rate at adjustment.",
      "Compute points and a break-even, group closing costs by category, and state what the annual percentage rate does and does not capture.",
      "Compute loan-to-value and combined loan-to-value under the lower-of-value-or-price rule, and compute equity and cash-out availability.",
      "Compute payments with the factor method, build PITI and qualifying ratios without stating thresholds, compute yield at a discount and a premium, and apply the reasonableness check to every figure.",
      "Integrate the assignment's concepts: review the key terms and summary, complete the applied memorandum, and pass the assignment knowledge check.",
    ],
    /* P1 interest in four directions and P2 arrears/first payment teach §1; P3 acceleration and
       alienation teaches §3; P4 the points break-even, §4; P5 the low appraisal and refinance
       exposure, §5; P6 the unreconciled payment quote, P7 the ratios, and P8 yield at three
       prices all teach §6. §2 (amortization) has no mapped problem — the documented gap; its
       retrieval check is its active learning. */
    problemMap: { 1: [1, 2], 3: [3], 4: [4], 5: [5], 6: [6, 7, 8] },
  },
};
