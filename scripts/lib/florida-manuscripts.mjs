/** Structural checks only: these do not establish substantive adequacy or measured hours. */
export function validateFloridaManuscript(section,text) {
  const errors=[];
  if(!text.startsWith(`# FREC Course I — Section ${section.number}:`))errors.push('Wrong section identity.');
  const actual=[...text.matchAll(/^### Objective (\d+\.\d+) — curriculum page (\d+)$/gm)].map(match=>match[1]);
  const expected=section.learningObjectives.map(objective=>`${section.number}.${objective.n}`);
  if(JSON.stringify(actual)!==JSON.stringify(expected))errors.push('Required objective headings are missing, duplicated or out of order.');
  if(!/not approved/i.test(text))errors.push('Development status must remain explicit.');
  return errors;
}
