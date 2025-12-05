import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { ItemCard } from '../item-card/item-card';
import * as ItemsActions from '../state/items.actions';
import {
  selectItems,
  selectItemsLoading,
  selectItemsError,
} from '../state/items.selectors';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemCard],
  templateUrl: './items-list.html',
  styleUrls: ['./items-list.css'],
})
export class ItemsList {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);

  q = signal('');

  items$ = this.store.select(selectItems);
  loading$ = this.store.select(selectItemsLoading);
  error$ = this.store.select(selectItemsError);

  constructor() {
    // следим за ?q= в URL и диспатчим загрузку
    this.route.queryParamMap.subscribe(pm => {
      const search = pm.get('q') ?? '';
      this.q.set(search);
      this.store.dispatch(ItemsActions.loadItems({ query: search }));
    });
  }

  onSearchChange(value: string) {
    this.router.navigate([], {
      queryParams: { q: value || null },
      queryParamsHandling: 'merge',
    });
  }
}
