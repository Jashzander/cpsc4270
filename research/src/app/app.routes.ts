import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { NewPlaylistComponent } from './pages/new-playlist/new-playlist.component';
import { EditPlaylistComponent } from './pages/edit-playlist/edit-playlist.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'playlists/new', component: NewPlaylistComponent, canActivate: [AuthGuard] },
  { path: 'playlists/:id/edit', component: EditPlaylistComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
