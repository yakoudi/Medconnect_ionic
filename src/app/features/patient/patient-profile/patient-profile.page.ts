// src/app/features/patient/patient-profile/patient-profile.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonItem, IonLabel, IonInput, IonButton, IonAvatar, 
  LoadingController, ToastController, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonBackButton, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';

import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth-service';
import { UserService } from 'src/app/core/services/user-service';
import { Patient } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton, IonAvatar,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/patient/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mon Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="!loading && patient">
        <!-- Photo de profil -->
        <div class="profile-header ion-text-center">
          <ion-avatar style="width: 120px; height: 120px; margin: 0 auto 20px;">
            <img [src]="patient.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg'" alt="Photo de profil">
          </ion-avatar>
          <h2>{{ patient.firstName }} {{ patient.lastName }}</h2>
          <p>{{ patient.email }}</p>
        </div>

        <!-- Informations personnelles -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Informations personnelles</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <ion-item>
              <ion-label position="floating">Prénom</ion-label>
              <ion-input 
                type="text" 
                [(ngModel)]="patient.firstName"
                placeholder="Votre prénom">
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Nom</ion-label>
              <ion-input 
                type="text" 
                [(ngModel)]="patient.lastName"
                placeholder="Votre nom">
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Téléphone</ion-label>
              <ion-input 
                type="tel" 
                [(ngModel)]="patient.phone"
                placeholder="+216 XX XXX XXX">
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Adresse</ion-label>
              <ion-input 
                type="text" 
                [(ngModel)]="patient.address"
                placeholder="Votre adresse">
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-label>Date de naissance</ion-label>
              <ion-input 
                type="text" 
                [value]="formatDate(patient.dateOfBirth)"
                readonly>
              </ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Bouton de mise à jour -->
        <ion-button 
          expand="block" 
          (click)="updateProfile()"
          class="ion-margin-top">
          Mettre à jour
        </ion-button>
      </div>

      <div *ngIf="loading" class="ion-text-center ion-padding">
        <p>Chargement du profil...</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-header {
      margin: 20px 0;
    }
    .profile-header h2 {
      margin: 10px 0;
    }
    .profile-header p {
      color: var(--ion-color-medium);
    }
  `]
})
export class PatientProfilePage implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  patient?: Patient;
  loading: boolean = true;

  constructor() {
    addIcons({ arrowBack });
  }

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    this.loading = true;
    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        const userData = await this.userService.getUserById(user.uid);
        if (userData && userData['role'] === 'patient') {
          this.patient = userData as unknown as Patient;
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      this.loading = false;
    }
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }

  async updateProfile() {
    if (!this.patient) return;

    const loading = await this.loadingCtrl.create({
      message: 'Mise à jour...',
    });
    await loading.present();

    try {
      await this.userService.updateUser(this.patient.uid, {
        firstName: this.patient.firstName,
        lastName: this.patient.lastName,
        phone: this.patient.phone,
        address: this.patient.address
      });

      await loading.dismiss();
      await this.showToast('Profil mis à jour avec succès', 'success');
    } catch (error) {
      await loading.dismiss();
      await this.showToast('Erreur lors de la mise à jour', 'danger');
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