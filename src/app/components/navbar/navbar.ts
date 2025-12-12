import { Component, inject, signal, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  user$ = this.auth.currentUser$;
  user = toSignal(this.user$);
  profile = signal<UserProfile | null>(null);

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.profileService.getUserProfile().subscribe({
          next: (profile) => {
            if (profile) {
              this.profile.set(profile);
            }
          },
          error: (error) => {
            console.error('Error loading profile:', error);
          },
        });
      } else {
        this.profile.set(null);
      }
    });
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  getProfilePictureUrl(): string | null {
    return this.profile()?.profilePictureUrl || null;
  }

  getInitials(): string {
    const email = this.profile()?.email || null;
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  }
}
