import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { StaffMember } from '../../models';

@Component({
  selector: 'app-topbar',
  standalone: false,
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit, OnDestroy {
  @Input() user: StaffMember | null = null;
  @Input() screen = 'pos';
  @Input() lowStock = 0;
  @Input() outStock = 0;

  now = new Date();
  private timer: any;

  ngOnInit() {
    this.timer = setInterval(() => { this.now = new Date(); }, 30000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  get timeString(): string {
    return this.now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  get dateString(): string {
    return this.now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  get screenLabel(): string {
    const labels: Record<string, string> = {
      pos:       'Point of Sale',
      menu:      'Menu Management',
      inventory: 'Inventory',
      payment:   'Payment',
    };
    return labels[this.screen] ?? this.screen;
  }
}
