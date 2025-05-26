import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { ActivatedRoute } from '@angular/router';

export const routes: Routes = [
    { path: 'register', component: SignupComponent }
];