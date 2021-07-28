import {HttpClient} from '@angular/common/http';
import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Settings} from 'src/types'
import {LogService} from '../popup/log.service';


@Component({
  selector: 'app-x-ref-sources',
  templateUrl: './x-ref-sources.component.html',
  styleUrls: ['./x-ref-sources.component.scss']
})
export class XRefSourcesComponent implements OnInit {

  @Input() sourcesForm?: FormGroup
  @Input() settings: {[key: string]: boolean} = {}
  loadedSources = false

  constructor(private client: HttpClient, private log: LogService) {
  }

  ngOnInit(): void {

    const storedSettings = window.localStorage.getItem('settings')
    if (!storedSettings) {
      return
    }
    const unichemURL = (<Settings>JSON.parse(storedSettings)).urls.unichemURL
    this.client.get<string[]>(`${unichemURL}/sources`).subscribe(sources => {
      sources.forEach(source => {
        const initialValue = this.settings[source] || false
        this.sourcesForm!.addControl(source, new FormControl(initialValue))
      })
      this.loadedSources = true
    }, (err) => this.log.Error(`error retrieving sources: ${JSON.stringify(err)}`))
  }

}
