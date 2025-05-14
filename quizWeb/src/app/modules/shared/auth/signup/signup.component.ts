import { Component } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  imports: [SharedModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  constructor(private fb: FormBuilder ,
  private message: NzMessageService,
  private router: Router,
  private authService : AuthService // Assuming you have an AuthService to handle authentication
  ) {}

  validateForm! : FormGroup ;
  

  ngOnInit() {
      this.validateForm = this.fb.group({
          email: [null, [Validators.required, Validators.email]],
          password: [null, [Validators.required]],
          name: [null, Validators.required]
      })
  }
  
  submitForm() {
    
    this.authService.register(this.validateForm.value).subscribe(res => {
      this.message
        .success(
          'Signup successful',
          {nzDuration: 1000}
        );
      this.router.navigate(['/login']);
        
      },
      error => {
        this.message
          .error(
            `${error.error}`,
            {nzDuration: 5000}
          )
      }
    )
    
}
}
