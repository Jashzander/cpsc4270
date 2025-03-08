import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Playlist } from '../../models/playlist.model';

@Component({
  selector: 'app-playlist-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './playlist-item.component.html',
  styleUrls: ['./playlist-item.component.css']
})
export class PlaylistItemComponent {
  @Input() playlist!: Playlist;

  getTrackCount(): string {
    const count = this.playlist.tracks.length;
    return count === 1 ? '1 track' : `${count} tracks`;
  }
}
