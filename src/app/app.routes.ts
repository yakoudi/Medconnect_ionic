// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.page').then(m => m.RegisterPage)
  },

  // ==================== ROUTES PATIENT ====================
  {
    path: 'patient',
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        data: { role: 'patient' },
        canActivate: [roleGuard],
        loadComponent: () => import('./features/patient/patient-home/patient-home/patient-home.page').then(m => m.PatientHomePage)
      },
      {
        path: 'doctor-list',
        data: { role: 'patient' },
        canActivate: [roleGuard],
        loadComponent: () => import('./features/patient/doctor-list/doctor-list/doctor-list.page').then(m => m.DoctorListPage)
      },
      {
        path: 'doctor-detail/:id',
        data: { role: 'patient' },
        canActivate: [roleGuard],
        loadComponent: () => import('./features/patient/doctor-detail/doctor-detail/doctor-detail.page').then(m => m.DoctorDetailPage)
      },
      {
        path: 'book-appointment/:id',
        data: { role: 'patient' },
        canActivate: [roleGuard],
        loadComponent: () => import('./features/patient/book-appointment/book-appointment/book-appointment.page').then(m => m.BookAppointmentPage)
      },
      {
        path: 'my-appointments',
        data: { role: 'patient' },
        canActivate: [roleGuard],
        loadComponent: () => import('./features/patient/my-appointments/my-appointments/my-appointments.page').then(m => m.MyAppointmentsPage)
      },
      {
        path: 'profile',
        data: { role: 'patient' },
        canActivate: [roleGuard],
        loadComponent: () => import('./features/patient/patient-profile/patient-profile.page').then(m => m.PatientProfilePage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },

  // ==================== ROUTES MÉDECIN ====================
  {
    path: 'doctor',
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        data: { role: 'doctor' },
        canActivate: [roleGuard],
        loadComponent: () => import('./features/doctor/doctor-home/doctor-home.page').then(m => m.DoctorHomePage)
      },
      {
        path: 'agenda',
        data: { role: 'doctor' },
        canActivate: [roleGuard],
        loadComponent: () => import('./features/doctor/doctor-agenda/doctor-agenda.page').then(m => m.DoctorAgendaPage)
      },
      {
        path: 'appointments',
        data: { role: 'doctor' },
        canActivate: [roleGuard],
        loadComponent: () => import('./features/doctor/doctor-appointments/doctor-appointments.page').then(m => m.DoctorAppointmentsPage)
      },
      {
        path: 'patient-detail/:id',
        data: { role: 'doctor' },
        canActivate: [roleGuard],
        loadComponent: () => import('./features/doctor/patient-detail/patient-detail.page').then(m => m.PatientDetailPage)
      },
      {
        path: 'profile',
        data: { role: 'doctor' },
        canActivate: [roleGuard],
        loadComponent: () => import('./features/doctor/doctor-profile/doctor-profile.page').then(m => m.DoctorProfilePage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },

  // Route par défaut après login
  {
    path: 'home',
    redirectTo: 'patient/home',
    pathMatch: 'full'
  },

  // Route fallback
  {
    path: '**',
    redirectTo: 'login'
  }
];