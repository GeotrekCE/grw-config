import { Component, inject } from '@angular/core';
import { TranslationService } from './services/translation.service';
import { RouterOutlet } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatDialogModule],
  template: `<router-outlet></router-outlet>`,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class App {
  translationService = inject(TranslationService);

  constructor() {
    this.translationService.init();
  }
}
