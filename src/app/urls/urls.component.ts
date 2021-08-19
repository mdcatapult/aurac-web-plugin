import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {DictionaryURLKeys} from '../../types';
import {LogService} from '../popup/log.service';

@Component({
  selector: 'app-urls',
  templateUrl: './urls.component.html',
  styleUrls: ['./urls.component.scss']
})
export class UrlsComponent {

  @Input() urlsForm?: FormGroup;

  readonly urlKeys = DictionaryURLKeys;

  constructor(private log: LogService) {
  }

  getBorderColor(formName: string): object {
    let colour = 'gray';
    if (!this.urlsForm!.get(formName)!.valid) {
      colour = 'red';
    }
    return {'border-color': colour};
  }


}
