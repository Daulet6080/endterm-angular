import { createReducer, on } from '@ngrx/store';
import { Item } from '../../../models/item.model';
import * as ItemsActions from './items.actions';

export interface ItemsState {
  items: Item[];
  itemsLoading: boolean;
  itemsError: string | null;

  selectedItem: Item | null;
  itemLoading: boolean;
  itemError: string | null;
}

export const initialState: ItemsState = {
  items: [],
  itemsLoading: false,
  itemsError: null,

  selectedItem: null,
  itemLoading: false,
  itemError: null,
};

export const itemsReducer = createReducer(
  initialState,


  on(ItemsActions.loadItems, state => ({
    ...state,
    itemsLoading: true,
    itemsError: null,
  })),
  on(ItemsActions.loadItemsSuccess, (state, { items }) => ({
    ...state,
    items,
    itemsLoading: false,
  })),
  on(ItemsActions.loadItemsFailure, (state, { error }) => ({
    ...state,
    itemsLoading: false,
    itemsError: error,
  })),


  on(ItemsActions.loadItem, state => ({
    ...state,
    itemLoading: true,
    itemError: null,
    selectedItem: null,
  })),
  on(ItemsActions.loadItemSuccess, (state, { item }) => ({
    ...state,
    itemLoading: false,
    selectedItem: item,
  })),
  on(ItemsActions.loadItemFailure, (state, { error }) => ({
    ...state,
    itemLoading: false,
    itemError: error,
  })),
);
