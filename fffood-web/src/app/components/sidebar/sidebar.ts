import { Component, Input, Output, EventEmitter } from '@angular/core';
import { StaffMember } from '../../models';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() activeScreen = 'pos';
  @Input() user: StaffMember | null = null;
  @Output() screenChange = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();

  navItems: NavItem[] = [
    { id: 'pos',       label: 'POS',       icon: 'cart' },
    { id: 'menu',      label: 'Menu',      icon: 'book' },
    { id: 'inventory', label: 'Inventory', icon: 'boxes' },
  ];

  navigate(id: string) {
    this.screenChange.emit(id);
  }

  onLogout() {
    this.logout.emit();
  }
}
