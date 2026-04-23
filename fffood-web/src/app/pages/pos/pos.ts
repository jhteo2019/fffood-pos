import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Api } from '../../services/api';
import { Cart } from '../../services/cart';
import { Auth } from '../../services/auth';
import { Category, MenuItem, CartLine, CartModifier } from '../../models';

@Component({
  selector: 'app-pos',
  standalone: false,
  templateUrl: './pos.html',
  styleUrl: './pos.css',
})
export class Pos implements OnInit, OnDestroy {
  categories: Category[] = [];
  items: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  activeCat = '';
  search = '';

  orderMeta = {
    number: 'ORD-' + String(Math.floor(Math.random() * 9000) + 1000),
    date: new Date(),
    type: 'dine-in',
    table: 7,
    guests: 2,
    discount: 0,
    server: '',
  };

  taxRate = 0.1;
  modifierItem: MenuItem | null = null;
  cartOpen = false;

  lines: CartLine[] = [];
  private linesSub!: Subscription;

  constructor(
    private api: Api,
    public cart: Cart,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.auth.user;
    if (user) this.orderMeta.server = user.name;

    this.linesSub = this.cart.lines$.subscribe(l => (this.lines = l));

    const mockCategories: Category[] = [
      { id: 'signatures', name: 'Signatures', sortOrder: 0 },
      { id: 'starters',   name: 'Starters',   sortOrder: 1 },
      { id: 'mains',      name: 'Mains',       sortOrder: 2 },
      { id: 'desserts',   name: 'Desserts',    sortOrder: 3 },
      { id: 'drinks',     name: 'Drinks',      sortOrder: 4 },
    ];

    const mockItems: MenuItem[] = [
      { id: 'I001', name: 'Croque Madame',      categoryId: 'signatures', categoryName: 'Signatures', price: 18.50, stock: 20, tags: ['popular'], isActive: true, modifiers: [] },
      { id: 'I002', name: 'Eggs Benedict',      categoryId: 'signatures', categoryName: 'Signatures', price: 21.00, stock: 15, tags: ['brunch'],  isActive: true, modifiers: [] },
      { id: 'I003', name: 'Smoked Salmon Tart', categoryId: 'signatures', categoryName: 'Signatures', price: 24.00, stock: 10, tags: ['chef\'s pick'], isActive: true, modifiers: [] },
      { id: 'I004', name: 'French Onion Soup',  categoryId: 'starters',   categoryName: 'Starters',   price: 12.00, stock: 18, tags: ['warm'],   isActive: true, modifiers: [] },
      { id: 'I005', name: 'Charcuterie Board',  categoryId: 'starters',   categoryName: 'Starters',   price: 28.00, stock: 8,  tags: ['sharing'], isActive: true, modifiers: [] },
      { id: 'I006', name: 'Duck Confit',         categoryId: 'mains',      categoryName: 'Mains',      price: 36.00, stock: 12, tags: ['premium'], isActive: true, modifiers: [] },
      { id: 'I007', name: 'Pan-Seared Salmon',  categoryId: 'mains',      categoryName: 'Mains',      price: 32.00, stock: 14, tags: [],          isActive: true, modifiers: [] },
      { id: 'I008', name: 'Beef Bourguignon',   categoryId: 'mains',      categoryName: 'Mains',      price: 38.00, stock: 10, tags: ['popular'], isActive: true, modifiers: [] },
      { id: 'I009', name: 'Mushroom Risotto',   categoryId: 'mains',      categoryName: 'Mains',      price: 26.00, stock: 16, tags: ['vegan'],   isActive: true, modifiers: [] },
      { id: 'I010', name: 'Crème Brûlée',       categoryId: 'desserts',   categoryName: 'Desserts',   price: 14.00, stock: 20, tags: ['classic'], isActive: true, modifiers: [] },
      { id: 'I011', name: 'Tarte Tatin',        categoryId: 'desserts',   categoryName: 'Desserts',   price: 13.00, stock: 12, tags: [],          isActive: true, modifiers: [] },
      { id: 'I012', name: 'Café au Lait',       categoryId: 'drinks',     categoryName: 'Drinks',     price: 6.00,  stock: 50, tags: ['hot'],     isActive: true, modifiers: [] },
      { id: 'I013', name: 'Kir Royale',         categoryId: 'drinks',     categoryName: 'Drinks',     price: 16.00, stock: 30, tags: ['cocktail'], isActive: true, modifiers: [] },
      { id: 'I014', name: 'House Red Wine',     categoryId: 'drinks',     categoryName: 'Drinks',     price: 12.00, stock: 40, tags: [],          isActive: true, modifiers: [] },
    ];

    // Load categories — show mock immediately, replace with API data if available
    this.categories = mockCategories;
    this.activeCat = 'signatures';

    this.api.getCategories().pipe(timeout(3000), catchError(() => of(null))).subscribe(cats => {
      if (cats && cats.length > 0) {
        this.categories = cats;
        this.activeCat = cats[0].id;
        this.filterItems();
      }
    });

    // Load items — show mock immediately, replace with API data if available
    this.items = mockItems;
    this.filterItems();

    this.api.getMenuItems().pipe(timeout(3000), catchError(() => of(null))).subscribe(items => {
      if (items && items.length > 0) {
        this.items = items;
        this.filterItems();
      }
    });
  }

  ngOnDestroy() {
    this.linesSub?.unsubscribe();
  }

  filterItems() {
    const q = this.search.trim().toLowerCase();
    this.filteredItems = this.items.filter(i => {
      const catMatch = !this.activeCat || i.categoryId === this.activeCat;
      const searchMatch = !q || i.name.toLowerCase().includes(q);
      return catMatch && searchMatch && i.isActive;
    });
  }

  setCategory(catId: string) {
    this.activeCat = catId;
    this.filterItems();
  }

  pickItem(item: MenuItem) {
    if (item.stock === 0) return;
    if (item.modifiers && item.modifiers.length > 0) {
      this.modifierItem = item;
    } else {
      this.cart.add(item.id, item.name, [], 1, '', item.price);
    }
  }

  confirmModifier(event: { modifiers: CartModifier[]; qty: number; note: string; unitPrice: number; lineTotal: number }) {
    if (!this.modifierItem) return;
    this.cart.add(
      this.modifierItem.id,
      this.modifierItem.name,
      event.modifiers,
      event.qty,
      event.note,
      event.unitPrice
    );
    this.modifierItem = null;
  }

  closeModifier() {
    this.modifierItem = null;
  }

  updateQty(lineId: string, delta: number) {
    this.cart.updateQty(lineId, delta);
  }

  removeLine(lineId: string) {
    this.cart.remove(lineId);
  }

  toggleCart() { this.cartOpen = !this.cartOpen; }

  goToPayment() {
    this.cartOpen = false;
    this.router.navigate(['/payment']);
  }

  clearCart() {
    this.cart.clear();
  }

  setOrderType(t: string) {
    this.orderMeta.type = t;
  }

  get subtotal(): number {
    return this.cart.subtotal;
  }

  get tax(): number {
    return this.cart.subtotal * this.taxRate;
  }

  get total(): number {
    return this.cart.total(this.taxRate, this.orderMeta.discount);
  }

  get activeCategory(): Category | undefined {
    return this.categories.find(c => c.id === this.activeCat);
  }

  getCategoryColor(catId: string): string {
    const colors: Record<string, string> = {
      signatures: '#c4553c',
      starters:   '#7a8c5c',
      mains:      '#d4a574',
      desserts:   '#a07abf',
      drinks:     '#4a6fa5',
    };
    return colors[catId] || '#827a68';
  }
}
