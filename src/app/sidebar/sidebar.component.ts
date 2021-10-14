import { Component, OnInit } from '@angular/core';
import { BrowserService } from '../browser.service';
import { SidebarEntity } from './types';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  entities: Array<SidebarEntity> = [
    {
      identifiers: [
        {
          type: "inchikey",
          value: "RDHQFKQIGNGIED-MRVPVSSYSA-N"
        }
      ],
      synonyms: [
        "Acetylcarnitine",
        "Acetyl-L-carnitine"
      ],
      occurrences: ["RDHQFKQIGNGIED-MRVPVSSYSA-N#0", "RDHQFKQIGNGIED-MRVPVSSYSA-N#1"],
    }
  ]

  constructor(private browserService: BrowserService) { }

  ngOnInit(): void {
    this.browserService.addListener((msg) => {
      console.log(msg.type)
      this.browserService.sendMessage('log', {msg: "Hello, World!"})
      // this.browserService.sendMessageToActiveTab({type: 'log', body: "Hello, World!"})
    })
  }

}
