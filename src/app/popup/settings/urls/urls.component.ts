import { Component, Input } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { APIURLs } from '../../../../types/settings'

@Component({
  selector: 'app-urls',
  templateUrl: './urls.component.html',
  styleUrls: ['./urls.component.scss']
})
export class UrlsComponent {
  @Input() urlsForm?: FormGroup

  // The values associated with these keys MUST EQUAL the form group names
  // defined in the parent settings component. We should move the urls form
  // down into this component to remove this complexity.
  readonly urlKeys: APIURLs = {
    nerURL: 'nerURL',
    compoundConverterURL: 'compoundConverterURL',
    unichemURL: 'unichemURL',
    pdfConverterURL: 'pdfConverterURL'
  }
}
