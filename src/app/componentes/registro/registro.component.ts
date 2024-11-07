import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Especialista } from '../../especialista.model';
import { Paciente } from '../../paciente.model';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../servicios/firebase.service';
import { Router } from '@angular/router';
import { Firestore, collection, query, collectionData, orderBy, addDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { LoadingService } from '../../servicios/loading.service';
import { Administrador } from '../../administrador.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  seleccionPaciente: boolean = false;
  seleccionEspecialista: boolean = false;
  pacienteForm: FormGroup;
  especialistaForm: FormGroup;
  especialidades: string[] = [];
  subscripcion!: Subscription;
  nuevaEspecialidad: string = '';
  mensajeVerificacion: string = '';
  mostrarMensaje: boolean = false;
  imagen1URL: string ='';
  imagen2URL: string = '';
  emailEnUso: boolean = false;
  isAdmin: boolean = false;
  adminForm: FormGroup;
  seleccionAdmin: boolean = false;

  constructor(private router: Router, private firestore : Firestore, private firebaseService: FirebaseService, private fb: FormBuilder, private loadingService: LoadingService ) {
    this.pacienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)]],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(99), Validators.pattern(/^[0-9]+$/)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      obraSocial: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)]],
      mail: ['', [Validators.required, Validators.email]],
      contrasenia: ['', [Validators.required, Validators.minLength(6)]],
      imagenesPerfil: [null, Validators.required]
    });

    this.especialistaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)]],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99), Validators.pattern(/^[0-9]+$/)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      especialidad: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)]],
      nuevaEspecialidad: [''],
      mail: ['', [Validators.required, Validators.email]],
      contrasenia: ['', [Validators.required, Validators.minLength(6)]],
      imagenPerfil: [null, Validators.required]
    });

    this.adminForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)]],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(99), Validators.pattern(/^[0-9]+$/)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      mail: ['', [Validators.required, Validators.email]],
      contrasenia: ['', [Validators.required, Validators.minLength(6)]],
      imagenPerfil: [null, Validators.required]
    });

    this.cargarEspecialidades();
  }

  async ngOnInit(): Promise<void> {
    const user = this.firebaseService.getUsuarioActual();
    if (user) {
      const adminEmails = await this.firebaseService.getAdminEmails();
      this.isAdmin = adminEmails.includes(user.email || '');
    }
  }

  cargarEspecialidades() {
    const col = collection(this.firestore, 'especialidades');
    const especialidadesQuery = query(col, orderBy('especialidad'));

    this.subscripcion = collectionData(especialidadesQuery).subscribe((respuesta: any) => {
      this.especialidades = respuesta.map((item: { especialidad: string }) => item.especialidad);
    });
  }

  async agregarEspecialidad() {
      const col = collection(this.firestore, 'especialidades');
      const objEspecialidad = { 
        especialidad: this.especialistaForm.value.nuevaEspecialidad.trim()
      };
      try {
        await addDoc(col, objEspecialidad);
        this.especialistaForm.patchValue({ nuevaEspecialidad: '' });
      } catch(error) {
        console.log(error);
    }
  }

  seleccionarPaciente(): void {
    this.seleccionPaciente = true;
    this.seleccionEspecialista = false;
    if (this.isAdmin) {
      this.seleccionAdmin = false;
    }
    this.limpiarFormularioPaciente();
  }

  seleccionarEspecialista(): void {
    this.seleccionPaciente = false;
    this.seleccionEspecialista = true;
    if (this.isAdmin) {
      this.seleccionAdmin = false;
    }
    this.limpiarFormularioEspecialista();
  }

  seleccionarAdmin(): void {
    this.seleccionAdmin = true;
    this.seleccionEspecialista = false;
    this.seleccionPaciente = false;
    this.limpiarFormularioAdmin();
  }

  async registrarPaciente(): Promise<void> {
    if (this.pacienteForm.valid) {
      this.emailEnUso = false;
      this.loadingService.show();
      try {
        const imagenesUrls = this.pacienteForm.value.imagenesPerfil;

        await this.firebaseService.registro(this.pacienteForm.value.mail, this.pacienteForm.value.contrasenia);

        const nuevoPaciente = new Paciente(
          this.pacienteForm.value.nombre,
          this.pacienteForm.value.apellido,
          this.pacienteForm.value.edad,
          this.pacienteForm.value.dni,
          this.pacienteForm.value.mail,
          this.pacienteForm.value.obraSocial,
          imagenesUrls,
        );

        const pacientesCol = collection(this.firestore, 'pacientes');
        await addDoc(pacientesCol, { ...nuevoPaciente });

        await this.firebaseService.sendEmailVerification();

        this.mostrarMensaje = true;
        this.mensajeVerificacion = 'Se ha enviado un correo de verificación.';
        
        setTimeout(() => {
          this.mostrarMensaje = false;
        }, 3000);

        this.limpiarFormularioPaciente();
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          this.emailEnUso = true;
        }
      } finally {
        this.loadingService.hide();
      }
    }
  }

  async registrarEspecialista(): Promise<void> {
    if (this.especialistaForm.valid) {
      this.emailEnUso = false;
      this.loadingService.show();
      try {
        const imagenUrl = this.especialistaForm.value.imagenPerfil;

        await this.firebaseService.registro(this.especialistaForm.value.mail, this.especialistaForm.value.contrasenia);

        const nuevoEspecialista = new Especialista(
          this.especialistaForm.value.nombre,
          this.especialistaForm.value.apellido,
          this.especialistaForm.value.edad,
          this.especialistaForm.value.dni,
          this.especialistaForm.value.mail,
          this.especialistaForm.value.especialidad,
          imagenUrl,
          false
        );

        const especialistasCol = collection(this.firestore, 'especialistas');
        await addDoc(especialistasCol, { ...nuevoEspecialista });
        
        await this.firebaseService.sendEmailVerification();
        
        this.mostrarMensaje = true;
        this.mensajeVerificacion = 'Se ha enviado un correo de verificación.';
        
        setTimeout(() => {
          this.mostrarMensaje = false;
        }, 3000);

        this.limpiarFormularioEspecialista();
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          this.emailEnUso = true;
        }
      } finally {
        this.loadingService.hide();
      }
    }
  }

  async registrarAdmin(): Promise<void> {
    if (this.adminForm.valid) {
      this.emailEnUso = false;
      this.loadingService.show();
      try {
        const imagenUrl = this.adminForm.value.imagenPerfil;

        await this.firebaseService.registro(this.adminForm.value.mail, this.adminForm.value.contrasenia);

        const nuevoAdmin = new Administrador(
          this.adminForm.value.nombre,
          this.adminForm.value.apellido,
          this.adminForm.value.edad,
          this.adminForm.value.dni,
          this.adminForm.value.mail,
          imagenUrl
        );

        const adminCol = collection(this.firestore, 'administradores');
        await addDoc(adminCol, { ...nuevoAdmin });
        
        await this.firebaseService.sendEmailVerification();
        
        this.mostrarMensaje = true;
        this.mensajeVerificacion = 'Se ha enviado un correo de verificación.';
        
        setTimeout(() => {
          this.mostrarMensaje = false;
        }, 3000);

        this.limpiarFormularioAdmin();
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          this.emailEnUso = true;
        }
      } finally {
        this.loadingService.hide();
      }
    }
  }

  async obtenerImagen(event: any, numero: number, tipo: 'paciente' | 'especialista' | 'administrador' = 'paciente') {
    const file = event.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (tipo === 'paciente') {
            if (numero === 1) {
              this.imagen1URL = e.target.result;
            } else if (numero === 2) {
              this.imagen2URL = e.target.result;
            }
          } else if (tipo === 'especialista') {
            this.imagen1URL = e.target.result;
          } else if (tipo === 'administrador') {
            this.imagen1URL = e.target.result;
          }
        };
        reader.readAsDataURL(file);
  
        const path = `imagenes/${tipo}-${file.name}`;
        const url = await this.firebaseService.subirImagen(file, path);
  
        if (tipo === 'paciente') {
          const currentUrls = this.pacienteForm.get('imagenesPerfil')?.value || [];
          const updatedUrls = [...currentUrls];
          updatedUrls[numero - 1] = url;
  
          this.pacienteForm.patchValue({
            imagenesPerfil: updatedUrls
          });
        } else if (tipo === 'especialista') {
          this.especialistaForm.patchValue({
            imagenPerfil: url
          });
        } else if (tipo === 'administrador') {
          this.adminForm.patchValue({
            imagenPerfil: url
          });
        }
      } catch (error) {
        console.error('Error al cargar la imagen:', error);
      }
    }
  }
  

  limpiarFormularioPaciente() {
    this.pacienteForm.reset();
    this.imagen1URL = '';
    this.imagen2URL = '';
    
    const fileInput1 = document.getElementById('perfil1') as HTMLInputElement;
    const fileInput2 = document.getElementById('perfil2') as HTMLInputElement;
    if (fileInput1) fileInput1.value = '';
    if (fileInput2) fileInput2.value = '';
  }

  limpiarFormularioEspecialista() {
    this.especialistaForm.reset();
    this.imagen1URL = '';
    
    const fileInput = document.getElementById('perfil') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  limpiarFormularioAdmin() {
    this.adminForm.reset();
    this.imagen1URL = '';
    
    const fileInput = document.getElementById('perfil') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  async IrABienvenida() {
    this.loadingService.show();
    try {
      await this.router.navigate(['/bienvenida']);
    } finally {
      this.loadingService.hide();
    }
  }

  async IrAUsuarios() {
    this.loadingService.show();
    try {
      await this.router.navigate(['/usuarios']);
    } finally {
      this.loadingService.hide();
    }
  }

  ngOnDestroy() {
    if (this.subscripcion) {
      this.subscripcion.unsubscribe();
    }
  }
}
