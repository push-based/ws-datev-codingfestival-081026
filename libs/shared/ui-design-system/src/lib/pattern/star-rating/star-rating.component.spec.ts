import { TestBed } from '@angular/core/testing';

import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
  function render(rating?: number) {
    const fixture = TestBed.createComponent(StarRatingComponent);
    fixture.componentRef.setInput('rating', rating);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders full, half and empty stars for a rating', () => {
    const el = render(7.2);
    expect(el.querySelectorAll('.star')).toHaveLength(5);
    expect(el.querySelectorAll('.star-half')).toHaveLength(1);
    expect(el.querySelectorAll('.star-empty')).toHaveLength(1);
  });

  it('shows the rating in the tooltip', () => {
    expect(render(7).querySelector('.tooltip')?.textContent?.trim()).toBe(
      '7 average rating',
    );
  });

  it('treats a missing rating as 0', () => {
    expect(render(undefined).querySelectorAll('.star-empty')).toHaveLength(5);
  });
});
