import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonSearchbar, IonItem, IonLabel, IonSelect, IonSelectOption, IonSpinner } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header/header.component';
import { DoctorCardComponent } from 'src/app/shared/components/doctor-card/doctor-card/doctor-card.component';
import { UserService } from 'src/app/core/services/user-service';
import { Doctor } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.page.html',
  styleUrls: ['./doctor-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    DoctorCardComponent,
    IonContent, IonSearchbar, IonItem, IonLabel,
    IonSelect, IonSelectOption, IonSpinner
  ]
})
export class DoctorListPage implements OnInit {
  private userService = inject(UserService);

  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  loading: boolean = true;
  selectedSpeciality: string = 'all';
  searchTerm: string = '';

  specialities = [
    'Médecine générale',
    'Cardiologie',
    'Dermatologie',
    'Pédiatrie',
    'Gynécologie',
    'Orthopédie',
    'Neurologie',
    'Psychiatrie',
    'Ophtalmologie',
    'ORL'
  ];

  async ngOnInit() {
    await this.loadDoctors();
  }

  async loadDoctors() {
    this.loading = true;
    try {
      this.doctors = await this.userService.getAllDoctors();
      this.filteredDoctors = this.doctors;
    } catch (error) {
      console.error('Erreur chargement médecins:', error);
    } finally {
      this.loading = false;
    }
  }

  filterDoctors() {
    this.filteredDoctors = this.doctors.filter(doctor => {
      const matchSpeciality = this.selectedSpeciality === 'all' || doctor.speciality === this.selectedSpeciality;
      const matchSearch = !this.searchTerm || 
        doctor.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchSpeciality && matchSearch;
    });
  }

  onSpecialityChange() {
    this.filterDoctors();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterDoctors();
  }
}