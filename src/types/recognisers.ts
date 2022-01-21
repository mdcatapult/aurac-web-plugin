export function allRecognisers(): Recogniser[] {
  return ALL_RECOGNISERS.map(e => e)
}

const ALL_RECOGNISERS = [
  'leadmine-proteins',
  'leadmine-chemical-entities',
  'leadmine-disease',
  'swissprot-genes-proteins'
] as const
type RecognisersTuple = typeof ALL_RECOGNISERS
export type Recogniser = RecognisersTuple[number]
