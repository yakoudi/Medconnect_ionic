import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, collection, query, where, getDocs, DocumentData } from '@angular/fire/firestore';
import { Patient, Doctor } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);

  // Récupérer un utilisateur par ID
  async getUserById(uid: string): Promise<DocumentData | null> {
    const docRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  // Mettre à jour un utilisateur
  async updateUser(uid: string, data: Partial<Patient | Doctor>) {
    const docRef = doc(this.firestore, 'users', uid);
    await updateDoc(docRef, { ...data });
  }

  // Récupérer tous les médecins
  async getAllDoctors(): Promise<Doctor[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', 'doctor'), where('verified', '==', true));
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
        address: data['address'],
        consultationFee: data['consultationFee'] || 0,
        availableHours: data['availableHours'] || [],
        bio: data['bio'] || ''
      } as Doctor);
    });
    
    return doctors;
  }

  // Rechercher des médecins par spécialité
  async searchDoctorsBySpeciality(speciality: string): Promise<Doctor[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(
      usersRef, 
      where('role', '==', 'doctor'),
      where('speciality', '==', speciality),
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
        address: data['address'],
        consultationFee: data['consultationFee'] || 0,
        availableHours: data['availableHours'] || [],
        bio: data['bio'] || ''
      } as Doctor);
    });
    
    return doctors;
  } 
}