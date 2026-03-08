// core/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast = signal<{ message: string; visible: boolean } | null>(null);

  async show(message: string): Promise<void> {
    this.toast.set({ message, visible: false });
    await new Promise(resolve => setTimeout(resolve, 50));
    const current = this.toast();
    
    if (current) this.toast.set({ ...current, visible: true });
    await new Promise(resolve => setTimeout(resolve, 2500));
    this.hideInternal();
    await new Promise(resolve => setTimeout(resolve, 600));
    this.toast.set(null);
  }

  hide() {
    this.hideInternal();
  }

  private hideInternal() {
    const current = this.toast();
    if (current) {
      this.toast.set({ ...current, visible: false });
    }
  }
}