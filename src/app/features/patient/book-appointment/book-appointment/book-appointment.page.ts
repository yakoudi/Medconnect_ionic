import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonSelect, IonSelectOption, LoadingController, ToastController } from '@ionic/angular/standalone';

import { format } from 'date-fns';
import { HeaderComponent } from 'src/app/shared/components/header/header/header.component';
import { AppointmentService } from 'src/app/core/services/appointment-service';
import { UserService } from 'src/app/core/services/user-service';
import { AuthService } from 'src/app/core/services/auth-service';
import { Doctor } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.page.html',
  styleUrls: ['./book-appointment.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonTextarea, IonButton,
    IonSelect, IonSelectOption
  ]
})
export class BookAppointmentPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  doctorId: string = '';
  doctor?: Doctor;
  
  selectedDate: string = '';
  selectedTime: string = '';
  reason: string = '';
  notes: string = '';

  timeSlots: string[] = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  minDate: string = new Date().toISOString();

  async ngOnInit() {
    this.doctorId = this.route.snapshot.paramMap.get('id') || '';
    await this.loadDoctorInfo();
  }

  async loadDoctorInfo() {
    const userData = await this.userService.getUserById(this.doctorId);
    if (userData && userData['role'] === 'doctor') {
      this.doctor = userData as unknown as Doctor;
    }
  }

  async bookAppointment() {
    if (!this.selectedDate || !this.selectedTime || !this.reason) {
      this.showToast('Veuillez remplir tous les champs requis', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Création du rendez-vous...',
    });
    await loading.present();

    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const appointmentDate = new Date(this.selectedDate);

      await this.appointmentService.createAppointment({
        patientId: user.uid,
        doctorId: this.doctorId,
        date: appointmentDate,
        time: this.selectedTime,
        status: 'pending',
        reason: this.reason,
        notes: this.notes,
        createdAt: new Date()
      });

      await loading.dismiss();
      await this.showToast('Rendez-vous créé avec succès !', 'success');
      this.router.navigate(['/patient/my-appointments']);

    } catch (error) {
      console.error('Erreur création RDV:', error);
      await loading.dismiss();
      await this.showToast('Erreur lors de la création du rendez-vous', 'danger');
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