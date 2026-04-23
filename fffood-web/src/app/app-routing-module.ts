import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Pos } from './pages/pos/pos';
import { Payment } from './pages/payment/payment';
import { Inventory } from './pages/inventory/inventory';
import { MenuManagement } from './pages/menu-management/menu-management';

const routes: Routes = [
  { path: 'login',     component: Login },
  { path: 'pos',       component: Pos },
  { path: 'payment',   component: Payment },
  { path: 'inventory', component: Inventory },
  { path: 'menu',      component: MenuManagement },
  { path: '',          redirectTo: '/pos', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
