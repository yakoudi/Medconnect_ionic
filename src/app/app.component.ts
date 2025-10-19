// src/app/app.component.ts
import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Fix pour le warning aria-hidden
      this.fixAriaHiddenIssue();
    });
  }

  // Fix le problème aria-hidden avec les pages Ionic
  private fixAriaHiddenIssue() {
    // Observer les changements de pages
    const observer = new MutationObserver(() => {
      const hiddenPages = document.querySelectorAll('.ion-page-hidden');
      hiddenPages.forEach(page => {
        // Retirer le focus des éléments dans les pages cachées
        const focusedElement = page.querySelector(':focus');
        if (focusedElement && focusedElement instanceof HTMLElement) {
          focusedElement.blur();
        }
      });
    });

    // Observer les changements dans le DOM
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'aria-hidden']
    });
  }
}