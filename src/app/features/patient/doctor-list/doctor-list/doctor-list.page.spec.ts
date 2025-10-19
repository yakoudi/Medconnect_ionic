import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorListPage } from './doctor-list.page';

describe('DoctorListPage', () => {
  let component: DoctorListPage;
  let fixture: ComponentFixture<DoctorListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
