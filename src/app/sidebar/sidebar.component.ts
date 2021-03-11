import { Component, OnInit } from '@angular/core';
import { Message } from 'src/types';
import { LogService } from '../popup/log.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {

  constructor(private log: LogService) { }

  ngOnInit(): void {
  }
}
