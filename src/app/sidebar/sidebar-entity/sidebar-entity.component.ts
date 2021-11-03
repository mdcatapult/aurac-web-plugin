import { Identifiers } from '@angular/compiler/src/render3/r3_identifiers';
import { Component, Input, OnInit } from '@angular/core';
import { Identifier, SidebarEntity } from '../types';

@Component({
  selector: 'app-sidebar-entity',
  templateUrl: './sidebar-entity.component.html',
  styleUrls: ['./sidebar-entity.component.scss']
})
export class SidebarEntityComponent implements OnInit {


  @Input() entity: SidebarEntity = {} as SidebarEntity
  constructor() { }

  ngOnInit(): void {
  }

  filterIdentifiers(arr: Identifier[]): Identifier[] {
    return arr.filter(v => v.value)
  } 

}
