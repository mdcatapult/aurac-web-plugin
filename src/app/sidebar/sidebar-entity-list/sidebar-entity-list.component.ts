import { Component, Input, OnInit } from '@angular/core';
import { SidebarEntity } from '../types';
@Component({
  selector: 'app-sidebar-entity-list',
  templateUrl: './sidebar-entity-list.component.html',
  styleUrls: ['./sidebar-entity-list.component.scss']
})
export class SidebarEntityListComponent implements OnInit {

  @Input() entities: Array<SidebarEntity> = [];
  constructor() { }

  ngOnInit(): void {
  }

}
