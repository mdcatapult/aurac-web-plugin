import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BrowserService } from '../browser.service';
import { SidebarEntity } from './types';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  entities: Array<SidebarEntity> = []

  constructor(private browserService: BrowserService, private changeDetector: ChangeDetectorRef) {
    this.browserService.addListener((msg: any) => {
      switch (msg.type) {
        case 'sidebar_component_set_entities':
          console.log(msg.body)
          this.setEntities(msg.body as SidebarEntity[]);
      }
    })
  }

  ngOnInit(): void {
    console.log("notifying sidebar readiness")
    this.browserService.sendMessageToActiveTab({ type: 'content_script_set_sidebar_ready' })
  }

  private setEntities(entities: SidebarEntity[]): void {
    this.entities = entities
    this.changeDetector.detectChanges()
  }
}
