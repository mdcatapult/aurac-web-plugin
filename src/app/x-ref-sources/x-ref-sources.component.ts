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
  loadedSources = false

  constructor(private client: HttpClient, private log: LogService) {
  }

  ngOnInit(): void {

    const unichemURL = (<Settings>JSON.parse(window.localStorage.getItem('settings')!)).urls.unichemURL
    this.client.get<string[]>(`${unichemURL}/sources`).subscribe(sources => {
      sources.forEach(source => {
        this.sourcesForm!.addControl(source, new FormControl(false))
      })
      this.loadedSources = true
    }, (err) => this.log.Error(`error retrieving sources: ${err}`))

  }

}
