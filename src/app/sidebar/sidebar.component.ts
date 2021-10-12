import { Component, OnInit } from '@angular/core';
import { BrowserService } from '../browser.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(private browserService: BrowserService) { }

  ngOnInit(): void {
    this.browserService.addListener((msg) => {
      console.log(msg.type)
      this.browserService.sendMessage('log', {msg: "Hello, World!"})
      // this.browserService.sendMessageToActiveTab({type: 'log', body: "Hello, World!"})
    })
  }

}
