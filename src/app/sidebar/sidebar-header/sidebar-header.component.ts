import { Component } from '@angular/core'
import { BrowserService } from 'src/app/browser.service'
import { SidebarDataService } from '../sidebar-data.service'
import { CsvExporterService } from '../../background/csv-exporter.service'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'
import { SettingsService } from '../../background/settings.service'

@Component({
  selector: 'app-sidebar-header',
  templateUrl: './sidebar-header.component.html',
  styleUrls: ['./sidebar-header.component.scss']
})
export class SidebarHeaderComponent {
  imgSrc = ''
  isPageCompressed = true
  totalHighlights?: number
  error?: string

  constructor(
    private browserService: BrowserService,
    private sidebarDataService: SidebarDataService,
    private csvExporterService: CsvExporterService,
    private settingsService: SettingsService
  ) {
    this.imgSrc = this.browserService.getURL('assets/head-brains.png')
    this.sidebarDataService.totalCountInfoObservable.subscribe(count => {
      this.totalHighlights = count
    })
  }

  exportCSV() {
    const recogniser = this.settingsService.preferences.recogniser
    const csvText = this.csvExporterService.entitiesToCSV(
      this.sidebarDataService.cards.map(sidebarEntity => sidebarEntity.entity),
      recogniser
    )

    if (csvText) {
      this.browserService.getActiveTab().then(tab => {
        const fileName =
          'aurac_sidebar_results_' +
          recogniser +
          '_' +
          this.csvExporterService.sanitiseURL(tab.url!) +
          '.csv'
        this.csvExporterService.saveAsCSV(csvText, fileName)
      })
    }
  }

  clearCards() {
    this.sidebarDataService.setCards([])
  }

  compressedOrFloatingSidebar($event: MatSlideToggleChange) {
    this.browserService
      .sendMessageToBackground({
        type: 'entity_messenger_service_is_page_compressed',
        body: $event.checked
      })
      .then(result => {
        this.isPageCompressed = result
      })
  }
}
