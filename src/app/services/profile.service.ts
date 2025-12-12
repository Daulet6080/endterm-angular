import { Injectable, inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable, from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

export interface UserProfile {
  email: string;
  profilePictureUrl?: string;
  uid: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  user$ = user(this.auth);

  getUserProfile(): Observable<UserProfile | null> {
    return this.user$.pipe(
      switchMap((authUser) => {
        if (!authUser) {
          return of(null);
        }
        const userDocRef = doc(this.firestore, 'users', authUser.uid);
        return from(getDoc(userDocRef)).pipe(
          map((docSnapshot) => {
            if (docSnapshot.exists()) {
              return docSnapshot.data() as UserProfile;
            } else {
              // Create profile if it doesn't exist
              const newProfile: UserProfile = {
                email: authUser.email || '',
                uid: authUser.uid,
              };
              setDoc(userDocRef, newProfile);
              return newProfile;
            }
          })
        );
      })
    );
  }

  async uploadProfilePicture(blob: Blob, userId: string): Promise<string> {
    const storageRef = ref(this.storage, `profile-pictures/${userId}/${Date.now()}.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    // Update Firestore with the new profile picture URL
    // Use merge: true to create if doesn't exist or update if it does
    const userDocRef = doc(this.firestore, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const existingData = userDoc.exists() ? userDoc.data() : {};

    await setDoc(
      userDocRef,
      {
        ...existingData,
        profilePictureUrl: downloadURL,
        uid: userId,
      },
      { merge: true }
    );

    return downloadURL;
  }
}
