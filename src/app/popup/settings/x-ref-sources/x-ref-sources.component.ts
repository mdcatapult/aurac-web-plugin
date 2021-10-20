import {HttpClient} from '@angular/common/http';
import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Settings} from 'src/types'
import { BrowserService } from '../../../browser.service';
import {LogService} from '../../log.service';


@Component({
  selector: 'app-x-ref-sources',
  templateUrl: './x-ref-sources.component.html',
  styleUrls: ['./x-ref-sources.component.scss']
})
export class XRefSourcesComponent implements OnInit {

  @Input() sourcesForm?: FormGroup
  @Input() xRefSources: {[key: string]: boolean} = {}
  @Input() unichemURL = ''

  loadedSources = false
  // private defaultCheckbox = true

  constructor() { }

  ngOnInit() {
    this.loadedSources = true;
  }

  // // We refresh changes so that we get new data if the unichemURL changes
  // ngOnChanges(): void {
  //   this.refresh()
  // }

  // private refresh(): void {
  //   this.client.get<string[]>(`${this.unichemURL}/sources`).subscribe(sources => {
  //     sources.forEach(source => {
  //       const initialValue = this.xRefSources[source] !== undefined ? this.xRefSources[source] : this.defaultCheckbox
  //       this.sourcesForm!.addControl(source, new FormControl(initialValue))
  //     })
  //     this.loadedSources = true
  //   }, (err) => this.log.Error(`error retrieving sources: ${JSON.stringify(err)}`))
  // }
}
