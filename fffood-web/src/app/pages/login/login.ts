import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { StaffMember } from '../../models';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  @Output() loggedIn = new EventEmitter<StaffMember>();

  staff: StaffMember[] = [];
  selectedStaff: StaffMember | null = null;
  pin = '';
  errorShake = false;
  loading = false;

  today = new Date();

  constructor(private api: Api, private auth: Auth, private cdr: ChangeDetectorRef) {}

  private offlineMode = false;

  private readonly mockStaff: StaffMember[] = [
    { id: 'S001', name: 'Marie Dupont',   role: 'Manager', initials: 'MD', color: '#c4553c' },
    { id: 'S002', name: 'Jean Lefebvre',  role: 'Server',  initials: 'JL', color: '#7a8c5c' },
    { id: 'S003', name: 'Sophie Martin',  role: 'Server',  initials: 'SM', color: '#d4a574' },
    { id: 'S004', name: 'Pierre Bernard', role: 'Cashier', initials: 'PB', color: '#4a6fa5' },
  ];

  apiStatus = 'loading…';

  ngOnInit() {
    this.offlineMode = true;
    this.staff = [...this.mockStaff];
    this.apiStatus = 'calling API…';

    this.api.getStaff().subscribe({
      next: s => {
        this.apiStatus = 'got ' + (s?.length ?? 0) + ' staff';
        if (s && s.length > 0) {
          this.offlineMode = false;
          this.staff = [...s];
          this.cdr.detectChanges();
        }
      },
      error: (e: any) => {
        this.apiStatus = 'error: ' + (e?.message || e?.status || 'unknown');
      }
    });
  }

  selectStaff(s: StaffMember) {
    this.selectedStaff = s;
    this.pin = '';
    this.errorShake = false;
  }

  goBack() {
    this.selectedStaff = null;
    this.pin = '';
    this.errorShake = false;
  }

  pressKey(k: string) {
    if (this.pin.length >= 4 || this.loading) return;
    this.pin += k;
    if (this.pin.length === 4) {
      this.submitPin();
    }
  }

  deletePin() {
    this.pin = this.pin.slice(0, -1);
  }

  submitPin() {
    if (!this.selectedStaff) return;
    this.loading = true;

    // Offline mode: accept PIN 1234 for any staff
    if (this.offlineMode) {
      if (this.pin === '1234') {
        this.loading = false;
        this.auth.login(this.selectedStaff, 'offline-token');
        this.loggedIn.emit(this.selectedStaff);
      } else {
        this.loading = false;
        this.triggerError();
      }
      return;
    }

    this.api.login(this.selectedStaff.id, this.pin).subscribe({
      next: res => {
        this.loading = false;
        const user: StaffMember = {
          id: res.staffId,
          name: res.name,
          role: res.role,
          initials: res.initials,
          color: res.color,
        };
        this.auth.login(user, res.token);
        this.loggedIn.emit(user);
      },
      error: () => {
        this.loading = false;
        // If API went down mid-session, fall back to offline
        if (!this.offlineMode) {
          this.offlineMode = true;
          this.staff = this.mockStaff;
        }
        this.triggerError();
      }
    });
  }

  private triggerError() {
    this.errorShake = true;
    setTimeout(() => {
      this.pin = '';
      this.errorShake = false;
    }, 500);
  }

  get pinDots(): boolean[] {
    return [0, 1, 2, 3].map(i => this.pin.length > i);
  }

  get dateString(): string {
    return this.today.toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  get timeString(): string {
    return this.today.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
}
