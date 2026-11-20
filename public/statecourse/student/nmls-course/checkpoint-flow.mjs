// Where the identity and conduct checkpoints fall in the reviewers' course. Pure
// sequencing only: nothing here verifies anyone, calls BioSig-ID or records a result.

const ids = (sequence, test) => sequence.filter(test).map(step => step.id);

// On opening the course. A first visit gets the Rules of Conduct and "Begin"; any later
// visit gets "Resuming". The open (read-only) version has no checkpoints: it exists so a
// reviewer can move through the material freely.
export function checkpointsOnOpen(snapshot, sequence) {
  if (!snapshot || snapshot.readOnly === true) return [];
  return snapshot.phase === 'not_started'
    ? ids(sequence, step => step.when === 'before_course')
    : ids(sequence, step => step.when === 'on_return');
}

// During the lessons, when a module that carries a checkpoint has just been passed.
// A module already passed when the page opened does not raise its checkpoint again.
export function checkpointsAfterModules(previouslyPassed, nowPassed, sequence) {
  const before = new Set(previouslyPassed || []);
  return ids(sequence, step => step.when === 'after_module' && nowPassed.includes(step.moduleId) && !before.has(step.moduleId));
}

// At entry to each final examination form.
export const checkpointsBeforeFinal = sequence => ids(sequence, step => step.when === 'before_final');

// What the placeholder says. Each one states plainly that nothing was verified.
export function placeholderCopy(step) {
  if (step.kind === 'rules_of_conduct') return {
    title: 'NMLS Rules of Conduct',
    body: 'In the approved course the student reads the NMLS Rules of Conduct for students and accepts them here, before any lesson opens.',
    status: 'Placeholder. The Rules of Conduct are not loaded in this version, and no acceptance is asked for or recorded.',
  };
  return {
    title: `BioSig-ID checkpoint: ${step.d3}`,
    body: `${step.label}. In the approved course the student is sent to BioSig-ID here and continues only after BioSig-ID confirms their identity.`,
    status: 'Placeholder. BioSig-ID is not connected in this version. No identity check is made and none is recorded.',
  };
}
