import { Component, Input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Item } from '../../../models/item.model';
import { FavoritesService } from '../../../services/favorites.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './item-card.html',
  styleUrls: ['./item-card.css'],
})
export class ItemCard {
  @Input() item!: Item;

  private favoritesService = inject(FavoritesService);
  private authService = inject(AuthService);

  user = toSignal(this.authService.currentUser$, { initialValue: null });
  isFavorite = signal(false);
  isToggling = signal(false);

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (currentUser && this.item) {
        this.checkFavoriteStatus();
      } else {
        this.isFavorite.set(false);
      }
    });
  }

  checkFavoriteStatus(): void {
    this.favoritesService.isFavorite(this.item.id).subscribe({
      next: (favorite) => {
        this.isFavorite.set(favorite);
      },
      error: (error) => {
        console.error('Error checking favorite status:', error);
      },
    });
  }

  async toggleFavorite(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (!this.user()) {
      return;
    }

    this.isToggling.set(true);
    try {
      const newStatus = await this.favoritesService.toggleFavorite(this.item);
      this.isFavorite.set(newStatus);
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
    } finally {
      this.isToggling.set(false);
    }
  }
}
