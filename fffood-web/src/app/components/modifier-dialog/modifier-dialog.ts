import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MenuItem, CartModifier } from '../../models';

@Component({
  selector: 'app-modifier-dialog',
  standalone: false,
  templateUrl: './modifier-dialog.html',
  styleUrl: './modifier-dialog.css',
})
export class ModifierDialog implements OnChanges {
  @Input() item: MenuItem | null = null;
  @Output() confirm = new EventEmitter<{ modifiers: CartModifier[]; qty: number; note: string; unitPrice: number; lineTotal: number }>();
  @Output() close = new EventEmitter<void>();

  selected: Record<string, string[]> = {};
  qty = 1;
  note = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['item'] && this.item) {
      this.selected = {};
      this.qty = 1;
      this.note = '';
      for (const g of this.item.modifiers) {
        this.selected[g.id] = [];
      }
    }
  }

  toggle(groupId: string, optId: string, isMulti: boolean) {
    if (!this.selected[groupId]) this.selected[groupId] = [];
    const arr = this.selected[groupId];
    const idx = arr.indexOf(optId);
    if (isMulti) {
      idx === -1 ? arr.push(optId) : arr.splice(idx, 1);
    } else {
      this.selected[groupId] = idx === -1 ? [optId] : [];
    }
  }

  isSelected(groupId: string, optId: string): boolean {
    return (this.selected[groupId] ?? []).includes(optId);
  }

  get chosenMods(): CartModifier[] {
    if (!this.item) return [];
    const mods: CartModifier[] = [];
    for (const g of this.item.modifiers) {
      for (const optId of (this.selected[g.id] ?? [])) {
        const opt = g.options.find(o => o.id === optId);
        if (opt) mods.push({ id: opt.id, name: opt.name, price: opt.price });
      }
    }
    return mods;
  }

  get canConfirm(): boolean {
    if (!this.item) return false;
    for (const g of this.item.modifiers) {
      if (g.isRequired && (this.selected[g.id] ?? []).length === 0) return false;
    }
    return true;
  }

  get unitPrice(): number {
    if (!this.item) return 0;
    return this.item.price + this.chosenMods.reduce((s, m) => s + m.price, 0);
  }

  get lineTotal(): number {
    return this.unitPrice * this.qty;
  }

  changeQty(delta: number) {
    this.qty = Math.max(1, this.qty + delta);
  }

  onConfirm() {
    if (!this.canConfirm) return;
    this.confirm.emit({
      modifiers: this.chosenMods,
      qty:       this.qty,
      note:      this.note,
      unitPrice: this.unitPrice,
      lineTotal: this.lineTotal,
    });
  }

  onClose() {
    this.close.emit();
  }
}
