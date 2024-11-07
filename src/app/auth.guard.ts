import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FirebaseService } from './servicios/firebase.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private firebaseService: FirebaseService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.firebaseService.getUsuarioLogeado().pipe(
      map((user) => {
        if (user) {
          return true;
        } else {
          this.router.navigate(['/bienvenida']);
          return false;
        }
      })
    );
  }
}
