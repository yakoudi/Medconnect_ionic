// src/app/core/services/notification.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, orderBy, Timestamp } from '@angular/fire/firestore';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'reminder' | 'info';
  read: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private firestore = inject(Firestore);

  // Créer une notification
  async createNotification(notification: Omit<Notification, 'id'>): Promise<string> {
    const notificationsRef = collection(this.firestore, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      ...notification,
      createdAt: Timestamp.fromDate(new Date())
    });
    return docRef.id;
  }

  // Récupérer les notifications d'un utilisateur
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const notificationsRef = collection(this.firestore, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        ...data,
        createdAt: data['createdAt'].toDate()
      } as Notification);
    });
    
    return notifications;
  }

  // Notifier un nouveau rendez-vous
  async notifyNewAppointment(userId: string, doctorName: string, date: Date): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Nouveau rendez-vous',
      message: `Votre rendez-vous avec Dr. ${doctorName} a été créé pour le ${date.toLocaleDateString('fr-FR')}`,
      type: 'appointment',
      read: false,
      createdAt: new Date()
    });
  }

  // Notifier une confirmation de rendez-vous
  async notifyAppointmentConfirmed(userId: string, doctorName: string, date: Date): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Rendez-vous confirmé',
      message: `Dr. ${doctorName} a confirmé votre rendez-vous du ${date.toLocaleDateString('fr-FR')}`,
      type: 'appointment',
      read: false,
      createdAt: new Date()
    });
  }

  // Notifier une annulation de rendez-vous
  async notifyAppointmentCancelled(userId: string, date: Date): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Rendez-vous annulé',
      message: `Le rendez-vous du ${date.toLocaleDateString('fr-FR')} a été annulé`,
      type: 'appointment',
      read: false,
      createdAt: new Date()
    });
  }
}