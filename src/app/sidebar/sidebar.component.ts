import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { InspectedHighlightData, MessageType } from 'src/types';
import { BrowserService } from '../browser.service';
import {Identifier, SidebarEntity} from './types';
import {parseWithTypes} from '../../json';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  entities: Array<SidebarEntity> = []

  constructor(private browserService: BrowserService, private changeDetector: ChangeDetectorRef) {
    this.browserService.addListener((msg: any) => {
      switch (msg.type as MessageType) {
        case 'sidebar_component_inspect_highlight':
          const highlightData = parseWithTypes(msg.body) as InspectedHighlightData
          this.inspectHighlight(highlightData)

          this.changeDetector.detectChanges()
      }
    })
  }

  private inspectHighlight(inspectedHighlightData: InspectedHighlightData): void {
    // convert inspected highlight data into sidebar entity (check if it's already in the array etc.)
    // and manipulate the entities array to render the cards

    console.log(inspectedHighlightData.entity.synonyms)
    if (!this.entities.some(entity => entity.entityName === inspectedHighlightData.entityName)) {
      const identifiersMap = inspectedHighlightData.entity.identifiers
      let identifiers: Array<Identifier> = []

      if (identifiersMap) {
        identifiers = Array.from(identifiersMap.entries()).map(([type, value]) => {
          return {type, value}
        })
      }

      this.entities.push({
          title: inspectedHighlightData.synonym,
          entityName: inspectedHighlightData.entityName,
          identifiers,
          synonyms: Array.from(inspectedHighlightData.entity.synonyms.keys()),
          occurrences: inspectedHighlightData.entity.htmlTagIDs!
    })
    }
  }



  ngOnInit(): void {
    this.browserService.sendMessageToActiveTab({ type: 'content_script_set_sidebar_ready' })
  }

}
