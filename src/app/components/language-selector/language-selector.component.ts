import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TranslationService } from '../../services/translation.service';

@Component({
    selector: 'app-language-selector',
    standalone: true,
    imports: [MatButtonModule, MatMenuModule, MatIconModule],
    template: `
    <button mat-button [matMenuTriggerFor]="menu">
      <mat-icon class="mr-2">language</mat-icon>
      {{ languageLabel() }}
      <mat-icon>arrow_drop_down</mat-icon>
    </button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item (click)="setLanguage('fr')">
        <span>Français</span>
      </button>
      <button mat-menu-item (click)="setLanguage('en')">
        <span>English</span>
      </button>
    </mat-menu>
  `,
    styles: [`
    .mr-2 { margin-right: 0.5rem; }
  `]
})
export class LanguageSelectorComponent {
    translationService = inject(TranslationService);

    languageLabel() {
        return this.translationService.currentLanguage() === 'fr' ? 'Français' : 'English';
    }

    setLanguage(lang: string) {
        this.translationService.setLanguage(lang);
    }
}
