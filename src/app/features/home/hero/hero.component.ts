import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { RouterLink } from "@angular/router";
import { HeaderService } from '../../../core/services/header.service';

@Component({
  selector: 'app-hero-component',
  standalone: true,
  imports: [ButtonComponent, RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  private headerService = inject(HeaderService);

  ngOnInit(){
    this.headerService.setCreateButtonVisible(false);
  }
}
