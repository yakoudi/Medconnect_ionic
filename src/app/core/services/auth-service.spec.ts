import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  user 
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  
  user$: Observable<any>;

  constructor() {
    this.user$ = user(this.auth);
  }

  // Inscription - Version simplifiée sans NgZone
  async register(email: string, password: string, userData: any) {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Sauvegarder dans Firestore
      await setDoc(doc(this.firestore, 'users', credential.user.uid), {
        ...userData,
        uid: credential.user.uid,
        email: email,
        createdAt: new Date()
      });

      return credential.user;
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      throw error;
    }
  }

  // Connexion
  async login(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return credential.user;
    } catch (error: any) {
      console.error('Erreur connexion:', error);
      throw error;
    }
  }

  // Déconnexion
  async logout() {
    return await signOut(this.auth);
  }

  // Récupérer les données utilisateur
  async getUserData(uid: string) {
    const docRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  }

  // Utilisateur actuel
  getCurrentUser() {
    return this.auth.currentUser;
  }
}