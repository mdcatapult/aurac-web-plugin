import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {SettingsComponent} from "./settings.component";
import {DictionaryURLs} from "../../types";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should do a thing?', () => {

    const invalidUrls: DictionaryURLs = {
      leadmineURL: "",
      compoundConverterURL: "",
      unichemURL: "",
    }

    expect(component.validURLs(invalidUrls)).toBeFalse()

  });
});
