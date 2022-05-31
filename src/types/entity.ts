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

import { Recogniser } from './recognisers'
import { Link } from '../app/sidebar/links'

// This is tab.id from the browser extension API
export type TabID = number

// This is some identifier that has allowed us to collate synonyms.
// e.g. resolvedEntity, or pubmed id. If there is no resolved entity
// we are using the lowercased synonym.
export type EntityID = string

export type XRef = {
  compoundName: string
  databaseName: string
  url: string
}

// Entity is our source of truth for all entity related questions!!
export interface Entity {
  synonymToXPaths: Map<string, string[]>
  identifierSourceToID?: Map<string, string> // e.g. {"pubchem":"1"}
  metadata?: any
  htmlTagIDs?: Array<string>
  xRefs?: Array<XRef>
  links?: Link[]
  speciesNames?: string[]
}

// Contains all the entities for a particular recogniser in the tab.
export interface RecogniserEntities {
  show: boolean
  entities: Map<EntityID, Entity>
}

// Holds all entities in a tab for each recogniser.
export type TabEntities = {
  [key in Recogniser]?: RecogniserEntities
}

// EntityChange describes where a change to the cache has been made for a tab.
export interface EntityChange {
  tabID: TabID
  entities: TabEntities
  setterInfo?: SetterInfo
}

// SetterInfo is used when emitting events from the EntityChangeObservable.
// 'noPropagate' is usedto stop the event emission from emitting another event when it would cause an infinite loop.
// 'isFilteredEntities' is used to update the filteredEntities map rather than the main entityMap.
export type SetterInfo = 'noPropagate' | 'isFilteredEntities'
