import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { InspectedHighlightData, MessageType } from 'src/types';
import { BrowserService } from '../browser.service';
import { SidebarEntity } from './types';

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
          const highlightData = msg.body as InspectedHighlightData
          this.inspectHighlight(highlightData)
        
          this.changeDetector.detectChanges()
      }
    })
  }

  private inspectHighlight(inspectedHighlightData: InspectedHighlightData): void {
    // convert inspected highlight data into sidebar entity (check if it's already in the array etc.)
    // and manipulate the entities array to render the cards
  }

  ngOnInit(): void {
    this.browserService.sendMessageToActiveTab({ type: 'content_script_set_sidebar_ready' })
  }

}
