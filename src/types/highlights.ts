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

import { Globals } from '../content-script/globals'

export const HIGHLIGHTED_ELEMENT_ID_DELIMITER = '_'

export function highlightID(
  entityID: string,
  entityOccurrence: number,
  synonymName: string
): string {
  return [entityID, entityOccurrence, synonymName].join(HIGHLIGHTED_ELEMENT_ID_DELIMITER)
}

export function parseHighlightID(
  id: string
): [entityID: string, entityOccurrence: number, synonymName: string, synonymOccurrence: number] {
  const [entityID, entityOccurrence, synonymName, synonymOccurrence] = id.split(
    HIGHLIGHTED_ELEMENT_ID_DELIMITER
  )

  return [entityID, parseInt(entityOccurrence), synonymName, parseInt(synonymOccurrence)]
}

export function highlightFormat(synonym: string): RegExp {
  // we need to escape special characters in the string first
  const escapedSynonym = synonym.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const highlightingFormat = `(?<=\\W|^)${escapedSynonym}(?=\\W|$)`

  return new RegExp(highlightingFormat)
}

// if an element has a class of aurac-highlight but no id that means its parent has a display none. we want to remove
// the highlight from these elements as they are not visible on the page
export function unmarkHiddenEntities(unmarker: (element: HTMLElement) => void): Element[] {
  return Array.from(Globals.document.getElementsByClassName('aurac-highlight'))
    .filter(element => {
      return !element.id
    })
    .map(element => {
      unmarker(element as HTMLElement)

      return element
    })
}
