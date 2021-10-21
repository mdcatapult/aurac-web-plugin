import {HttpClient} from '@angular/common/http';
import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Settings} from 'src/types'
import { BrowserService } from '../../../browser.service';
import {Logger} from '../../../logger';


@Component({
  selector: 'app-x-ref-sources',
  templateUrl: './x-ref-sources.component.html',
  styleUrls: ['./x-ref-sources.component.scss']
})
export class XRefSourcesComponent implements OnChanges {

  @Input() sourcesForm?: FormGroup
  @Input() xRefSources: {[key: string]: boolean} = {}

  constructor() { }

  ngOnChanges() {
    this.sourcesForm!.controls = {}
    Object.entries(this.xRefSources).map(([key,value]) => {
      this.sourcesForm!.addControl(key, new FormControl(value));
    })
  }

  hasXRefs(): boolean {
    return Object.keys(this.xRefSources).length > 0
  }
}
