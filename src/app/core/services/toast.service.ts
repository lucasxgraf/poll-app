import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast = signal<{ message: string; visible: boolean } | null>(null);

  private readonly ENTRANCE_ANIMATION_DELAY = 50;
  private readonly DISPLAY_DURATION = 2000;
  private readonly EXIT_ANIMATION_DELAY = 1600;

  async show(message: string): Promise<void> {
    this.initializeToast(message);
    
    await this.triggerEntranceAnimation();
    await this.waitAndHide();
    
    this.scheduleFinalCleanup();
  }

  hide(): void {
    this.updateVisibility(false);
    this.scheduleFinalCleanup();
  }

  private initializeToast(message: string): void {
    this.toast.set({ message, visible: false });
  }

  private async triggerEntranceAnimation(): Promise<void> {
    await this.delay(this.ENTRANCE_ANIMATION_DELAY);
    this.updateVisibility(true);
  }

  private async waitAndHide(): Promise<void> {
    await this.delay(this.DISPLAY_DURATION);
    this.updateVisibility(false);
  }

  private updateVisibility(visible: boolean): void {
    const current = this.toast();
    if (current) {
      this.toast.set({ ...current, visible });
    }
  }

  private scheduleFinalCleanup(): void {
    setTimeout(() => this.toast.set(null), this.EXIT_ANIMATION_DELAY);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}