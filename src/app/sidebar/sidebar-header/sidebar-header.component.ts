import { Component, OnInit } from '@angular/core';
import { BrowserService } from 'src/app/browser.service';
import { SidebarDataService } from '../sidebar-data.service';

@Component({
  selector: 'app-sidebar-header',
  templateUrl: './sidebar-header.component.html',
  styleUrls: ['./sidebar-header.component.scss']
})
export class SidebarHeaderComponent implements OnInit {

  imgSrc = "";
  constructor(private browserService: BrowserService, private sidebarDataService: SidebarDataService) {
    this.imgSrc = this.browserService.getURL("assets/head-brains.icon.128.png")
  }

  ngOnInit(): void {
  }

  exportCSV() {
    alert("not yet implemented")
  }

  closeSidebar() {
    this.browserService.sendMessageToActiveTab({type: 'content_script_close_sidebar'})
  }

  clearCards() {
    this.sidebarDataService.entities = []
  }

}
