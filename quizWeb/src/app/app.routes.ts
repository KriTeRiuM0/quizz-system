import { Routes } from '@angular/router';
import { SignupComponent } from './modules/shared/auth/signup/signup.component';
import { LoginComponent } from './modules/shared/auth/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: SignupComponent },
  { path: 'user', loadChildren: () => import('./modules/shared/user/user.module').then(m => m.UserModule) },
  { path: 'admin', loadChildren: () => import('./modules/shared/admin/admin.module').then(m => m.AdminModule) },

];
