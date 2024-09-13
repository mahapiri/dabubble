import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp({
          projectId: 'dabubble-214c3',
          appId: '1:32084063258:web:ec786fc4bc3d62a6eb0da3',
          storageBucket: 'dabubble-214c3.appspot.com',
          apiKey: 'AIzaSyCPlIL2uLIRqCGVEJx0Bxm26odZI31Q3kc',
          authDomain: 'dabubble-214c3.firebaseapp.com',
          messagingSenderId: '32084063258',
        })
      )
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideDatabase(() => getDatabase())),
    importProvidersFrom(provideStorage(() => getStorage())),
    provideAnimationsAsync(),
  ],
};
