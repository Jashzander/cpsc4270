import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Playlist } from '../../models/playlist.model';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { PlaylistListComponent } from '../../components/playlist-list/playlist-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, PlaylistListComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  playlists: Playlist[] = [];
  loading = true;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    this.loading = true;
    this.apiService.getPlaylists().subscribe({
      next: (playlists) => {
        this.playlists = playlists;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading playlists:', err);
        this.error = 'Failed to load playlists. Please try again later.';
        this.loading = false;
      }
    });
  }
}
