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

export function allSpecies(): Species[] {
  return ALL_SPECIES.map(e => e)
}

const ALL_SPECIES = [
  'Homo sapiens',
  'Rattus norvegicus',
  'Mus musculus',
  'Saccharomyces cerevisiae',
  'Drosophila melanogaster',
  'Caenorhabditis elegans',
  'Xenopus tropicalis',
  'Danio rerio'
] as const
type SpeciesTuple = typeof ALL_SPECIES
export type Species = SpeciesTuple[number]
