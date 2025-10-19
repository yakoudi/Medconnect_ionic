import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

export const roleGuard = async (route: ActivatedRouteSnapshot) => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      
      if (!user) {
        router.navigate(['/login']);
        resolve(false);
        return;
      }

      const expectedRole = route.data['role'] as 'patient' | 'doctor';
      
      try {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData['role'] === expectedRole) {
            resolve(true);
            return;
          }
        }
        
        // Si le rôle ne correspond pas, rediriger vers la bonne page
        const userData = docSnap.data();
        if (userData && userData['role'] === 'patient') {
          router.navigate(['/patient/home']);
        } else if (userData && userData['role'] === 'doctor') {
          router.navigate(['/doctor/home']);
        } else {
          router.navigate(['/login']);
        }
        resolve(false);
      } catch (error) {
        console.error('Erreur role guard:', error);
        router.navigate(['/login']);
        resolve(false);
      }
    });
  });
};