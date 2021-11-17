import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core'
import { BrowserService } from '../browser.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  constructor(private browserService: BrowserService) {

  }

  ngOnInit(): void {
    this.browserService.sendMessageToActiveTab({ type: 'content_script_set_sidebar_ready' })
  }
}
