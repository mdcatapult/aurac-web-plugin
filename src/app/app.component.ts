import { Component } from '@angular/core'
import { MatIconRegistry } from '@angular/material/icon'
import { DomSanitizer } from '@angular/platform-browser'

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  title = 'browser-plugin'

  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      `dna_icon`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/dna_icon.svg')
    )
    this.matIconRegistry.addSvgIcon(
      'left_arrow',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/left_arrow.svg')
    )
    this.matIconRegistry.addSvgIcon(
      'right_arrow',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/right_arrow.svg')
    )
    this.matIconRegistry.addSvgIcon(
      'save',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/save.svg')
    )
    this.matIconRegistry.addSvgIcon(
      'close',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/close.svg')
    )
  }
}
