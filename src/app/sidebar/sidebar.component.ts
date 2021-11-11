import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { BrowserService } from '../browser.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  constructor(private browserService: BrowserService, private changeDetector: ChangeDetectorRef) {
    // TODO: Investigate why angular is not detecting changes and remove this awful hack.
    this.changeDetector.detach()
    setInterval(() => {
      this.changeDetector.detectChanges()
    }, 50)
  }

  ngOnInit(): void {
    this.browserService.sendMessageToActiveTab({ type: 'content_script_set_sidebar_ready' })
  }
}
