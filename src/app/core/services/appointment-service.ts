// src/app/core/services/appointment.service.ts
// VERSION SANS INDEX - Fonctionne immédiatement sans configuration Firebase

import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, Timestamp } from '@angular/fire/firestore';
import { Appointment } from '../../shared/models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private firestore = inject(Firestore);

  // Créer un rendez-vous
  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<string> {
    const appointmentsRef = collection(this.firestore, 'appointments');
    const docRef = await addDoc(appointmentsRef, {
      ...appointment,
      createdAt: Timestamp.fromDate(new Date()),
      date: Timestamp.fromDate(appointment.date)
    });
    return docRef.id;
  }

  // Récupérer un rendez-vous par ID
  async getAppointmentById(id: string): Promise<Appointment | null> {
    const docRef = doc(this.firestore, 'appointments', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        date: data['date'].toDate(),
        createdAt: data['createdAt'].toDate()
      } as Appointment;
    }
    return null;
  }

  // Récupérer les rendez-vous d'un patient
  // VERSION SANS INDEX - Tri côté client
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      
      // Requête simple SANS orderBy (pas besoin d'index composite)
      const q = query(
        appointmentsRef,
        where('patientId', '==', patientId)
      );
      
      const querySnapshot = await getDocs(q);
      const appointments: Appointment[] = [];
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        appointments.push({
          id: docSnapshot.id,
          patientId: data['patientId'],
          doctorId: data['doctorId'],
          date: data['date'].toDate(),
          time: data['time'],
          status: data['status'],
          reason: data['reason'],
          notes: data['notes'] || '',
          createdAt: data['createdAt'].toDate()
        });
      });
      
      // Trier côté client par date décroissante (les plus récents en premier)
      appointments.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      return appointments;
    } catch (error) {
      console.error('Erreur récupération RDV patient:', error);
      return [];
    }
  }

  // Récupérer les rendez-vous d'un médecin
  // VERSION SANS INDEX - Tri côté client
  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(this.firestore, 'appointments');
      
      // Requête simple SANS orderBy (pas besoin d'index composite)
      const q = query(
        appointmentsRef,
        where('doctorId', '==', doctorId)
      );
      
      const querySnapshot = await getDocs(q);
      const appointments: Appointment[] = [];
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        appointments.push({
          id: docSnapshot.id,
          patientId: data['patientId'],
          doctorId: data['doctorId'],
          date: data['date'].toDate(),
          time: data['time'],
          status: data['status'],
          reason: data['reason'],
          notes: data['notes'] || '',
          createdAt: data['createdAt'].toDate()
        });
      });
      
      // Trier côté client par date décroissante (les plus récents en premier)
      appointments.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      return appointments;
    } catch (error) {
      console.error('Erreur récupération RDV médecin:', error);
      return [];
    }
  }

  // Mettre à jour le statut d'un rendez-vous
  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'appointments', id);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      throw error;
    }
  }

  // Annuler un rendez-vous
  async cancelAppointment(id: string): Promise<void> {
    return this.updateAppointmentStatus(id, 'cancelled');
  }

  // Confirmer un rendez-vous
  async confirmAppointment(id: string): Promise<void> {
    return this.updateAppointmentStatus(id, 'confirmed');
  }

  // Compléter un rendez-vous
  async completeAppointment(id: string, notes?: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'appointments', id);
      await updateDoc(docRef, { 
        status: 'completed',
        notes: notes || '',
        completedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Erreur complétion RDV:', error);
      throw error;
    }
  }

  // Récupérer les rendez-vous d'aujourd'hui pour un médecin
  async getTodayAppointments(doctorId: string): Promise<Appointment[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const appointments = await this.getDoctorAppointments(doctorId);
      
      // Filtrer les RDV d'aujourd'hui
      return appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });
    } catch (error) {
      console.error('Erreur RDV du jour:', error);
      return [];
    }
  }

  // Récupérer les prochains rendez-vous (à venir)
  async getUpcomingAppointments(userId: string, isDoctor: boolean): Promise<Appointment[]> {
    try {
      const appointments = isDoctor 
        ? await this.getDoctorAppointments(userId)
        : await this.getPatientAppointments(userId);
      
      const now = new Date();
      
      // Filtrer les RDV futurs non annulés
      return appointments.filter(apt => 
        new Date(apt.date) >= now && 
        apt.status !== 'cancelled' &&
        apt.status !== 'completed'
      );
    } catch (error) {
      console.error('Erreur RDV à venir:', error);
      return [];
    }
  }
}