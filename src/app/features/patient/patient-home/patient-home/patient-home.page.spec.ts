import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientHomePage } from './patient-home.page';

describe('PatientHomePage', () => {
  let component: PatientHomePage;
  let fixture: ComponentFixture<PatientHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
