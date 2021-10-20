import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import { DictionaryPath } from '../../../../types';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {

  minEntityLength = [...Array(50).keys()].slice(2)
  isLoaded = false;
  dictionaries: DictionaryPath[] = ['proteins', 'chemical-entities', 'diseases']

  @Input() preferencesForm?: FormGroup;

  constructor() {}

  ngOnInit(): void {
    this.isLoaded = true;
  }
}

