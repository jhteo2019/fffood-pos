import { Component, OnInit } from '@angular/core';
import { Api } from '../../services/api';
import { InventoryItem } from '../../models';

@Component({
  selector: 'app-inventory',
  standalone: false,
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {
  items: InventoryItem[] = [];
  filtered: InventoryItem[] = [];
  search = '';
  catFilter = 'all';
  stockFilter = 'all';

  editingId: string | null = null;
  adjustValue = '';
  adjustReason = 'delivery';

  categories: string[] = [];

  constructor(private api: Api) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.api.getInventory().subscribe({
      next: items => {
        this.items = items;
        this.categories = [...new Set(items.map(i => i.categoryName))];
        this.filterItems();
      },
      error: () => { this.items = []; this.filtered = []; }
    });
  }

  filterItems() {
    let result = [...this.items];
    const q = this.search.trim().toLowerCase();
    if (q) result = result.filter(i => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    if (this.catFilter !== 'all') result = result.filter(i => i.categoryName === this.catFilter);
    if (this.stockFilter === 'low')  result = result.filter(i => i.stock > 0 && i.stock <= 5);
    if (this.stockFilter === 'out')  result = result.filter(i => i.stock === 0);
    this.filtered = result;
  }

  setStockFilter(f: string) {
    this.stockFilter = f;
    this.filterItems();
  }

  quickAdjust(id: string, delta: number) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    const newStock = Math.max(0, item.stock + delta);
    const reason = delta >= 0 ? 'delivery' : 'waste';
    this.api.adjustStock(id, { qty: Math.abs(delta), reason }).subscribe({
      next: () => {
        item.stock = newStock;
        this.filterItems();
      }
    });
  }

  openAdjust(id: string) {
    this.editingId = id;
    this.adjustValue = '';
    this.adjustReason = 'delivery';
  }

  closeAdjust() {
    this.editingId = null;
    this.adjustValue = '';
  }

  applyAdjust(id: string) {
    const qty = parseInt(this.adjustValue, 10);
    if (isNaN(qty)) return;
    this.api.adjustStock(id, { qty, reason: this.adjustReason }).subscribe({
      next: (res: any) => {
        const item = this.items.find(i => i.id === id);
        if (item) item.stock = res.stock ?? Math.max(0, item.stock + qty);
        this.filterItems();
        this.editingId = null;
        this.adjustValue = '';
      }
    });
  }

  get totalSku(): number { return this.items.length; }
  get totalLow(): number { return this.items.filter(i => i.stock > 0 && i.stock <= 5).length; }
  get totalOut(): number { return this.items.filter(i => i.stock === 0).length; }
  get totalValue(): number { return this.items.reduce((s, i) => s + i.price * i.stock, 0); }

  stockHealth(stock: number): number {
    if (stock === 0) return 0;
    if (stock <= 5) return 25;
    if (stock <= 15) return 60;
    return 100;
  }

  stockColor(stock: number): string {
    if (stock === 0) return '#e55a3a';
    if (stock <= 5) return '#e6b800';
    return '#7a8c5c';
  }

  getPreviewStock(id: string): number {
    const item = this.items.find(i => i.id === id);
    if (!item) return 0;
    const delta = parseInt(this.adjustValue, 10) || 0;
    return Math.max(0, item.stock + delta);
  }
}
