import { Component, Input } from '@angular/core';
import { BrowserService } from 'src/app/browser.service';
import { SidebarDataService } from '../sidebar-data.service';
import { Identifier, SidebarEntity } from '../types';

@Component({
  selector: 'app-sidebar-entity',
  templateUrl: './sidebar-entity.component.html',
  styleUrls: ['./sidebar-entity.component.scss']
})
export class SidebarEntityComponent {

  @Input() entity: SidebarEntity = {} as SidebarEntity
  
  scrollIndex = 0
  constructor(private browserService: BrowserService, private sidebarDataService: SidebarDataService) { }

  filterIdentifiers(arr: Identifier[]): Identifier[] {
    return arr.filter(v => v.value)
  } 

  arrowClicked(direction: 'left' | 'right'): void {
    direction === 'left' ? this.scrollIndex-- : this.scrollIndex++   
    
    this.scrollIndex = 
    (this.scrollIndex % this.entity.occurrences.length + this.entity.occurrences.length)
     % this.entity.occurrences.length

     this.browserService.sendMessageToActiveTab({type: 'content_script_scroll_to_highlight', body: this.entity.occurrences[this.scrollIndex]})
  }

  remove() {
    this.sidebarDataService.setEntities(this.sidebarDataService.entities.filter(entity => entity.entityName !== this.entity.entityName))
  }

}
