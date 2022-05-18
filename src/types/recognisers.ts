/*
 * Copyright 2022 Medicines Discovery Catapult
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { environment } from 'src/environments/environment'

export function allRecognisers(): Recogniser[] {
  // @ts-ignore
  return ALL_RECOGNISERS.map(e => e)
}

const ALL_RECOGNISERS = environment.bio
  ? (['swissprot-genes-proteins'] as const)
  : ([
      'leadmine-proteins',
      'leadmine-chemical-entities',
      'leadmine-disease',
      'swissprot-genes-proteins'
    ] as const)
type RecognisersTuple = typeof ALL_RECOGNISERS
export type Recogniser = RecognisersTuple[number]
