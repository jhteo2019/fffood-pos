import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './pages/login/login';
import { Pos } from './pages/pos/pos';
import { Payment } from './pages/payment/payment';
import { Inventory } from './pages/inventory/inventory';
import { MenuManagement } from './pages/menu-management/menu-management';
import { Sidebar } from './components/sidebar/sidebar';
import { Topbar } from './components/topbar/topbar';
import { ModifierDialog } from './components/modifier-dialog/modifier-dialog';

@NgModule({
  declarations: [
    App,
    Login,
    Pos,
    Payment,
    Inventory,
    MenuManagement,
    Sidebar,
    Topbar,
    ModifierDialog,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
  ],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
