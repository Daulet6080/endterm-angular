import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Item } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private http = inject(HttpClient);
  private readonly API = 'https://dummyjson.com/products';

  getItems(query: string = ''): Observable<Item[]> {
    const url = query.trim()
      ? `${this.API}/search?q=${encodeURIComponent(query)}`
      : this.API;

    return this.http.get<any>(url).pipe(
      map(res => (res.products ?? res.items ?? []) as Item[])
    );
  }

  getItemById(id: string | number): Observable<Item> {
    return this.http.get<Item>(`${this.API}/${id}`);
  }
}
