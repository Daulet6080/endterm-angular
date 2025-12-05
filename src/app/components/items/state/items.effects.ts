import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ItemsService } from '../../../services/items.service';
import * as ItemsActions from './items.actions';
import { catchError, map, of, switchMap } from 'rxjs';

@Injectable()
export class ItemsEffects {
  private actions$ = inject(Actions);
  private api = inject(ItemsService);

  loadItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ItemsActions.loadItems),
      switchMap(({ query }) =>
        this.api.getItems(query ?? '').pipe(
          map(items => ItemsActions.loadItemsSuccess({ items })),
          catchError(err =>
            of(
              ItemsActions.loadItemsFailure({
                error: String(err?.message || err),
              })
            )
          )
        )
      )
    )
  );

  loadItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ItemsActions.loadItem),
      switchMap(({ id }) =>
        this.api.getItemById(id).pipe(
          map(item => ItemsActions.loadItemSuccess({ item })),
          catchError(err =>
            of(
              ItemsActions.loadItemFailure({
                error: String(err?.message || err),
              })
            )
          )
        )
      )
    )
  );
}
