import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTestComponent } from './create-test.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CreateTestComponent', () => {
  let component: CreateTestComponent;
  let fixture: ComponentFixture<CreateTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CreateTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
