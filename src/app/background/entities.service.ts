import { ConditionalExpr, ConstantPool } from '@angular/compiler'
import { Injectable } from '@angular/core'
import * as _ from 'lodash'
import { filter, min } from 'lodash'
import { Subject } from 'rxjs'
import { Recogniser } from 'src/types/recognisers'
import {
  Entity,
  EntityChange,
  EntityID,
  RecogniserEntities,
  SetterInfo,
  TabEntities,
  TabID
} from '../../types/entity'
import { SettingsService } from './settings.service'

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {
  private entityMap: Map<TabID, TabEntities> = new Map()

  private readonly entityChangeSubject = new Subject<EntityChange>()
  readonly entityChangeObservable = this.entityChangeSubject.asObservable()

  constructor(private settingsService: SettingsService) {}

  getTabEntities(tab: TabID): TabEntities | undefined {
    return this.entityMap.get(tab)
  }

  setTabEntities(tabID: TabID, entities: TabEntities, setterInfo?: SetterInfo): void {
    this.entityMap.set(tabID, entities)
    this.updateStream(tabID, entities, setterInfo)
  }

  filterEntities(minEntityLength: number): Map<TabID, TabEntities> {

    const entityMap = new Map<TabID, TabEntities>()

    _.cloneDeep(this.entityMap).forEach((tabEntities, tabId) => {
      const filteredEntities = this.filterTabEntities(minEntityLength, tabEntities)
      entityMap.set(tabId, filteredEntities)
      this.updateStream(tabId, filteredEntities, 'noSetEntities')
    })

    return entityMap
  }

  private filterTabEntities(minEntityLength: number, tabEntities: TabEntities): TabEntities {

    Object.keys(tabEntities).forEach(recogniser => {

      // @ts-ignore
      const recogniserEntities = tabEntities[`${recogniser}`] as RecogniserEntities

      // @ts-ignore
      recogniserEntities.entities.forEach((entity, entityName) => {

        const filteredSynonyms = new Map<string, string[]>()

        entity.synonymToXPaths.forEach((occurrences, synonym) => {

          if (synonym.length >= minEntityLength) {
            filteredSynonyms.set(synonym, occurrences)
          }
        })

        entity.synonymToXPaths = filteredSynonyms

      })
    })

    return tabEntities
  }

  setRecogniserEntities(
    tabID: TabID,
    recogniser: Recogniser,
    entities: RecogniserEntities,
    setterInfo?: SetterInfo
  ): void {

    const minEntityLength = this.settingsService.preferences.minEntityLength

    const tabEntities = this.entityMap.get(tabID)

    let entityCopy: TabEntities

    if (!tabEntities) {
      const newTabEntities: TabEntities = {}
      newTabEntities[recogniser] = entities
      this.entityMap.set(tabID, newTabEntities)
      entityCopy = _.cloneDeep(newTabEntities)
    } else {
      tabEntities[recogniser] = entities
      this.entityMap.set(tabID, tabEntities)
      entityCopy = _.cloneDeep(tabEntities)
    }
    this.updateStream(tabID, this.filterTabEntities(minEntityLength, entityCopy), setterInfo)

  }

  getEntity(tabID: TabID, recogniser: Recogniser, entityID: EntityID): Entity | undefined {
    const tabEntities = this.entityMap.get(tabID)
 
    return tabEntities ? tabEntities[recogniser]?.entities?.get(entityID) : undefined
  }

  private updateStream(tabID: TabID, entities: TabEntities, setterInfo?: SetterInfo): void {
    this.entityChangeSubject.next({ tabID, entities, setterInfo: setterInfo })
  }
}
