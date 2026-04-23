import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from './services/auth';
import { Cart } from './services/cart';
import { Api } from './services/api';
import { StaffMember } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  user: StaffMember | null = null;
  activeScreen = 'pos';
  lowStock = 0;
  outStock = 0;

  constructor(
    private auth: Auth,
    private cart: Cart,
    private api: Api,
    private router: Router
  ) {}

  ngOnInit() {
    this.auth.restore();
    this.auth.user$.subscribe(u => {
      this.user = u;
      if (u) {
        this.router.navigate(['/pos']);
        this.loadStockAlerts();
      }
    });
  }

  loadStockAlerts() {
    this.api.getInventory().subscribe(items => {
      this.lowStock = items.filter(i => i.stock > 0 && i.stock <= 5).length;
      this.outStock = items.filter(i => i.stock === 0).length;
    });
  }

  onLogin(user: StaffMember) {
    this.user = user;
    this.activeScreen = 'pos';
    this.router.navigate(['/pos']);
    this.loadStockAlerts();
  }

  onLogout() {
    this.auth.logout();
    this.cart.clear();
    this.user = null;
    this.router.navigate(['/login']);
  }

  onScreenChange(screen: string) {
    this.activeScreen = screen;
    this.router.navigate(['/' + screen]);
  }
}
