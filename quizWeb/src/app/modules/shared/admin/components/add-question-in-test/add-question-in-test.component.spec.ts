import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQuestionInTestComponent } from './add-question-in-test.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('AddQuestionInTestComponent', () => {
  let component: AddQuestionInTestComponent;
  let fixture: ComponentFixture<AddQuestionInTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AddQuestionInTestComponent],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddQuestionInTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
