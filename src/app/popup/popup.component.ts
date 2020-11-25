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
    this.log.Info("Trying to get page...")
    browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT}).then(tabs => {
      const tabId = tabs[0].id;
      browser.tabs.sendMessage(tabId, {type: 'run_leadmine', tabId})
      .then(result => {
        this.log.Info(result);
      });
    });
  }

}
