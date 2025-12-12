import { Injectable, inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Item } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  user$ = user(this.auth);

  // Check if item is in favorites
  isFavorite(itemId: number): Observable<boolean> {
    return this.user$.pipe(
      switchMap((authUser) => {
        if (!authUser) {
          return of(false);
        }
        const favoriteDocRef = doc(this.firestore, 'favorites', `${authUser.uid}_${itemId}`);
        return from(getDoc(favoriteDocRef)).pipe(map((docSnapshot) => docSnapshot.exists()));
      })
    );
  }

  // Get all favorite items for current user
  getFavorites(): Observable<Item[]> {
    return this.user$.pipe(
      switchMap((authUser) => {
        if (!authUser) {
          return of([]);
        }
        const favoritesRef = collection(this.firestore, 'favorites');
        const q = query(favoritesRef, where('userId', '==', authUser.uid));
        return from(getDocs(q)).pipe(
          map((querySnapshot) => {
            const favorites: Item[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              if (data['item']) {
                favorites.push(data['item'] as Item);
              }
            });
            return favorites;
          })
        );
      })
    );
  }

  // Add item to favorites
  async addToFavorites(item: Item): Promise<void> {
    const authUser = this.auth.currentUser;
    if (!authUser) {
      throw new Error('User not authenticated');
    }

    const favoriteDocRef = doc(this.firestore, 'favorites', `${authUser.uid}_${item.id}`);
    await setDoc(favoriteDocRef, {
      userId: authUser.uid,
      itemId: item.id,
      item: item,
      addedAt: new Date(),
    });
  }

  // Remove item from favorites
  async removeFromFavorites(itemId: number): Promise<void> {
    const authUser = this.auth.currentUser;
    if (!authUser) {
      throw new Error('User not authenticated');
    }

    const favoriteDocRef = doc(this.firestore, 'favorites', `${authUser.uid}_${itemId}`);
    await deleteDoc(favoriteDocRef);
  }

  // Toggle favorite status
  async toggleFavorite(item: Item): Promise<boolean> {
    const authUser = this.auth.currentUser;
    if (!authUser) {
      throw new Error('User not authenticated');
    }

    const favoriteDocRef = doc(this.firestore, 'favorites', `${authUser.uid}_${item.id}`);
    const docSnapshot = await getDoc(favoriteDocRef);

    if (docSnapshot.exists()) {
      await deleteDoc(favoriteDocRef);
      return false;
    } else {
      await setDoc(favoriteDocRef, {
        userId: authUser.uid,
        itemId: item.id,
        item: item,
        addedAt: new Date(),
      });
      return true;
    }
  }
}
