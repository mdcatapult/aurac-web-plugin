import { environment } from 'src/environments/environment'

export function allRecognisers(): Recogniser[] {
  // @ts-ignore
  return ALL_RECOGNISERS.map(e => e)
}

const ALL_RECOGNISERS = environment.bio
  ? ['swissprot-genes-proteins'] as const
  : (['leadmine-proteins', 'leadmine-chemical-entities', 'leadmine-disease', 'swissprot-genes-proteins'] as const)
type RecognisersTuple = typeof ALL_RECOGNISERS
export type Recogniser = RecognisersTuple[number]
