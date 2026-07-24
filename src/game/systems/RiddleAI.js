const ACCEPTED_CONCEPTS = Object.freeze(['memoire', 'souvenir', 'archive']);
const RELATED_CONCEPTS = Object.freeze(['histoire', 'recit', 'passe', 'experience', 'conscience', 'temoignage']);
const IGNORED_WORDS = new Set(['un', 'une', 'le', 'la', 'les', 'des', 'du', 'de', 'd', 'l', 'cest', 'ce']);

export const SIBYL_RIDDLES = Object.freeze([
  Object.freeze({
    question: 'Je conserve les voix sans avoir de bouche.\nJe traverse les siècles sans vieillir.\nQue suis-je ?',
    acceptedConcepts: ACCEPTED_CONCEPTS,
    relatedConcepts: RELATED_CONCEPTS,
    hints: [
      'INDICE 1 — On ne peut pas me toucher, mais je peux être perdu.',
      'INDICE 2 — Je conserve ce qui a été vécu et raconté.',
      'INDICE 3 — Ma réponse peut commencer par M, S ou A.',
      'INDICE FINAL — Pense à la mémoire, aux souvenirs et aux archives.',
    ],
  }),
  Object.freeze({
    question: 'Je répète chaque voix sans jamais la comprendre.\nJe nais après le son et meurs dans le silence.\nQue suis-je ?',
    acceptedConcepts: Object.freeze(['echo', 'resonance']),
    relatedConcepts: Object.freeze(['reflet', 'repetition', 'son', 'voix']),
    hints: [
      'INDICE 1 — Il faut d’abord produire un son pour me faire naître.',
      'INDICE 2 — Je reviens souvent depuis une paroi lointaine.',
      'INDICE 3 — Mon nom est aussi celui du réseau de la cité.',
      'INDICE FINAL — La réponse est un écho.',
    ],
  }),
  Object.freeze({
    question: 'Plus on me partage, moins je peux disparaître.\nLe pouvoir me craint lorsqu’il tente de me cacher.\nQue suis-je ?',
    acceptedConcepts: Object.freeze(['verite', 'savoir', 'connaissance']),
    relatedConcepts: Object.freeze(['information', 'preuve', 'secret', 'histoire']),
    hints: [
      'INDICE 1 — Je grandis lorsque plusieurs personnes me connaissent.',
      'INDICE 2 — Une archive et un témoignage peuvent me révéler.',
      'INDICE 3 — Je suis le contraire du mensonge.',
      'INDICE FINAL — La réponse principale est la vérité.',
    ],
  }),
]);

export const SIBYL_RIDDLE = SIBYL_RIDDLES[0];

export function normalizeAnswer(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(word => word && !IGNORED_WORDS.has(word))
    .map(word => word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word)
    .join(' ');
}

function levenshtein(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const previous = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = previous;
    }
  }
  return row[b.length];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
}

export function evaluateRiddleAnswer(answer, riddle = SIBYL_RIDDLE) {
  const normalized = normalizeAnswer(answer);
  const words = normalized.split(' ').filter(Boolean);
  let confidence = 0;
  let matchedConcept = null;

  for (const concept of riddle.acceptedConcepts) {
    for (const word of words) {
      const score = similarity(word, concept);
      if (score > confidence) {
        confidence = score;
        matchedConcept = concept;
      }
    }
  }

  if (words.some(word => riddle.relatedConcepts.includes(word)) && confidence < 0.6) {
    confidence = 0.6;
    matchedConcept = 'concept-proche';
  }

  const status = confidence >= 0.78 ? 'correct' : confidence >= 0.52 ? 'close' : 'wrong';
  return { status, confidence, matchedConcept, normalized };
}

export function getRiddleHint(attempt, riddle = SIBYL_RIDDLE) {
  return riddle.hints[Math.min(Math.max(0, attempt - 1), riddle.hints.length - 1)];
}
