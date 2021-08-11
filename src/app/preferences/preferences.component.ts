import {Component, Input, OnChanges} from '@angular/core';
import {FormGroup, FormArray, FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnChanges {

  @Input() preferencesForm?: FormGroup

  WordLengthLimit: Array<object> = [
    {name: '2 characters', value: 2},
    {name: '3 characters', value: 3}
  ]

  constructor() { }

  ngOnChanges(): void {
  }

}
