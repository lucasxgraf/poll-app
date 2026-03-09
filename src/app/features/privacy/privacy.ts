import { Component, inject, OnInit } from '@angular/core';
import { HeaderService } from '../../core/services/header.service';

@Component({
  selector: 'app-privacy',
  imports: [],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export class PrivacyComponent implements OnInit {
  private headerService = inject(HeaderService);

  ngOnInit() {
    this.headerService.setCreateButtonVisible(false)
  }
}
