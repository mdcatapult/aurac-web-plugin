import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-router',
  templateUrl: './router.component.html'
})
export class RouterComponent implements OnInit {
  isBackground = false
  isPopup = false
  isSidebar = false
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(m => {
      const page = m.get('page')
      this.isBackground = page === 'background'
      this.isPopup = page === 'popup'
      this.isSidebar = page === 'sidebar'
    })
  }
}
