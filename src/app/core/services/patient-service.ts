// src/app/core/services/patient.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { Patient } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private firestore = inject(Firestore);

  // Récupérer un patient par ID
  async getPatientById(patientId: string): Promise<Patient | null> {
    const docRef = doc(this.firestore, 'users', patientId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        email: data['email'],
        role: 'patient',
        firstName: data['firstName'],
        lastName: data['lastName'],
        phone: data['phone'],
        photoURL: data['photoURL'],
        createdAt: data['createdAt']?.toDate() || new Date(),
        dateOfBirth: data['dateOfBirth']?.toDate() || new Date(),
        address: data['address'] || '',
        medicalHistory: data['medicalHistory'] || []
      } as Patient;
    }
    return null;
  }

  // Mettre à jour le profil du patient
  async updatePatientProfile(patientId: string, data: Partial<Patient>): Promise<void> {
    const docRef = doc(this.firestore, 'users', patientId);
    await updateDoc(docRef, { ...data });
  }

  // Ajouter un élément à l'historique médical
  async addMedicalHistory(patientId: string, entry: string): Promise<void> {
    const docRef = doc(this.firestore, 'users', patientId);
    await updateDoc(docRef, {
      medicalHistory: arrayUnion(entry)
    });
  }
}