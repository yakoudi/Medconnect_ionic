import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, calendarOutline, personOutline, documentTextOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth-service';
import { UserService } from 'src/app/core/services/user-service';
import { HeaderComponent } from 'src/app/shared/components/header/header/header.component';


@Component({
  selector: 'app-patient-home',
  templateUrl: './patient-home.page.html',
  styleUrls: ['./patient-home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    IonContent, IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonIcon
  ]
})
export class PatientHomePage implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  patientName: string = '';

  constructor() {
    addIcons({ searchOutline, calendarOutline, personOutline, documentTextOutline });
  }

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      const userData = await this.userService.getUserById(user.uid);
      if (userData) {
        this.patientName = userData['firstName'] || '';
      }
    }
  }
}