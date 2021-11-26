import { Recogniser } from './recognisers'

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
