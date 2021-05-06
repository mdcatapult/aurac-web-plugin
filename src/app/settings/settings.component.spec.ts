import { SettingsComponent } from './settings.component';
import {TestBrowserService} from '../test-browser.service';
import {LogService} from '../popup/log.service';
describe('SettingsComponent', () => {
  const component =  new SettingsComponent(new LogService(), new TestBrowserService(new LogService()));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
