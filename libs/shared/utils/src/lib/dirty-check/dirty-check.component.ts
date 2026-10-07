import { Component, DoCheck, signal } from '@angular/core';

/** Counts how often its host view is checked. Use `<dirty-check />` in a template. */
@Component({
  selector: 'dirty-check',
  template: ` <code class="dirty-checks">({{ checked() }})</code> `,
  styles: [
    `
      :host {
        display: inline-block;
        border-radius: 100%;
        border: 2px solid var(--palette-secondary-main);
        padding: 1rem;
        font-size: var(--text-lg);
      }
    `,
  ],
})
export class DirtyCheckComponent implements DoCheck {
  checked = signal(0);

  ngDoCheck() {
    this.checked.update((c) => c + 1);
  }
}
