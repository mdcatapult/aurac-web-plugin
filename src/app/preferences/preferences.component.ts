import {Component, Input, OnChanges} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnChanges {

  @Input() preferencesForm?: FormGroup;

  constructor() {}

  ngOnChanges(): void {}

}
