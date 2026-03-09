import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HeaderService {
  showCreateButton = signal(true);
  
  setCreateButtonVisible(visible: boolean) {
    this.showCreateButton.set(visible);
  }
}
