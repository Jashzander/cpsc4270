export interface AlbumTrack {
  id: string;
  title: string;
  duration: string | number;
  number?: number;
  trackNumber?: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  tracks: AlbumTrack[];
}
