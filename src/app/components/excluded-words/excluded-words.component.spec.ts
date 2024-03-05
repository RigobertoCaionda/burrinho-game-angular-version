import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcludedWordsComponent } from './excluded-words.component';

describe('ExcludedWordsComponent', () => {
  let component: ExcludedWordsComponent;
  let fixture: ComponentFixture<ExcludedWordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcludedWordsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcludedWordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
