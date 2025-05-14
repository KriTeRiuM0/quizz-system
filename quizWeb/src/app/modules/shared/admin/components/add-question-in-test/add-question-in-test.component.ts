import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SharedModule } from '../../../shared.module';
import { AdminService } from '../../services/admin.service';



@Component({
  selector: 'app-add-question-in-test',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './add-question-in-test.component.html',
  styleUrls: ['./add-question-in-test.component.scss']
})
export class AddQuestionInTestComponent {

  constructor(private fb: FormBuilder,
              private adminService: AdminService,
              private notification: NzNotificationService,
              private router: Router,
              private activatedRoute: ActivatedRoute) 
              
              {}

              id: number | null;
              questionForm!: FormGroup;
              
              ngOnInit() {
                this.questionForm = this.fb.group({
                  questionText: [null, [Validators.required]],
                  optionA: [null, [Validators.required]],
                  optionB: [null, [Validators.required]],
                  optionC: [null, [Validators.required]],
                  optionD: [null, [Validators.required]],
                  correctOption: [null, [Validators.required]],
                });
              
                this.id = this.activatedRoute.snapshot.params["id"];
              }
              
              submitForm() {
                const questionDto = this.questionForm.value;
                questionDto.id = this.id;
              
                this.adminService.addQuestionInTest(questionDto).subscribe(
                  res => {
                    this.notification
                    .success(
                      'SUCCESS',
                      'Qustion Created Successfully.',
                      { nzDuration: 5000 }
                    );
                    this.router.navigateByUrl("/admin/dashboard");

                  },
                  error => {
                    this.notification
                      .error(
                        'ERROR',
                        `${error.error}`,
                        { nzDuration: 5000 }
                      );
                  }
                );
              }
              


}
