import { Routes } from '@angular/router';
import { BienvenidaComponent } from './componentes/bienvenida/bienvenida.component';
import { RegistroComponent } from './componentes/registro/registro.component';
import { HomeComponent } from './componentes/home/home.component';
import { UsuariosComponent } from './componentes/usuarios/usuarios.component';

export const routes: Routes = [
    { path: '', redirectTo: 'bienvenida', pathMatch: 'full' },
    { path: 'bienvenida', component: BienvenidaComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'home', component: HomeComponent },
    { path: 'usuarios', component: UsuariosComponent }
];
