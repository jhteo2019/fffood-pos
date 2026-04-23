import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Api } from '../../services/api';
import { MenuItem, Category } from '../../models';

interface EditState {
  name: string;
  price: number;
  isActive: boolean;
  tags: string;
}

interface AddState {
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  tags: string;
}

@Component({
  selector: 'app-menu-management',
  standalone: false,
  templateUrl: './menu-management.html',
  styleUrl: './menu-management.css',
})
export class MenuManagement implements OnInit {
  items: MenuItem[] = [];
  categories: Category[] = [];
  filtered: MenuItem[] = [];
  catFilter = 'all';
  editingId: string | null = null;
  editState: EditState = { name: '', price: 0, isActive: true, tags: '' };
  showAddForm = false;
  addState: AddState = { name: '', categoryId: '', price: 0, stock: 0, tags: '' };
  addSaving = false;
  addError = '';

  constructor(private api: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getCategories().subscribe({ next: cats => { this.categories = cats; this.cdr.detectChanges(); } });
    this.api.getAllMenuItems().subscribe({
      next: items => {
        this.items = items;
        this.filterItems();
        this.cdr.detectChanges();
      },
      error: () => { this.items = []; this.filtered = []; this.cdr.detectChanges(); }
    });
  }

  filterItems() {
    if (this.catFilter === 'all') {
      this.filtered = [...this.items];
    } else {
      this.filtered = this.items.filter(i => i.categoryId === this.catFilter);
    }
  }

  setCatFilter(id: string) {
    this.catFilter = id;
    this.filterItems();
  }

  toggleAvailable(id: string) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    const newActive = !item.isActive;
    this.api.updateItem(id, { name: item.name, price: item.price, isActive: newActive, tags: item.tags }).subscribe({
      next: () => { item.isActive = newActive; this.cdr.detectChanges(); }
    });
  }

  startEdit(item: MenuItem) {
    this.editingId = item.id;
    this.editState = {
      name:     item.name,
      price:    item.price,
      isActive: item.isActive,
      tags:     item.tags.join(', '),
    };
  }

  cancelEdit() {
    this.editingId = null;
  }

  openAddForm() {
    this.showAddForm = true;
    this.addError = '';
    this.addState = {
      name: '',
      categoryId: this.categories.length > 0 ? this.categories[0].id : '',
      price: 0,
      stock: 0,
      tags: '',
    };
  }

  cancelAdd() {
    this.showAddForm = false;
  }

  saveNewItem() {
    const name = (this.addState.name || '').trim();
    const price = +this.addState.price;
    const stock = +this.addState.stock || 0;
    if (!name || price <= 0) return;

    this.addSaving = true;
    this.addError = '';

    this.api.createItem({
      name,
      categoryId: this.addState.categoryId,
      price,
      stock,
      tags: (this.addState.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    }).subscribe({
      next: () => {
        this.addSaving = false;
        this.showAddForm = false;
        this.cdr.detectChanges();
        this.loadData();
      },
      error: (err: any) => {
        this.addSaving = false;
        this.addError = err?.error?.title || err?.message || 'Save failed — check console';
        this.cdr.detectChanges();
      }
    });
  }

  updateItem(id: string) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    const body = {
      name:     this.editState.name,
      price:    this.editState.price,
      isActive: this.editState.isActive,
      tags:     this.editState.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    this.api.updateItem(id, body).subscribe({
      next: () => {
        item.name     = body.name;
        item.price    = body.price;
        item.isActive = body.isActive;
        item.tags     = body.tags;
        this.editingId = null;
        this.filterItems();
        this.cdr.detectChanges();
      }
    });
  }

  getCategoryName(catId: string): string {
    return this.categories.find(c => c.id === catId)?.name ?? catId;
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
