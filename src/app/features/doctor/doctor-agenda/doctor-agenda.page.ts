// src/app/features/doctor/doctor-agenda/doctor-agenda.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonIcon, IonChip, IonLabel, IonList, IonItem,
  IonCheckbox, LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, addCircleOutline, trashOutline } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/shared/components/header/header/header.component';
import { AuthService } from 'src/app/core/services/auth-service';
import { DoctorService } from 'src/app/core/services/doctor-service';


@Component({
  selector: 'app-doctor-agenda',
  template: `
    <app-header title="Mon Agenda" [showBackButton]="true"></app-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="time-outline"></ion-icon>
            Horaires de disponibilité
          </ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <p class="ion-text-center ion-margin-bottom">
            Sélectionnez vos horaires disponibles pour les consultations
          </p>

          <ion-list>
            <ion-item *ngFor="let slot of allTimeSlots">
              <ion-checkbox
                [(ngModel)]="slot.selected"
                (ionChange)="onTimeSlotChange()">
              </ion-checkbox>
              <ion-label class="ion-margin-start">{{ slot.time }}</ion-label>
            </ion-item>
          </ion-list>

          <ion-button 
            expand="block" 
            (click)="saveAvailability()"
            class="ion-margin-top"
            [disabled]="!hasChanges">
            Enregistrer les modifications
          </ion-button>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Horaires actuels</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <div *ngIf="selectedSlots.length === 0" class="ion-text-center">
            <p class="ion-text-color-medium">Aucun horaire sélectionné</p>
          </div>

          <div *ngIf="selectedSlots.length > 0">
            <ion-chip *ngFor="let time of selectedSlots" color="primary">
              <ion-icon name="time-outline"></ion-icon>
              <ion-label>{{ time }}</ion-label>
            </ion-chip>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    ion-card-title {
      display: flex;
      align-items: center;
      gap: 10px;

      ion-icon {
        font-size: 24px;
      }
    }

    ion-chip {
      margin: 4px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButton, IonIcon, IonChip, IonLabel, IonList, IonItem,
    IonCheckbox
  ]
})
export class DoctorAgendaPage implements OnInit {
  private authService = inject(AuthService);
  private doctorService = inject(DoctorService);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  allTimeSlots: { time: string; selected: boolean }[] = [];
  selectedSlots: string[] = [];
  hasChanges: boolean = false;

  constructor() {
    addIcons({ timeOutline, addCircleOutline, trashOutline });
  }

  async ngOnInit() {
    this.initializeTimeSlots();
    await this.loadDoctorAvailability();
  }

  initializeTimeSlots() {
    const slots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
    ];

    this.allTimeSlots = slots.map(time => ({
      time,
      selected: false
    }));
  }

  async loadDoctorAvailability() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    try {
      const userData = await this.doctorService.getDoctorById(user.uid);
      if (userData && userData.availableHours) {
        this.selectedSlots = userData.availableHours;
        
        // Mettre à jour les sélections
        this.allTimeSlots.forEach(slot => {
          slot.selected = this.selectedSlots.includes(slot.time);
        });
      }
    } catch (error) {
      console.error('Erreur chargement disponibilités:', error);
    }
  }

  onTimeSlotChange() {
    this.hasChanges = true;
    this.selectedSlots = this.allTimeSlots
      .filter(slot => slot.selected)
      .map(slot => slot.time);
  }

  async saveAvailability() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    if (this.selectedSlots.length === 0) {
      await this.showToast('Veuillez sélectionner au moins un horaire', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Enregistrement...',
    });
    await loading.present();

    try {
      await this.doctorService.updateAvailability(user.uid, this.selectedSlots);
      await loading.dismiss();
      await this.showToast('Horaires mis à jour avec succès', 'success');
      this.hasChanges = false;
    } catch (error) {
      await loading.dismiss();
      await this.showToast('Erreur lors de la mise à jour', 'danger');
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