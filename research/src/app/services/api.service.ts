import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { catchError, retry, map, switchMap, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Playlist } from '../models/playlist.model';
import { Album, AlbumTrack } from '../models/album.model';
import { AuthService } from './auth.service';

interface MongoDocument {
  _id?: string;
  id?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Helper method to get auth headers
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Helper method to ensure we have a valid token
  private ensureToken(): Observable<HttpHeaders> {
    const token = this.authService.getToken();
    
    if (token) {
      return of(this.getHeaders());
    } else {
      // No token, try to refresh it
      return this.authService.refreshToken().pipe(
        take(1),
        map(newToken => {
          if (!newToken) {
            console.warn('Failed to get auth token');
          }
          return this.getHeaders();
        })
      );
    }
  }

  // Helper method to map MongoDB _id to id
  private mapMongoId<T extends MongoDocument>(item: T): T {
    if (item._id && !item.id) {
      return {
        ...item,
        id: item._id
      };
    }
    return item;
  }

  // Playlists API
  getPlaylists(): Observable<Playlist[]> {
    return this.ensureToken().pipe(
      switchMap(headers => 
        this.http.get<MongoDocument[]>(`${this.apiUrl}/playlists`, { headers })
          .pipe(
            retry(2),
            map(playlists => playlists.map(playlist => this.mapMongoId(playlist) as unknown as Playlist)),
            catchError(this.handleError)
          )
      )
    );
  }

  getPlaylist(id: string): Observable<Playlist> {
    return this.ensureToken().pipe(
      switchMap(headers => 
        this.http.get<MongoDocument>(`${this.apiUrl}/playlists/${id}`, { headers })
          .pipe(
            retry(2),
            map(playlist => this.mapMongoId(playlist) as unknown as Playlist),
            catchError(this.handleError)
          )
      )
    );
  }

  createPlaylist(playlist: Partial<Playlist>): Observable<Playlist> {
    const newPlaylist = {
      name: playlist.name,
      isPublic: playlist.isPublic || false,
      tracks: []
    };
    
    console.log('Sending playlist data:', newPlaylist);
    
    return this.ensureToken().pipe(
      switchMap(headers => 
        this.http.post<MongoDocument>(`${this.apiUrl}/playlists`, newPlaylist, { 
          headers,
          observe: 'response'
        })
        .pipe(
          map(response => {
            // For 201 Created responses, if we can't get the response body,
            // construct a valid playlist object from what we sent
            if (response.status === 201) {
              const responseData = response.body || {
                ...newPlaylist,
                id: `new-${Date.now()}`,
                userId: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              return this.mapMongoId(responseData) as unknown as Playlist;
            }
            throw new Error('Unexpected response status: ' + response.status);
          }),
          catchError(error => {
            // If it's a 201 response but with parsing issues, return a valid playlist
            if (error instanceof HttpErrorResponse && error.status === 201) {
              console.log('Created playlist successfully, constructing response');
              return of({
                ...newPlaylist,
                id: `new-${Date.now()}`,
                userId: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              } as Playlist);
            }
            console.error('Server error details:', error);
            return this.handleError(error);
          })
        )
      )
    );
  }

  // Update playlist name - This is a placeholder as the server doesn't have a specific endpoint for this
  // In a real application, you would need to add this endpoint to the server
  updatePlaylistName(): Observable<void> {
    console.error('Server does not have an endpoint to update playlist name');
    return of(undefined);
  }

  // Update playlist isPublic status
  updatePlaylist(id: string, playlist: Partial<Playlist>): Observable<Playlist> {
    console.log('Updating playlist isPublic:', id, playlist.isPublic);
    
    return this.ensureToken().pipe(
      switchMap(headers => 
        // Update isPublic status
        this.http.put<void>(`${this.apiUrl}/playlists/${id}/isPublic`, playlist.isPublic, { headers })
          .pipe(
            // Then get the updated playlist
            switchMap(() => this.getPlaylist(id)),
            catchError(error => {
              console.error('Error updating playlist isPublic:', error);
              return this.handleError(error);
            })
          )
      )
    );
  }

  deletePlaylist(id: string): Observable<void> {
    return this.ensureToken().pipe(
      switchMap(headers => 
        this.http.delete<void>(`${this.apiUrl}/playlists/${id}`, { headers })
          .pipe(
            catchError(this.handleError)
          )
      )
    );
  }

  // Albums API
  getAlbums(): Observable<Album[]> {
    console.log('Fetching albums...');
    return this.ensureToken().pipe(
      switchMap(headers => 
        this.http.get<MongoDocument[]>(`${this.apiUrl}/albums`, { headers })
          .pipe(
            switchMap(albumDocs => {
              // Map MongoDB documents to Album objects without tracks
              const albums = albumDocs.map(albumDoc => {
                // Ensure ID is a string, even if it's a number in the database
                const albumId = albumDoc.id !== undefined ? String(albumDoc.id) : 
                               (albumDoc._id !== undefined ? String(albumDoc._id) : '');
                
                const album: Partial<Album> = {
                  id: albumId,
                  title: albumDoc['name'] as string || '',
                  artist: '', // Will be populated from tracks
                  tracks: []
                };
                return album;
              });
              
              console.log('Albums fetched successfully:', albums);
              
              if (albums.length === 0) {
                return of([]);
              }
              
              // Fetch tracks for each album
              const albumsWithTracks$ = albums.map(album => {
                if (!album.id && album.id !== '0') {
                  console.warn('Album missing ID, skipping tracks fetch');
                  return of({
                    ...album,
                    tracks: []
                  } as Album);
                }
                
                console.log(`Fetching tracks for album ${album.id}`);
                return this.http.get<MongoDocument[]>(`${this.apiUrl}/albums/${album.id}/tracks`, { headers })
                  .pipe(
                    map(trackDocs => {
                      // Map track documents to AlbumTrack objects
                      const tracks = trackDocs.map((trackDoc, index) => {
                        // Generate a unique ID for the track
                        const trackId = trackDoc.id !== undefined ? String(trackDoc.id) : 
                                      (trackDoc._id !== undefined ? String(trackDoc._id) : 
                                      `${album.id}-${index + 1}`);
                        
                        const track: AlbumTrack = {
                          id: trackId,
                          title: trackDoc['name'] as string || 'Untitled Track',
                          duration: trackDoc['duration'] as string || '0:00',
                          number: trackDoc['trackNumber'] as number || index + 1,
                          trackNumber: trackDoc['trackNumber'] as number || index + 1
                        };
                        
                        return track;
                      });
                      
                      console.log(`Tracks for album ${album.id}:`, tracks);
                      
                      // Get artist from the first track's primaryArtist if available
                      let artist = '';
                      if (tracks.length > 0 && trackDocs[0]['primaryArtist']) {
                        artist = trackDocs[0]['primaryArtist'] as string;
                      }
                      
                      // Return complete album with tracks
                      return {
                        id: album.id,
                        title: album.title || '',
                        artist: artist,
                        tracks: tracks
                      } as Album;
                    }),
                    catchError(error => {
                      console.error(`Error fetching tracks for album ${album.id}:`, error);
                      // Return album with empty tracks array if tracks fetch fails
                      return of({
                        id: album.id,
                        title: album.title || '',
                        artist: '',
                        tracks: []
                      } as Album);
                    })
                  );
              });
              
              // If no albums were found, return empty array
              if (albumsWithTracks$.length === 0) {
                return of([]);
              }
              
              // Combine all album observables
              return forkJoin(albumsWithTracks$).pipe(
                map(albumsWithTracks => {
                  console.log('Albums with tracks:', albumsWithTracks);
                  return albumsWithTracks;
                })
              );
            }),
            catchError(error => {
              console.error('Error fetching albums:', error);
              return this.handleError(error);
            })
          )
      )
    );
  }

  getAlbum(id: string): Observable<Album> {
    return this.ensureToken().pipe(
      switchMap(headers => 
        this.http.get<MongoDocument>(`${this.apiUrl}/albums/${id}`, { headers })
          .pipe(
            retry(2),
            map(album => this.mapMongoId(album) as unknown as Album),
            catchError(this.handleError)
          )
      )
    );
  }

  // Add a track to a playlist
  addTrackToPlaylist(playlistId: string, trackId: string): Observable<void> {
    console.log(`Adding track ${trackId} to playlist ${playlistId}`);
    return this.ensureToken().pipe(
      switchMap(headers => 
        this.http.post<void>(`${this.apiUrl}/playlists/${playlistId}/tracks`, { trackId }, { headers })
          .pipe(
            catchError(error => {
              console.error(`Error adding track ${trackId} to playlist:`, error);
              return this.handleError(error);
            })
          )
      )
    );
  }
  
  // Remove a track from a playlist
  removeTrackFromPlaylist(playlistId: string, trackId: string): Observable<void> {
    console.log(`Removing track ${trackId} from playlist ${playlistId}`);
    return this.ensureToken().pipe(
      switchMap(headers => 
        this.http.delete<void>(`${this.apiUrl}/playlists/${playlistId}/tracks/${trackId}`, { headers })
          .pipe(
            catchError(error => {
              console.error(`Error removing track ${trackId} from playlist:`, error);
              return this.handleError(error);
            })
          )
      )
    );
  }
  
  // Move a track to a new position in a playlist
  moveTrackInPlaylist(playlistId: string, trackId: string, position: number): Observable<void> {
    console.log(`Moving track ${trackId} to position ${position} in playlist ${playlistId}`);
    return this.ensureToken().pipe(
      switchMap(headers => 
        this.http.patch<void>(`${this.apiUrl}/playlists/${playlistId}/tracks`, { trackId, position }, { headers })
          .pipe(
            catchError(error => {
              console.error(`Error moving track ${trackId} to position ${position}:`, error);
              return this.handleError(error);
            })
          )
      )
    );
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      console.error('Full error:', error);
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
