import { Injectable } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Observable, from, of } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

interface User {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = null;

  constructor(private auth0: Auth0Service) {
    // Try to get token from localStorage on initialization
    this.token = localStorage.getItem('authToken');

    // Set up token refresh
    this.auth0.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.refreshToken().subscribe();
      }
    });
  }

  login(): void {
    this.auth0.loginWithRedirect();
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.token = null;
    this.auth0.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }

  isAuthenticated(): Observable<boolean> {
    return this.auth0.isAuthenticated$;
  }

  getUser(): Observable<User | null | undefined> {
    return this.auth0.user$;
  }

  getToken(): string | null {
    return this.token;
  }

  refreshToken(): Observable<string | null> {
    return this.auth0.isAuthenticated$.pipe(
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          console.warn('User is not authenticated, cannot get token');
          return of(null);
        }
        
        return from(this.auth0.getAccessTokenSilently()).pipe(
          tap(token => {
            this.token = token;
            localStorage.setItem('authToken', token);
          }),
          catchError(error => {
            console.error('Error getting access token:', error);
            return of(null);
          })
        );
      })
    );
  }
}
