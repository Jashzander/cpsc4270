export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  albumId?: string;
  number?: number;
  originalNumber?: number;
  playlistNumber?: number;
  albumName?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}
