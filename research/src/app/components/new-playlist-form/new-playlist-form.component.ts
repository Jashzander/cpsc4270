import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-new-playlist-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './new-playlist-form.component.html',
  styleUrls: ['./new-playlist-form.component.css']
})
export class NewPlaylistFormComponent implements OnInit {
  playlistForm!: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.playlistForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      isPublic: [false]
    });
  }

  onSubmit(): void {
    if (this.playlistForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const newPlaylist = {
      name: this.playlistForm.get('name')?.value?.trim(),
      isPublic: this.playlistForm.get('isPublic')?.value || false
    };

    console.log('Creating playlist:', newPlaylist);

    this.apiService.createPlaylist(newPlaylist).subscribe({
      next: (playlist) => {
        console.log('Playlist created successfully:', playlist);
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error creating playlist:', err);
        this.loading = false;
        this.error = err.message || 'Failed to create playlist. Please try again.';
      }
    });
  }

  // Form getters for template access
  get name() { return this.playlistForm.get('name'); }
}
