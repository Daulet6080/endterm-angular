import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { About } from './components/about/about';
import { ItemsList } from './components/items/items-list/items-list';
import { ItemDetails } from './components/items/item-details/item-details';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { Profile } from './components/profile/profile';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home, title: 'Home' },
  { path: 'about', component: About, title: 'About' },
  { path: 'items', component: ItemsList, title: 'Items' },
  { path: 'items/:id', component: ItemDetails, title: 'Item Details' },
  { path: 'login', component: Login, title: 'Login' },
  { path: 'signup', component: Signup, title: 'Sign Up' },
  { path: 'profile', component: Profile, canActivate: [authGuard], title: 'Profile' },
  { path: '**', redirectTo: '' },
];
