export class Paciente {
    nombre: string;
    apellido: string;
    edad: number;
    dni: string;
    mail: string;
    obraSocial: string;
    imagenesPerfil: string[];
  
    constructor(nombre: string, apellido: string, edad: number, dni: string, mail: string, obraSocial: string, imagenesPerfil: string[]) {
      this.nombre = nombre;
      this.apellido = apellido;
      this.edad = edad;
      this.dni = dni;
      this.mail = mail;
      this.obraSocial = obraSocial;
      this.imagenesPerfil = imagenesPerfil;
    }
  }
