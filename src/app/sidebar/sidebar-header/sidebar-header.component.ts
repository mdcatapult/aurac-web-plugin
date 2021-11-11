import { Component } from '@angular/core'
import { BrowserService } from 'src/app/browser.service'
import { SidebarDataService } from '../sidebar-data.service'
import { CsvExporterService } from '../../background/csv-exporter.service'

@Component({
  selector: 'app-sidebar-header',
  templateUrl: './sidebar-header.component.html',
  styleUrls: ['./sidebar-header.component.scss']
})
export class SidebarHeaderComponent {
  imgSrc = ''
  constructor(
    private browserService: BrowserService,
    private sidebarDataService: SidebarDataService,
    private csvExporterService: CsvExporterService
  ) {
    this.imgSrc = this.browserService.getURL('assets/head-brains.icon.128.png')
  }

  exportCSV() {
    const csvText = this.csvExporterService.leadmineToCSV(
      this.sidebarDataService.cards.map(sidebarEntity => sidebarEntity.entity)
    )
    this.browserService.getActiveTab().then(tab => {
      this.csvExporterService.saveAsCSV(csvText, tab.url!, 'aurac_sidebar_results_')
    })
  }

  closeSidebar() {
    this.browserService.sendMessageToActiveTab({ type: 'content_script_close_sidebar' })
  }

  clearCards() {
    this.sidebarDataService.setCards([])
  }
}
