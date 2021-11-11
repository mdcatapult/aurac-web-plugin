
export function allRecognisers(): Recogniser[] {
  return ALL_RECOGNISERS.map(e => e)
}

const ALL_RECOGNISERS = [
  'leadmine-proteins',
  'leadmine-chemical-entities',
  'leadmine-diseases'
] as const;
type RecognisersTuple = typeof ALL_RECOGNISERS;
export type Recogniser = RecognisersTuple[number];
