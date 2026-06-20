import { Component, Injector, Input, OnInit } from '@angular/core';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

@Component({
  selector: 'app-podcast-grid-item',
  templateUrl: './podcast-grid-item.component.html',
  styleUrls: ['./podcast-grid-item.component.scss'],
  standalone: true,
})
export class PodcastGridItemComponent extends AppComponentBase implements OnInit {
  @Input() id: string | undefined;
  @Input() image: string | undefined;
  @Input() title: string | undefined;
  @Input() subtitle: string | undefined;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {}

  play(): void {
    if (this.id) {
      this.router.navigate(['/home/play', this.id]);
      return;
    }
    this.navigate('/home/play');
  }
}
