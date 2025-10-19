import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonChip, IonLabel, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, timeOutline, personOutline, closeCircle, checkmarkCircle } from 'ionicons/icons';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from 'src/app/shared/models/appointment.model';

@Component({
  selector: 'app-appointment-card',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-subtitle>
          <ion-icon name="calendar-outline"></ion-icon>
          {{ formatDate(appointment.date) }}
        </ion-card-subtitle>
        <ion-card-title>{{ appointment.time }}</ion-card-title>
      </ion-card-header>

      <ion-card-content>
        <div class="info-row">
          <ion-icon name="person-outline"></ion-icon>
          <span>{{ doctorName || patientName }}</span>
        </div>

        <p class="reason">{{ appointment.reason }}</p>

        <ion-chip [color]="getStatusColor(appointment.status)">
          <ion-label>{{ getStatusLabel(appointment.status) }}</ion-label>
        </ion-chip>

        <ion-buttons class="ion-margin-top" *ngIf="showActions">
          <ion-button 
            color="danger" 
            fill="outline" 
            size="small"
            (click)="onCancel()"
            *ngIf="appointment.status === 'pending' || appointment.status === 'confirmed'">
            <ion-icon slot="start" name="close-circle"></ion-icon>
            Annuler
          </ion-button>

          <ion-button 
            color="success" 
            fill="outline" 
            size="small"
            (click)="onConfirm()"
            *ngIf="appointment.status === 'pending' && isDoctor">
            <ion-icon slot="start" name="checkmark-circle"></ion-icon>
            Confirmer
          </ion-button>
        </ion-buttons>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0;
      
      ion-icon {
        font-size: 20px;
        color: var(--ion-color-primary);
      }
    }

    .reason {
      color: var(--ion-color-medium);
      font-style: italic;
      margin: 12px 0;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonChip, IonLabel, IonButtons]
})
export class AppointmentCardComponent {
  @Input() appointment!: Appointment;
  @Input() doctorName?: string;
  @Input() patientName?: string;
  @Input() showActions: boolean = true;
  @Input() isDoctor: boolean = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  constructor() {
    addIcons({ calendarOutline, timeOutline, personOutline, closeCircle, checkmarkCircle });
  }

  formatDate(date: Date): string {
    return format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr });
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

  onCancel() {
    this.cancel.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}