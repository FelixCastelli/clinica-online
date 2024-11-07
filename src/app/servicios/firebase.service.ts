import { Injectable, inject } from '@angular/core';
import { FirebaseApp, initializeApp } from '@angular/fire/app';
import { Auth, getAuth, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, getFirestore, collection, getDocs, query, where, updateDoc, doc } from '@angular/fire/firestore';
import { environmentConfig } from '../environment.config';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Storage, getStorage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Especialista } from '../especialista.model';
import { Paciente } from '../paciente.model';
import { Administrador } from '../administrador.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private app: FirebaseApp;
  public firestore: Firestore;
  public auth: Auth;
  public storage: Storage;
  usuarioActual: User | null = null;

  constructor() { 
    this.app = initializeApp(environmentConfig);
    this.firestore = getFirestore(this.app);
    this.auth = getAuth(this.app);
    this.storage = getStorage(this.app);
    this.initializeAuthListener();
  }

  private initializeAuthListener(): void {
    onAuthStateChanged(this.auth, (usuario: User | null) => {
      this.usuarioActual = usuario;
    });
  }

  public getUsuarioActual(): User | null {
    return this.usuarioActual;
  }

  getUsuarioLogeado(){
    let afAuth = inject(AngularFireAuth);
    return afAuth.authState;
  }

  async logIn(email: string, contrasenia: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, contrasenia);
      const user = this.auth.currentUser;
      if (user && !user.emailVerified) {
        throw new Error("Email no verificado");
      }
    } catch (error) {
      throw error;
    }
  }

  async registro(email: string, contrasenia: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, contrasenia);
    } catch (error) {
      throw error;
    }
  }

  async sendEmailVerification(): Promise<void> {
    const user = this.getUsuarioActual();
    if (user) {
      await sendEmailVerification(user);
    }
  }

  async subirImagen(file: File, path: string): Promise<string> {
    const imageRef = ref(this.storage, path);
    await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  }

  async getAdminEmails(): Promise<string[]> {
    const adminEmails: string[] = [];
    const adminCollection = collection(this.firestore, 'administradores');
  
    const adminSnapshot = await getDocs(adminCollection);
    adminSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data['mail']) {
        adminEmails.push(data['mail']);
      }
    });
    return adminEmails;
  }

  async traerEspecialistas(): Promise<Especialista[]> {
    const especialistas: Especialista[] = [];
    const especialistasCollection = collection(this.firestore, 'especialistas');
    const snapshot = await getDocs(especialistasCollection);

    snapshot.forEach((doc) => {
      const data = doc.data();
      especialistas.push({
        nombre: data['nombre'],
        apellido: data['apellido'],
        edad: data['edad'],
        dni: data['dni'],
        especialidad: data['especialidad'],
        mail: data['mail'],
        imagenPerfil: data['imagenPerfil'],
        validado: data['validado']
      } as Especialista);
    });

    return especialistas;
  }

  async traerPacientes(): Promise<Paciente[]> {
    const pacientes: Paciente[] = [];
    const pacientesCollection = collection(this.firestore, 'pacientes');
    const snapshot = await getDocs(pacientesCollection);

    snapshot.forEach((doc) => {
      const data = doc.data();
      pacientes.push({
        nombre: data['nombre'],
        apellido: data['apellido'],
        edad: data['edad'],
        dni: data['dni'],
        mail: data['mail'],
        obraSocial: data['obraSocial'],
        imagenesPerfil: data['imagenesPerfil']
      } as Paciente);
    });
    return pacientes;
  }

  async traerAdministradores(): Promise<Administrador[]> {
    const administradores: Administrador[] = [];
    const administradoresCollection = collection(this.firestore, 'administradores');
    const snapshot = await getDocs(administradoresCollection);

    snapshot.forEach((doc) => {
      const data = doc.data();
      administradores.push({
        nombre: data['nombre'],
        apellido: data['apellido'],
        edad: data['edad'],
        dni: data['dni'],
        mail: data['mail'],
        imagenPerfil: data['imagenPerfil']
      } as Administrador);
    });
    return administradores;
  }

  async actualizarValidacionEspecialista(especialista: Especialista) {
    try {
      const especialistasCollection = collection(this.firestore, 'especialistas');
      const especialistaSnapshot = await getDocs(query(especialistasCollection, where('mail', '==', especialista.mail)));
  
      if (!especialistaSnapshot.empty) {
        const especialistaDoc = especialistaSnapshot.docs[0];
        const especialistaRef = doc(this.firestore, 'especialistas', especialistaDoc.id);
        await updateDoc(especialistaRef, {
          validado: especialista.validado
        });
      }
    } catch (error) {
      console.error('Error al actualizar la validación del especialista:', error);
    }
  }

  async verificarEspecialista(email: string): Promise<boolean | null> {
    const especialistasCollection = collection(this.firestore, 'especialistas');
    const especialistasSnapshot = await getDocs(query(especialistasCollection, where('mail', '==', email)));

    if (!especialistasSnapshot.empty) {
        const especialistaData = especialistasSnapshot.docs[0].data() as Especialista;
        return especialistaData.validado;
    }
    return null;
  }

}
