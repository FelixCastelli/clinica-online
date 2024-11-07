export class Especialista {
    nombre: string;
    apellido: string;
    edad: number;
    dni: string;
    mail: string;
    especialidad: string;
    imagenPerfil: string;
    validado: boolean;
  
    constructor(nombre: string, apellido: string, edad: number, dni: string, mail: string, especialidad: string, imagenPerfil: string, validado: boolean) {
      this.nombre = nombre;
      this.apellido = apellido;
      this.edad = edad;
      this.dni = dni;
      this.mail = mail;
      this.especialidad = especialidad;
      this.imagenPerfil = imagenPerfil;
      this.validado = validado;
    }
  }
