import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButton, IonInput, IonItem, IonLabel, IonCard,
  IonCardContent, IonIcon, LoadingController, ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { medical } from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonInput, IonItem, IonLabel,
    IonCard, IonCardContent, IonIcon
  ]
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor() {
    addIcons({ medical });
  }

  async login() {
    if (!this.email || !this.password) {
      this.showToast('Veuillez remplir tous les champs', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Connexion en cours...',
    });
    await loading.present();

    try {
      const user = await this.authService.login(this.email, this.password);
      
      // Récupérer les données utilisateur
      const userData = await this.authService.getUserData(user.uid);
      
      await loading.dismiss();
      await this.showToast('Connexion réussie !', 'success');
      
      // Redirection selon le rôle
      if (userData && userData['role'] === 'patient') {
        this.router.navigate(['/patient/home']);
      } else if (userData && userData['role'] === 'doctor') {
        this.router.navigate(['/doctor/home']);
      } else {
        this.router.navigate(['/home']);
      }
      
    } catch (error: any) {
      await loading.dismiss();
      
      if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'Aucun compte trouvé avec cet email';
      } else if (error.code === 'auth/wrong-password') {
        this.errorMessage = 'Mot de passe incorrect';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Email invalide';
      } else if (error.code === 'auth/invalid-credential') {
        this.errorMessage = 'Email ou mot de passe incorrect';
      } else {
        this.errorMessage = 'Erreur de connexion: ' + error.message;
      }
      
      await this.showToast(this.errorMessage, 'danger');
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