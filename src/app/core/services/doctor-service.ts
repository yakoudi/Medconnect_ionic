// src/app/core/services/doctor.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { Doctor } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private firestore = inject(Firestore);

  // Récupérer un médecin par ID
  async getDoctorById(doctorId: string): Promise<Doctor | null> {
    const docRef = doc(this.firestore, 'users', doctorId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        email: data['email'],
        role: 'doctor',
        firstName: data['firstName'],
        lastName: data['lastName'],
        phone: data['phone'],
        photoURL: data['photoURL'],
        createdAt: data['createdAt']?.toDate() || new Date(),
        speciality: data['speciality'],
        registrationNumber: data['registrationNumber'],
        verified: data['verified'] || false,
        address: data['address'] || '',
        consultationFee: data['consultationFee'] || 0,
        availableHours: data['availableHours'] || [],
        bio: data['bio'] || ''
      } as Doctor;
    }
    return null;
  }

  // Récupérer tous les médecins vérifiés
  async getVerifiedDoctors(): Promise<Doctor[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(
      usersRef, 
      where('role', '==', 'doctor'),
      where('verified', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    const doctors: Doctor[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      doctors.push({ 
        uid: docSnapshot.id,
        email: data['email'],
        role: 'doctor',
        firstName: data['firstName'],
        lastName: data['lastName'],
        phone: data['phone'],
        photoURL: data['photoURL'],
        createdAt: data['createdAt']?.toDate() || new Date(),
        speciality: data['speciality'],
        registrationNumber: data['registrationNumber'],
        verified: data['verified'] || false,
        address: data['address'] || '',
        consultationFee: data['consultationFee'] || 0,
        availableHours: data['availableHours'] || [],
        bio: data['bio'] || ''
      } as Doctor);
    });
    
    return doctors;
  }

  // Mettre à jour les disponibilités du médecin
  async updateAvailability(doctorId: string, availableHours: string[]): Promise<void> {
    const docRef = doc(this.firestore, 'users', doctorId);
    await updateDoc(docRef, { availableHours });
  }

  // Mettre à jour le profil du médecin
  async updateDoctorProfile(doctorId: string, data: Partial<Doctor>): Promise<void> {
    const docRef = doc(this.firestore, 'users', doctorId);
    await updateDoc(docRef, { ...data });
  }
}