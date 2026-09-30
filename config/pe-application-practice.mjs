// Only the two reviewed PUBLIC formative banks are allowlisted here. Never import
// an instructor package or a protected final-assessment source.
import PE03 from './pe-public-practice/PE03.json' with { type: 'json' };
import PE04 from './pe-public-practice/PE04.json' with { type: 'json' };
import SOURCE_REGISTRY from './pe-public-practice/sources.json' with { type: 'json' };

export const PUBLIC_ITEM_COUNTS = Object.freeze({ PE03: 12, PE04: 12, PE05: 20, PE06: 16 });
// Only these reviewed fictional/numeric cases intentionally have no external
// citation. Dropping a legal question's sources must never relabel it as fiction.
const SOURCELESS_CASE_IDS = new Set(['PE03-P02', 'PE03-P04', 'PE03-P05', 'PE03-P06', 'PE03-P07', 'PE03-P10', 'PE03-P11']);
export const isReviewedSourcelessCase = (moduleId, itemId) => moduleId === 'PE03' && SOURCELESS_CASE_IDS.has(itemId);

export function normalizePublicPeBank(bank, moduleId, sourceRegistry) {
  if (!Object.hasOwn(PUBLIC_ITEM_COUNTS, moduleId) || bank.module_id !== moduleId ||
      bank.schema_version !== '1.0' || bank.public_formative !== true ||
      bank.credit_bearing !== false || bank.official_final_exam !== false ||
      bank.repeatable_practice !== true || !Array.isArray(bank.items) || bank.items.length !== PUBLIC_ITEM_COUNTS[moduleId])
    throw new Error('Invalid public PE bank boundary');
  const seen = new Set();
  return Array.from(bank.items, item => {
    if (!item || typeof item !== 'object' || item.module_id !== moduleId || item.type !== 'single_choice' ||
        item.assessment_role !== 'public_formative' || item.credit_bearing !== false ||
        typeof item.id !== 'string' || !item.id.startsWith(`${moduleId}-P`) || seen.has(item.id) ||
        !Array.isArray(item.choices) || item.choices.length !== 4 ||
        !Array.isArray(item.source_ids) || new Set(item.source_ids).size !== item.source_ids.length)
      throw new Error('Invalid public PE item');
    seen.add(item.id);
    if (!item.source_ids.length && !isReviewedSourcelessCase(moduleId, item.id))
      throw new Error('Required public PE sources were removed');
    const choiceIds = item.choices.map(choice => choice.id);
    if (choiceIds.join(',') !== 'A,B,C,D' || !choiceIds.includes(item.correct_choice_id) ||
        item.choices.some(choice => typeof choice.text !== 'string' || !choice.text.trim() ||
          typeof choice.feedback !== 'string' || !choice.feedback.trim()))
      throw new Error('Incomplete public PE choice feedback');
    const correctChoice = choiceIds.indexOf(item.correct_choice_id);
    const sources = Array.from(item.source_ids, id => {
      if (typeof id !== 'string' || !id.trim()) throw new Error('Invalid public PE source ID');
      const source = sourceRegistry?.[id];
      if (!source || new URL(source.url).protocol !== 'https:' || !source.reference)
        throw new Error(`Unresolved public PE source: ${moduleId}/${id}`);
      return { ...source };
    });
    return {
      id: item.id, module: `module-${moduleId.slice(2)}`, prompt: item.prompt,
      choices: item.choices.map(choice => choice.text), correctChoice,
      rationale: item.choices[correctChoice].feedback,
      choiceFeedback: item.choices.map(choice => choice.feedback), sources,
      ...(sources.length ? {} : { sourceNote: `Original fictional ${moduleId} lesson case. Review the stated facts and assumptions in the lesson.` }),
    };
  });
}

export const APPLICATION_TOPIC_QUIZZES = {
  'module-03': normalizePublicPeBank(PE03, 'PE03', SOURCE_REGISTRY.PE03),
  'module-04': normalizePublicPeBank(PE04, 'PE04', SOURCE_REGISTRY.PE04),
};
