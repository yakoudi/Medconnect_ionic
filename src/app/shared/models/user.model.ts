export interface User {
  uid: string;
  email: string;
  role: 'patient' | 'doctor';
  firstName: string;
  lastName: string;
  phone: string;
  photoURL?: string;
  createdAt: Date;
}

export interface Patient extends User {
  role: 'patient';
  dateOfBirth: Date;
  address: string;
  medicalHistory?: string[];
}

export interface Doctor extends User {
  role: 'doctor';
  speciality: string;
  registrationNumber: string;
  verified: boolean;
  address: string;
  consultationFee: number;
  availableHours?: string[];
  bio?: string;
}