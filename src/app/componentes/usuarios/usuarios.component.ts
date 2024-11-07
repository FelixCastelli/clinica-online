import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../servicios/firebase.service';
import { Especialista } from '../../especialista.model';
import { CommonModule } from '@angular/common';
import { Paciente } from '../../paciente.model';
import { Administrador } from '../../administrador.model';
import { LoadingService } from '../../servicios/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  especialistas: Especialista[] = [];
  especialistaSeleccionado: Especialista | null = null;
  pacientes: Paciente[] = [];
  pacienteSeleccionado: Paciente | null = null;
  administradores: Administrador[] = [];
  administradorSeleccionado: Administrador | null = null;

  constructor(private firebaseService: FirebaseService, private loadingService: LoadingService, private router: Router) {}

  async ngOnInit() {
    this.especialistas = await this.firebaseService.traerEspecialistas();
    this.pacientes = await this.firebaseService.traerPacientes();
    this.administradores = await this.firebaseService.traerAdministradores();
  }

  seleccionarEspecialista(especialista: Especialista) {
    this.especialistaSeleccionado = especialista;
    this.pacienteSeleccionado = null;
    this.administradorSeleccionado = null;
  }

  toggleValidado(especialista: Especialista) {
    especialista.validado = !especialista.validado;
    this.firebaseService.actualizarValidacionEspecialista(especialista);
  }

  seleccionarPaciente(paciente: Paciente) {
    this.pacienteSeleccionado = paciente;
    this.especialistaSeleccionado = null;
    this.administradorSeleccionado = null;
  }

  seleccionarAdministrador(administrador: Administrador) {
    this.administradorSeleccionado = administrador;
    this.especialistaSeleccionado = null;
    this.pacienteSeleccionado = null;
  }

  async irARegistro() {
    this.loadingService.show();
    try {
      await this.router.navigate(['/registro']);
    } finally {
      this.loadingService.hide();
    }
  }

  async IrAHome() {
    this.loadingService.show();
    try {
      await this.router.navigate(['/home']);
    } finally {
      this.loadingService.hide();
    }
  }
}
