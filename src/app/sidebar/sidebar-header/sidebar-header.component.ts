import { Component, OnInit } from '@angular/core'
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
  isPageCompressed = true

  constructor(
    private browserService: BrowserService,
    private sidebarDataService: SidebarDataService,
    private csvExporterService: CsvExporterService
  ) {
    this.imgSrc = this.browserService.getURL('assets/head-brains.png')
  }

  exportCSV() {
    const csvText = this.csvExporterService.leadmineToCSV(
      this.sidebarDataService.cards.map(sidebarEntity => sidebarEntity.entity)
    )

    if (csvText) {
      this.browserService.getActiveTab().then(tab => {
        const fileName =
          'aurac_sidebar_results_' + this.csvExporterService.sanitiseURL(tab.url!) + '.csv'
        this.csvExporterService.saveAsCSV(csvText, fileName)
      })
    }
  }

  clearCards() {
    this.sidebarDataService.setCards([])
  }

  compressedOrFloatingSidebar() {
    this.browserService
      .sendMessageToActiveTab({
        type: 'content_script_is_page_compressed',
        body: this.isPageCompressed
      })
      .then(result => {
        this.isPageCompressed = result
      })
  }
}
