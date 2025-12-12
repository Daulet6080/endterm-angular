import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { ProfileService, UserProfile } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  user = toSignal(this.auth.currentUser$, { initialValue: null });
  profile = signal<UserProfile | null>(null);
  isUploading = signal(false);
  uploadError = signal<string | null>(null);
  private compressionWorker: Worker | null = null;

  constructor() {
    // Load user profile
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.profileService.getUserProfile().subscribe({
          next: (profile) => {
            if (profile) {
              this.profile.set(profile);
            }
          },
          error: (error) => {
            console.error('Error loading profile:', error);
          },
        });
      }
    });

    // Initialize Web Worker
    if (typeof Worker !== 'undefined') {
      this.compressionWorker = new Worker(
        new URL('../../workers/image-compression.worker.ts', import.meta.url),
        { type: 'module' }
      );
      this.compressionWorker.onmessage = ({ data }) => {
        if (data.success) {
          // Convert ArrayBuffer back to Blob
          const blob = new Blob([data.arrayBuffer], { type: data.type || 'image/jpeg' });
          this.handleCompressedImage(blob);
        } else {
          this.uploadError.set(data.error || 'Compression failed');
          this.isUploading.set(false);
        }
      };
      this.compressionWorker.onerror = (error) => {
        this.uploadError.set('Worker error: ' + error.message);
        this.isUploading.set(false);
      };
    }
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      this.uploadError.set('Please select a .jpg or .png image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.uploadError.set('File size must be less than 10MB');
      return;
    }

    this.uploadError.set(null);
    this.isUploading.set(true);

    // Compress image in Web Worker
    if (this.compressionWorker) {
      this.compressionWorker.postMessage({
        file,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
      });
    } else {
      // Fallback if Web Workers are not supported
      this.handleImageDirectly(file);
    }
  }

  private async handleCompressedImage(blob: Blob): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) {
      this.uploadError.set('User not authenticated');
      this.isUploading.set(false);
      return;
    }

    try {
      const downloadURL = await this.profileService.uploadProfilePicture(blob, currentUser.uid);

      // Update local profile state
      const currentProfile = this.profile();
      if (currentProfile) {
        this.profile.set({
          ...currentProfile,
          profilePictureUrl: downloadURL,
        });
      }

      this.isUploading.set(false);
      this.uploadError.set(null);
    } catch (error: any) {
      this.uploadError.set(error.message || 'Failed to upload image');
      this.isUploading.set(false);
    }
  }

  private async handleImageDirectly(file: File): Promise<void> {
    // Fallback compression without Web Worker
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                this.handleCompressedImage(blob);
              } else {
                this.uploadError.set('Failed to compress image');
                this.isUploading.set(false);
              }
            },
            'image/jpeg',
            0.8
          );
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  getProfilePictureUrl(): string | null {
    return this.profile()?.profilePictureUrl || null;
  }

  getInitials(): string {
    const email = this.profile()?.email || this.user()?.email || '';
    return email.charAt(0).toUpperCase();
  }
}
