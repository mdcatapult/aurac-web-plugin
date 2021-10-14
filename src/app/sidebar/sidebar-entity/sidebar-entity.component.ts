import { Component, Input, OnInit } from '@angular/core';
import { SidebarEntity } from '../types';

@Component({
  selector: 'app-sidebar-entity',
  templateUrl: './sidebar-entity.component.html',
  styleUrls: ['./sidebar-entity.component.scss']
})
export class SidebarEntityComponent implements OnInit {

  @Input() entity: SidebarEntity = {
    identifiers: [],
    synonyms: [],
    occurrences: []
  };
  constructor() { }

  ngOnInit(): void {
  }

}
