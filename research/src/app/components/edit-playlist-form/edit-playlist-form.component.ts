import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Playlist, Track } from '../../models/playlist.model';
import { Album } from '../../models/album.model';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { Observable, of } from 'rxjs';
import { switchMap, take, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-edit-playlist-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './edit-playlist-form.component.html',
  styleUrls: ['./edit-playlist-form.component.css']
})
export class EditPlaylistFormComponent implements OnInit {
  @Input() playlist!: Playlist;

  playlistForm!: FormGroup;
  allTracks: Track[] = [];
  filteredTracks: Track[] = [];
  albums: Album[] = [];
  selectedAlbumId = '';
  loading = false;
  loadingAlbums = false;
  error: string | null = null;
  warning: string | null = null;
  saveSuccess = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAllTracks();
  }

  private initForm(): void {
    // Format the tracks first to ensure they're all Track objects
    this.formatPlaylistTracks();
    
    this.playlistForm = this.fb.group({
      name: [{value: this.playlist.name, disabled: true}, [Validators.required, Validators.minLength(3)]],
      isPublic: [this.playlist.isPublic],
      tracks: [this.playlist.tracks || []]
    });
    
    console.log('Form initialized with tracks:', this.playlistForm.value.tracks);
  }
  
  private formatPlaylistTracks(): void {
    // Ensure all playlist tracks have the required properties
    if (this.playlist && this.playlist.tracks) {
      console.log('Original playlist tracks:', this.playlist.tracks);
      
      // Handle the case where playlist tracks are just IDs (strings)
      const formattedTracks = this.playlist.tracks.map((trackData, index) => {
        // Check if trackData is just a string (ID)
        if (typeof trackData === 'string' || typeof trackData === 'number') {
          const trackId = String(trackData);
          console.log(`Looking for track with ID: ${trackId}`);
          
          // Find the track in allTracks by ID
          const matchingTrack = this.allTracks.find(t => 
            t.id === trackId || 
            t.id === `${trackId}` || 
            t.id.endsWith(`-${trackId}`)
          );
          
          if (matchingTrack) {
            console.log(`Found matching track for ID ${trackId}:`, matchingTrack);
            return {
              ...matchingTrack,
              playlistNumber: index + 1
            };
          } else {
            console.log(`No matching track found for ID ${trackId}`);
            // Create a placeholder track
            return {
              id: trackId,
              title: `Track ${index + 1}`,
              artist: 'Unknown Artist',
              album: 'Unknown Album',
              duration: 0,
              albumId: '',
              number: index + 1,
              originalNumber: index + 1
            } as Track;
          }
        }
        
        // If trackData is an object, handle it as before
        const track = trackData as Track;
        
        // Try to find a matching track in allTracks by ID
        let matchingTrack = this.allTracks.find(t => t.id === track.id);
        
        // If no match by ID, try to match by title
        if (!matchingTrack && track.title) {
          matchingTrack = this.allTracks.find(t => 
            t.title.toLowerCase() === track.title.toLowerCase()
          );
        }
        
        if (matchingTrack) {
          // Use the matching track's data but keep the playlist track's ID
          return {
            ...matchingTrack,
            id: track.id || matchingTrack.id,
            playlistNumber: index + 1
          };
        }
        
        // If no match found, use the original track with defaults for missing properties
        return {
          id: track.id || `playlist-track-${index}`,
          title: track.title || 'Unknown Track',
          artist: track.artist || 'Unknown Artist',
          album: track.album || 'Unknown Album',
          duration: track.duration || 0,
          albumId: track.albumId || '',
          number: index + 1,
          originalNumber: track.originalNumber || index + 1
        } as Track;
      });
      
      this.playlist.tracks = formattedTracks;
      console.log('Formatted playlist tracks:', this.playlist.tracks);
      
      // If the form is already initialized, update it
      if (this.playlistForm) {
        this.playlistForm.patchValue({
          tracks: this.playlist.tracks
        });
        console.log('Updated form with formatted tracks:', this.playlistForm.value.tracks);
      }
    }
  }

  private loadAllTracks(): void {
    this.loadingAlbums = true;
    this.apiService.getAlbums().subscribe({
      next: (albums) => {
        console.log('Albums loaded in component:', albums);
        this.albums = albums;
        
        // Extract all tracks from all albums
        this.allTracks = albums.flatMap(album => {
          // Check if album has tracks property and it's an array
          if (!album.tracks || !Array.isArray(album.tracks)) {
            console.warn(`Album ${album.id} has no tracks or tracks is not an array`);
            return [];
          }
          
          return album.tracks.map((track, index) => {
            // Get the primaryArtist from the track if available
            const trackWithArtist = track as { primaryArtist?: string };
            const primaryArtist = trackWithArtist.primaryArtist || album.artist || '';
            
            // Generate a consistent ID for the track
            // Format: albumId-trackNumber (e.g., "0-1", "1-3")
            const trackNumber = track.number || track.trackNumber || (index + 1);
            const trackId = `${album.id}-${trackNumber}`;
            
            // Create a complete Track object with all required properties
            const completeTrack: Track = {
              id: trackId, // Use our consistent ID format
              title: track.title || '',
              duration: typeof track.duration === 'string' ? this.parseDuration(track.duration) : (track.duration || 0),
              artist: primaryArtist,
              album: album.title || '',
              albumId: album.id,
              albumName: album.title || '',
              // Set optional properties with default values
              number: trackNumber,
              originalNumber: trackNumber
            };
            
            console.log(`Created track with ID ${trackId}:`, completeTrack);
            return completeTrack;
          });
        });
        
        // Initialize filtered tracks with all tracks
        this.filteredTracks = [...this.allTracks];
        
        console.log('All tracks loaded:', this.allTracks);
        this.loadingAlbums = false;
        
        // Now that we have all tracks, format the playlist tracks
        this.formatPlaylistTracks();
      },
      error: (err) => {
        console.error('Error loading tracks:', err);
        this.warning = 'Could not load complete track information. Some track details may be missing.';
        this.loadingAlbums = false;
      }
    });
  }
  
  onAlbumSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const albumId = selectElement.value;
    
    this.selectedAlbumId = albumId;
    
    if (!albumId) {
      // If no album is selected, show all tracks
      this.filteredTracks = [...this.allTracks];
    } else {
      // Filter tracks by the selected album ID
      this.filteredTracks = this.allTracks.filter(track => track.albumId === albumId);
    }
    
    console.log(`Filtered tracks for album ${albumId}:`, this.filteredTracks);
  }
  
  // Helper method to parse duration strings like "4:35" to seconds
  private parseDuration(durationStr: string): number {
    if (!durationStr) return 0;
    
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      return (minutes * 60) + seconds;
    }
    
    return 0;
  }

  formatDuration(duration: number | string): string {
    if (!duration) return '0:00';
    
    // If duration is already formatted as MM:SS, return it
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }
    
    // If duration is a number (seconds), format it as MM:SS
    if (typeof duration === 'number' || !isNaN(Number(duration))) {
      const totalSeconds = Number(duration);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return '0:00';
  }

  removeTrack(trackId: string): void {
    // Update the playlist tracks
    this.playlist.tracks = this.playlist.tracks.filter(track => track.id !== trackId);
    
    // Update the form value
    this.playlistForm.patchValue({
      tracks: this.playlist.tracks
    });
    
    console.log('Track removed, updated tracks:', this.playlistForm.value.tracks);
  }

  moveTrack(trackId: string, direction: 'up' | 'down'): void {
    const currentIndex = this.playlist.tracks.findIndex(track => track.id === trackId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= this.playlist.tracks.length) return;

    // Swap tracks
    const tracks = [...this.playlist.tracks];
    [tracks[currentIndex], tracks[newIndex]] = [tracks[newIndex], tracks[currentIndex]];
    this.playlist.tracks = tracks;
    
    // Update the form value
    this.playlistForm.patchValue({
      tracks: this.playlist.tracks
    });
    
    console.log('Track moved, updated tracks:', this.playlistForm.value.tracks);
  }

  addTrack(track: Track): void {
    // Check if track already exists in playlist
    if (this.playlist.tracks.some(t => t.id === track.id)) {
      this.error = 'This track is already in the playlist';
      return;
    }

    // Add track to playlist
    this.playlist.tracks.push(track);
    
    // Update the form value
    this.playlistForm.patchValue({
      tracks: this.playlist.tracks
    });
    
    console.log('Track added, updated tracks:', this.playlistForm.value.tracks);
  }

  onSubmit(): void {
    if (this.playlistForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.warning = null;
    this.saveSuccess = false;

    // Get form values, including disabled controls
    const formValues = {
      ...this.playlistForm.getRawValue()
    };
    
    const playlistId = this.playlist.id;
    
    console.log('Form values:', formValues);
    console.log('Current playlist:', this.playlist);
    
    // 2. Update isPublic if changed
    let updateOperation: Observable<Playlist>;
    if (formValues.isPublic !== this.playlist.isPublic) {
      console.log(`Updating isPublic from ${this.playlist.isPublic} to ${formValues.isPublic}`);
      updateOperation = this.apiService.updatePlaylist(playlistId, { isPublic: formValues.isPublic });
    } else {
      // If isPublic hasn't changed, just get the current playlist
      updateOperation = this.apiService.getPlaylist(playlistId);
    }
    
    // Start with updating isPublic or getting the current playlist
    updateOperation.pipe(
      // Then handle track changes
      switchMap(updatedPlaylist => {
        // 3. Handle track changes
        const currentTracks: Track[] = formValues.tracks || [];
        
        // Get the server's current tracks
        const serverTracks = updatedPlaylist.tracks || [];
        
        // Convert server tracks to Track objects if they're strings
        const serverTrackIds = serverTracks.map(track => 
          typeof track === 'string' ? track : track.id
        );
        
        console.log('Current tracks from form:', currentTracks);
        console.log('Server track IDs:', serverTrackIds);
        
        // Get track IDs for comparison
        const currentTrackIds = currentTracks.map(track => track.id);
        
        console.log('Current track IDs:', currentTrackIds);
        
        // Find tracks to add (in current but not in server)
        const tracksToAdd = currentTracks.filter(track => 
          !serverTrackIds.includes(track.id)
        );
        
        // Find tracks to remove (in server but not in current)
        const tracksToRemove = serverTrackIds.filter(trackId => 
          !currentTrackIds.includes(trackId)
        );
        
        console.log('Tracks to add:', tracksToAdd);
        console.log('Tracks to remove:', tracksToRemove);
        
        // Process track operations sequentially
        let trackOperation: Observable<unknown> = of(updatedPlaylist);
        
        // Add new tracks one by one
        for (const track of tracksToAdd) {
          console.log(`Adding track ${track.id} to playlist ${playlistId}`);
          trackOperation = trackOperation.pipe(
            switchMap(() => this.apiService.addTrackToPlaylist(playlistId, track.id).pipe(
              catchError(error => {
                console.error(`Error adding track ${track.id}:`, error);
                return of(null);
              })
            ))
          );
        }
        
        // Remove tracks one by one
        for (const trackId of tracksToRemove) {
          console.log(`Removing track ${trackId} from playlist ${playlistId}`);
          trackOperation = trackOperation.pipe(
            switchMap(() => this.apiService.removeTrackFromPlaylist(playlistId, trackId).pipe(
              catchError(error => {
                console.error(`Error removing track ${trackId}:`, error);
                return of(null);
              })
            ))
          );
        }
        
        // After all track operations, get the updated playlist
        return trackOperation.pipe(
          switchMap(() => {
            console.log('All track operations completed');
            return this.apiService.getPlaylist(playlistId);
          })
        );
      }),
      // Then handle track reordering
      switchMap(updatedPlaylist => {
        console.log('Handling track reordering');
        
        // Get the current tracks from the form
        const currentTracks: Track[] = formValues.tracks || [];
        
        // If there are no tracks, return the playlist
        if (currentTracks.length === 0) {
          return of(updatedPlaylist);
        }
        
        // Process reordering operations sequentially
        let reorderOperation: Observable<unknown> = of(updatedPlaylist);
        
        // Move tracks to their correct positions one by one
        currentTracks.forEach((track, index) => {
          console.log(`Moving track ${track.id} to position ${index}`);
          reorderOperation = reorderOperation.pipe(
            switchMap(() => this.apiService.moveTrackInPlaylist(playlistId, track.id, index).pipe(
              catchError(error => {
                console.error(`Error moving track ${track.id} to position ${index}:`, error);
                return of(null);
              })
            ))
          );
        });
        
        // After all reordering operations, get the updated playlist
        return reorderOperation.pipe(
          switchMap(() => {
            console.log('All reordering operations completed');
            return this.apiService.getPlaylist(playlistId);
          })
        );
      }),
      take(1)
    ).subscribe({
      next: (updatedPlaylist) => {
        console.log('Playlist updated successfully:', updatedPlaylist);
        this.loading = false;
        this.saveSuccess = true;
        
        // Update the local playlist object with the server response
        this.playlist = updatedPlaylist;
        
        // Reset the form with the updated playlist data
        this.initForm();
      },
      error: (err) => {
        console.error('Error updating playlist:', err);
        this.loading = false;
        this.error = 'Failed to update playlist. Please try again.';
      }
    });
  }

  deletePlaylist(): void {
    if (!confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    this.loading = true;
    this.apiService.deletePlaylist(this.playlist.id).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error deleting playlist:', err);
        this.error = 'Failed to delete playlist. Please try again.';
        this.loading = false;
      }
    });
  }

  // Form getters for template access
  get name() { return this.playlistForm.get('name'); }

  isTrackInPlaylist(trackId: string): boolean {
    return this.playlist.tracks.some(track => {
      // Handle both track objects and track IDs
      if (typeof track === 'string') {
        return track === trackId;
      }
      return track.id === trackId;
    });
  }
}
