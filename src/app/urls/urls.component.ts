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

}
