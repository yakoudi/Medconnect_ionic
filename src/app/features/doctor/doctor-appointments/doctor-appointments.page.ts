// src/app/features/doctor/doctor-appointments/doctor-appointments.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonSegment, IonSegmentButton, IonLabel, 
  IonSpinner, AlertController, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header/header.component';
import { AppointmentCardComponent } from 'src/app/shared/components/appointment-card/appointment-card/appointment-card.component';
import { AppointmentService } from 'src/app/core/services/appointment-service';
import { UserService } from 'src/app/core/services/user-service';
import { AuthService } from 'src/app/core/services/auth-service';
import { Appointment } from 'src/app/shared/models/appointment.model';
import { NotificationService } from 'src/app/core/services/notification';

@Component({
  selector: 'app-doctor-appointments',
  template: `
    <app-header title="Mes Rendez-vous" [showBackButton]="true"></app-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-segment [value]="selectedSegment" (ionChange)="onSegmentChange($event)">
        <ion-segment-button value="pending">
          <ion-label>En attente ({{ pendingCount }})</ion-label>
        </ion-segment-button>
        <ion-segment-button value="confirmed">
          <ion-label>Confirmés ({{ confirmedCount }})</ion-label>
        </ion-segment-button>
        <ion-segment-button value="past">
          <ion-label>Historique</ion-label>
        </ion-segment-button>
      </ion-segment>

      <div class="loading-container" *ngIf="loading">
        <ion-spinner></ion-spinner>
        <p>Chargement...</p>
      </div>

      <div class="appointments-list ion-padding" *ngIf="!loading">
        <div *ngIf="filteredAppointments.length === 0" class="no-appointments">
          <p *ngIf="selectedSegment === 'pending'">Aucun rendez-vous en attente</p>
          <p *ngIf="selectedSegment === 'confirmed'">Aucun rendez-vous confirmé</p>
          <p *ngIf="selectedSegment === 'past'">Aucun rendez-vous passé</p>
        </div>

        <app-appointment-card
          *ngFor="let appointment of filteredAppointments"
          [appointment]="appointment"
          [patientName]="patientNames[appointment.patientId]"
          [showActions]="selectedSegment !== 'past'"
          [isDoctor]="true"
          (cancel)="cancelAppointment(appointment)"
          (confirm)="confirmAppointment(appointment)">
        </app-appointment-card>
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

    .no-appointments {
      text-align: center;
      padding: 40px 20px;
      color: var(--ion-color-medium);
    }

    .appointments-list {
      padding-bottom: 20px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    AppointmentCardComponent,
    IonContent, IonSegment, IonSegmentButton, IonLabel, 
    IonSpinner, IonRefresher, IonRefresherContent
  ]
})
export class DoctorAppointmentsPage implements OnInit {
  private appointmentService = inject(AppointmentService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private alertCtrl = inject(AlertController);
  private notificationService = inject(NotificationService);

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  patientNames: { [key: string]: string } = {};
  loading: boolean = true;
  selectedSegment: string = 'pending';
  
  pendingCount: number = 0;
  confirmedCount: number = 0;

  async ngOnInit() {
    await this.loadAppointments();
  }

  async loadAppointments() {
    this.loading = true;
    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        // Récupérer tous les rendez-vous du médecin
        this.appointments = await this.appointmentService.getDoctorAppointments(user.uid);
        
        // Charger les noms des patients pour chaque rendez-vous
        for (const appointment of this.appointments) {
          try {
            const patient = await this.userService.getUserById(appointment.patientId);
            if (patient) {
              this.patientNames[appointment.patientId] = `${patient['firstName']} ${patient['lastName']}`;
            }
          } catch (error) {
            console.error('Erreur chargement patient:', error);
            this.patientNames[appointment.patientId] = 'Patient inconnu';
          }
        }
        
        // Mettre à jour les compteurs et filtrer
        this.updateCounts();
        this.filterAppointments();
      }
    } catch (error) {
      console.error('Erreur chargement RDV:', error);
      // Afficher un message d'erreur convivial
      this.appointments = [];
      this.filteredAppointments = [];
    } finally {
      this.loading = false;
    }
  }

  updateCounts() {
    const now = new Date();
    this.pendingCount = this.appointments.filter(apt => 
      apt.status === 'pending' && new Date(apt.date) >= now
    ).length;
    
    this.confirmedCount = this.appointments.filter(apt => 
      apt.status === 'confirmed' && new Date(apt.date) >= now
    ).length;
  }

  filterAppointments() {
    const now = new Date();
    
    if (this.selectedSegment === 'pending') {
      this.filteredAppointments = this.appointments.filter(apt => 
        apt.status === 'pending' && new Date(apt.date) >= now
      );
    } else if (this.selectedSegment === 'confirmed') {
      this.filteredAppointments = this.appointments.filter(apt => 
        apt.status === 'confirmed' && new Date(apt.date) >= now
      );
    } else if (this.selectedSegment === 'past') {
      this.filteredAppointments = this.appointments.filter(apt => 
        apt.status === 'completed' || 
        apt.status === 'cancelled' || 
        new Date(apt.date) < now
      );
    }

    // Trier par date (les plus récents d'abord)
    this.filteredAppointments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    this.filterAppointments();
  }

  async confirmAppointment(appointment: Appointment) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmer le rendez-vous',
      message: `Voulez-vous confirmer le rendez-vous avec ${this.patientNames[appointment.patientId]} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          role: 'confirm',
          handler: async () => {
            if (appointment.id) {
              try {
                await this.appointmentService.confirmAppointment(appointment.id);
                
                // Notifier le patient
                const doctor = this.authService.getCurrentUser();
                if (doctor) {
                  const doctorData = await this.userService.getUserById(doctor.uid);
                  if (doctorData) {
                    const doctorName = `${doctorData['firstName']} ${doctorData['lastName']}`;
                    await this.notificationService.notifyAppointmentConfirmed(
                      appointment.patientId,
                      doctorName,
                      appointment.date
                    );
                  }
                }
                
                // Recharger les rendez-vous
                await this.loadAppointments();
              } catch (error) {
                console.error('Erreur confirmation RDV:', error);
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async cancelAppointment(appointment: Appointment) {
    const alert = await this.alertCtrl.create({
      header: 'Annuler le rendez-vous',
      message: `Êtes-vous sûr de vouloir annuler le rendez-vous avec ${this.patientNames[appointment.patientId]} ?`,
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Raison de l\'annulation (optionnel)'
        }
      ],
      buttons: [
        {
          text: 'Non',
          role: 'cancel'
        },
        {
          text: 'Oui, annuler',
          role: 'confirm',
          handler: async (data) => {
            if (appointment.id) {
              try {
                await this.appointmentService.cancelAppointment(appointment.id);
                
                // Notifier le patient
                await this.notificationService.notifyAppointmentCancelled(
                  appointment.patientId,
                  appointment.date
                );
                
                // Recharger les rendez-vous
                await this.loadAppointments();
              } catch (error) {
                console.error('Erreur annulation RDV:', error);
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async handleRefresh(event: any) {
    await this.loadAppointments();
    event.target.complete();
  }
}