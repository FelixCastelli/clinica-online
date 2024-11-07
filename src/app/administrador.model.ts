export class Administrador {
    nombre: string;
    apellido: string;
    edad: number;
    dni: string;
    mail: string;
    imagenPerfil: string;
  
    constructor(nombre: string, apellido: string, edad: number, dni: string, mail: string, imagenPerfil: string) {
      this.nombre = nombre;
      this.apellido = apellido;
      this.edad = edad;
      this.dni = dni;
      this.mail = mail;
      this.imagenPerfil = imagenPerfil;
    }
  }
