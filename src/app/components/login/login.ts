import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  loading = signal(false);
  error = signal<string | null>(null);

  async submit() {
    if (!this.email || !this.password) {
      this.error.set('Please enter email and password');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.auth.login(this.email, this.password);
      this.loading.set(false);
      this.router.navigate(['/profile']);
    } catch (e: any) {
      this.loading.set(false);
      this.error.set(e.message || 'Login failed');
    }
  }
}
