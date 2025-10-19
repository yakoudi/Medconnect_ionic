// src/app/features/doctor/doctor-profile/doctor-profile.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonItem, IonLabel, IonInput, IonButton, IonAvatar, IonTextarea,
  IonSelect, IonSelectOption, LoadingController, ToastController, 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton
} from '@ionic/angular/standalone';

import { AuthService } from 'src/app/core/services/auth-service';
import { UserService } from 'src/app/core/services/user-service';
import { DoctorService } from 'src/app/core/services/doctor-service';
import { Doctor } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton, IonAvatar, IonTextarea,
    IonSelect, IonSelectOption, IonHeader, IonToolbar, IonTitle, 
    IonButtons, IonBackButton
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/doctor/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mon Profil Professionnel</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="!loading && doctor">
        <!-- Photo de profil -->
        <div class="profile-header ion-text-center">
          <ion-avatar style="width: 120px; height: 120px; margin: 0 auto 20px;">
            <img [src]="doctor.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg'" alt="Photo de profil">
          </ion-avatar>
          <h2>Dr. {{ doctor.firstName }} {{ doctor.lastName }}</h2>
          <p>{{ doctor.email }}</p>
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
                [(ngModel)]="doctor.firstName"
                placeholder="Votre prénom">
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Nom</ion-label>
              <ion-input 
                type="text" 
                [(ngModel)]="doctor.lastName"
                placeholder="Votre nom">
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Téléphone</ion-label>
              <ion-input 
                type="tel" 
                [(ngModel)]="doctor.phone"
                placeholder="+216 XX XXX XXX">
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Email</ion-label>
              <ion-input 
                type="email" 
                [value]="doctor.email"
                readonly>
              </ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Informations professionnelles -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Informations professionnelles</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <ion-item>
              <ion-label position="floating">Spécialité</ion-label>
              <ion-select 
                [(ngModel)]="doctor.speciality" 
                interface="popover">
                <ion-select-option value="Médecine générale">Médecine générale</ion-select-option>
                <ion-select-option value="Cardiologie">Cardiologie</ion-select-option>
                <ion-select-option value="Dermatologie">Dermatologie</ion-select-option>
                <ion-select-option value="Pédiatrie">Pédiatrie</ion-select-option>
                <ion-select-option value="Gynécologie">Gynécologie</ion-select-option>
                <ion-select-option value="Orthopédie">Orthopédie</ion-select-option>
                <ion-select-option value="Neurologie">Neurologie</ion-select-option>
                <ion-select-option value="Psychiatrie">Psychiatrie</ion-select-option>
                <ion-select-option value="Ophtalmologie">Ophtalmologie</ion-select-option>
                <ion-select-option value="ORL">ORL</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Numéro d'ordre</ion-label>
              <ion-input 
                type="text" 
                [(ngModel)]="doctor.registrationNumber"
                placeholder="12345">
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Adresse du cabinet</ion-label>
              <ion-input 
                type="text" 
                [(ngModel)]="doctor.address"
                placeholder="123 Avenue Habib Bourguiba, Tunis">
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Tarif consultation (TND)</ion-label>
              <ion-input 
                type="number" 
                [(ngModel)]="doctor.consultationFee"
                min="0"
                placeholder="50">
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Biographie</ion-label>
              <ion-textarea
                [(ngModel)]="doctor.bio"
                rows="5"
                placeholder="Présentez votre parcours et votre expertise...">
              </ion-textarea>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Statut de vérification -->
        <ion-card [color]="doctor.verified ? 'success' : 'warning'">
          <ion-card-content class="ion-text-center">
            <p *ngIf="doctor.verified">
              <strong>✓ Compte vérifié</strong><br>
              Votre compte est validé et vous pouvez recevoir des patients.
            </p>
            <p *ngIf="!doctor.verified">
              <strong>⚠️ Compte en attente de vérification</strong><br>
              Un administrateur doit valider votre compte.
            </p>
          </ion-card-content>
        </ion-card>

        <!-- Bouton de mise à jour -->
        <ion-button 
          expand="block" 
          size="large"
          (click)="updateProfile()"
          class="ion-margin-top">
          Mettre à jour le profil
        </ion-button>

        <!-- Bouton de déconnexion -->
        <ion-button 
          expand="block" 
          color="danger"
          fill="outline"
          (click)="logout()"
          class="ion-margin-top">
          Se déconnecter
        </ion-button>
      </div>

      <div *ngIf="loading" class="ion-text-center ion-padding">
        <p>Chargement du profil...</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-header {
      margin: 20px 0 30px;
    }
    .profile-header h2 {
      margin: 10px 0;
      font-size: 24px;
    }
    .profile-header p {
      color: var(--ion-color-medium);
    }
    ion-item {
      margin-bottom: 10px;
    }
  `]
})
export class DoctorProfilePage implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private doctorService = inject(DoctorService);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  doctor?: Doctor;
  loading: boolean = true;

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    this.loading = true;
    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        const userData = await this.userService.getUserById(user.uid);
        if (userData && userData['role'] === 'doctor') {
          this.doctor = userData as unknown as Doctor;
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      this.loading = false;
    }
  }

  async updateProfile() {
    if (!this.doctor) return;

    const loading = await this.loadingCtrl.create({
      message: 'Mise à jour...',
    });
    await loading.present();

    try {
      await this.doctorService.updateDoctorProfile(this.doctor.uid, {
        firstName: this.doctor.firstName,
        lastName: this.doctor.lastName,
        phone: this.doctor.phone,
        speciality: this.doctor.speciality,
        registrationNumber: this.doctor.registrationNumber,
        address: this.doctor.address,
        consultationFee: this.doctor.consultationFee,
        bio: this.doctor.bio
      });

      await loading.dismiss();
      await this.showToast('Profil mis à jour avec succès', 'success');
    } catch (error) {
      await loading.dismiss();
      await this.showToast('Erreur lors de la mise à jour', 'danger');
      console.error('Erreur:', error);
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
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