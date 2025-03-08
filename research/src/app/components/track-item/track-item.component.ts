import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track } from '../../models/playlist.model';

@Component({
  selector: 'app-track-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-item.component.html',
  styleUrls: ['./track-item.component.css']
})
export class TrackItemComponent {
  @Input() track!: Track;
  @Output() remove = new EventEmitter<string>();

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  removeTrack(): void {
    this.remove.emit(this.track.id);
  }
}
