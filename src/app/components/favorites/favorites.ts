import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { FavoritesService } from '../../services/favorites.service';
import { ItemCard } from '../items/item-card/item-card';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, ItemCard, RouterLink],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css'],
})
export class Favorites {
  private auth = inject(AuthService);
  private favoritesService = inject(FavoritesService);
  private router = inject(Router);

  user = toSignal(this.auth.currentUser$, { initialValue: null });
  favorites = signal<Item[]>([]);
  isLoading = signal(true);

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.loadFavorites();
      } else {
        this.favorites.set([]);
        this.isLoading.set(false);
      }
    });
  }

  loadFavorites(): void {
    this.isLoading.set(true);
    this.favoritesService.getFavorites().subscribe({
      next: (items) => {
        this.favorites.set(items);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.isLoading.set(false);
      },
    });
  }

  navigateToItems(): void {
    this.router.navigate(['/items']);
  }
}
