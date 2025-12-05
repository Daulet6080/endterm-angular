import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = toSignal(this.auth.currentUser$, { initialValue: null });

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
