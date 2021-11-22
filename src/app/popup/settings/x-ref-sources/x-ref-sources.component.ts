import { Component, Input, OnChanges } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'

@Component({
  selector: 'app-x-ref-sources',
  templateUrl: './x-ref-sources.component.html',
  styleUrls: ['./x-ref-sources.component.scss']
})
export class XRefSourcesComponent implements OnChanges {
  @Input() sourcesForm: FormGroup = new FormGroup({})
  @Input() xRefSources: { [key: string]: boolean } = {}

  constructor() {}

  ngOnChanges() {
    if (!this.xRefSources) return
    this.sourcesForm.controls = {}
    Object.entries(this.xRefSources).map(([key, value]) => {
      this.sourcesForm.addControl(key, new FormControl(value))
    })
  }

  hasXRefs(): boolean {
    return this.xRefSources && Object.keys(this.xRefSources).length > 0
  }
}
