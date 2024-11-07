import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../servicios/firebase.service';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../servicios/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  isAdmin: boolean = false;

  constructor(private router: Router, private firebaseService: FirebaseService, private loadingService: LoadingService) {}

  async ngOnInit(): Promise<void> {
    const user = this.firebaseService.getUsuarioActual();
    if (user) {
      const adminEmails = await this.firebaseService.getAdminEmails();
      this.isAdmin = adminEmails.includes(user.email || '');
    }
  }

  async irAUsuarios() {
    this.loadingService.show();
    try {
      await this.router.navigate(['/usuarios']);
    } finally {
      this.loadingService.hide();
    }
  }
}
