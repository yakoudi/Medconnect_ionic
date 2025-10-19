import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Garder FormsModule
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButton, IonInput, IonItem, IonLabel, IonCard,
  IonCardContent, IonIcon, IonSelect, IonSelectOption,
  IonText, LoadingController, ToastController, IonList 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle, medkit } from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth-service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // ✅ C'est correct
    RouterLink,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonInput, IonItem, IonLabel,
    IonCard, IonCardContent, IonIcon, IonSelect,
    IonSelectOption, IonText, IonList
  ]
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  // Données du formulaire
  role: 'patient' | 'doctor' = 'patient';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  firstName: string = '';
  lastName: string = '';
  phone: string = '';
  
  // Données spécifiques Patient
  dateOfBirth: string = '';
  address: string = '';
  
  // Données spécifiques Médecin
  speciality: string = '';
  registrationNumber: string = '';
  consultationFee: number = 0;

  errorMessage: string = '';

  constructor() {
    addIcons({ personCircle, medkit });
  }

  // Validation du formulaire
  isFormValid(): boolean {
    // Validation commune
    if (!this.email || !this.password || !this.confirmPassword ||
        !this.firstName || !this.lastName || !this.phone) {
      return false;
    }

    // Vérifier que les mots de passe correspondent
    if (this.password !== this.confirmPassword) {
      return false;
    }

    // Validation spécifique selon le rôle
    if (this.role === 'patient') {
      return !!(this.dateOfBirth && this.address);
    } else {
      return !!(this.speciality && this.registrationNumber && this.consultationFee > 0);
    }
  }

  async register() {
    this.errorMessage = '';

    // Validation
    if (!this.isFormValid()) {
      this.showToast('Veuillez remplir tous les champs', 'warning');
      return;
    }

    if (this.password.length < 6) {
      this.showToast('Le mot de passe doit contenir au moins 6 caractères', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showToast('Les mots de passe ne correspondent pas', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Création du compte...',
    });
    await loading.present();

    try {
      // Préparer les données selon le rôle
      let userData: any = {
        role: this.role,
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone
      };

      if (this.role === 'patient') {
        userData = {
          ...userData,
          dateOfBirth: new Date(this.dateOfBirth),
          address: this.address,
          medicalHistory: []
        };
      } else {
        userData = {
          ...userData,
          speciality: this.speciality,
          registrationNumber: this.registrationNumber,
          verified: true, // Mettre true pour les tests
          address: this.address || '',
          consultationFee: this.consultationFee,
          availableHours: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
          bio: 'Médecin qualifié et expérimenté'
        };
      }

      // Créer le compte
      await this.authService.register(this.email, this.password, userData);
      await loading.dismiss();
      
      await this.showToast('Compte créé avec succès !', 'success');
      
      // Rediriger vers la page de connexion
      this.router.navigate(['/login']);
      
    } catch (error: any) {
      await loading.dismiss();
      
      // Gestion des erreurs Firebase
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'Cet email est déjà utilisé';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Email invalide';
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = 'Mot de passe trop faible';
      } else {
        this.errorMessage = 'Erreur lors de la création du compte: ' + error.message;
      }
      
      await this.showToast(this.errorMessage, 'danger');
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}