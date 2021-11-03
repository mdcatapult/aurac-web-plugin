import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, OnChanges, OnInit } from '@angular/core';
import { SidebarDataService } from '../sidebar-data.service';
import { SidebarEntity } from '../types';

@Component({
  selector: 'app-sidebar-entity-list',
  templateUrl: './sidebar-entity-list.component.html',
  styleUrls: ['./sidebar-entity-list.component.scss']
})
export class SidebarEntityListComponent {

  entities: Array<SidebarEntity> = [];

  constructor(
    private sidebarDataService: SidebarDataService,
  ) {

    this.sidebarDataService.entities$.subscribe(entities => {
      this.entities = entities
    })
  }
}
