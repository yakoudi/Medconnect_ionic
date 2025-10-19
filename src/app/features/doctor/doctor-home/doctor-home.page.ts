// src/app/features/doctor/doctor-home/doctor-home.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { 
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonIcon, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, timeOutline, peopleOutline, 
  personOutline, statsChartOutline, checkmarkCircleOutline 
} from 'ionicons/icons';
import { HeaderComponent } from 'src/app/shared/components/header/header/header.component';
import { AuthService } from 'src/app/core/services/auth-service';
import { UserService } from 'src/app/core/services/user-service';
import { AppointmentService } from 'src/app/core/services/appointment-service';

@Component({
  selector: 'app-doctor-home',
  templateUrl: './doctor-home.page.html',
  styleUrls: ['./doctor-home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonIcon, IonBadge
  ]
})
export class DoctorHomePage implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private appointmentService = inject(AppointmentService);

  doctorName: string = '';
  verified: boolean = false;
  pendingAppointments: number = 0;
  confirmedAppointments: number = 0;

  constructor() {
    addIcons({ 
      calendarOutline, timeOutline, peopleOutline, 
      personOutline, statsChartOutline, checkmarkCircleOutline 
    });
  }

  async ngOnInit() {
    await this.loadDoctorInfo();
    await this.loadStatistics();
  }

  async loadDoctorInfo() {
    const user = this.authService.getCurrentUser();
    if (user) {
      const userData = await this.userService.getUserById(user.uid);
      if (userData) {
        this.doctorName = `${userData['firstName']} ${userData['lastName']}`;
        this.verified = userData['verified'] || false;
      }
    }
  }

  async loadStatistics() {
    const user = this.authService.getCurrentUser();
    if (user) {
      try {
        const appointments = await this.appointmentService.getDoctorAppointments(user.uid);
        const now = new Date();
        
        this.pendingAppointments = appointments.filter(apt => 
          apt.status === 'pending' && new Date(apt.date) >= now
        ).length;
        
        this.confirmedAppointments = appointments.filter(apt => 
          apt.status === 'confirmed' && new Date(apt.date) >= now
        ).length;
      } catch (error) {
        console.error('Erreur chargement statistiques:', error);
      }
    }
  }
}