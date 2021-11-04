import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BrowserService } from '../browser.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(private browserService: BrowserService, private changeDetector: ChangeDetectorRef) { 

    // TODO: Investigate why angular is not detecting changes and remove this awful hack.
    this.changeDetector.detach()
    setInterval(() => {
      this.changeDetector.detectChanges()
    }, 50)
  }

<<<<<<< HEAD
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
          title: inspectedHighlightData.clickedSynonymName,
          entityName: inspectedHighlightData.entityName,
          identifiers,
          synonyms: Array.from(inspectedHighlightData.entity.synonyms.keys()),
          occurrences: inspectedHighlightData.entity.htmlTagIDs!,
          xrefs: inspectedHighlightData.entity.xRefs
    })
    }
  }



=======
>>>>>>> breaking-changes/angular-sidebar-refactor
  ngOnInit(): void {
    this.browserService.sendMessageToActiveTab({ type: 'content_script_set_sidebar_ready' })
  }
}
