export interface Appointment {
  id?: string;
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason: string;
  notes?: string;
  createdAt: Date;
}