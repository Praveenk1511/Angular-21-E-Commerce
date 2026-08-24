import { PricePipe } from './price.pipe';

describe('PricePipe', () => {
  let pipe: PricePipe;

  beforeEach(() => {
    pipe = new PricePipe();
  });

  it('should format minor units to currency string', () => {
    expect(pipe.transform(2499, 'GBP')).toBe('£24.99');
    expect(pipe.transform(0, 'GBP')).toBe('£0.00');
    expect(pipe.transform(5000, 'GBP')).toBe('£50.00');
  });

  it('should return empty string for null or undefined value', () => {
    expect(pipe.transform(null as unknown as number, 'GBP')).toBe('');
    expect(pipe.transform(undefined as unknown as number, 'GBP')).toBe('');
  });
});
