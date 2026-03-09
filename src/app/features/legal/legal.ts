import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderService } from '../../core/services/header.service';

@Component({
  selector: 'app-legal',
  imports: [CommonModule],
  templateUrl: './legal.html',
  styleUrl: './legal.scss',
})
export class LegalComponent implements OnInit {
  private headerService = inject(HeaderService);

  ngOnInit() {
    this.headerService.setCreateButtonVisible(false)
  }
}
