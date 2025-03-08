import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NewPlaylistFormComponent } from '../../components/new-playlist-form/new-playlist-form.component';

@Component({
  selector: 'app-new-playlist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NewPlaylistFormComponent],
  templateUrl: './new-playlist.component.html',
  styleUrls: ['./new-playlist.component.css']
})
export class NewPlaylistComponent {
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}
}
