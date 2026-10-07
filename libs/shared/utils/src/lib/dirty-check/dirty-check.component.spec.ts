import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DirtyCheckComponent } from './dirty-check.component';

@Component({
  template: `{{ value() }} <dirty-check />`,
  imports: [DirtyCheckComponent],
})
class HostComponent {
  value = signal(0);
}

describe('DirtyCheckComponent', () => {
  it('counts every check of its host', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.componentInstance.value.set(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('code').textContent).toBe('(2)');
  });
});
