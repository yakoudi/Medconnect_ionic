import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonChip, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, cashOutline, starOutline } from 'ionicons/icons';
import { Doctor } from 'src/app/shared/models/user.model';


@Component({
  selector: 'app-doctor-card',
  template: `
    <ion-card [routerLink]="['/patient/doctor-detail', doctor.uid]">
      <ion-card-header>
        <ion-card-subtitle>{{ doctor.speciality }}</ion-card-subtitle>
        <ion-card-title>Dr. {{ doctor.firstName }} {{ doctor.lastName }}</ion-card-title>
      </ion-card-header>

      <ion-card-content>
        <div class="info-row">
          <ion-icon name="location-outline"></ion-icon>
          <span>{{ doctor.address || 'Non spécifié' }}</span>
        </div>
        
        <div class="info-row">
          <ion-icon name="cash-outline"></ion-icon>
          <span>{{ doctor.consultationFee }} TND</span>
        </div>

        <ion-chip color="primary" *ngIf="doctor.verified">
          <ion-icon name="star-outline"></ion-icon>
          <ion-label>Vérifié</ion-label>
        </ion-chip>

        <ion-button expand="block" class="ion-margin-top">
          Prendre RDV
        </ion-button>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      color: var(--ion-color-medium);
      
      ion-icon {
        font-size: 18px;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterLink, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonChip, IonLabel]
})
export class DoctorCardComponent {
  @Input() doctor!: Doctor;

  constructor() {
    addIcons({ locationOutline, cashOutline, starOutline });
  }
}