import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LeadminerResult } from 'src/types';
import { BrowserService } from '../browser.service';

@Injectable({
  providedIn: 'root'
})
export class NerService {

  constructor(
    private httpClient: HttpClient, 
    private browserService: BrowserService
    ) {
    this.browserService.addListener((msg) => {
      switch (msg.type) {
        case 'ner_service_process_current_page':
          this.processCurrentPage()
      }
    })
  }

  private processCurrentPage(): void {
    this.getPageContents().then(this.callLeadmine).then()
  }

  private getPageContents(): Promise<string> {
    return this.browserService.sendMessage('content_script_get_page_contents')
  }

  private callLeadmine(body: string): Promise<LeadminerResult> {
    return this.httpClient.post<LeadminerResult>("", body).toPromise()
  }
}
