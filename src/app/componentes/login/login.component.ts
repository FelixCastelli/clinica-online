import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../servicios/firebase.service';
import { Router } from '@angular/router';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../servicios/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  contrasenia: string = '';
  error:string = '';
  exito = true;

  usuariosAccesoRapido = [
    { mail: 'xokel95564@aleitar.com', contrasenia: '123456', img: 'https://firebasestorage.googleapis.com/v0/b/clinica-online-72196.appspot.com/o/admin.webp?alt=media&token=b7611617-3491-4cfc-bf71-a7df1d655d33'},
    { mail: 'kimone4072@edectus.com', contrasenia: '123456', img: 'https://firebasestorage.googleapis.com/v0/b/clinica-online-72196.appspot.com/o/imagenes%2Fespecialista-portrait-3157821__340.webp?alt=media&token=625cf766-a9e5-44d9-8fba-1097d915934f'},
    { mail: 'jibolek858@cironex.com', contrasenia: '123456', img: 'https://firebasestorage.googleapis.com/v0/b/clinica-online-72196.appspot.com/o/imagenes%2Fespecialista-persona-origen-indio-divirtiendose_23-2150285283.webp?alt=media&token=623cccd4-9a2a-44a7-8333-3f52c08b5b50'},
    { mail: 'pewalot838@gianes.com', contrasenia: '123456', img: 'https://firebasestorage.googleapis.com/v0/b/clinica-online-72196.appspot.com/o/imagenes%2Fpaciente_photo-1560250097-0b93528c311a.webp?alt=media&token=796bc9a8-620a-4a28-be80-a766f94dc721'},
    { mail: 'wabeco5114@anypng.com', contrasenia: '123456', img: 'https://firebasestorage.googleapis.com/v0/b/clinica-online-72196.appspot.com/o/imagenes%2Fpaciente-portrait-of-a-smiling-latin-woman-in-a-garden.webp?alt=media&token=c6e1ae46-9f97-4917-92f9-4fcd01a4f77f'},
    { mail: 'wikayi9678@cironex.com', contrasenia: '123456', img: 'https://firebasestorage.googleapis.com/v0/b/clinica-online-72196.appspot.com/o/imagenes%2Fpaciente-chico-guapo-seguro-posando-contra-pared-blanca_176420-32936.webp?alt=media&token=f63087e3-d771-4759-883e-95f42f59bc73'}
  ]

  constructor(private router: Router, private firestore : Firestore, private firebaseService: FirebaseService, private loadingService: LoadingService) {}

  async logIn() {
    this.loadingService.show();
    try {
        await this.firebaseService.logIn(this.email, this.contrasenia);

        const isValidado = await this.firebaseService.verificarEspecialista(this.email);
        
        if (isValidado === false) {
            this.error = "La cuenta debe ser validada por un administrador.";
            this.exito = false;
            return;
        } else if (isValidado === null) {
            this.router.navigate(['/home']);
            return;
        }

        let col = collection(this.firestore, 'logins');
        let obj = { 'usuario': this.email };
        await addDoc(col, obj);
        this.router.navigate(['/home']);
    } catch (e: any) {
        this.exito = false;
        if (e.message === "Email no verificado") {
            this.error = "Verifique su correo";
        } else {
            this.error = "Correo electrónico o contraseña inválidos";
        }
    } finally {
        this.loadingService.hide();
    }
  }

  async irARegistro() {
    this.loadingService.show();
    try {
      await this.router.navigate(['/registro']);
    } finally {
      this.loadingService.hide();
    }
  }

  accesoRapido(email: string, contrasenia: string) {
    this.email = email;
    this.contrasenia = contrasenia;
  }
}
