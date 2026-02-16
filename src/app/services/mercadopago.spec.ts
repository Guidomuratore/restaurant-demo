import { TestBed } from '@angular/core/testing';

import { Mercadopago } from './mercadopago';

describe('Mercadopago', () => {
  let service: Mercadopago;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Mercadopago);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
