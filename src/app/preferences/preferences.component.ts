import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {

  isLoaded = false;
  @Input() preferencesForm?: FormGroup;

  constructor() {}

  ngOnInit(): void {
    this.isLoaded = true;
  }

}

