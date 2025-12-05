import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);


  currentUser$: Observable<User | null> = authState(this.auth);

  async signup(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw new Error(this.mapError(error));
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw new Error(this.mapError(error));
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw new Error(this.mapError(error));
    }
  }

  private mapError(error: any): string {
    const code = error?.code ?? '';
    if (code.includes('auth/invalid-email')) return 'Invalid email address';
    if (code.includes('auth/user-not-found')) return 'User not found';
    if (code.includes('auth/wrong-password')) return 'Incorrect password';
    if (code.includes('auth/email-already-in-use')) return 'Email already in use';
    if (code.includes('auth/weak-password')) return 'Password is too weak';
    return 'Authentication error';
  }
}
