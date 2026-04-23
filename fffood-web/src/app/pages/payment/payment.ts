import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Api } from '../../services/api';
import { Cart } from '../../services/cart';
import { Auth } from '../../services/auth';
import { CartLine } from '../../models';

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment implements OnInit, OnDestroy {
  method: 'cash' | 'card' | 'qr' | 'split' = 'cash';
  methods: Array<'cash' | 'card' | 'qr' | 'split'> = ['cash', 'card', 'qr', 'split'];
  tendered = '';
  step: 'tender' | 'success' = 'tender';
  loading = false;
  splitWays = 2;

  printReceipt = true;
  sendKitchen = true;
  emailReceipt = false;

  orderMeta = {
    number: '',
    date: new Date(),
    type: 'dine-in',
    table: 7,
    guests: 2,
    server: '',
  };
  taxRate = 0.1;

  lines: CartLine[] = [];
  createdOrderId: number | null = null;
  changeDue = 0;

  private linesSub!: Subscription;

  constructor(
    private api: Api,
    private cart: Cart,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    this.linesSub = this.cart.lines$.subscribe(l => (this.lines = l));
    const user = this.auth.user;
    if (user) this.orderMeta.server = user.name;
    this.orderMeta.number = 'ORD-' + String(Math.floor(Math.random() * 9000) + 1000);
  }

  ngOnDestroy() {
    this.linesSub?.unsubscribe();
  }

  press(k: string) {
    if (this.tendered.includes('.') && this.tendered.split('.')[1].length >= 2) return;
    if (k === '.' && this.tendered.includes('.')) return;
    this.tendered += k;
  }

  backspace() {
    this.tendered = this.tendered.slice(0, -1);
  }

  setQuick(amount: number) {
    this.tendered = String(amount);
  }

  exact() {
    this.tendered = this.total.toFixed(2);
  }

  setMethod(m: 'cash' | 'card' | 'qr' | 'split') {
    this.method = m;
    this.tendered = '';
  }

  get subtotal(): number { return this.cart.subtotal; }
  get tax(): number      { return this.cart.subtotal * this.taxRate; }
  get total(): number    { return this.cart.total(this.taxRate, 0); }

  get tenderedNum(): number {
    return parseFloat(this.tendered) || 0;
  }

  get change(): number {
    return Math.max(0, this.tenderedNum - this.total);
  }

  get canComplete(): boolean {
    if (this.method === 'cash') return this.tenderedNum >= this.total;
    return true;
  }

  finalize() {
    if (!this.canComplete || this.loading) return;
    this.loading = true;

    const user = this.auth.user;
    const orderBody = {
      staffId:      user?.id ?? '',
      orderType:    this.orderMeta.type,
      tableNumber:  this.orderMeta.table,
      guests:       this.orderMeta.guests,
      taxRate:      this.taxRate,
      discount:     0,
      lines: this.lines.map(l => ({
        lineId:    l.lineId,
        itemId:    l.itemId,
        itemName:  l.itemName,
        qty:       l.qty,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
        note:      l.note,
        modifiers: l.modifiers.map(m => ({ id: m.id, name: m.name, price: m.price })),
      })),
    };

    this.api.createOrder(orderBody).subscribe({
      next: order => {
        this.createdOrderId = order.id;
        const payBody = {
          paymentMethod: this.method,
          tendered:      this.method === 'cash' ? this.tenderedNum : this.total,
        };
        this.api.payOrder(order.id, payBody).subscribe({
          next: () => {
            this.loading = false;
            this.changeDue = this.change;
            this.step = 'success';
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  onComplete() {
    this.cart.clear();
    this.router.navigate(['/pos']);
  }
}
