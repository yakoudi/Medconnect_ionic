import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonBackButton 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, arrowBack } from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth-service';

@Component({
  selector: 'app-header',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start" *ngIf="showBackButton">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
        
        <ion-title>{{ title }}</ion-title>
        
        <ion-buttons slot="end" *ngIf="showLogout">
          <ion-button (click)="logout()">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
  `,
  standalone: true,
  imports: [ 
    CommonModule, 
    IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonIcon, IonBackButton 
  ]
})
export class HeaderComponent {
  @Input() title: string = 'MediConnect';
  @Input() showBackButton: boolean = false;
  @Input() showLogout: boolean = true;

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({ logOutOutline, arrowBack });
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}