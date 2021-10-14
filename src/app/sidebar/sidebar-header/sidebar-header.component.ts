import { Component, OnInit } from '@angular/core';
import { BrowserService } from 'src/app/browser.service';

@Component({
  selector: 'app-sidebar-header',
  templateUrl: './sidebar-header.component.html',
  styleUrls: ['./sidebar-header.component.scss']
})
export class SidebarHeaderComponent implements OnInit {

  imgSrc = "";
  constructor(private browserService: BrowserService) {
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

}
