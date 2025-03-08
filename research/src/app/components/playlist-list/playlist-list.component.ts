import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Playlist } from '../../models/playlist.model';
import { PlaylistItemComponent } from '../playlist-item/playlist-item.component';

@Component({
  selector: 'app-playlist-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PlaylistItemComponent],
  templateUrl: './playlist-list.component.html',
  styleUrls: ['./playlist-list.component.css']
})
export class PlaylistListComponent {
  @Input() playlists: Playlist[] = [];
}
