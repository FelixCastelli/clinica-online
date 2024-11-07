import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [FormsModule, LoginComponent],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.css'
})
export class BienvenidaComponent {

}
