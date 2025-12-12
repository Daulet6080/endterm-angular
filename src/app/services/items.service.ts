import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Item } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private http = inject(HttpClient);
  private readonly API = 'https://fakestoreapi.com/products';

  getItems(query: string = ''): Observable<Item[]> {
    // FakeStoreAPI не поддерживает поиск напрямую, поэтому фильтруем на клиенте
    return this.http.get<any[]>(this.API).pipe(
      map(products => {
        if (!query.trim()) return products as Item[];
        
        const searchTerm = query.toLowerCase();
        return products.filter(p => 
          p.title?.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm) ||
          p.category?.toLowerCase().includes(searchTerm)
        ) as Item[];
      })
    );
  }

  getItemById(id: string | number): Observable<Item> {
    return this.http.get<Item>(`${this.API}/${id}`);
  }

  // Дополнительный метод для получения по категории
  getItemsByCategory(category: string): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.API}/category/${category}`);
  }

  // Получить список всех категорий
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>('https://fakestoreapi.com/products/categories');
  }
}

