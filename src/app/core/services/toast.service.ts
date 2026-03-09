import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast = signal<{ message: string; visible: boolean } | null>(null);

  async show(message: string): Promise<void> {
    this.toast.set({ message, visible: false });
    await new Promise(resolve => setTimeout(resolve, 50));
    const current = this.toast();
    if (current) this.toast.set({ ...current, visible: true });
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.hideInternal();
    return new Promise(resolve => {
      resolve();
      setTimeout(() => {
        this.toast.set(null);
      }, 1600); 
    });
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