import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StaffMember } from '../models';

@Injectable({ providedIn: 'root' })
export class Auth {
  private _user = new BehaviorSubject<StaffMember | null>(null);
  user$ = this._user.asObservable();

  get user() { return this._user.value; }

  login(user: StaffMember, token: string) {
    this._user.next(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    this._user.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  restore() {
    const u = localStorage.getItem('user');
    if (u) this._user.next(JSON.parse(u));
  }

  get token() { return localStorage.getItem('token'); }
  get isLoggedIn() { return !!this._user.value; }
}
