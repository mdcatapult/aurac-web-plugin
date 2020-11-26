import { Component, OnInit } from '@angular/core';
import { LogService } from './log.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  constructor(private log: LogService) { }

  ngOnInit(): void {
  }

  nerCurrentPage() {
    this.log.Log('Sending message to background page...');
    browser.runtime.sendMessage({type: 'ner_current_page'})
      .catch(e => this.log.Error(`Couldn't send message to background page: ${e}`));
  }
}
