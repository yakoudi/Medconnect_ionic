import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorAgendaPage } from './doctor-agenda.page';

describe('DoctorAgendaPage', () => {
  let component: DoctorAgendaPage;
  let fixture: ComponentFixture<DoctorAgendaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorAgendaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
