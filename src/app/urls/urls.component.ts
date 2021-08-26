import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {DictionaryURLKeys} from '../../types';


@Component({
  selector: 'app-urls',
  templateUrl: './urls.component.html',
  styleUrls: ['./urls.component.scss']
})
export class UrlsComponent {

  @Input() urlsForm?: FormGroup

  readonly urlKeys = DictionaryURLKeys;

  getBorderColor(formName: string): object {
    let colour = 'blue';
    if (!this.urlsForm!.get(formName)!.valid) {
      colour = 'red';
    }
    return {'border-color': colour};
  }

}
