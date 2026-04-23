import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartLine, CartModifier } from '../models';

@Injectable({ providedIn: 'root' })
export class Cart {
  private _lines = new BehaviorSubject<CartLine[]>([]);
  lines$ = this._lines.asObservable();

  get lines() { return this._lines.value; }

  add(itemId: string, itemName: string, modifiers: CartModifier[], qty: number, note: string, unitPrice: number) {
    const lineTotal = unitPrice * qty;
    const lineId = `L${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    this._lines.next([...this.lines, { lineId, itemId, itemName, modifiers, qty, note, unitPrice, lineTotal }]);
  }

  updateQty(lineId: string, delta: number) {
    const updated = this.lines.map(l => {
      if (l.lineId !== lineId) return l;
      const qty = Math.max(0, l.qty + delta);
      if (qty === 0) return null;
      return { ...l, qty, lineTotal: l.unitPrice * qty };
    }).filter((l): l is CartLine => l !== null);
    this._lines.next(updated);
  }

  remove(lineId: string) {
    this._lines.next(this.lines.filter(l => l.lineId !== lineId));
  }

  clear() { this._lines.next([]); }

  get subtotal() { return this.lines.reduce((s, l) => s + l.lineTotal, 0); }
  total(taxRate: number, discount = 0) { return Math.max(0, this.subtotal + this.subtotal * taxRate - discount); }
}
