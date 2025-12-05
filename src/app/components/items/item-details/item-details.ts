import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';

import * as ItemsActions from '../state/items.actions';
import {
  selectSelectedItem,
  selectItemLoading,
  selectItemError,
} from '../state/items.selectors';
import { ItemsState } from '../state/items.reducer';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './item-details.html',
  styleUrls: ['./item-details.css'],
})
export class ItemDetails {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private store: Store<ItemsState> = inject(Store);

  item$ = this.store.select(selectSelectedItem);
  loading$ = this.store.select(selectItemLoading);
  error$ = this.store.select(selectItemError);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.store.dispatch(ItemsActions.loadItem({ id }));
      }
    });
  }

  back() {
    this.location.back();
  }
}
