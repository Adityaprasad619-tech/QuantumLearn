// src/quantum/complex.ts
import { ComplexNumber } from '../types';

export class Complex implements ComplexNumber {
  re: number;
  im: number;

  constructor(re: number = 0, im: number = 0) {
    this.re = Math.abs(re) < 1e-12 ? 0 : re;
    this.im = Math.abs(im) < 1e-12 ? 0 : im;
  }

  static zero(): Complex {
    return new Complex(0, 0);
  }

  static one(): Complex {
    return new Complex(1, 0);
  }

  static i(): Complex {
    return new Complex(0, 1);
  }

  static fromPolar(r: number, theta: number): Complex {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
  }

  static exp(theta: number): Complex {
    return new Complex(Math.cos(theta), Math.sin(theta));
  }

  add(other: ComplexNumber): Complex {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other: ComplexNumber): Complex {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other: ComplexNumber): Complex {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  scale(factor: number): Complex {
    return new Complex(this.re * factor, this.im * factor);
  }

  div(other: ComplexNumber): Complex {
    const denom = other.re * other.re + other.im * other.im;
    if (denom === 0) throw new Error('Division by zero complex number');
    return new Complex(
      (this.re * other.re + this.im * other.im) / denom,
      (this.im * other.re - this.re * other.im) / denom
    );
  }

  conj(): Complex {
    return new Complex(this.re, -this.im);
  }

  absSq(): number {
    return this.re * this.re + this.im * this.im;
  }

  abs(): number {
    return Math.sqrt(this.absSq());
  }

  arg(): number {
    return Math.atan2(this.im, this.re);
  }

  equals(other: ComplexNumber, tolerance: number = 1e-6): boolean {
    return (
      Math.abs(this.re - other.re) <= tolerance &&
      Math.abs(this.im - other.im) <= tolerance
    );
  }

  format(precision: number = 3): string {
    const r = this.re.toFixed(precision);
    const i = Math.abs(this.im).toFixed(precision);
    const reZero = Math.abs(this.re) < 1e-4;
    const imZero = Math.abs(this.im) < 1e-4;

    if (reZero && imZero) return '0';
    if (imZero) return `${r}`;
    if (reZero) {
      if (Math.abs(this.im - 1) < 1e-4) return 'i';
      if (Math.abs(this.im + 1) < 1e-4) return '-i';
      return `${this.im < 0 ? '-' : ''}${i}i`;
    }

    const sign = this.im < 0 ? '-' : '+';
    const imPart = Math.abs(this.im - 1) < 1e-4 ? 'i' : `${i}i`;
    return `${r} ${sign} ${imPart}`;
  }

  formatExact(): string {
    const invSqrt2 = 1 / Math.SQRT2;
    const eps = 1e-4;
    if (Math.abs(this.re - invSqrt2) < eps && Math.abs(this.im) < eps) return '1/√2';
    if (Math.abs(this.re + invSqrt2) < eps && Math.abs(this.im) < eps) return '-1/√2';
    if (Math.abs(this.im - invSqrt2) < eps && Math.abs(this.re) < eps) return 'i/√2';
    if (Math.abs(this.im + invSqrt2) < eps && Math.abs(this.re) < eps) return '-i/√2';
    if (Math.abs(this.re - 0.5) < eps && Math.abs(this.im) < eps) return '1/2';
    if (Math.abs(this.re + 0.5) < eps && Math.abs(this.im) < eps) return '-1/2';
    return this.format(3);
  }
}
