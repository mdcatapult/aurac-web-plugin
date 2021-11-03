import { Component, Input, OnInit } from '@angular/core';
import { BrowserService } from 'src/app/browser.service';
import { SidebarDataService } from '../sidebar-data.service';
import { Identifier, SidebarEntity } from '../types';

@Component({
  selector: 'app-sidebar-entity',
  templateUrl: './sidebar-entity.component.html',
  styleUrls: ['./sidebar-entity.component.scss']
})
export class SidebarEntityComponent implements OnInit {

  @Input() entity: SidebarEntity = {} as SidebarEntity
  
  scrollIndex = 0
  constructor(
    private browserService: BrowserService,
    private sidebarDataService: SidebarDataService,
  ) { }

  ngOnInit(): void {
    console.log(this.entity.occurrences)
  }

  filterIdentifiers(arr: Identifier[]): Identifier[] {
    return arr.filter(v => v.value)
  } 

  arrowClicked(direction: 'left' | 'right'): void {
    direction === 'left' ? this.scrollIndex-- : this.scrollIndex++   
    
    const i = this.scrollIndex
    const n = this.entity.occurrences.length
    
    // loop around the array in either direction
    this.scrollIndex = (i % n + n) % n

    this.browserService.sendMessageToActiveTab({type: 'content_script_scroll_to_highlight', body: this.entity.occurrences[this.scrollIndex]})
  }

  remove(): void {
    this.sidebarDataService.entities = this.sidebarDataService.entities.filter(entity => entity.entityName !== this.entity.entityName)
  }


}
