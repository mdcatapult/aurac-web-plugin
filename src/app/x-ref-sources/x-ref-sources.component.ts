import {HttpClient} from '@angular/common/http';
import {Component, Input, OnChanges} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Settings} from 'src/types'
import {LogService} from '../popup/log.service';


@Component({
  selector: 'app-x-ref-sources',
  templateUrl: './x-ref-sources.component.html',
  styleUrls: ['./x-ref-sources.component.scss']
})
export class XRefSourcesComponent implements OnChanges {

  @Input() sourcesForm?: FormGroup
  @Input() settings: {[key: string]: boolean} = {}
  @Input() unichemURL = ""

  loadedSources = false

  constructor(private client: HttpClient, private log: LogService) {
  }

  ngOnChanges(): void {
    const storedSettings = window.localStorage.getItem('settings')
    if (!storedSettings) {
      return
    }
    this.client.get<string[]>(`${this.unichemURL}/sources`).subscribe(sources => {
      sources.forEach(source => {
        const initialValue = this.settings[source] || true
        this.sourcesForm!.addControl(source, new FormControl(initialValue))
      })
      this.loadedSources = true
    }, (err) => this.log.Error(`error retrieving sources: ${JSON.stringify(err)}`))
  }

}
