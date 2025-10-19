// src/app/features/doctor/patient-detail/patient-detail.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { 
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonList, IonItem, IonLabel, IonIcon, IonAvatar, IonChip,
  IonButton, IonTextarea, IonSpinner, LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, calendarOutline, locationOutline, callOutline, 
  mailOutline, medkitOutline, documentTextOutline, addCircleOutline 
} from 'ionicons/icons';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from 'src/app/shared/components/header/header/header.component';
import { UserService } from 'src/app/core/services/user-service';
import { PatientService } from 'src/app/core/services/patient-service';
import { AppointmentService } from 'src/app/core/services/appointment-service';
import { Patient } from 'src/app/shared/models/user.model';
import { Appointment } from 'src/app/shared/models/appointment.model';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonIcon, IonAvatar, IonChip,
    IonButton, IonTextarea, IonSpinner
  ],
  template: `
    <app-header [title]="patient ? patient.firstName + ' ' + patient.lastName : 'Patient'" [showBackButton]="true"></app-header>

    <ion-content>
      <div *ngIf="loading" class="loading-container">
        <ion-spinner></ion-spinner>
        <p>Chargement...</p>
      </div>

      <div *ngIf="!loading && patient" class="ion-padding">
        <!-- Informations personnelles -->
        <ion-card>
          <ion-card-content>
            <div class="profile-header">
              <ion-avatar class="large-avatar">
                <img [src]="patient.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg'" alt="Photo patient">
              </ion-avatar>
              <div class="profile-info">
                <h1>{{ patient.firstName }} {{ patient.lastName }}</h1>
                <p class="age">{{ calculateAge(patient.dateOfBirth) }} ans</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Coordonnées -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="person-outline"></ion-icon>
              Coordonnées
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none">
              <ion-item>
                <ion-icon name="calendar-outline" slot="start" color="primary"></ion-icon>
                <ion-label>
                  <h3>Date de naissance</h3>
                  <p>{{ formatDate(patient.dateOfBirth) }}</p>
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-icon name="call-outline" slot="start" color="success"></ion-icon>
                <ion-label>
                  <h3>Téléphone</h3>
                  <p>{{ patient.phone }}</p>
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-icon name="mail-outline" slot="start" color="tertiary"></ion-icon>
                <ion-label>
                  <h3>Email</h3>
                  <p>{{ patient.email }}</p>
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-icon name="location-outline" slot="start" color="warning"></ion-icon>
                <ion-label>
                  <h3>Adresse</h3>
                  <p>{{ patient.address }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Historique médical -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="medkit-outline"></ion-icon>
              Historique médical
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div *ngIf="!patient.medicalHistory || patient.medicalHistory.length === 0">
              <p class="ion-text-center" style="color: var(--ion-color-medium);">
                Aucun antécédent médical enregistré
              </p>
            </div>

            <ion-list *ngIf="patient.medicalHistory && patient.medicalHistory.length > 0">
              <ion-item *ngFor="let entry of patient.medicalHistory">
                <ion-icon name="document-text-outline" slot="start"></ion-icon>
                <ion-label class="ion-text-wrap">{{ entry }}</ion-label>
              </ion-item>
            </ion-list>

            <!-- Ajouter un antécédent -->
            <div class="ion-margin-top">
              <ion-item>
                <ion-label position="stacked">Ajouter un antécédent médical</ion-label>
                <ion-textarea
                  [(ngModel)]="newMedicalEntry"
                  rows="3"
                  placeholder="Ex: Allergique à la pénicilline">
                </ion-textarea>
              </ion-item>
              <ion-button 
                expand="block" 
                (click)="addMedicalHistory()"
                [disabled]="!newMedicalEntry"
                class="ion-margin-top">
                <ion-icon name="add-circle-outline" slot="start"></ion-icon>
                Ajouter
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Rendez-vous récents -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="calendar-outline"></ion-icon>
              Rendez-vous récents
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div *ngIf="appointments.length === 0">
              <p class="ion-text-center" style="color: var(--ion-color-medium);">
                Aucun rendez-vous
              </p>
            </div>

            <ion-list *ngIf="appointments.length > 0">
              <ion-item *ngFor="let apt of appointments">
                <ion-label>
                  <h3>{{ formatDate(apt.date) }} à {{ apt.time }}</h3>
                  <p>{{ apt.reason }}</p>
                  <ion-chip [color]="getStatusColor(apt.status)" style="margin-top: 8px;">
                    <ion-label>{{ getStatusLabel(apt.status) }}</ion-label>
                  </ion-chip>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      padding: 40px;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 10px 0;
    }

    .large-avatar {
      width: 100px;
      height: 100px;
    }

    .profile-info h1 {
      margin: 0;
      font-size: 24px;
    }

    .profile-info .age {
      color: var(--ion-color-medium);
      margin: 5px 0;
    }

    ion-card-title {
      display: flex;
      align-items: center;
      gap: 10px;

      ion-icon {
        font-size: 24px;
      }
    }

    ion-item {
      margin-bottom: 8px;
    }
  `]
})
export class PatientDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private patientService = inject(PatientService);
  private appointmentService = inject(AppointmentService);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  patient?: Patient;
  appointments: Appointment[] = [];
  loading: boolean = true;
  patientId: string = '';
  newMedicalEntry: string = '';

  constructor() {
    addIcons({ 
      personOutline, calendarOutline, locationOutline, callOutline, 
      mailOutline, medkitOutline, documentTextOutline, addCircleOutline 
    });
  }

  async ngOnInit() {
    this.patientId = this.route.snapshot.paramMap.get('id') || '';
    await this.loadPatientDetails();
    await this.loadAppointments();
  }

  async loadPatientDetails() {
    this.loading = true;
    try {
      const userData = await this.userService.getUserById(this.patientId);
      if (userData && userData['role'] === 'patient') {
        this.patient = userData as unknown as Patient;
      }
    } catch (error) {
      console.error('Erreur chargement patient:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadAppointments() {
    try {
      const allAppointments = await this.appointmentService.getPatientAppointments(this.patientId);
      this.appointments = allAppointments.slice(0, 5);
    } catch (error) {
      console.error('Erreur chargement RDV:', error);
    }
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getStatusColor(status: Appointment['status']): string {
    const colors = {
      'pending': 'warning',
      'confirmed': 'success',
      'cancelled': 'danger',
      'completed': 'medium'
    };
    return colors[status];
  }

  getStatusLabel(status: Appointment['status']): string {
    const labels = {
      'pending': 'En attente',
      'confirmed': 'Confirmé',
      'cancelled': 'Annulé',
      'completed': 'Terminé'
    };
    return labels[status];
  }

  async addMedicalHistory() {
    if (!this.newMedicalEntry.trim() || !this.patient) return;

    const loading = await this.loadingCtrl.create({
      message: 'Ajout en cours...',
    });
    await loading.present();

    try {
      await this.patientService.addMedicalHistory(this.patientId, this.newMedicalEntry);
      
      if (!this.patient.medicalHistory) {
        this.patient.medicalHistory = [];
      }
      this.patient.medicalHistory.push(this.newMedicalEntry);
      
      this.newMedicalEntry = '';
      await loading.dismiss();
      await this.showToast('Antécédent ajouté avec succès', 'success');
    } catch (error) {
      await loading.dismiss();
      await this.showToast('Erreur lors de l\'ajout', 'danger');
      console.error('Erreur:', error);
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}