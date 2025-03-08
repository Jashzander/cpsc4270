import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Playlist } from '../../models/playlist.model';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { EditPlaylistFormComponent } from '../../components/edit-playlist-form/edit-playlist-form.component';

@Component({
  selector: 'app-edit-playlist',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, EditPlaylistFormComponent],
  templateUrl: './edit-playlist.component.html',
  styleUrls: ['./edit-playlist.component.css']
})
export class EditPlaylistComponent implements OnInit {
  playlist: Playlist | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadPlaylist();
  }

  loadPlaylist(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid playlist ID';
      this.loading = false;
      return;
    }

    this.apiService.getPlaylist(id).subscribe({
      next: (playlist) => {
        this.playlist = playlist;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading playlist:', err);
        this.error = 'Failed to load playlist. Please try again later.';
        this.loading = false;
      }
    });
  }
}
