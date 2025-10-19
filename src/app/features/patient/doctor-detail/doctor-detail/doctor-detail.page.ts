import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonCard ,IonList, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonChip, IonLabel, IonAvatar, IonItem, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, cashOutline, timeOutline, starOutline, callOutline, mailOutline } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/shared/components/header/header/header.component';
import { UserService } from 'src/app/core/services/user-service';
import { Doctor } from 'src/app/shared/models/user.model';


@Component({
  selector: 'app-doctor-detail',
  templateUrl: './doctor-detail.page.html',
  styleUrls: ['./doctor-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    IonContent, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonButton, IonIcon, IonChip, IonLabel,
    IonAvatar, IonItem, IonSpinner ,  IonList,
    
  ]
})
export class DoctorDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  doctor?: Doctor;
  loading: boolean = true;
  doctorId: string = '';

  constructor() {
    addIcons({ locationOutline, cashOutline, timeOutline, starOutline, callOutline, mailOutline });
  }

  async ngOnInit() {
    this.doctorId = this.route.snapshot.paramMap.get('id') || '';
    await this.loadDoctorDetails();
  }

  async loadDoctorDetails() {
    this.loading = true;
    try {
      const userData = await this.userService.getUserById(this.doctorId);
      if (userData && userData['role'] === 'doctor') {
        this.doctor = userData as unknown as Doctor;
      }
    } catch (error) {
      console.error('Erreur chargement médecin:', error);
    } finally {
      this.loading = false;
    }
  }

  bookAppointment() {
    this.router.navigate(['/patient/book-appointment', this.doctorId]);
  }
}