import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Podcast';

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    document.body.classList.add('force-mobile-layout');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('force-mobile-layout');
  }
}
