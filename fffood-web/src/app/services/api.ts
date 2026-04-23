import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category, MenuItem, InventoryItem, Order, StaffMember } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Api {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}

  getStaff()          { return this.http.get<StaffMember[]>(`${this.base}/auth/staff`); }
  login(staffId: string, pin: string) { return this.http.post<any>(`${this.base}/auth/login`, { staffId, pin }); }

  getCategories()     { return this.http.get<Category[]>(`${this.base}/menu/categories`); }
  getMenuItems()      { return this.http.get<MenuItem[]>(`${this.base}/menu/items`); }
  getAllMenuItems()    { return this.http.get<MenuItem[]>(`${this.base}/menu/items?all=true`); }
  createItem(body: any)              { return this.http.post<any>(`${this.base}/menu/items`, body); }
  updateItem(id: string, body: any)  { return this.http.put(`${this.base}/menu/items/${id}`, body); }

  getOrders(status?: string) { return this.http.get<Order[]>(`${this.base}/orders${status ? '?status='+status : ''}`); }
  createOrder(body: any)     { return this.http.post<Order>(`${this.base}/orders`, body); }
  payOrder(id: number, body: any) { return this.http.post<any>(`${this.base}/orders/${id}/pay`, body); }
  voidOrder(id: number)      { return this.http.post(`${this.base}/orders/${id}/void`, {}); }

  getInventory()             { return this.http.get<InventoryItem[]>(`${this.base}/inventory`); }
  adjustStock(id: string, body: any) { return this.http.post<any>(`${this.base}/inventory/${id}/adjust`, body); }
}
