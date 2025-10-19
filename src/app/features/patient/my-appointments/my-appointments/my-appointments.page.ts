import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonSegment, IonSegmentButton, IonLabel, IonSpinner, AlertController } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header/header.component';
import { AppointmentCardComponent } from 'src/app/shared/components/appointment-card/appointment-card/appointment-card.component';
import { AppointmentService } from 'src/app/core/services/appointment-service';
import { UserService } from 'src/app/core/services/user-service';
import { AuthService } from 'src/app/core/services/auth-service';
import { Appointment } from 'src/app/shared/models/appointment.model';


@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.page.html',
  styleUrls: ['./my-appointments.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    AppointmentCardComponent,
    IonContent, IonSegment, IonSegmentButton, IonLabel, IonSpinner
  ]
})
export class MyAppointmentsPage implements OnInit {
  private appointmentService = inject(AppointmentService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private alertCtrl = inject(AlertController);

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  doctorNames: { [key: string]: string } = {};
  loading: boolean = true;
  selectedSegment: string = 'upcoming';

  async ngOnInit() {
    await this.loadAppointments();
  }

  async loadAppointments() {
    this.loading = true;
    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.appointments = await this.appointmentService.getPatientAppointments(user.uid);
        
        // Charger les noms des médecins
        for (const appointment of this.appointments) {
          const doctor = await this.userService.getUserById(appointment.doctorId);
          if (doctor) {
            this.doctorNames[appointment.doctorId] = `Dr. ${doctor['firstName']} ${doctor['lastName']}`;
          }
        }
        
        this.filterAppointments();
      }
    } catch (error) {
      console.error('Erreur chargement RDV:', error);
    } finally {
      this.loading = false;
    }
  }

  filterAppointments() {
    const now = new Date();
    
    if (this.selectedSegment === 'upcoming') {
      this.filteredAppointments = this.appointments.filter(apt => 
        (apt.status === 'pending' || apt.status === 'confirmed') && 
        new Date(apt.date) >= now
      );
    } else if (this.selectedSegment === 'past') {
      this.filteredAppointments = this.appointments.filter(apt => 
        apt.status === 'completed' || 
        (apt.status === 'cancelled' || new Date(apt.date) < now)
      );
    }
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    this.filterAppointments();
  }

  async cancelAppointment(appointment: Appointment) {
    const alert = await this.alertCtrl.create({
      header: 'Annuler le rendez-vous',
      message: 'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
      buttons: [
        {
          text: 'Non',
          role: 'cancel'
        },
        {
          text: 'Oui, annuler',
          role: 'confirm',
          handler: async () => {
            if (appointment.id) {
              await this.appointmentService.cancelAppointment(appointment.id);
              await this.loadAppointments();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}